# URA Labs — Exchange Worker

Long-running Node worker que mantém WebSockets persistentes com BingX (user data stream) por usuário ativo e faz push de eventos (fills, balance updates) via Supabase Realtime.

Substitui o polling 30s do cliente quando ativo. Fallback automático pra polling se o worker estiver offline.

## O que faz

1. A cada 30s, lê `exchange_connections WHERE status='active' AND exchange='bingx'` do Supabase.
2. Pra cada row nova: descriptografa API key, cria `listenKey` via BingX REST, abre WebSocket.
3. Mantém listenKey renovado automaticamente (refresh a cada 55min).
4. Quando chega evento `ACCOUNT_UPDATE` ou `ORDER_TRADE_UPDATE`, faz broadcast no canal Realtime `exchange:<userId>:<exchange>`.
5. Reconnect com backoff exponencial (1s→30s max) em caso de queda.
6. Graceful shutdown em SIGTERM: fecha WS, deleta listenKeys do BingX.

## Arquitetura

```
exchange_connections (status=active) 
   ↓ reconcile 30s
Manager
   ↓ 1 UserStream per (userId, exchange)
UserStream: WebSocket BingX + listenKey refresh + reconnect
   ↓ event (ACCOUNT_UPDATE, ORDER_TRADE_UPDATE)
Supabase Realtime broadcast channel `exchange:userId:exchange`
   ↓
Cliente Next.js (hook useExchangeRealtime)
```

## Setup local (dev)

```bash
cd site/worker
npm install
cp .env.example .env
# Preenche .env com valores reais

# Rodar com tsx hot reload:
npm run dev

# Ou build + run:
npm run build && npm start
```

Teste health:
```bash
curl http://localhost:8080/health
```

## Deploy no Railway

1. Criar conta: https://railway.app
2. New Project → Empty Project
3. Service → Deploy from GitHub repo → escolhe `Uralabs`
4. Root Directory: `site/worker`
5. Dockerfile é detectado automaticamente
6. Variables (colar no dashboard Railway):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EXCHANGE_ENCRYPTION_KEY`
   - `BINGX_PROXY_URL` (opcional, se usar CF Worker)
   - `BINGX_PROXY_SECRET` (opcional)
   - `LOG_LEVEL=info` (recomendado)
   - `PORT=8080`
7. Deploy.
8. (opcional) Setting → Custom Domain → `worker.uralabs.com.br` — pra facilitar UptimeRobot

### Custo
- Hobby plan: $5/mês fixo + $5 crédito incluído (= efetivamente grátis em baixo uso)
- Worker consome ~$2-3/mês em recursos (256MB RAM, CPU idle)
- Sobra crédito pra testes

## Deploy em outras plataformas

Dockerfile padrão, stateless. Roda em:
- **Fly.io:** `fly launch --dockerfile Dockerfile` + `fly secrets set ...`
- **Google Cloud Run:** use `min_instances=1` pra não scale-to-zero
- **Render Background Worker:** Starter $7/mês
- **AWS ECS/Fargate:** Task Definition com a imagem, Service = 1 task sempre running
- **Self-hosted:** `docker build -t worker . && docker run --env-file .env worker`

Nenhuma dependência proprietária Railway. Portabilidade total.

## Observabilidade

- Logs: JSON estruturado em stdout/stderr (Railway, Fly, CloudWatch entendem)
- Health: `GET /health` retorna `{ activeStreams, uptime, ts }`
- Alertas: configurar UptimeRobot (https://uptimerobot.com/) pra pingar `/health` a cada 5min com webhook Discord em caso de falha

## Troubleshooting

**Worker não pega user novo que se conectou:**
- Reconcile roda a cada 30s. Espera 30s.
- Se não funcionou: log `reconcile done active=N` sobe? Query na `exchange_connections` tá filtrando direito?

**listenKey expirado / WS fecha:**
- Refresh automático a cada 55min. Se cair antes, reconnect em 1s.
- Se o BingX retornar 401 no listenKey create, API key está inválida — DB tá com row stale.

**Usuário vê atualizações atrasadas:**
- Cliente está com Supabase Realtime conectado? Verificar indicador "live" no header da corretora.
- Se não: fallback polling 60s ativo — confirma com DevTools Network.

## Segurança

- Worker usa `service_role` do Supabase (ver env). NUNCA commitar.
- `EXCHANGE_ENCRYPTION_KEY` idêntica à usada pelo site — descriptografa api_keys.
- WS BingX fica apenas em memória do worker, nunca persistido.
- Graceful shutdown deleta listenKeys remotas pra não deixar recurso pendurado.
