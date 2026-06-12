"use client";

import { useLang } from "@/context/lang-context";
import { HOME_STR } from "@/i18n/home-strings";
import { colorFromName } from "@/lib/fixtures";
import { IconHeart, IconReply, IconRetweet, IconVerified, IconX } from "@/components/icons";
import { MOCK_TWEETS } from "./right-rail-mock";

function compact(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "B";
  return String(n);
}

export function TwitterFeed() {
  const { lang } = useLang();
  const t = HOME_STR[lang];

  return (
    <div className="rl-section">
      <div className="card-head">
        <span className="tw-logo">
          <IconX s={16} />
        </span>
        <h3>{t.trending}</h3>
        <button className="tw-follow" type="button">
          {t.follow}
        </button>
      </div>

      {MOCK_TWEETS.map((tw) => (
        <div className="tweet" key={tw.handle}>
          <span className="tw-av" style={{ background: tw.color || colorFromName(tw.name) }}>
            {tw.name.charAt(0)}
          </span>
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
              <span className="tw-time">{tw.time}</span>
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
        </div>
      ))}
    </div>
  );
}
