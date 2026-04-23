import { loadActiveConnections, type ExchangeConnection } from "./supabase.js";
import { decrypt } from "./crypto.js";
import { UserStream } from "./bingxWs.js";
import { log } from "./log.js";
import { env } from "./env.js";

/** Gerencia o lifecycle de todos os UserStreams baseado em `exchange_connections.active`.
 *  A cada RECONCILE_INTERVAL_MS:
 *  1. Lê connections ativas do DB
 *  2. Abre UserStream pros que ainda não têm
 *  3. Fecha UserStream pros que foram removidos/desativados
 *  4. Mantém os que já estão conectados */
export class Manager {
  private streams = new Map<string, UserStream>();
  private reconcileTimer: NodeJS.Timeout | null = null;
  private isStopping = false;

  async start() {
    log.info("manager starting", { reconcileMs: env.RECONCILE_INTERVAL_MS });
    await this.reconcile();
    this.scheduleReconcile();
  }

  private scheduleReconcile() {
    if (this.isStopping) return;
    this.reconcileTimer = setTimeout(async () => {
      await this.reconcile().catch((err) => log.error("reconcile failed", { err: err instanceof Error ? err.message : String(err) }));
      this.scheduleReconcile();
    }, env.RECONCILE_INTERVAL_MS);
  }

  private keyOf(c: ExchangeConnection): string {
    return `${c.discord_user_id}:${c.exchange}`;
  }

  private async reconcile() {
    const connections = await loadActiveConnections();
    const currentKeys = new Set<string>();

    for (const conn of connections) {
      const key = this.keyOf(conn);
      currentKeys.add(key);
      if (this.streams.has(key)) continue;

      // Descriptografa apiKey (secret nao precisamos pro WS — só pro REST auth)
      let apiKey: string;
      try {
        apiKey = decrypt(conn.api_key_encrypted, conn.iv);
      } catch (err) {
        log.error("decrypt api_key failed, skipping", { userId: conn.discord_user_id, err: err instanceof Error ? err.message : String(err) });
        continue;
      }

      log.info("starting user stream", { userId: conn.discord_user_id, exchange: conn.exchange });
      const stream = new UserStream(conn.discord_user_id, conn.exchange, apiKey);
      this.streams.set(key, stream);
      stream.start().catch((err) => log.error("stream start failed", { userId: conn.discord_user_id, err: err instanceof Error ? err.message : String(err) }));
    }

    // Fecha streams órfãos (connection desativada/removida)
    for (const [key, stream] of this.streams) {
      if (!currentKeys.has(key)) {
        const [userId] = key.split(":");
        log.info("stopping orphaned stream", { userId });
        await stream.stop();
        this.streams.delete(key);
      }
    }

    log.debug("reconcile done", { active: this.streams.size });
  }

  activeCount(): number {
    return this.streams.size;
  }

  async stopAll() {
    this.isStopping = true;
    if (this.reconcileTimer) clearTimeout(this.reconcileTimer);
    log.info("manager stopping all streams", { count: this.streams.size });
    await Promise.all([...this.streams.values()].map((s) => s.stop()));
    this.streams.clear();
  }
}
