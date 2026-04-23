import WebSocket from "ws";
import pako from "pako";
import { env } from "./env.js";
import { log } from "./log.js";
import { broadcast } from "./supabase.js";

const BINGX_REST = env.BINGX_PROXY_URL && env.BINGX_PROXY_SECRET
  ? { url: `${env.BINGX_PROXY_URL}/bingx`, secret: env.BINGX_PROXY_SECRET }
  : { url: "https://open-api.bingx.com", secret: "" };

const BINGX_WS_URL = "wss://open-api-swap.bingx.com/swap-market";

/** Cria listenKey via REST. 1 por user. */
export async function createListenKey(apiKey: string): Promise<string> {
  const headers: Record<string, string> = { "X-BX-APIKEY": apiKey };
  if (BINGX_REST.secret) headers["X-URA-PROXY-SECRET"] = BINGX_REST.secret;
  const res = await fetch(`${BINGX_REST.url}/openApi/user/auth/userDataStream`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error(`listenKey create failed: ${res.status}`);
  const json = await res.json() as { listenKey?: string };
  if (!json.listenKey) throw new Error("listenKey ausente na resposta");
  return json.listenKey;
}

/** Renova listenKey (válido 60min desde o último renew). */
export async function renewListenKey(apiKey: string, listenKey: string): Promise<void> {
  const headers: Record<string, string> = { "X-BX-APIKEY": apiKey };
  if (BINGX_REST.secret) headers["X-URA-PROXY-SECRET"] = BINGX_REST.secret;
  const res = await fetch(`${BINGX_REST.url}/openApi/user/auth/userDataStream?listenKey=${listenKey}`, {
    method: "PUT",
    headers,
  });
  if (!res.ok) throw new Error(`listenKey renew failed: ${res.status}`);
}

/** Fecha listenKey no server BingX (limpa recursos). */
export async function closeListenKey(apiKey: string, listenKey: string): Promise<void> {
  const headers: Record<string, string> = { "X-BX-APIKEY": apiKey };
  if (BINGX_REST.secret) headers["X-URA-PROXY-SECRET"] = BINGX_REST.secret;
  await fetch(`${BINGX_REST.url}/openApi/user/auth/userDataStream?listenKey=${listenKey}`, {
    method: "DELETE",
    headers,
  }).catch(() => {});
}

export class UserStream {
  private ws: WebSocket | null = null;
  private listenKey: string | null = null;
  private renewTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isStopped = false;

  constructor(
    private userId: string,
    private exchange: string,
    private apiKey: string,
  ) {}

  async start() {
    if (this.isStopped) return;
    try {
      this.listenKey = await createListenKey(this.apiKey);
      log.info("user stream listenKey created", { userId: this.userId });
      this.connect();
      this.scheduleRenew();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error("listenKey creation failed, retrying", { userId: this.userId, err: msg });
      this.scheduleReconnect();
    }
  }

  private connect() {
    if (!this.listenKey || this.isStopped) return;
    const url = `${BINGX_WS_URL}?listenKey=${this.listenKey}`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      log.info("WS open", { userId: this.userId });
      this.reconnectAttempts = 0;
      this.startPing();
    });

    this.ws.on("message", (data: WebSocket.RawData) => {
      let text: string | null = null;
      try {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
        try {
          text = pako.ungzip(buf, { to: "string" });
        } catch {
          text = buf.toString("utf-8");
        }

        const trimmed = text.trim();

        // Control frames BingX (texto puro, não JSON):
        // - "Ping" do server → responde "Pong"
        // - "Pong" em resposta ao nosso Ping → ignora
        if (trimmed.startsWith("Ping")) {
          this.ws?.send("Pong");
          return;
        }
        if (trimmed.startsWith("Pong")) {
          return;
        }

        // Qualquer coisa que não pareça JSON é frame não-modelado — ignora em debug
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
          log.debug("WS non-JSON frame ignored", { userId: this.userId, preview: trimmed.slice(0, 80) });
          return;
        }

        const payload = JSON.parse(trimmed);
        this.handleEvent(payload);
      } catch (err) {
        log.warn("WS message parse error", {
          userId: this.userId,
          err: err instanceof Error ? err.message : String(err),
          preview: text ? text.slice(0, 120) : null,
        });
      }
    });

    this.ws.on("close", (code, reason) => {
      log.warn("WS closed", { userId: this.userId, code, reason: reason.toString() });
      this.cleanupSocket();
      if (!this.isStopped) this.scheduleReconnect();
    });

    this.ws.on("error", (err) => {
      log.error("WS error", { userId: this.userId, err: err.message });
      // close handler cuida do reconnect
    });
  }

  private startPing() {
    this.stopPing();
    // BingX espera cliente enviar Ping a cada 30s (ou server manda e gente responde Pong)
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send("Ping");
        } catch {}
      }
    }, 30_000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleRenew() {
    if (this.renewTimer) clearTimeout(this.renewTimer);
    // Renova a cada 55min (válido 60min)
    this.renewTimer = setTimeout(async () => {
      if (this.listenKey && !this.isStopped) {
        try {
          await renewListenKey(this.apiKey, this.listenKey);
          log.info("listenKey renewed", { userId: this.userId });
          this.scheduleRenew();
        } catch (err) {
          log.warn("listenKey renew failed, recreating", { userId: this.userId, err: err instanceof Error ? err.message : String(err) });
          this.cleanupSocket();
          this.start(); // recria do zero
        }
      }
    }, 55 * 60 * 1000);
  }

  private scheduleReconnect() {
    if (this.isStopped) return;
    this.reconnectAttempts += 1;
    const delay = Math.min(30_000, 1000 * Math.pow(2, this.reconnectAttempts));
    log.info("reconnect scheduled", { userId: this.userId, attempt: this.reconnectAttempts, delayMs: delay });
    setTimeout(() => {
      if (!this.isStopped) this.start();
    }, delay);
  }

  private cleanupSocket() {
    this.stopPing();
    if (this.ws) {
      try { this.ws.removeAllListeners(); this.ws.close(); } catch {}
      this.ws = null;
    }
  }

  private handleEvent(payload: Record<string, unknown>) {
    // Eventos BingX user stream:
    // - ACCOUNT_UPDATE: mudança de saldo/posição
    // - ORDER_TRADE_UPDATE: fill/execution
    // - listenKeyExpired: precisa recriar
    const e = (payload.e as string) || (payload.event as string);
    if (e === "listenKeyExpired") {
      log.warn("listenKey expired signal received, recreating", { userId: this.userId });
      this.cleanupSocket();
      this.start();
      return;
    }

    // Broadcast seletivo pra reduzir ruído na Realtime
    if (e === "ACCOUNT_UPDATE" || e === "ORDER_TRADE_UPDATE") {
      broadcast(this.userId, this.exchange, e, payload).catch((err) => {
        log.warn("broadcast failed", { userId: this.userId, event: e, err: err instanceof Error ? err.message : String(err) });
      });
      log.debug("forwarded event", { userId: this.userId, event: e });
    }
  }

  async stop() {
    this.isStopped = true;
    if (this.renewTimer) clearTimeout(this.renewTimer);
    this.stopPing();
    this.cleanupSocket();
    if (this.listenKey) {
      await closeListenKey(this.apiKey, this.listenKey);
    }
    log.info("user stream stopped", { userId: this.userId });
  }
}
