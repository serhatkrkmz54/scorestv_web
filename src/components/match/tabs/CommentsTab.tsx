"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CommentPageResponse,
  CommentView,
} from "@/lib/comment-types";
import type { MatchDetailResponse } from "@/lib/match-detail-types";
import { useAuth } from "@/context/auth-context";
import { IconClose, IconHeart, IconReply } from "@/components/icons";

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

/** Ağaçta verilen id'li yorumu (top-level veya reply) immutable patch'ler. */
function patchComment(
  items: CommentView[],
  id: number,
  patch: (c: CommentView) => Partial<CommentView>,
): CommentView[] {
  return items.map((c) => {
    if (c.id === id) return { ...c, ...patch(c) };
    if (c.replies.length > 0) {
      return { ...c, replies: patchComment(c.replies, id, patch) };
    }
    return c;
  });
}

export function CommentsTab({ detail, lang }: Props) {
  const { user, openAuth } = useAuth();
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en);

  const [sort, setSort] = useState<SortMode>("newest");
  const [data, setData] = useState<CommentPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Üst yazma kutusu
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState<string | null>(null);

  // Yanıt formu
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(
        `/api/comments/fixtures/${detail.id}?sort=${sort}&page=0&size=50`,
        { cache: "no-store" },
      );
      if (!r.ok) throw new Error(String(r.status));
      setData((await r.json()) as CommentPageResponse);
    } catch {
      setErr(lang === "tr" ? "Yorumlar yuklenemedi" : "Failed to load comments");
    } finally {
      setLoading(false);
    }
    // user?.id deps'te: giriş/çıkış olunca listeyi tazele ki backend
    // likedByMe / isMine alanlarını doğru (kullanıcıya göre) dönsün.
  }, [detail.id, sort, lang, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitTop(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    if (!user) {
      openAuth("signin");
      return;
    }
    setPosting(true);
    setPostErr(null);
    try {
      const r = await fetch(`/api/comments/fixtures/${detail.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (r.status === 401) {
        openAuth("signin");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      setText("");
      await load();
    } catch {
      setPostErr(t("Yorumunuz gönderilemedi (Küfür,argo,hakaret içerikli kelimeler gönderilmez!). Tekrar dene.", "Your comment could not be sent (Swearing, slang, and insulting words will not be sent!). Please try again."));
    } finally {
      setPosting(false);
    }
  }

  async function submitReply(parentId: number) {
    const content = replyText.trim();
    if (!content) return;
    if (!user) {
      openAuth("signin");
      return;
    }
    setReplyPosting(true);
    try {
      const r = await fetch(`/api/comments/fixtures/${detail.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (r.status === 401) {
        openAuth("signin");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      setReplyText("");
      setReplyingTo(null);
      await load();
    } catch {
      // formu acik birak — kullanici tekrar deneyebilir
    } finally {
      setReplyPosting(false);
    }
  }

  async function toggleLike(c: CommentView) {
    if (!user) {
      openAuth("signin");
      return;
    }
    // İyimser güncelleme
    setData((d) =>
      d
        ? {
            ...d,
            items: patchComment(d.items, c.id, (x) => ({
              likedByMe: !x.likedByMe,
              likeCount: Math.max(0, x.likeCount + (x.likedByMe ? -1 : 1)),
            })),
          }
        : d,
    );
    try {
      const r = await fetch(`/api/comments/${c.id}/like`, { method: "POST" });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as { liked: boolean; likeCount: number };
      setData((d) =>
        d
          ? {
              ...d,
              items: patchComment(d.items, c.id, () => ({
                likedByMe: j.liked,
                likeCount: j.likeCount,
              })),
            }
          : d,
      );
    } catch {
      void load(); // hatada sunucu durumuna geri dön
    }
  }

  async function removeComment(id: number) {
    const ok = window.confirm(
      t("Bu yorumu silmek istiyor musun?", "Delete this comment?"),
    );
    if (!ok) return;
    try {
      const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(String(r.status));
      await load();
    } catch {
      void load();
    }
  }

  const sortNewest = lang === "tr" ? "En yeni" : "Newest";
  const sortPopular = lang === "tr" ? "Populer" : "Popular";
  const loadingTxt = lang === "tr" ? "Yukleniyor..." : "Loading...";
  const emptyTxt =
    lang === "tr"
      ? "Henuz yorum yok. Ilk yorumu sen birak!"
      : "No comments yet. Be the first!";
  const countLabel = lang === "tr" ? "yorum" : "comments";

  function renderComment(c: CommentView, isReply = false) {
    return (
      <li key={c.id} className={`comment-item ${isReply ? "is-reply" : ""}`}>
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
            {c.isMine ? (
              <button
                type="button"
                className="comment-del"
                onClick={() => removeComment(c.id)}
                title={t("Sil", "Delete")}
                aria-label={t("Sil", "Delete")}
              >
                <IconClose s={13} />
              </button>
            ) : null}
          </div>
          <p className="comment-text">{c.content}</p>
          <div className="comment-foot">
            <button
              type="button"
              className={`comment-act like ${c.likedByMe ? "is-liked" : ""}`}
              onClick={() => toggleLike(c)}
              aria-pressed={c.likedByMe}
            >
              <IconHeart s={15} />
              {c.likeCount > 0 ? <span className="tnum">{c.likeCount}</span> : null}
            </button>
            {!isReply ? (
              <button
                type="button"
                className={`comment-act ${replyingTo === c.id ? "is-active" : ""}`}
                onClick={() => {
                  if (!user) {
                    openAuth("signin");
                    return;
                  }
                  setReplyText("");
                  setReplyingTo((cur) => (cur === c.id ? null : c.id));
                }}
              >
                <IconReply s={15} />
                {replyingTo === c.id ? t("Vazgec", "Cancel") : t("Yanitla", "Reply")}
              </button>
            ) : null}
          </div>

          {!isReply && replyingTo === c.id && user ? (
            <form
              className="comment-reply-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submitReply(c.id);
              }}
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                maxLength={2000}
                autoFocus
                placeholder={`${t("Yanitla", "Reply to")} ${c.user.displayName}…`}
              />
              <div className="comment-reply-actions">
                <button
                  type="button"
                  className="comment-cancel"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  {t("Vazgec", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={replyPosting || !replyText.trim()}
                >
                  {replyPosting ? t("Gönderiliyor…", "Sending…") : t("Gönder", "Send")}
                </button>
              </div>
            </form>
          ) : null}

          {!isReply && c.replies.length > 0 ? (
            <ul className="comment-replies">
              {c.replies.map((rep) => renderComment(rep, true))}
            </ul>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <div className="match-tab match-tab-comments">
      {user ? (
        <form className="comment-composer match-card" onSubmit={submitTop}>
          <div className="comment-composer-avatar" aria-hidden="true">
            {initials(user.displayName)}
          </div>
          <div className="comment-composer-main">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={t("Yorumunu yaz…", "Write a comment…")}
            />
            {postErr ? <p className="comment-post-err">{postErr}</p> : null}
            <div className="comment-composer-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={posting || !text.trim()}
              >
                {posting ? t("Gönderiliyor…", "Sending…") : t("Yorum Yap", "Post")}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <section className="match-card comments-cta">
          <div className="comments-cta-text">
            <strong>{t("Yorum yazmak ister misin? ", "Want to comment? ")}</strong>
            <span>
              {t(
                "Begenmek ve yorum birakmak icin giris yap.",
                "Sign in to like and post comments.",
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openAuth("signin")}
            className="btn-primary"
          >
            {t("Giris Yap", "Sign In")}
          </button>
        </section>
      )}

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
          <ul className="comment-list">{data.items.map((c) => renderComment(c))}</ul>
        )}
      </section>
    </div>
  );
}
