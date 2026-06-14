"use client";

import { useEffect, useState } from "react";
import type {
  CommentPageResponse,
  CommentView,
} from "@/lib/comment-types";
import type { MatchDetailResponse } from "@/lib/match-detail-types";

interface Props {
  detail: MatchDetailResponse;
  lang: "tr" | "en";
}

type SortMode = "newest" | "popular";

function timeAgo(iso: string, lang: "tr" | "en"): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, (now - then) / 1000);
  if (diffSec < 60) return lang === "tr" ? "simdi" : "now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === "tr" ? `${diffMin}dk` : `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return lang === "tr" ? `${diffH}sa` : `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return lang === "tr" ? `${diffD}g` : `${diffD}d`;
  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");
}

function CommentItem({
  c,
  lang,
  isReply = false,
}: {
  c: CommentView;
  lang: "tr" | "en";
  isReply?: boolean;
}) {
  const replyLabel =
    lang === "tr" ? "yanit" : c.replies.length === 1 ? "reply" : "replies";
  return (
    <li className={`comment-item ${isReply ? "is-reply" : ""}`}>
      <div className="comment-avatar">
        {c.user.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.user.photo} alt={c.user.displayName} loading="lazy" />
        ) : (
          <span className="comment-avatar-initials">
            {initials(c.user.displayName)}
          </span>
        )}
      </div>
      <div className="comment-body">
        <div className="comment-head">
          <span className="comment-author">{c.user.displayName}</span>
          <span className="comment-time">{timeAgo(c.createdAt, lang)}</span>
        </div>
        <p className="comment-text">{c.content}</p>
        <div className="comment-foot">
          <span
            className={`comment-like-readonly ${c.likedByMe ? "is-liked" : ""}`}
            title={lang === "tr" ? "Begenmek icin giris yap" : "Sign in to like"}
          >
            HEART <span className="tnum">{c.likeCount}</span>
          </span>
          {!isReply && c.replies.length > 0 ? (
            <span className="comment-reply-count tnum">
              {c.replies.length} {replyLabel}
            </span>
          ) : null}
        </div>
        {c.replies.length > 0 && !isReply ? (
          <ul className="comment-replies">
            {c.replies.map((r) => (
              <CommentItem key={r.id} c={r} lang={lang} isReply />
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export function CommentsTab({ detail, lang }: Props) {
  const [sort, setSort] = useState<SortMode>("newest");
  const [data, setData] = useState<CommentPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    setLoading(true);
    setErr(null);
    fetch(
      `/api/comments/fixtures/${detail.id}?sort=${sort}&page=0&size=50`,
      { cache: "no-store" },
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as CommentPageResponse;
        if (!aborted) setData(j);
      })
      .catch(() => {
        if (!aborted) {
          setErr(lang === "tr" ? "Yorumlar yuklenemedi" : "Failed to load comments");
        }
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
    };
  }, [detail.id, sort, lang]);

  const cta = {
    title: lang === "tr" ? "Yorum yazmak ister misin?" : "Want to comment?",
    sub:
      lang === "tr"
        ? "Begenmek ve yorum birakmak icin giris yap."
        : "Sign in to like and post comments.",
    btn: lang === "tr" ? "Giris Yap" : "Sign In",
  };
  const sortNewest = lang === "tr" ? "En yeni" : "Newest";
  const sortPopular = lang === "tr" ? "Populer" : "Popular";
  const loadingTxt = lang === "tr" ? "Yukleniyor..." : "Loading...";
  const emptyTxt =
    lang === "tr"
      ? "Henuz yorum yok. Ilk yorumu sen birak!"
      : "No comments yet. Be the first!";
  const countLabel = lang === "tr" ? "yorum" : "comments";

  return (
    <div className="match-tab match-tab-comments">
      <section className="match-card comments-cta">
        <div className="comments-cta-text">
          <strong>{cta.title}</strong>
          <span>{cta.sub}</span>
        </div>
        <a href={`/${lang === "tr" ? "giris" : "login"}`} className="btn-primary">
          {cta.btn}
        </a>
      </section>

      <div className="comments-toolbar">
        <span className="comments-count">
          {data?.totalCount ?? 0} {countLabel}
        </span>
        <div className="comments-sort">
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={`comments-sort-btn ${sort === "newest" ? "is-active" : ""}`}
          >
            {sortNewest}
          </button>
          <button
            type="button"
            onClick={() => setSort("popular")}
            className={`comments-sort-btn ${sort === "popular" ? "is-active" : ""}`}
          >
            {sortPopular}
          </button>
        </div>
      </div>

      <section className="match-card">
        {loading ? (
          <p className="match-empty">{loadingTxt}</p>
        ) : err ? (
          <p className="match-empty">{err}</p>
        ) : !data || data.items.length === 0 ? (
          <p className="match-empty">{emptyTxt}</p>
        ) : (
          <ul className="comment-list">
            {data.items.map((c) => (
              <CommentItem key={c.id} c={c} lang={lang} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
