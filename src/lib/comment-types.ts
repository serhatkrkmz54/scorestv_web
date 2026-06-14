/**
 * Backend {@code CommentView}/{@code CommentPageResponse} TS karşılıkları.
 *
 * Web read-only kullanımı: likedByMe ve isMine her zaman false döner
 * (anonymous istekler için). Yazma/beğenme JWT istek gerektirir; web v1'de
 * UI'da Auth CTA gösterilir.
 */

export interface CommentUserRef {
  id: number;
  displayName: string;
  photo?: string | null;
  country?: string | null;
}

export interface CommentView {
  id: number;
  content: string;
  user: CommentUserRef;
  createdAt: string; // ISO 8601
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
  parentId?: number | null;
  replies: CommentView[];
}

export interface CommentPageResponse {
  items: CommentView[];
  totalCount: number;
  hasNext: boolean;
}
