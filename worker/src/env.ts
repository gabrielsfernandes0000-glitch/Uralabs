// Env loader — fail fast se variaveis criticas faltarem.
// No Railway, envs ficam no dashboard. Local, usar .env com dotenv (npm i dotenv) ou exportar na shell.

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}`);
  return v.trim();
}

export const env = {
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),
  EXCHANGE_ENCRYPTION_KEY: required("EXCHANGE_ENCRYPTION_KEY"),
  PORT: parseInt(process.env.PORT || "8080"),
  // Opcional: proxy BingX via CF Worker (mesma env do site)
  BINGX_PROXY_URL: process.env.BINGX_PROXY_URL?.replace(/\/$/, "") || "",
  BINGX_PROXY_SECRET: process.env.BINGX_PROXY_SECRET || "",
  // Intervalo em ms pra reconciliar DB vs WS ativos
  RECONCILE_INTERVAL_MS: parseInt(process.env.RECONCILE_INTERVAL_MS || "30000"),
  // Log level
  LOG_LEVEL: (process.env.LOG_LEVEL || "info") as "debug" | "info" | "warn" | "error",
};
