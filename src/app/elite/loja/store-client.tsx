"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Search, ArrowUp, Sparkles, BookOpen, PlayCircle, DollarSign, Gift, Zap, Ticket } from "lucide-react";
import Link from "next/link";
import type { BoxWithPrizes, UserCoinBalance, RecentOpening, PrizeType } from "@/lib/ura-coin";
import { UraCoinIcon } from "@/components/elite/UraCoinIcon";
import { BoxCard } from "./box-card";
import { OpenOverlay, type OpenResult } from "./open-overlay";
import { PixDialog } from "./pix-dialog";
import { PrizeTile } from "./prize-tile";
import { StatsRow } from "./stats-row";
import { DirectShop, DIRECT_CATALOG } from "./direct-shop";
import { BoxPreview } from "./box-preview";

type Tab = "boxes" | "direct" | "history";
type TierFilter = "all" | "basic" | "premium" | "legendary";

export function StoreClient({
  initialBalance,
  boxes,
  recentOpenings,
}: {
  initialBalance: UserCoinBalance;
  boxes: BoxWithPrizes[];
  recentOpenings: RecentOpening[];
}) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance.balance);
  const [lifetimeEarned] = useState(initialBalance.lifetime_earned);
  const [tab, setTab] = useState<Tab>("boxes");
  const [opening, setOpening] = useState<{
    box: BoxWithPrizes;
    result: OpenResult | null;
    error: string | null;
  } | null>(null);
  const [pixClaim, setPixClaim] = useState<{
    redemptionId: string;
    prizeName: string;
    amountBrl: number | null;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  // Preview modal antes de confirmar abertura — mostra prêmios + odds
  const [previewing, setPreviewing] = useState<BoxWithPrizes | null>(null);

  // Keyboard nav entre tabs — ←/→ pra trocar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const tabs: Tab[] = ["boxes", "direct", "history"];
      const idx = tabs.indexOf(tab);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setTab(tabs[(idx + 1) % tabs.length]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab]);

  // Back-to-top visibility — aparece após 600px de scroll
  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleOpen(box: BoxWithPrizes) {
    if (opening) return;
    if (balance < box.cost_coins) {
      showToast("Saldo insuficiente");
      return;
    }
    if (!box.any_available) {
      showToast("Todos os prêmios desta caixa estão esgotados hoje");
      return;
    }

    setOpening({ box, result: null, error: null });

    try {
      const res = await fetch("/api/loot/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box_id: box.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOpening((prev) => (prev ? { ...prev, error: data.error ?? "Erro desconhecido" } : null));
        return;
      }

      const result = data as OpenResult;
      setOpening((prev) => (prev ? { ...prev, result } : null));

      setBalance((b) => {
        let next = b - box.cost_coins;
        if (result.prize.type === "ura_coin_bonus") {
          const bonus = Number(result.prize.metadata?.coin_amount ?? 0);
          next += bonus;
        }
        return next;
      });
    } catch (err) {
      setOpening((prev) =>
        prev ? { ...prev, error: err instanceof Error ? err.message : "Falha na rede" } : null,
      );
    }
  }

  function handleOverlayClose() {
    const result = opening?.result;
    const error = opening?.error;
    setOpening(null);
    if (error) {
      showToast(error);
      return;
    }
    if (result?.prize.type === "cash_brl") {
      setPixClaim({
        redemptionId: result.redemption_id,
        prizeName: result.prize.name,
        amountBrl: result.prize.value_brl,
      });
    } else {
      router.refresh();
    }
  }

  function handlePixClose(submitted: boolean) {
    setPixClaim(null);
    if (submitted) {
      showToast("PIX enviado! Admin vai processar em breve.");
      router.refresh();
    }
  }

  const minBoxPrice = useMemo(() => {
    if (boxes.length === 0) return 0;
    return Math.min(...boxes.map((b) => b.cost_coins));
  }, [boxes]);

  // Zero-balance onboarding — user não consegue fazer nada, mostra como ganhar coin
  const showZeroBalance = balance < minBoxPrice && minBoxPrice > 0;

  return (
    <>
      <div className="animate-in-up">
        <StatsRow
          balance={balance}
          lifetimeEarned={lifetimeEarned}
          openings={recentOpenings}
        />
      </div>

      {/* Zero-balance onboarding — only if user can't afford any box */}
      {showZeroBalance && (
        <div className="mt-4 animate-in-up delay-1">
          <ZeroBalanceOnboarding needed={minBoxPrice - balance} />
        </div>
      )}

      {/* Tabs ancoradas à esquerda com o conteúdo, não centralizadas soltas */}
      <div className="animate-in-up delay-2 mt-10 flex items-center justify-between gap-4 flex-wrap">
        <Segmented
          tab={tab}
          setTab={setTab}
          counts={{
            boxes: boxes.length,
            direct: DIRECT_CATALOG.length,
            history: recentOpenings.length,
          }}
        />
        <p className="text-[10.5px] text-white/30 font-mono tracking-wider hidden md:block">
          ← → navega
        </p>
      </div>

      <div className="mt-6 animate-in-up delay-2">
        {tab === "boxes" && (
          <BoxesTab
            boxes={boxes}
            balance={balance}
            onOpen={(box) => setPreviewing(box)}
            disabled={!!opening}
          />
        )}
        {tab === "direct" && (
          <DirectShop
            balance={balance}
            onBuy={(p) => showToast(`${p.name} ainda em configuração.`)}
            onWaitlistChange={(msg) => showToast(msg)}
          />
        )}
        {tab === "history" && (
          <HistorySection
            openings={recentOpenings}
            onClaim={(r) => setPixClaim(r)}
          />
        )}
      </div>

      {/* Sticky back-to-top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 h-11 w-11 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-white/70 hover:text-white hover:bg-white/[0.1] flex items-center justify-center transition-colors shadow-lg animate-in fade-in duration-200"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2} />
        </button>
      )}

      {previewing && !opening && (
        <BoxPreview
          box={previewing}
          balance={balance}
          onConfirm={() => {
            const box = previewing;
            setPreviewing(null);
            handleOpen(box);
          }}
          onClose={() => setPreviewing(null)}
        />
      )}

      {opening && (
        <OpenOverlay
          box={opening.box}
          result={opening.result}
          error={opening.error}
          onClose={handleOverlayClose}
        />
      )}

      {pixClaim && <PixDialog {...pixClaim} onClose={handlePixClose} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white text-black px-4 py-2.5 text-[13px] font-medium shadow-2xl animate-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
    </>
  );
}

// ── Onboarding: o user não tem coin suficiente pra abrir nada ────────────────
function ZeroBalanceOnboarding({ needed }: { needed: number }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white/70" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white leading-tight">Falta pouco pra sua primeira caixa</p>
          <p className="text-[11.5px] text-white/45 mt-1 leading-relaxed">
            Faltam <span className="font-semibold text-white/70 tabular-nums">{needed.toLocaleString("pt-BR")}</span> URA Coin pra abrir a caixa mais barata. Veja como acelerar:
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <EarnCard href="/elite/pratica" icon={PlayCircle} title="Prática" sub="3 cenários · coin por acerto" />
        <EarnCard href="/elite/aulas" icon={BookOpen} title="Aulas" sub="bônus ao completar módulos" />
        <EarnCard href="/elite/calls" icon={Sparkles} title="Calls ao vivo" sub="presença + engajamento" />
      </div>
    </div>
  );
}

function EarnCard({
  href,
  icon: Icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="interactive-tap rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-3 flex items-center gap-3 hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors"
    >
      <Icon className="w-4 h-4 text-white/55 shrink-0" strokeWidth={1.8} />
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-semibold text-white truncate">{title}</p>
        <p className="text-[10.5px] text-white/40 truncate">{sub}</p>
      </div>
    </Link>
  );
}

// ── Live drops — seus melhores drops (até chegar API comunitária) ───────────
function LiveDrops({ openings }: { openings: RecentOpening[] }) {
  const top = useMemo(() => {
    return [...openings]
      .filter((o) => o.prize.type !== "ura_coin_bonus")
      .sort((a, z) => {
        const rarityScore: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        const rDiff = (rarityScore[z.prize.rarity] ?? 0) - (rarityScore[a.prize.rarity] ?? 0);
        if (rDiff !== 0) return rDiff;
        return (z.prize.value_brl ?? 0) - (a.prize.value_brl ?? 0);
      })
      .slice(0, 5);
  }, [openings]);

  if (top.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] text-white/35 mb-2.5">Seus melhores drops</p>
      <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {top.map((op) => (
          <div
            key={op.id}
            className="shrink-0 snap-start min-w-[220px] rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 flex items-center gap-3"
          >
            <DropThumb type={op.prize.type} imageUrl={op.prize.image_url} name={op.prize.name} />
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-white truncate leading-tight">{op.prize.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-1 h-1 rounded-full ${RARITY_DOT[op.prize.rarity]}`} />
                <span className="text-[11px] text-white/45">{rarityLabel(op.prize.rarity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DropThumb({ type, imageUrl, name }: { type: PrizeType; imageUrl?: string | null; name: string }) {
  if (imageUrl) {
    return (
      <div className="relative shrink-0 w-11 h-11 rounded-lg bg-white/[0.04] border border-white/[0.05] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>
    );
  }
  return (
    <div className="relative shrink-0 w-11 h-11 rounded-lg bg-white/[0.04] border border-white/[0.05] flex items-center justify-center">
      {renderIconFor(type)}
    </div>
  );
}

function renderIconFor(type: PrizeType) {
  const cls = "w-4 h-4 text-white/55";
  if (type === "cash_brl") return <DollarSign className={cls} strokeWidth={1.8} />;
  if (type === "nitro_basic" || type === "nitro_boost") return <Zap className={cls} strokeWidth={1.8} />;
  if (type === "elite_discount" || type === "cupom_custom") return <Ticket className={cls} strokeWidth={1.8} />;
  if (type === "sub_vip" || type === "sub_elite") return <Sparkles className={cls} strokeWidth={1.8} />;
  return <Gift className={cls} strokeWidth={1.8} />;
}

function rarityLabel(r: "common" | "uncommon" | "rare" | "epic" | "legendary"): string {
  return { common: "Comum", uncommon: "Incomum", rare: "Rara", epic: "Épica", legendary: "Lendária" }[r];
}

const RARITY_DOT: Record<"common" | "uncommon" | "rare" | "epic" | "legendary", string> = {
  common: "bg-zinc-400",
  uncommon: "bg-emerald-400",
  rare: "bg-blue-400",
  epic: "bg-purple-400",
  legendary: "bg-amber-400",
};

// ── Segmented control (Apple) ──────────────────────────────────────────────
function Segmented({
  tab,
  setTab,
  counts,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  counts: { boxes: number; direct: number; history: number };
}) {
  const OPTIONS: { id: Tab; label: string }[] = [
    { id: "boxes", label: "Caixas" },
    { id: "direct", label: "Loja direta" },
    { id: "history", label: "Histórico" },
  ];
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
      {OPTIONS.map((opt) => {
        const active = tab === opt.id;
        const count = counts[opt.id];
        return (
          <button
            key={opt.id}
            onClick={() => setTab(opt.id)}
            className={`interactive-tap px-4 h-9 rounded-full text-[12.5px] font-medium transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none ${
              active ? "bg-white text-black" : "text-white/55 hover:text-white"
            }`}
          >
            {opt.label}
            {count > 0 && (
              <span className={`text-[10.5px] font-mono tabular-nums ${active ? "text-black/50" : "text-white/30"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── TAB: Caixas ──────────────────────────────────────────────────────────
function BoxesTab({
  boxes,
  balance,
  onOpen,
  disabled,
}: {
  boxes: BoxWithPrizes[];
  balance: number;
  onOpen: (box: BoxWithPrizes) => void;
  disabled: boolean;
}) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [affordOnly, setAffordOnly] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return boxes.filter((b) => {
      if (tierFilter !== "all" && b.tier !== tierFilter) return false;
      if (affordOnly && balance < b.cost_coins) return false;
      if (term && !b.name.toLowerCase().includes(term) && !(b.description ?? "").toLowerCase().includes(term)) return false;
      return true;
    });
  }, [boxes, search, tierFilter, affordOnly, balance]);

  if (boxes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Filter bar — search compacta + controles agrupados à direita */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar caixa"
            className="w-full h-9 pl-9 pr-3 rounded-full bg-white/[0.03] border border-white/[0.05] text-[12.5px] placeholder:text-white/30 focus:border-white/[0.18] focus:bg-white/[0.04] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
          {(["all", "basic", "premium", "legendary"] as TierFilter[]).map((t) => {
            const active = tierFilter === t;
            const label = t === "all" ? "Todas" : t === "basic" ? "Básica" : t === "premium" ? "Premium" : "Lendária";
            return (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`interactive-tap px-3 h-7 rounded-full text-[11.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none ${
                  active ? "bg-white text-black" : "text-white/45 hover:text-white/75"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setAffordOnly((v) => !v)}
          className={`interactive-tap h-9 px-3.5 rounded-full text-[11.5px] font-medium transition-colors flex items-center gap-1.5 border focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none ${
            affordOnly
              ? "bg-white text-black border-transparent"
              : "bg-white/[0.03] text-white/45 border-white/[0.05] hover:text-white/75"
          }`}
        >
          <UraCoinIcon className="w-3 h-3" />
          Posso abrir
        </button>

        {filtered.length !== boxes.length && (
          <span className="text-[11px] text-white/35 font-mono tabular-nums ml-auto">
            {filtered.length} de {boxes.length}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-14 text-center">
          <p className="text-[13px] text-white/50">Nenhuma caixa bate com o filtro.</p>
          <button
            onClick={() => { setSearch(""); setTierFilter("all"); setAffordOnly(false); }}
            className="mt-3 text-[11.5px] text-white/70 hover:text-white underline underline-offset-4 decoration-white/20"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((box) => (
            <BoxCard
              key={box.id}
              box={box}
              balance={balance}
              onOpen={() => onOpen(box)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Como ganhar mais coin — preenche o espaço abaixo do grid de caixas */}
      {filtered.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <UraCoinIcon className="w-3.5 h-3.5" />
            <h3 className="text-[12px] font-bold text-white/85">Como acumular URA Coin</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <HowTo title="Missão do dia" sub="3 cenários de prática · streak mantida" />
            <HowTo title="Calls ao vivo" sub="Coin por presença e engajamento" />
            <HowTo title="Drops aleatórios" sub="Mensagens surpresa no Discord" />
            <HowTo title="Conquistas" sub="Bonus proporcional à raridade" />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-10 md:p-14 max-w-2xl mx-auto text-center">
      <p className="text-[11px] text-white/40 tracking-[0.12em] mb-4">Próximas caixas em breve</p>
      <h3 className="text-[22px] md:text-[26px] font-semibold text-white tracking-tight mb-4 leading-tight">
        Acumule URA Coin enquanto a temporada não abre
      </h3>
      <p className="text-[13px] text-white/50 leading-relaxed mb-10 max-w-lg mx-auto">
        Quanto mais coin você tem quando as caixas abrem, mais chances de prêmios raros.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <HowTo title="Missão do dia" sub="3 cenários de prática · streak mantida" />
        <HowTo title="Calls ao vivo" sub="Coin por presença e engajamento" />
        <HowTo title="Drops aleatórios" sub="Mensagens surpresa no Discord" />
        <HowTo title="Conquistas" sub="Bonus proporcional à raridade" />
      </div>
    </div>
  );
}

function HowTo({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
      <p className="text-[13px] font-semibold text-white mb-1">{title}</p>
      <p className="text-[11.5px] text-white/45 leading-relaxed">{sub}</p>
    </div>
  );
}

// ── TAB: Histórico ────────────────────────────────────────────────────────
type HistoryFilter = "all" | "cash" | "cosmetic" | "coin" | "other";

function HistorySection({
  openings,
  onClaim,
}: {
  openings: RecentOpening[];
  onClaim: (r: { redemptionId: string; prizeName: string; amountBrl: number | null }) => void;
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const matchFilter = (op: RecentOpening): boolean => {
    if (filter === "all") return true;
    if (filter === "cash") return op.prize.type === "cash_brl";
    if (filter === "coin") return op.prize.type === "ura_coin_bonus";
    if (filter === "cosmetic")
      return ["banner", "profile_design"].includes(op.prize.type);
    return !["cash_brl", "ura_coin_bonus", "banner", "profile_design"].includes(op.prize.type);
  };

  const filtered = openings.filter(matchFilter);
  const visible = expanded ? filtered : filtered.slice(0, 10);
  const hiddenCount = filtered.length - visible.length;
  const totalCoinsSpent = openings.reduce((sum, o) => sum + Number(o.coins_spent || 0), 0);

  // Agrupa por bucket temporal (Hoje, Ontem, Últimos 7d, Mais antigo)
  const grouped = useMemo(() => groupByTime(visible), [visible]);

  const FILTERS: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "Tudo" },
    { id: "cash", label: "Cash" },
    { id: "cosmetic", label: "Cosméticos" },
    { id: "coin", label: "Coin Bonus" },
    { id: "other", label: "Outros" },
  ];

  if (openings.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-16 text-center max-w-md mx-auto">
        <p className="text-[14px] text-white/60 font-medium mb-1.5">Nenhuma abertura ainda</p>
        <p className="text-[12px] text-white/35">Abra sua primeira caixa na aba Caixas.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Seus melhores drops — agrupado dentro do histórico pra não poluir o topo */}
      <div className="mb-6">
        <LiveDrops openings={openings} />
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-[11.5px] text-white/40">
          {openings.length} aberturas · {totalCoinsSpent.toLocaleString("pt-BR")} coin gastos
        </p>

        <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setExpanded(false); }}
                className={`interactive-tap px-3 h-7 rounded-full text-[11.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none ${
                  active ? "bg-white text-black" : "text-white/45 hover:text-white/75"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-10 text-center">
          <p className="text-[12px] text-white/35">Nenhuma abertura nesse filtro.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="text-[10.5px] text-white/35 tracking-[0.1em] mb-2">{group.label}</p>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] overflow-hidden">
                  {group.items.map((op) => (
                    <RecentRow key={op.id} op={op} onClaim={onClaim} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="interactive-tap mt-4 w-full flex items-center justify-center gap-1.5 h-10 rounded-full border border-white/[0.05] bg-white/[0.02] text-[12px] font-medium text-white/65 hover:text-white hover:border-white/[0.12] transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Ver mais {hiddenCount}
            </button>
          )}
          {expanded && filtered.length > 10 && (
            <button
              onClick={() => setExpanded(false)}
              className="interactive-tap mt-4 w-full flex items-center justify-center gap-1.5 h-10 rounded-full text-[12px] font-medium text-white/45 hover:text-white/70 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Recolher
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Agrupa openings em buckets temporais relativos
function groupByTime(openings: RecentOpening[]): Array<{ label: string; items: RecentOpening[] }> {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const groups = {
    today: [] as RecentOpening[],
    yesterday: [] as RecentOpening[],
    week: [] as RecentOpening[],
    older: [] as RecentOpening[],
  };

  for (const op of openings) {
    const age = now - new Date(op.opened_at).getTime();
    if (age < ONE_DAY) groups.today.push(op);
    else if (age < ONE_DAY * 2) groups.yesterday.push(op);
    else if (age < ONE_DAY * 7) groups.week.push(op);
    else groups.older.push(op);
  }

  const out: Array<{ label: string; items: RecentOpening[] }> = [];
  if (groups.today.length) out.push({ label: "Hoje", items: groups.today });
  if (groups.yesterday.length) out.push({ label: "Ontem", items: groups.yesterday });
  if (groups.week.length) out.push({ label: "Últimos 7 dias", items: groups.week });
  if (groups.older.length) out.push({ label: "Mais antigo", items: groups.older });
  return out;
}

function RecentRow({
  op,
  onClaim,
}: {
  op: RecentOpening;
  onClaim: (r: { redemptionId: string; prizeName: string; amountBrl: number | null }) => void;
}) {
  const needsPix = op.prize.type === "cash_brl" && op.redemption?.status === "pending_claim";
  const statusLabel = getStatusLabel(op.prize.type, op.redemption?.status);

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.04] last:border-0">
      <PrizeTile
        name={op.prize.name}
        type={op.prize.type}
        rarity={op.prize.rarity}
        valueBrl={op.prize.value_brl}
        imageUrl={op.prize.image_url}
        compact
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{op.prize.name}</div>
        <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
          <UraCoinIcon className="w-3 h-3" />
          <span className="tabular-nums">{op.coins_spent.toLocaleString("pt-BR")}</span>
          <span>·</span>
          <time>{formatTimeAgo(op.opened_at)}</time>
        </div>
      </div>
      {needsPix && op.redemption ? (
        <button
          onClick={() =>
            onClaim({
              redemptionId: op.redemption!.id,
              prizeName: op.prize.name,
              amountBrl: op.prize.value_brl,
            })
          }
          className="interactive-tap text-[12px] font-semibold h-8 px-3.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
        >
          Enviar PIX
        </button>
      ) : statusLabel ? (
        <span className="text-[11px] text-white/40">{statusLabel}</span>
      ) : null}
    </div>
  );
}

function getStatusLabel(type: PrizeType, status?: string): string | null {
  // Não mostra status redundante pra coin bonus — ícone + valor já comunicam
  if (type === "ura_coin_bonus") return null;
  if (status === "fulfilled") return "entregue";
  if (status === "pending_claim") return "aguardando PIX";
  if (status === "pending_fulfillment") return "em entrega";
  if (status === "cancelled") return "cancelado";
  return null;
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.round(hrs / 24);
  return `${days}d atrás`;
}

export type { PrizeType };
