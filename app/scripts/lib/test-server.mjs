// Servidor Next de pruebas sobre una copia fresca de la base (data/seguimiento.test.db).
// Los checks E2E lo usan en lugar del servidor de producción: nunca escriben en data/seguimiento.db.
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

export async function startTestServer(port = Number(process.env.TEST_PORT ?? 3101), { migrate = false } = {}) {
  const dst = resolve("data/seguimiento.test.db");
  for (const ext of ["", "-journal", "-wal", "-shm"]) if (existsSync(dst + ext)) unlinkSync(dst + ext);
  copyFileSync(resolve(process.env.TEST_SOURCE_DB ?? "data/seguimiento.db"), dst);
  if (migrate) {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], { env: { ...process.env, DATABASE_URL: `file:${dst}`, LOCAL_DEMO: "1" }, encoding: "utf8" });
    if (result.status !== 0) throw new Error(`Migración de copia de pruebas: ${result.stderr}`);
  }
  const child = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
    // LOCAL_DEMO=1: modo producción local con PIN de demo y base de archivo (la guardia lo exige; en Vercel se ignora).
    env: { ...process.env, DATABASE_URL: "file:./data/seguimiento.test.db", LOCAL_DEMO: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  const base = `http://localhost:${port}`;
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(`${base}/login`)).ok) break;
    } catch {
      /* aún arrancando */
    }
    if (i > 80 || child.exitCode !== null) throw new Error(`El servidor de pruebas no arrancó:\n${log}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`Servidor de pruebas ${base} sobre data/seguimiento.test.db (copia fresca; la base viva no se toca)`);
  return { base, stop: () => child.kill() };
}
