import { notFound } from "next/navigation";
import { getSupabaseAnon } from "@/lib/supabase";
import { InviteClient, type InviteData, type InviteStatus } from "./InviteClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return {
    title: "Convite Elite · URA Labs",
    description: "Seu convite pessoal pra próxima turma do Elite.",
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.uralabs.com.br/convite/${token}` },
  };
}

type ConviteRpcRow = {
  token: string;
  discord_user_id: string;
  nome_exibicao: string;
  turma: string;
  valor_centavos: number;
  duracao_meses: number;
  vagas_totais: number;
  numero_convite: number;
  sent_at: string;
  expires_at: string;
  opened_at: string | null;
  decided_at: string | null;
  status: string;
  email_contato: string | null;
  vagas_restantes: number;
  total_convites_turma: number;
  aceitos_turma: number;
};

function effectiveStatus(row: ConviteRpcRow): InviteStatus {
  if (row.status === "accepted" || row.status === "declined") return row.status;
  if (new Date(row.expires_at).getTime() < Date.now()) return "expired";
  if (row.status === "expired") return "expired";
  if (row.status === "opened") return "opened";
  return "pending";
}

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 8 || token.length > 64) return notFound();

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.rpc("get_convite_by_token", { p_token: token });

  if (error) {
    console.error("[convite] rpc error:", error);
    return notFound();
  }
  const rows = (data ?? []) as ConviteRpcRow[];
  const row = rows[0];
  if (!row) return notFound();

  const invite: InviteData = {
    token: row.token,
    nomeExibicao: row.nome_exibicao,
    turma: row.turma,
    valorCentavos: row.valor_centavos,
    duracaoMeses: row.duracao_meses,
    vagasTotais: row.vagas_totais,
    vagasRestantes: row.vagas_restantes,
    numeroConvite: row.numero_convite,
    totalConvites: row.total_convites_turma,
    aceitos: row.aceitos_turma,
    expiresAt: row.expires_at,
    status: effectiveStatus(row),
    emailContato: row.email_contato,
  };

  return <InviteClient invite={invite} />;
}
