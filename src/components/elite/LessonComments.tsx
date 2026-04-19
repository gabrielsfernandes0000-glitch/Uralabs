"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Reply, Trash2, Send, Loader2 } from "lucide-react";
import { memberColor } from "@/lib/discord-members";

interface CommentRow {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted: boolean;
  author_username: string | null;
  author_global_name: string | null;
}

interface Props {
  lessonId: string;
  currentUserId: string | null;
  accent: string;
}

function displayName(c: CommentRow): string {
  return c.author_global_name || c.author_username || `user-${c.user_id.slice(-4)}`;
}

function initials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d atrás`;
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "—";
  }
}

export function LessonComments({ lessonId, currentUserId, accent }: Props) {
  const [comments, setComments] = useState<CommentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newBody, setNewBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { comments: CommentRow[] };
      setComments(data.comments);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro carregando comentários");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function post(body: string, parentId: string | null): Promise<boolean> {
    if (!currentUserId) return false;
    const text = body.trim();
    if (!text) return false;
    setPosting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, parent_id: parentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Erro publicando");
        return false;
      }
      await fetchComments();
      return true;
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Remover este comentário?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Erro removendo");
        return;
      }
      await fetchComments();
    } catch {
      setError("Erro removendo");
    }
  }

  // Agrupa em thread: parents + children
  const { roots, childrenByParent } = useMemo(() => {
    const rts: CommentRow[] = [];
    const byParent = new Map<string, CommentRow[]>();
    for (const c of comments ?? []) {
      if (c.parent_id == null) rts.push(c);
      else {
        const arr = byParent.get(c.parent_id) ?? [];
        arr.push(c);
        byParent.set(c.parent_id, arr);
      }
    }
    return { roots: rts, childrenByParent: byParent };
  }, [comments]);

  const totalCount = (comments ?? []).filter((c) => !c.deleted).length;

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-[#0e0e10]">
      <header className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.05]">
        <MessageCircle className="w-4 h-4" style={{ color: accent }} />
        <h3 className="text-[13px] font-bold text-white/85">Comentários</h3>
        <span className="text-[11px] text-white/30 font-mono">{totalCount}</span>
      </header>

      {/* Composer novo comentário */}
      {currentUserId ? (
        <div className="px-5 py-4 border-b border-white/[0.04]">
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Comente sobre a aula, tire dúvida, compartilhe insight…"
            rows={2}
            maxLength={2000}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[13px] text-white/85 placeholder-white/25 resize-none focus:outline-none focus:border-white/[0.18] transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-white/25 tabular-nums">{newBody.length}/2000</span>
            <button
              onClick={async () => {
                const ok = await post(newBody, null);
                if (ok) setNewBody("");
              }}
              disabled={posting || !newBody.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: accent,
                color: "#fff",
              }}
            >
              {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Publicar
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 border-b border-white/[0.04] text-center">
          <p className="text-[12px] text-white/40">Faça login pra comentar.</p>
        </div>
      )}

      {/* Lista */}
      <div className="px-5 py-2">
        {loading && (
          <p className="text-[12px] text-white/30 py-6 text-center">Carregando comentários…</p>
        )}
        {error && !loading && (
          <p className="text-[12px] text-red-400/80 py-4 text-center">{error}</p>
        )}
        {!loading && roots.length === 0 && (
          <p className="text-[12px] text-white/30 py-6 text-center">
            Ainda sem comentários. Seja o primeiro a comentar sobre essa aula.
          </p>
        )}
        {!loading && roots.length > 0 && (
          <ul className="divide-y divide-white/[0.04]">
            {roots.map((c) => (
              <li key={c.id}>
                <CommentItem
                  c={c}
                  currentUserId={currentUserId}
                  accent={accent}
                  onReply={() => { setReplyTo(c.id); setReplyBody(""); }}
                  onDelete={() => handleDelete(c.id)}
                />
                {/* Replies */}
                {(childrenByParent.get(c.id) ?? []).map((r) => (
                  <div key={r.id} className="pl-11">
                    <CommentItem
                      c={r}
                      currentUserId={currentUserId}
                      accent={accent}
                      onReply={() => { setReplyTo(c.id); setReplyBody(""); }}
                      onDelete={() => handleDelete(r.id)}
                    />
                  </div>
                ))}
                {/* Reply composer */}
                {replyTo === c.id && currentUserId && (
                  <div className="pl-11 pb-3 pt-1">
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder={`Responder @${displayName(c)}…`}
                      rows={2}
                      maxLength={2000}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[12.5px] text-white/85 placeholder-white/25 resize-none focus:outline-none focus:border-white/[0.18] transition-colors"
                    />
                    <div className="flex items-center justify-end gap-2 mt-1.5">
                      <button
                        onClick={() => { setReplyTo(null); setReplyBody(""); }}
                        className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          const ok = await post(replyBody, c.id);
                          if (ok) { setReplyTo(null); setReplyBody(""); }
                        }}
                        disabled={posting || !replyBody.trim()}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: accent, color: "#fff" }}
                      >
                        {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Responder
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CommentItem({
  c,
  currentUserId,
  accent,
  onReply,
  onDelete,
}: {
  c: CommentRow;
  currentUserId: string | null;
  accent: string;
  onReply: () => void;
  onDelete: () => void;
}) {
  const name = displayName(c);
  const color = memberColor(c.user_id);
  const isMine = currentUserId === c.user_id;

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Avatar — inicial + cor determinística */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        {initials(name)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[12.5px] font-bold ${c.deleted ? "text-white/25" : "text-white/90"}`}>
            {name}
          </span>
          <time className="text-[10.5px] text-white/30">{formatRelative(c.created_at)}</time>
          {isMine && !c.deleted && (
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: accent + "18", color: accent }}
            >
              Você
            </span>
          )}
        </div>
        <p className={`text-[12.5px] leading-relaxed mt-0.5 whitespace-pre-wrap ${c.deleted ? "text-white/25 italic" : "text-white/70"}`}>
          {c.body}
        </p>

        {/* Ações */}
        {!c.deleted && (
          <div className="flex items-center gap-3 mt-1.5">
            {currentUserId && c.parent_id == null && (
              <button
                onClick={onReply}
                className="flex items-center gap-1 text-[11px] text-white/35 hover:text-white/70 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Responder
              </button>
            )}
            {isMine && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 text-[11px] text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Remover
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
