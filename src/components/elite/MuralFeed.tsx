"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ImageOff, Loader2, MessageSquare, Trophy } from "lucide-react";
import { memberColor } from "@/lib/discord-members";

export interface MuralPost {
  id: string;
  discord_message_id: string;
  user_id: string;
  username: string | null;
  global_name: string | null;
  avatar_url: string | null;
  content: string;
  image_urls: string[];
  message_timestamp: string;
  has_images: boolean;
}

function displayName(p: MuralPost): string {
  return p.global_name || p.username || `user-${p.user_id.slice(-4)}`;
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
  if (mins < 60) return `${mins}min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d`;
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "—";
  }
}

type Filter = "all" | "images";

export function MuralFeed({ channelId }: { channelId?: string }) {
  const [posts, setPosts] = useState<MuralPost[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/mural?limit=50", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { posts: MuralPost[] };
        if (!cancelled) setPosts(data.posts);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro carregando mural");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = (posts ?? []).filter((p) => filter === "all" || p.has_images);
  const withImages = (posts ?? []).filter((p) => p.has_images).length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500/70" />
          <h2 className="text-[13px] font-bold text-white/85">Mural — Sucessos da turma</h2>
          {posts && (
            <span className="text-[10px] text-white/30 font-mono">
              {posts.length} posts · {withImages} com imagem
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
              filter === "all"
                ? "border-white/[0.20] bg-white/[0.05] text-white"
                : "border-white/[0.05] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setFilter("images")}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
              filter === "images"
                ? "border-white/[0.20] bg-white/[0.05] text-white"
                : "border-white/[0.05] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
            }`}
          >
            Só com imagem
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div className="px-5 py-12 text-center">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin mx-auto mb-3" />
          <p className="text-[12px] text-white/35">Carregando mural…</p>
        </div>
      )}

      {!loading && error && (
        <div className="px-5 py-8 text-center">
          <p className="text-[12px] text-red-400/80">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="px-5 py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
            {filter === "images" ? <ImageOff className="w-5 h-5 text-white/25" /> : <MessageSquare className="w-5 h-5 text-white/25" />}
          </div>
          <p className="text-[13px] text-white/40 mb-1">
            {filter === "images" ? "Sem posts com imagem ainda" : "Sem posts sincronizados ainda"}
          </p>
          <p className="text-[11px] text-white/25 max-w-sm mx-auto">
            O mural puxa automaticamente do canal do Discord a cada 3 minutos. Publique uma conquista por lá pra aparecer aqui.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((p) => (
            <MuralPostCard key={p.id} post={p} channelId={channelId} />
          ))}
        </div>
      )}
    </div>
  );
}

function MuralPostCard({ post, channelId }: { post: MuralPost; channelId?: string }) {
  const name = displayName(post);
  const color = memberColor(post.user_id);
  const discordLink = channelId
    ? `https://discord.com/channels/@me/${channelId}/${post.discord_message_id}`
    : null;

  // Pre-formatação leve do conteúdo — quebra em linhas, preserva emojis
  const content = post.content.trim();

  return (
    <article className="px-5 py-4 hover:bg-white/[0.015] transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar Discord real */}
        {post.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.avatar_url}
            alt={name}
            className="w-10 h-10 rounded-full shrink-0 object-cover"
            style={{ border: `1px solid ${color}40` }}
            loading="lazy"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            {initials(name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap mb-1">
            <span className="text-[13px] font-bold text-white/90">{name}</span>
            {post.username && post.global_name && post.username !== post.global_name && (
              <span className="text-[11px] text-white/30">@{post.username}</span>
            )}
            <time className="text-[10.5px] text-white/30">{formatRelative(post.message_timestamp)}</time>
            {discordLink && (
              <a
                href={discordLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir no Discord"
                className="ml-auto text-white/25 hover:text-white/60 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {content && (
            <p className="text-[12.5px] text-white/70 leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          )}

          {post.image_urls.length > 0 && (
            <div className={`mt-3 grid gap-2 ${post.image_urls.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-2 max-w-lg"}`}>
              {post.image_urls.slice(0, 4).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative block overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 hover:border-white/[0.15] transition-colors ${
                    post.image_urls.length === 1 ? "aspect-[16/10]" : "aspect-square"
                  }`}
                  title="Abrir imagem original"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </a>
              ))}
              {post.image_urls.length > 4 && (
                <div className="col-span-2 text-center text-[10.5px] text-white/40 py-1">
                  +{post.image_urls.length - 4} {post.image_urls.length - 4 === 1 ? "imagem" : "imagens"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
