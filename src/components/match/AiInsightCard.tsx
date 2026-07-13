"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MatchInsight } from "@/lib/insight-types";

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
    if (!data || !data.available || openedRef.current) return;
    openedRef.current = true;
    setTyping(true);
    const id = window.setTimeout(() => {
      setTyping(false);
      push("bot", openingText(data, lang, home, away));
    }, 900);
    timers.current.push(id);
  }, [data, lang, home, away, push]);

  if (!data || !data.available) return null;

  const chips = buildChips(data, lang);

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
  const dr = d.drawPct ?? 0;
  const a = d.awayWinPct ?? 0;
  const fav = d.favorite;
  if (lang === "tr") {
    let lead: string;
    if (fav === "HOME") lead = `${home} %${h} ihtimalle önde görünüyor.`;
    else if (fav === "AWAY") lead = `${away} %${a} ihtimalle önde görünüyor.`;
    else lead = `Dengeli bir maç — sonuç her yöne gidebilir (ev %${h}, ber %${dr}, dep %${a}).`;
    const score = d.expectedScore ? ` Beklenen skor ${d.expectedScore} civarı.` : "";
    return `Merhaba! Bu maçı senin için analiz ettim. ${lead}${score} Aşağıdaki sorulara dokunarak detaya inebilirsin.`;
  }
  let lead: string;
  if (fav === "HOME") lead = `${home} looks favoured at ${h}%.`;
  else if (fav === "AWAY") lead = `${away} looks favoured at ${a}%.`;
  else lead = `It's a balanced game — could go either way (home ${h}%, draw ${dr}%, away ${a}%).`;
  const score = d.expectedScore ? ` Expected score around ${d.expectedScore}.` : "";
  return `Hi! I analysed this match for you. ${lead}${score} Tap a question below to dig deeper.`;
}

function buildChips(d: MatchInsight, lang: "tr" | "en"): Chip[] {
  const tr = lang === "tr";
  const chips: Chip[] = [];

  // Kazanan
  {
    const h = d.homeWinPct ?? 0;
    const dr = d.drawPct ?? 0;
    const a = d.awayWinPct ?? 0;
    const favLine =
      d.favorite === "HOME"
        ? tr
          ? "Model hafif ev sahibinden yana."
          : "The model leans slightly to the home side."
        : d.favorite === "AWAY"
          ? tr
            ? "Model deplasmandan yana."
            : "The model leans to the away side."
          : tr
            ? "Net favori yok, başa baş."
            : "No clear favourite — it's even.";
    chips.push({
      id: "win",
      q: tr ? "Kazanan kim?" : "Who wins?",
      a: tr
        ? `1X2 olasılıkları: ev %${h}, beraberlik %${dr}, deplasman %${a}. ${favLine}`
        : `1X2 probabilities: home ${h}%, draw ${dr}%, away ${a}%. ${favLine}`,
    });
  }

  // Beklenen skor
  if (d.expectedScore) {
    const eg =
      d.expectedGoalsHome != null && d.expectedGoalsAway != null
        ? tr
          ? ` Gol beklentisi ${d.expectedGoalsHome.toFixed(1)} - ${d.expectedGoalsAway.toFixed(1)}.`
          : ` Expected goals ${d.expectedGoalsHome.toFixed(1)} - ${d.expectedGoalsAway.toFixed(1)}.`
        : "";
    chips.push({
      id: "score",
      q: tr ? "Beklenen skor?" : "Expected score?",
      a: (tr ? `Yaklaşık ${d.expectedScore}.` : `Around ${d.expectedScore}.`) + eg,
    });
  }

  // 2.5 Alt/Üst
  if (d.over25Pct != null) {
    const o = d.over25Pct;
    const u = d.under25Pct ?? 100 - o;
    const line =
      o >= u
        ? tr
          ? "Bol gollü bir maç beklentisi ağır basıyor."
          : "It leans towards a high-scoring game."
        : tr
          ? "Az gollü geçebilir."
          : "It could be a low-scoring game.";
    chips.push({
      id: "ou",
      q: tr ? "2.5 alt/üst?" : "Over/Under 2.5?",
      a: tr
        ? `2.5 Üst %${o}, Alt %${u}. ${line}`
        : `Over 2.5 ${o}%, Under 2.5 ${u}%. ${line}`,
    });
  }

  // Karşılıklı gol
  if (d.bttsYesPct != null) {
    const y = d.bttsYesPct;
    const n = d.bttsNoPct ?? 100 - y;
    const line =
      y >= 50
        ? tr
          ? "İki takımın da gol atması muhtemel."
          : "Both teams are likely to score."
        : tr
          ? "En az bir takım gol atamayabilir."
          : "At least one side may be kept out.";
    chips.push({
      id: "btts",
      q: tr ? "KG var mı?" : "Both teams score?",
      a: tr
        ? `Karşılıklı gol: Var %${y}, Yok %${n}. ${line}`
        : `Both teams to score: Yes ${y}%, No ${n}%. ${line}`,
    });
  }

  // Kısa yorum (backend özeti)
  if (d.summary && d.summary.trim()) {
    chips.push({
      id: "sum",
      q: tr ? "Kısa yorum" : "Quick take",
      a: d.summary.trim(),
    });
  }

  // Güvenilirlik / feragat
  {
    const conf = d.confidence
      ? tr
        ? `Güven seviyem: ${d.confidence}. `
        : `My confidence: ${d.confidence}. `
      : "";
    chips.push({
      id: "trust",
      q: tr ? "Güvenilir mi?" : "How reliable?",
      a:
        conf +
        (tr
          ? "Bunlar geçmiş maçlar, form ve xG'den üretilen istatistiksel olasılıklar — kesin sonuç değil, futbol her zaman sürpriz yapabilir."
          : "These are statistical probabilities from past results, form and xG — not a certainty; football always springs surprises."),
    });
  }

  return chips;
}
