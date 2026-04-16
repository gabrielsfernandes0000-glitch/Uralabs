"use client";

import { Hash, Volume2, ChevronDown, Crown, Users, Mic, Headphones, Settings, Plus, Gift, Smile, Bell, Pin, Search, Inbox } from "lucide-react";
import { Reveal } from "./Reveal";
import type { LPGuildData, LPChannel, LPMessage } from "@/lib/discord-lp";

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
  };
  return <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${colors[status] || colors.online} rounded-full border-2 border-[#2b2d31]`} />;
}

function roleColor(role: string) {
  if (role === "Mentor") return "text-brand-500";
  if (role === "Elite") return "text-green-500";
  if (role === "VIP") return "text-yellow-500";
  return "text-gray-400";
}

function roleBg(role: string) {
  if (role === "Mentor") return "bg-brand-500";
  if (role === "Elite") return "bg-green-600";
  if (role === "VIP") return "bg-yellow-600";
  return "bg-gray-600";
}

// Group channels by category
function groupChannels(channels: LPChannel[]) {
  const groups: { category: string; channels: LPChannel[] }[] = [];
  const seen = new Set<string>();
  for (const ch of channels) {
    if (!seen.has(ch.category)) {
      seen.add(ch.category);
      groups.push({ category: ch.category, channels: [] });
    }
    groups.find((g) => g.category === ch.category)!.channels.push(ch);
  }
  return groups;
}

// Clean category name for display (strip emojis)
function cleanCategoryName(name: string) {
  return name.replace(/[❇🔸]/g, "").trim();
}

function Avatar({ src, fallback, bg }: { src: string | null; fallback: string; bg: string }) {
  if (src) {
    return <img src={src} alt="" className="w-10 h-10 rounded-full object-cover" />;
  }
  return (
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white font-bold text-sm`}>
      {fallback}
    </div>
  );
}

function SmallAvatar({ src, fallback, bg }: { src: string | null; fallback: string; bg: string }) {
  if (src) {
    return <img src={src} alt="" className="w-8 h-8 rounded-full object-cover" />;
  }
  return (
    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold`}>
      {fallback}
    </div>
  );
}

type Props = {
  data: LPGuildData;
};

export function DiscordWidget({ data }: Props) {
  const channelGroups = groupChannels(data.channels);
  const mentors = data.onlineMembers.filter((m) => m.role === "Mentor");
  const elites = data.onlineMembers.filter((m) => m.role === "Elite");
  const vips = data.onlineMembers.filter((m) => m.role === "VIP");
  const totalPagantes = data.vipCount + data.eliteCount;

  return (
    <section className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#5865F2]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-[#5865F2] tracking-wide uppercase">
                {data.fallback ? "Conecte direto no Discord" : "Comunidade ao vivo"}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Espia Antes de Entrar</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {data.fallback
                ? "Snapshot do nosso Discord indisponível no momento. Entra direto lá pra ver o que rola ao vivo."
                : `Isso é o que rola lá dentro — todos os dias. ${data.memberCount.toLocaleString("pt-BR")} traders compartilhando resultados, tirando dúvidas e evoluindo juntos. A entrada é gratuita.`}
            </p>
            {!data.fallback && data.snapshotAt && (
              <p className="text-[10px] text-gray-600 mt-3 uppercase tracking-wider">
                Snapshot atualizado a cada 5 min · dados reais da nossa guild
              </p>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.2} width="100%">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5865F2]/20 via-brand-500/10 to-[#5865F2]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition duration-700" />

            {/* Discord mockup */}
            <div className="relative bg-[#313338] rounded-xl border border-white/10 overflow-hidden shadow-2xl flex h-[520px]">

              {/* Sidebar - channels (só em desktop — tablet fica com chat + members) */}
              <div className="hidden lg:flex flex-col w-60 bg-[#2b2d31] border-r border-white/5 shrink-0">
                <div className="h-12 px-4 flex items-center justify-between border-b border-black/30 bg-[#2b2d31] shrink-0">
                  <span className="font-bold text-white text-sm truncate">URA LABS</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-4">
                  {channelGroups.map((group, gi) => (
                    <div key={gi}>
                      <button className="flex items-center gap-1 px-1 mb-1 text-[11px] font-bold text-gray-500 uppercase tracking-wide hover:text-gray-300 transition-colors w-full text-left">
                        <ChevronDown className="w-3 h-3" />
                        {cleanCategoryName(group.category)}
                      </button>
                      {group.channels.map((ch, i) => (
                        <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group/ch ${
                          ch.active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}>
                          <span className="text-gray-500">
                            {ch.type === "voice" ? <Volume2 className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                          </span>
                          <span className={`text-sm truncate ${ch.active ? "font-semibold text-white" : ""}`}>{ch.name}</span>
                          {ch.unread && !ch.active && <span className="ml-auto w-2 h-2 rounded-full bg-white shrink-0" />}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="h-[52px] bg-[#232428] px-2 flex items-center gap-2 border-t border-black/30 shrink-0">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">U</div>
                    <StatusDot status="online" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">Você</p>
                    <p className="text-[10px] text-gray-400">Online</p>
                  </div>
                  <div className="flex gap-1 text-gray-400">
                    <Mic className="w-4 h-4" />
                    <Headphones className="w-4 h-4" />
                    <Settings className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Main chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Channel header */}
                <div className="h-12 px-4 flex items-center gap-3 border-b border-black/30 bg-[#313338] shrink-0">
                  <Hash className="w-5 h-5 text-gray-500 shrink-0" />
                  <span className="font-bold text-white text-sm">sucesso</span>
                  <div className="hidden sm:block h-5 w-px bg-gray-700 mx-1" />
                  <span className="hidden sm:block text-xs text-gray-500 truncate">Resultados reais da comunidade</span>
                  <div className="ml-auto flex items-center gap-3 text-gray-400">
                    <Bell className="w-4 h-4 hidden sm:block" />
                    <Pin className="w-4 h-4 hidden sm:block" />
                    <Users className="w-4 h-4 hidden lg:block" />
                    <Search className="w-4 h-4 hidden sm:block" />
                    <Inbox className="w-4 h-4 hidden sm:block" />
                  </div>
                </div>

                {/* Messages — real from #sucesso */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
                  {data.messages.map((msg, i) => (
                    <div key={i} className="flex gap-3 group/msg hover:bg-white/[0.02] -mx-4 px-4 py-1 rounded transition-colors">
                      <div className="shrink-0">
                        <Avatar
                          src={msg.avatarUrl}
                          fallback={msg.user[0]}
                          bg={roleBg(msg.role)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-sm ${roleColor(msg.role)}`}>{msg.user}</span>
                        </div>
                        {msg.content && <p className="text-sm text-gray-300 leading-relaxed break-words mt-0.5">{msg.content}</p>}
                        {msg.imageUrl && (
                          <div className="mt-2 max-w-[300px] rounded-lg overflow-hidden border border-white/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.imageUrl}
                              alt="Resultado compartilhado"
                              className="w-full h-auto object-cover max-h-[200px]"
                              loading="lazy"
                              width={msg.imageWidth ?? undefined}
                              height={msg.imageHeight ?? undefined}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input bar */}
                <div className="px-4 pb-4 shrink-0">
                  <div className="bg-[#383a40] rounded-lg flex items-center px-4 py-2.5 gap-3">
                    <Plus className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 truncate flex-1">Enviar mensagem em #sucesso</span>
                    <div className="flex gap-2 text-gray-400 shrink-0">
                      <Gift className="w-5 h-5 hidden sm:block" />
                      <Smile className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Members sidebar */}
              <div className="hidden lg:flex flex-col w-60 bg-[#2b2d31] border-l border-white/5 shrink-0">
                <div className="p-4 space-y-4 overflow-y-auto no-scrollbar">
                  {mentors.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Mentor — {mentors.length}</p>
                      {mentors.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
                          <div className="relative">
                            <SmallAvatar src={m.avatarUrl} fallback={m.name[0]} bg={roleBg(m.role)} />
                            <StatusDot status={m.status} />
                          </div>
                          <span className={`text-sm font-medium ${roleColor(m.role)} truncate`}>{m.name}</span>
                          <Crown className="w-3 h-3 text-brand-500 ml-auto shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                  {elites.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Elite — {data.eliteCount}</p>
                      {elites.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
                          <div className="relative">
                            <SmallAvatar src={m.avatarUrl} fallback={m.name[0]} bg={roleBg(m.role)} />
                            <StatusDot status={m.status} />
                          </div>
                          <span className={`text-sm font-medium ${roleColor(m.role)} truncate`}>{m.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {vips.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">VIP — {data.vipCount}</p>
                      {vips.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
                          <div className="relative">
                            <SmallAvatar src={m.avatarUrl} fallback={m.name[0]} bg={roleBg(m.role)} />
                            <StatusDot status={m.status} />
                          </div>
                          <span className={`text-sm font-medium ${roleColor(m.role)} truncate`}>{m.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/5 text-center">
                    <span className="text-[10px] text-gray-400">+{totalPagantes} membros pagantes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA below */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <a
                href="https://discord.gg/SrxZSGN6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
                Entrar na Comunidade Grátis
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                <span>{data.onlineCount.toLocaleString("pt-BR")} membros online agora</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
