"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { colorFromName } from "@/lib/fixtures";
import { IconHeart, IconReply, IconRetweet, IconVerified, IconX } from "@/components/icons";

// Backend SocialTweet (com.scorestv.social.SocialTweet) TS karsiligi.
interface SocialTweet {
  id: string;
  handle: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  text: string;
  createdAt: string; // ISO-8601
  replies: number;
  retweets: number;
  likes: number;
  url: string;
}

function compact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "B";
  return String(n);
}

function timeAgo(iso: string, lang: "tr" | "en"): string {
  const then = new Date(iso).getTime();
  if (!then || Number.isNaN(then)) return "";
  const sec = Math.max(0, (Date.now() - then) / 1000);
  if (sec < 60) return lang === "tr" ? "şimdi" : "now";
  const m = Math.floor(sec / 60);
  if (m < 60) return lang === "tr" ? `${m}dk` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "tr" ? `${h}sa` : `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return lang === "tr" ? `${d}g` : `${d}d`;
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function TwitterFeed() {
  const { lang } = useLang();
  const t = HOME_STR[lang];
  const [tweets, setTweets] = useState<SocialTweet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let off = false;
    fetch("/api/social/tweets", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: SocialTweet[]) => {
        if (!off) setTweets(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        if (!off) setTweets([]);
      })
      .finally(() => {
        if (!off) setLoaded(true);
      });
    return () => {
      off = true;
    };
  }, []);

  // Veri yoksa bolumu hic cizme (bos kart gosterme).
  if (loaded && tweets.length === 0) return null;
  if (!loaded) return null;

  return (
    <div className="rl-section">
      <div className="card-head">
        <span className="tw-logo">
          <IconX s={16} />
        </span>
        <h3>{t.trending}</h3>
      </div>

      {tweets.map((tw) => (
        <a
          className="tweet"
          key={tw.id}
          href={tw.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tw.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tw-av tw-av-img" src={tw.avatar} alt={tw.name} loading="lazy" />
          ) : (
            <span className="tw-av" style={{ background: colorFromName(tw.name) }}>
              {tw.name.charAt(0)}
            </span>
          )}
          <div className="tw-body">
            <div className="tw-head">
              <span className="tw-name">{tw.name}</span>
              {tw.verified && (
                <span className="tw-verified">
                  <IconVerified s={14} />
                </span>
              )}
              <span className="tw-handle">@{tw.handle}</span>
              <span className="tw-dot">·</span>
              <span className="tw-time">{timeAgo(tw.createdAt, lang)}</span>
            </div>
            <p className="tw-text">{tw.text}</p>
            <div className="tw-actions">
              <span className="tw-act">
                <IconReply s={14} /> {compact(tw.replies)}
              </span>
              <span className="tw-act">
                <IconRetweet s={14} /> {compact(tw.retweets)}
              </span>
              <span className="tw-act">
                <IconHeart s={14} /> {compact(tw.likes)}
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
