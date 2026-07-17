"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MatchInsight } from "@/lib/insight-types";
import { AiAccuracyBadge } from "@/components/ai/AiAccuracyBadge";

interface Props {
  fixtureId: number;
  lang: "tr" | "en";
  homeName?: string;
  awayName?: string;
}

type Role = "bot" | "user";
interface Msg {
  key: string;
  role: Role;
  text: string;
}
interface Chip {
  id: string;
  q: string;
  a: string;
}

let _seq = 0;
const nextKey = () => `aim${_seq++}`;

/**
 * "AI Analiz" — sohbet (chatbot) tarzı maç asistanı. Açılışta hazır bir tahmin
 * cevabı verir; altındaki sorulara dokununca yeni balonla yanıtlar. Tüm metin
 * yapısal veriden TR/EN üretilir. İstatistiksel analiz — bahis tavsiyesi DEĞİL.
 * Veri yoksa/az ise kart hiç görünmez.
 */
export function AiInsightCard({ fixtureId, lang, homeName, awayName }: Props) {
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);
  const [data, setData] = useState<MatchInsight | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const openedRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/match-insight/m-${fixtureId}?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MatchInsight | null) => {
        if (alive) setData(d);
      })
      .catch(() => {
        /* sessizce gizle */
      });
    return () => {
      alive = false;
    };
  }, [fixtureId, lang]);

  // açılış durumunu sıfırla (dil/maç değişince)
  useEffect(() => {
    openedRef.current = false;
    setMessages([]);
    setTyping(false);
  }, [fixtureId, lang]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((id) => clearTimeout(id));
    };
  }, []);

  const push = useCallback((role: Role, text: string) => {
    setMessages((m) => [...m, { key: nextKey(), role, text }]);
  }, []);

  const home = homeName || t("ev sahibi", "the home side");
  const away = awayName || t("deplasman", "the away side");

  // veri gelince açılış cevabını yaz
  useEffect(() => {
    if (!data || !data.available || data.finished || openedRef.current) return;
    openedRef.current = true;
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      push("bot", openingText(data, lang, home, away));
    }, 900);
    timers.current.push(id);
  }, [data, lang, home, away, push]);

  if (!data || !data.available) return null;

  // Biten maç → aktif tahmin/sohbet yerine "Sonuç Karnesi" (tahmin vs gerçek).
  if (data.finished) {
    return <AiResultScorecard d={data} lang={lang} home={home} away={away} />;
  }

  const chips = buildChips(data, lang, home, away);

  const onAsk = (c: Chip) => {
    if (typing) return;
    push("user", c.q);
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      push("bot", c.a);
    }, 750);
    timers.current.push(id);
  };

  return (
    <section className="match-card ai-chat">
      <header className="ai-chat-head">
        <span className="ai-chat-avatar" aria-hidden="true">✦</span>
        <div className="ai-chat-id">
          <strong>{t("AI Analiz", "AI Analysis")}</strong>
          <span className="ai-chat-sub">{t("Maç asistanı", "Match assistant")}</span>
        </div>
        {data.confidence ? (
          <span className="ai-chat-conf">
            {t("Güven", "Confidence")}: {data.confidence}
          </span>
        ) : null}
      </header>

      <AiAccuracyBadge lang={lang} />

      <div className="ai-chat-body">
        {messages.map((m) => (
          <div key={m.key} className={`ai-msg ai-msg-${m.role}`}>
            <div className="ai-bubble">{m.text}</div>
          </div>
        ))}
        {typing ? (
          <div className="ai-msg ai-msg-bot">
            <div className="ai-bubble ai-typing" aria-label={t("yazıyor", "typing")}>
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      {chips.length ? (
        <div className="ai-chat-chips">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              className="ai-chat-chip"
              onClick={() => onAsk(c)}
              disabled={typing}
            >
              {c.q}
            </button>
          ))}
        </div>
      ) : null}

      {data.note ? <p className="ai-chat-note">{data.note}</p> : null}
    </section>
  );
}

/* ── metin üretimi (yapısal veriden TR/EN) ── */

function openingText(
  d: MatchInsight,
  lang: "tr" | "en",
  home: string,
  away: string,
): string {
  const h = d.homeWinPct ?? 0;
  const a = d.awayWinPct ?? 0;
  const fav = d.favorite;
  if (lang === "tr") {
    let lead: string;
    if (fav === "HOME") lead = `Bence ${home} önde — kazanma ihtimalini %${h} görüyorum.`;
    else if (fav === "AWAY") lead = `Bence ${away} önde — kazanma ihtimalini %${a} görüyorum.`;
    else lead = "Bence çok dengeli bir maç; sonuç her yöne gidebilir.";
    const score = d.expectedScore
      ? ` Skorun yaklaşık ${d.expectedScore} olmasını bekliyorum.`
      : "";
    return `Merhaba! Bu maçı senin için inceledim. ${lead}${score} Merak ettiğin soruyu aşağıdan seç, hemen açıklayayım.`;
  }
  let lead: string;
  if (fav === "HOME") lead = `I think ${home} are ahead — I put their win chance at ${h}%.`;
  else if (fav === "AWAY") lead = `I think ${away} are ahead — I put their win chance at ${a}%.`;
  else lead = "I think it's very even; it could go either way.";
  const score = d.expectedScore
    ? ` I expect the score to be around ${d.expectedScore}.`
    : "";
  return `Hi! I took a look at this match for you. ${lead}${score} Pick a question below and I'll explain.`;
}

function buildChips(
  d: MatchInsight,
  lang: "tr" | "en",
  home: string,
  away: string,
): Chip[] {
  const tr = lang === "tr";
  const chips: Chip[] = [];

  // Kim kazanacak?
  {
    const h = d.homeWinPct ?? 0;
    const dr = d.drawPct ?? 0;
    const a = d.awayWinPct ?? 0;
    const favLine =
      d.favorite === "HOME"
        ? tr
          ? `Yani hafif favori ${home}.`
          : `So ${home} are slight favourites.`
        : d.favorite === "AWAY"
          ? tr
            ? `Yani hafif favori ${away}.`
            : `So ${away} are slight favourites.`
          : tr
            ? "Yani net bir favori yok, başa baş."
            : "So there's no clear favourite — it's even.";
    chips.push({
      id: "win",
      q: tr ? "Kim kazanacak?" : "Who will win?",
      a: tr
        ? `Kazanma ihtimalleri: ${home} %${h}, beraberlik %${dr}, ${away} %${a}. ${favLine}`
        : `Win chances: ${home} ${h}%, draw ${dr}%, ${away} ${a}%. ${favLine}`,
    });
  }

  // Kaç kaç biter?
  if (d.expectedScore) {
    let total = "";
    if (d.expectedGoalsHome != null && d.expectedGoalsAway != null) {
      const tg = Math.round(d.expectedGoalsHome + d.expectedGoalsAway);
      total = tr
        ? ` Yani maçta toplam ${tg} civarı gol demek.`
        : ` That's about ${tg} goals in the match in total.`;
    }
    chips.push({
      id: "score",
      q: tr ? "Kaç kaç biter?" : "Final score?",
      a:
        (tr
          ? `Skorun yaklaşık ${d.expectedScore} olmasını bekliyorum.`
          : `I expect the score to be around ${d.expectedScore}.`) + total,
    });
  }

  // Çok gol olur mu?
  if (d.over25Pct != null) {
    const o = d.over25Pct;
    const u = d.under25Pct ?? 100 - o;
    const line =
      o >= u
        ? tr
          ? "Yani bol gollü bir maç bekliyorum."
          : "So I expect plenty of goals."
        : tr
          ? "Yani az gollü, temkinli bir maç olabilir."
          : "So it could be a cautious, low-scoring game.";
    chips.push({
      id: "ou",
      q: tr ? "Çok gol olur mu?" : "Many goals?",
      a: tr
        ? `Maçta 3 veya daha fazla gol olma ihtimali %${o}, 2 ve daha az gol olma ihtimali %${u}. ${line}`
        : `Chance of 3+ goals is ${o}%, and 2 or fewer is ${u}%. ${line}`,
    });
  }

  // Karşılıklı gol olur mu?
  if (d.bttsYesPct != null) {
    const y = d.bttsYesPct;
    const n = d.bttsNoPct ?? 100 - y;
    const line =
      y >= 50
        ? tr
          ? "Yani büyük ihtimalle iki takım da gol atar."
          : "So both teams will probably score."
        : tr
          ? "Yani bir takım kalesini gole kapatabilir."
          : "So one side may keep a clean sheet.";
    chips.push({
      id: "btts",
      q: tr ? "Karşılıklı gol olur mu?" : "Both teams score?",
      a: tr
        ? `İki takımın da gol atma ihtimali %${y}, en az birinin gol atamama ihtimali %${n}. ${line}`
        : `Chance both teams score: ${y}%; at least one kept out: ${n}%. ${line}`,
    });
  }

  // Özet yorum (backend özeti)
  if (d.summary && d.summary.trim()) {
    chips.push({
      id: "sum",
      q: tr ? "Özet yorum" : "Quick take",
      a: d.summary.trim(),
    });
  }

  // Ne kadar emin?
  {
    const conf = d.confidence
      ? tr
        ? `Güven seviyem: ${d.confidence}. `
        : `My confidence: ${d.confidence}. `
      : "";
    chips.push({
      id: "trust",
      q: tr ? "Ne kadar emin?" : "How sure are you?",
      a:
        conf +
        (tr
          ? "Bu tahminleri geçmiş maçlara, güncel forma ve gol verilerine bakarak yapıyorum — kesin değil, futbolda her zaman sürpriz olabilir."
          : "I base these on past matches, current form and goal data — nothing is certain; football always has surprises."),
    });
  }

  return chips;
}

/* ── Biten maç: "Sonuç Karnesi" — AI tahmini vs gerçekleşen (✓/✗) ── */
function AiResultScorecard({
  d,
  lang,
  home,
  away,
}: {
  d: MatchInsight;
  lang: "tr" | "en";
  home: string;
  away: string;
}) {
  const tr = lang === "tr";
  const t = (a: string, b: string) => (tr ? a : b);
  const aH = d.actualHome ?? 0;
  const aA = d.actualAway ?? 0;
  const h = d.homeWinPct ?? 0;
  const dr = d.drawPct ?? 0;
  const aw = d.awayWinPct ?? 0;
  const aiRes = h >= dr && h >= aw ? "H" : aw >= dr ? "A" : "D";
  const actRes = aH > aA ? "H" : aH === aA ? "D" : "A";
  const resHit = aiRes === actRes;
  const aiOver = (d.over25Pct ?? 50) >= 50;
  const actOver = aH + aA >= 3;
  const ouHit = aiOver === actOver;
  const aiBtts = (d.bttsYesPct ?? 50) >= 50;
  const actBtts = aH > 0 && aA > 0;
  const bttsHit = aiBtts === actBtts;
  const hits = (resHit ? 1 : 0) + (ouHit ? 1 : 0) + (bttsHit ? 1 : 0);
  const badge = hits >= 2 ? "hit" : hits === 0 ? "miss" : "mid";
  const res = (c: string) =>
    c === "H" ? home : c === "A" ? away : t("Beraberlik", "Draw");
  const ou = (o: boolean) =>
    tr ? (o ? "2.5 Üst" : "2.5 Alt") : o ? "Over 2.5" : "Under 2.5";
  const kg = (y: boolean) =>
    tr ? (y ? "KG Var" : "KG Yok") : y ? "BTTS Yes" : "BTTS No";

  return (
    <section className="match-card ai-scorecard">
      <header className="ai-sc-head">
        <span className="ai-chat-avatar" aria-hidden="true">
          ✦
        </span>
        <strong className="ai-sc-title">
          {t("AI Analiz · Sonuç Karnesi", "AI Analysis · Results")}
        </strong>
        <span className={`ai-sc-badge ai-sc-${badge}`}>
          {t(`AI ${hits}/3 tuttu`, `AI got ${hits}/3`)}
        </span>
      </header>
      <div className="ai-sc-score">
        {home} {aH}-{aA} {away}
      </div>
      <ul className="ai-sc-rows">
        <ScRow
          label={t("Maç Sonucu", "Match Result")}
          ai={res(aiRes)}
          actual={res(actRes)}
          hit={resHit}
        />
        <ScRow
          label={t("Gol (2.5)", "Goals (2.5)")}
          ai={ou(aiOver)}
          actual={ou(actOver)}
          hit={ouHit}
        />
        <ScRow
          label={t("Karşılıklı Gol", "Both Teams to Score")}
          ai={kg(aiBtts)}
          actual={kg(actBtts)}
          hit={bttsHit}
        />
      </ul>
      {d.expectedScore ? (
        <p className="ai-sc-exp">
          {t(
            `AI beklenen skor ~${d.expectedScore} · Gerçek ${aH}-${aA}`,
            `AI expected ~${d.expectedScore} · Actual ${aH}-${aA}`,
          )}
        </p>
      ) : null}
      {d.note ? <p className="ai-chat-note">{d.note}</p> : null}
    </section>
  );
}

function ScRow({
  label,
  ai,
  actual,
  hit,
}: {
  label: string;
  ai: string;
  actual: string;
  hit: boolean;
}) {
  return (
    <li className={`ai-sc-row ${hit ? "hit" : "miss"}`}>
      <span className="ai-sc-mark" aria-hidden="true">
        {hit ? "✓" : "✗"}
      </span>
      <span className="ai-sc-label">{label}</span>
      <span className="ai-sc-vals">
        <span className="ai-sc-ai">AI: {ai}</span>
        {!hit ? <span className="ai-sc-actual"> · {actual}</span> : null}
      </span>
    </li>
  );
}
