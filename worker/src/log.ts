import { env } from "./env.js";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const current = LEVELS[env.LOG_LEVEL] || 20;

function emit(level: keyof typeof LEVELS, msg: string, extra?: Record<string, unknown>) {
  if (LEVELS[level] < current) return;
  const line = {
    t: new Date().toISOString(),
    lvl: level,
    msg,
    ...(extra || {}),
  };
  const s = JSON.stringify(line);
  if (level === "error" || level === "warn") console.error(s);
  else console.log(s);
}

export const log = {
  debug: (msg: string, extra?: Record<string, unknown>) => emit("debug", msg, extra),
  info: (msg: string, extra?: Record<string, unknown>) => emit("info", msg, extra),
  warn: (msg: string, extra?: Record<string, unknown>) => emit("warn", msg, extra),
  error: (msg: string, extra?: Record<string, unknown>) => emit("error", msg, extra),
};
