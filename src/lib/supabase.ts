import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client com service role (bypassa RLS).
 * Usado só quando realmente precisa — prefira `getSupabaseAnon()` +
 * RPCs security-definer pra operações públicas por token.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase admin vars not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Anon client — usa chave pública. Acesso à tabela `elite_convites` passa
 * exclusivamente por RPCs security-definer (get_convite_by_token,
 * accept_convite, decline_convite). Seguro porque o token é 14 chars random
 * (~10²⁰ combinações).
 *
 * Fallback: se anon não estiver configurada, usa service role. Assim o deploy
 * funciona mesmo que a env var NEXT_PUBLIC_SUPABASE_ANON_KEY não esteja
 * setada ainda no Vercel.
 */
export function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anon) {
    return createClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  // Fallback pra service role — as RPCs têm check próprio de validação,
  // então rodar com service role apenas bypassa RLS (não há RLS policies ativas
  // no fluxo, então comportamento é idêntico).
  return getSupabaseAdmin();
}
