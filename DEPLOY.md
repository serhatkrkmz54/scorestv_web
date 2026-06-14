# scorestv_web — Production Deploy

Sunucu 3 (web) kurulumu. Hetzner Cloud + Docker + nginx + Let's Encrypt.

---

## 1) Sunucu 3 ilk hazirlik (sadece bir kez)

### 1.1 Docker + Docker Compose

```bash
# Ubuntu 24.04 LTS varsayimi
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# yeniden giris yap (logout/login)
```

### 1.2 Hetzner Cloud Firewall

Panel'den firewall ekle, **inbound**:

| Protokol | Port    | Kaynak                         | Aciklama          |
|----------|---------|--------------------------------|-------------------|
| TCP      | 22      | Sadece kendi IP'n              | SSH               |
| TCP      | 80      | 0.0.0.0/0, ::/0                | HTTP (LE + redir) |
| TCP      | 443     | 0.0.0.0/0, ::/0                | HTTPS             |

**NOT:** UFW kullanmiyoruz — Hetzner Cloud Firewall yeterli.

### 1.3 SSH key-only

`/etc/ssh/sshd_config`:
```
PasswordAuthentication no
PermitRootLogin no
```
`sudo systemctl restart sshd`

### 1.4 Dizinler

```bash
sudo mkdir -p /opt/scorestv-web/{data/nginx/logs,data/nginx/cache,data/letsencrypt,conf/nginx/certs}
sudo chown -R $USER:$USER /opt/scorestv-web
```

### 1.5 DNS (Cloudflare)

`scorestv.com` ve `www.scorestv.com` → Sunucu 3 public IP'sine A kaydi.
**Proxy status:** orange cloud (acik) — Cloudflare onunde. SSL/TLS mode: **Full (Strict)**.

---

## 2) Kod transferi

Local (Windows):
```powershell
cd D:\scorestv_web
# Build local olarak dene (typecheck + lint)
npm run lint
npm run build  # .next/standalone uretilir, dogrulama icin
```

Sunucuya kopyala (PowerShell + SCP):
```powershell
# tum repo (node_modules / .next haric — .dockerignore halleder)
scp -r -i <SSH_KEY> `
  D:\scorestv_web\* `
  user@<SUNUCU3_IP>:/opt/scorestv-web/
# .env'i ayrica olustur (assagidaki adim)
```

**Alternatif (tavsiye):** git push → sunucuda `git clone/pull`. Sırlar zaten `.env` dosyasinda ve `.gitignore`'da.

---

## 3) `.env` doldur (sunucuda)

```bash
cd /opt/scorestv-web
cp .env.example .env
nano .env
```

Doldurulacaklar:
- `BACKEND_URL` — Sunucu 1'e internal IP veya `https://api.scorestv.com`
- `NEXT_PUBLIC_WS_URL` — `wss://api.scorestv.com/ws`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — varsa

---

## 4) SSL sertifika (Let's Encrypt)

Compose start etmeden ONCE, certbot ile cert al:

```bash
# certbot kur
sudo apt install -y certbot

# 80 portu bos olmali — once nginx'i baslat ki webroot challenge calissin
# YA DA standalone mode ile:
sudo certbot certonly --standalone \
  -d scorestv.com -d www.scorestv.com \
  --email serhatkorkmaz5454@gmail.com --agree-tos --no-eff-email
```

Cert'ler `/etc/letsencrypt/live/scorestv.com/` altinda olusur. Compose `:ro` mount ediyor.

**Auto renew** (certbot package zaten cron olusturur):
```bash
sudo systemctl status certbot.timer    # aktif olmali
sudo certbot renew --dry-run            # test
```

Renew sonrasi nginx'i reload icin hook:
```bash
sudo nano /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
```
```bash
#!/bin/bash
docker exec scorestv-web-nginx nginx -s reload
```
```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
```

---

## 5) Build + run

```bash
cd /opt/scorestv-web
docker compose up -d --build

# loglari izle
docker compose logs -f web
docker compose logs -f nginx
```

İlk build ~3-5 dakika (npm ci + next build). Sonraki build'ler cache ile ~30sn.

---

## 6) Smoke test

```bash
# Container saglikli mi
docker compose ps
# STATUS healthy gozukmeli

# Localden 3000 portu
curl -s http://127.0.0.1:3000/ -o /dev/null -w "%{http_code}\n"
# 200 olmali

# Nginx uzerinden
curl -s -H "Host: scorestv.com" http://127.0.0.1/ -o /dev/null -w "%{http_code}\n"
# 301 (HTTPS redirect)

# Disardan TLS
curl -sI https://scorestv.com/ | head -5
# HTTP/2 200, Strict-Transport-Security header'i gorulmeli

# BFF proxy backend'e gidiyor mu
curl -s https://scorestv.com/api/leagues/popular?lang=tr | head -200
# JSON donmeli (boy degil)

# WS endpoint
curl -sI https://api.scorestv.com/ws | head -3
# 400 / Upgrade Required normal (WS handshake degil HTTP GET)
```

Browser:
1. `https://scorestv.com` → anasayfa açilir, ligler + ülkeler sol raylda
2. Bir maç tikla → match detail SSR gelir
3. Bir takim tikla → team detail SSR gelir
4. Search bar → "Galat" yaz → dropdown sonuc gelir (Elasticsearch)
5. TR/EN switcher → URL `/takim/x` ↔ `/team/x` degisir
6. F12 → Network → WS bağlantı kurulu mu (canli skor)

---

## 7) Backend Hikari/Lettuce yeni degerleri uygula (Sunucu 1)

```bash
ssh user@<SUNUCU1_IP>
cd /opt/scorestv/backend
nano .env
```

Yeni satirlar ekle (gerek YOK — defaultlar zaten yml'de tuned, ama override etmek istersen):
```
HIKARI_MAX_POOL=50
HIKARI_MIN_IDLE=15
HIKARI_CONNECTION_TIMEOUT=10000
REDIS_MAX_ACTIVE=64
REDIS_MAX_IDLE=32
REDIS_MIN_IDLE=8
```

Sonra **JAR rebuild + restart**:
```powershell
# Local (Windows)
cd C:\Users\korkm\OneDrive\Desktop\scorestv-yeni-proje-api-football\scorestv-backend
.\gradlew.bat clean bootJar
scp build\libs\*.jar user@<SUNUCU1_IP>:/opt/scorestv/backend/app.jar
```
```bash
# Sunucu 1
cd /opt/scorestv/backend
docker compose restart backend
docker compose logs -f backend | grep -i "hikari\|pool"
# scorestv-hikari startup: Pool stats (total=15, active=0, idle=15, waiting=0)
```

Healthcheck:
```bash
curl -s https://api.scorestv.com/actuator/health | jq
# {"status":"UP","components":{"db":{"status":"UP"},"redis":{"status":"UP"},...}}
```

---

## 8) Loadtest (opsiyonel, canliya cikmadan onerilir)

k6 ile basit smoke (Sunucu 1 veya local):
```bash
docker run --rm -i grafana/k6:latest run - <<'EOF'
import http from 'k6/http';
import { sleep, check } from 'k6';
export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m',  target: 500 },
    { duration: '2m',  target: 1000 },
    { duration: '30s', target: 0 },
  ],
};
export default function () {
  const r1 = http.get('https://scorestv.com/');
  check(r1, { 'home 200': (r) => r.status === 200 });
  const r2 = http.get('https://api.scorestv.com/api/v1/fixtures?lang=tr');
  check(r2, { 'fixtures 200': (r) => r.status === 200 });
  sleep(1);
}
EOF
```

p95 < 500ms, error rate < 1% kabul kriteri.

---

## 9) Sorun giderme

| Belirti                                | Cozum                                                                                                                                                                                          |
|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `502 Bad Gateway`                      | `docker compose ps` → web healthy mi? `docker compose logs web` bak. `127.0.0.1:3000` curl et.                                                                                                 |
| Hikari `Connection is not available, request timed out` | `.env`'de `HIKARI_MAX_POOL=70` yap, restart. Postgres `max_connections` 200'un altinda olmasin. PgBouncer ekle (P1 task).                                                          |
| Nginx `worker_connections are not enough` | `nginx.conf` `worker_connections 16384` yap, restart.                                                                                                                                          |
| Browser `404` detail page              | RetryablePage zaten devreye girer; backend down ise auto-recover eder. Backend gercekten 404 donuyorsa slug yanlistir.                                                                          |
| `Mixed content` warning                | `BACKEND_URL=https://...` olmali; HTTP iken `wss://` kullanamazsiniz. CF Full Strict zorunlu.                                                                                                  |
| Cert renewal fail                      | `sudo certbot renew --dry-run`. Hata varsa `/etc/letsencrypt/log/letsencrypt.log` oku. 80 portu acik olmali — Hetzner firewall ve docker nginx 80'i dinliyor mu.                                |

---

## 10) Sonraki adim (P1 — opsiyonel ama tavsiye edilir)

- **PgBouncer** kur (Sunucu 2'de Postgres yanina): transaction mode, pool_size 50, max_client_conn 200. Backend `jdbc:postgresql://<PG_IP>:6432/...` yapilir → connection storm karsi sigorta.
- **Postgres tuning** (Sunucu 2 `postgresql.conf`): `shared_buffers=4GB`, `effective_cache_size=12GB`, `work_mem=32MB`, `max_connections=200`, `random_page_cost=1.1`.
- **Grafana dashboard** (Sunucu 1'de zaten kurulu) — Hikari/Pool/JVM/Tomcat panellerini ekle (Spring Boot Actuator dashboard 4701).
- **k6 nightly run** — Hetzner Cloud function veya cron, her gece smoke test.
- **Mobile APK release** — Play Store internal track + signed APK upload.

---

İletisim: serhatkorkmaz5454@gmail.com
