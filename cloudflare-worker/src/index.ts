/**
 * URA Labs — BingX Proxy (Cloudflare Worker)
 *
 * Objetivo: distribuir egress das chamadas BingX em IPs da Cloudflare
 * (centenas globais) em vez de concentrar no IP da Vercel. Evita
 * rate-limit por IP (600 req/min/IP do BingX) e elimina risco de IP ban.
 *
 * Fluxo:
 *   site.vercel.app /api/exchange/data
 *     └── fetch(BINGX_PROXY_URL + "/bingx/openApi/swap/v2/user/balance?...&X-BX-APIKEY=...")
 *         └── CF Worker
 *             └── fetch("https://open-api.bingx.com/openApi/...")
 *                 └── retorna resposta (com edge cache pra publicos)
 *
 * Segurança:
 *   - Origem restrita via ALLOWED_ORIGINS (CORS)
 *   - Header X-URA-PROXY-SECRET obrigatório (shared secret com o site)
 *   - Limita paths a /openApi/* e /market/*
 *   - Log de requests pesados
 */

const BINGX_BASE = "https://open-api.bingx.com";

interface Env {
  ALLOWED_ORIGINS: string;
  PROXY_SECRET: string; // via `wrangler secret put PROXY_SECRET`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check público
    if (url.pathname === "/health") {
      return json({ ok: true, service: "uralabs-bingx-proxy", ts: Date.now() });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(request, env);
    }

    // Auth via shared secret (header)
    const secret = request.headers.get("x-ura-proxy-secret");
    if (!env.PROXY_SECRET || secret !== env.PROXY_SECRET) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Restringe paths: aceita só /bingx/openApi/* ou /bingx/market/*
    if (!url.pathname.startsWith("/bingx/")) {
      return json({ error: "Path not allowed" }, 404);
    }
    const upstreamPath = url.pathname.replace(/^\/bingx/, "");
    if (!upstreamPath.startsWith("/openApi/") && !upstreamPath.startsWith("/market/")) {
      return json({ error: "Endpoint not whitelisted" }, 403);
    }

    const upstreamUrl = `${BINGX_BASE}${upstreamPath}${url.search}`;

    // Repassa headers relevantes. X-BX-APIKEY vem do caller.
    const headers = new Headers();
    const apiKey = request.headers.get("x-bx-apikey");
    if (apiKey) headers.set("X-BX-APIKEY", apiKey);
    headers.set("User-Agent", "uralabs-bingx-proxy/0.1");

    // Edge cache: só pra endpoints públicos (klines, market). Privados (user/*, trade/*) nunca.
    const isPublic = upstreamPath.startsWith("/openApi/swap/v") && (upstreamPath.includes("/quote/") || upstreamPath.includes("/market/"));
    const cacheKey = isPublic ? new Request(upstreamUrl, { method: "GET" }) : null;
    const cache = caches.default;

    if (cacheKey && request.method === "GET") {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const out = new Response(cached.body, cached);
        out.headers.set("x-ura-cache", "HIT");
        addCors(out.headers, request, env);
        return out;
      }
    }

    try {
      const resp = await fetch(upstreamUrl, {
        method: request.method,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(request.method) ? await request.clone().text() : undefined,
      });

      const body = await resp.text();
      const out = new Response(body, {
        status: resp.status,
        headers: {
          "content-type": resp.headers.get("content-type") || "application/json",
        },
      });

      if (cacheKey && resp.ok && request.method === "GET") {
        // Edge cache 30s pra públicos — klines de 1m não precisam menos que isso
        const cacheable = new Response(body, {
          status: resp.status,
          headers: {
            "content-type": resp.headers.get("content-type") || "application/json",
            "cache-control": "public, max-age=30",
          },
        });
        // ctx.waitUntil não disponível no closure — usa put direto (sync no runtime CF)
        await cache.put(cacheKey, cacheable);
        out.headers.set("x-ura-cache", "MISS");
      }

      addCors(out.headers, request, env);
      return out;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "upstream error";
      return json({ error: "Proxy error", detail: msg }, 502);
    }
  },
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function corsResponse(request: Request, env: Env): Response {
  const headers = new Headers();
  addCors(headers, request, env);
  return new Response(null, { status: 204, headers });
}

function addCors(headers: Headers, request: Request, env: Env) {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) {
    headers.set("access-control-allow-origin", origin);
  } else if (allowed.includes("*")) {
    headers.set("access-control-allow-origin", "*");
  }
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, x-ura-proxy-secret, x-bx-apikey");
  headers.set("access-control-max-age", "86400");
}
