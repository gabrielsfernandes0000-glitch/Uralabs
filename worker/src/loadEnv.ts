// Carrega .env ANTES de qualquer outro import (incluindo env.ts).
// Railway injeta envs nativamente, entao skipa em prod.
import fs from "fs";
import path from "path";

if (process.env.NODE_ENV !== "production" && !process.env.RAILWAY_ENVIRONMENT) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  }
}
