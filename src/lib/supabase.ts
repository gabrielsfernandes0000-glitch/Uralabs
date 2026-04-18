import { createClient } from "@supabase/supabase-js";

/**
 * URL e anon key são **públicos por design** — Supabase expõe a anon key no
 * JavaScript do browser em qualquer projeto que use o client JS. Por isso
 * ficam hardcoded como fallback caso as env vars não estejam setadas no Vercel.
 * O que nunca deve vir pro client é a SERVICE_ROLE_KEY (que bypassa RLS).
 *
 * Env vars continuam tendo prioridade — se precisar trocar, só setar no
 * dashboard do Vercel que sobrescreve.
 */
const DEFAULT_URL = "https://nqozuxvhdzyawwdkwgvb.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3p1eHZoZHp5YXd3ZGt3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODU1MzEsImV4cCI6MjA5MTE2MTUzMX0.9c19sQBtohJVsCHLj2sEX5-blMSOZQ7blHmR9ZjOO7g";

/**
 * Server-side Supabase client com service role (bypassa RLS).
 * Usado só quando realmente precisa — prefira `getSupabaseAnon()` +
 * RPCs security-definer pra operações públicas por token.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Supabase admin não configurado: falta SUPABASE_SERVICE_ROLE_KEY");
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
 */
export function getSupabaseAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? DEFAULT_ANON_KEY;

  return createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
