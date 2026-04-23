# URA Labs — BingX Proxy (Cloudflare Worker)

Proxy leve pra BingX REST API. Distribui egress em IPs da Cloudflare (centenas globais) pra evitar IP ban da Vercel e aumentar a capacidade antes de bater o rate limit da BingX (600 req/min/IP).

## Setup inicial (1x)

1. Criar conta Cloudflare se ainda não tem: https://dash.cloudflare.com/sign-up
2. Instalar wrangler CLI + autenticar:
   ```bash
   cd cloudflare-worker
   npm install
   npx wrangler login   # abre browser pra autorizar
   ```
3. Gerar um shared secret (usado pra autenticar chamadas vindas do site):
   ```bash
   openssl rand -hex 32
   ```
4. Setar o secret no Worker:
   ```bash
   npx wrangler secret put PROXY_SECRET
   # cola o valor gerado quando pedir
   ```
5. Deploy:
   ```bash
   npx wrangler deploy
   ```
   Vai imprimir uma URL tipo `https://uralabs-bingx-proxy.<seu-sub>.workers.dev`.

6. Setar env vars no site (Vercel):
   ```bash
   cd ../site
   vercel env add BINGX_PROXY_URL production
   # cola a URL do Worker (sem trailing slash)
   vercel env add BINGX_PROXY_SECRET production
   # cola o mesmo secret
   ```
7. Redeploy do site pra carregar as envs:
   ```bash
   vercel --prod
   ```

Pronto — `site/src/lib/exchange/bingx.ts` detecta `BINGX_PROXY_URL` e começa a rotear automaticamente. Se qualquer uma das duas envs não estiver presente, funciona no modo direto (como antes).

## Observabilidade

- Tail logs em tempo real:
  ```bash
  npx wrangler tail
  ```
- Dashboard com métricas de requests/erros/latência:
  https://dash.cloudflare.com → Workers → uralabs-bingx-proxy

## Custos

- **Free tier:** 100k req/dia. Primeiros ~50-100 users ativos cabem com folga.
- **Paid ($5/mês):** 10M req/dia. Cobre até ~5000 users ativos.

## Segurança

- Todas as chamadas exigem header `x-ura-proxy-secret` (shared secret com o site).
- Whitelist de paths: só `/bingx/openApi/*` e `/bingx/market/*` são aceitos.
- CORS restrito via `ALLOWED_ORIGINS` em `wrangler.toml`.
- Edge cache só pra endpoints públicos (klines/market), nunca pra user data.

## Dev local

```bash
npx wrangler dev
# Worker sobe em http://localhost:8787 simulando o ambiente CF
```

Pra testar:
```bash
curl -H "x-ura-proxy-secret: <SEU_SECRET>" \
     "http://localhost:8787/bingx/openApi/swap/v2/quote/klines?symbol=BTC-USDT&interval=1m&limit=3"
```
