import "./loadEnv.js"; // MUST come before any import that reads env
import { createServer } from "http";
import { env } from "./env.js";
import { log } from "./log.js";
import { Manager } from "./manager.js";

const manager = new Manager();

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      service: "uralabs-exchange-worker",
      activeStreams: manager.activeCount(),
      uptime: process.uptime(),
      ts: Date.now(),
    }));
    return;
  }
  res.writeHead(404);
  res.end("Not Found");
});

server.listen(env.PORT, () => {
  log.info("http server listening", { port: env.PORT });
});

manager.start().catch((err) => {
  log.error("manager start failed", { err: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});

// Graceful shutdown: limpa streams antes de sair
async function shutdown(sig: string) {
  log.info("shutdown signal", { sig });
  server.close();
  await manager.stopAll();
  log.info("goodbye");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  log.error("unhandledRejection", { reason: reason instanceof Error ? reason.message : String(reason) });
});
process.on("uncaughtException", (err) => {
  log.error("uncaughtException", { err: err.message, stack: err.stack });
  // Nao morre — Railway restartaria, mas queremos dar chance de recovery
});
