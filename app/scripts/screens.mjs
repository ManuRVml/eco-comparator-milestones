// Capturas de pantalla completas por rol con Playwright.
// Uso: pnpm run screens [-- nombre ...]   (servidor en BASE_URL, por defecto http://localhost:3100)
// Los PIN se leen de .env.local y nunca se imprimen ni viajan en la URL.
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = resolve(process.env.SCREENS_DIR ?? "docs/screens");
const WIDTH = Number(process.env.SCREENS_WIDTH ?? 1440);
const PIN = { cliente: process.env.PIN_CLIENTE, editor: process.env.PIN_EDITOR, admin: process.env.PIN_ADMIN };

const SHOTS = [
  { name: "dashboard", role: "cliente", path: "/" },
  { name: "timeline", role: "cliente", path: "/lineas" },
  { name: "milestone", role: "cliente", path: "/milestones/M-01" },
  { name: "area", role: "cliente", path: "/areas" },
  { name: "agenda", role: "cliente", path: "/agenda" },
  { name: "editor", role: "editor", path: "/editor?ms=M-01" },
  { name: "log", role: "editor", path: "/bitacora" },
];

async function login(browser, role) {
  if (!PIN[role]) throw new Error(`Falta el PIN para el rol ${role} en .env.local`);
  const context = await browser.newContext({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 1, locale: "es-CO" });
  const page = await context.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill("#pin", PIN[role]);
  await Promise.all([page.waitForURL(`${BASE}/`), page.click("button[type=submit]")]);
  return { context, page };
}

const wanted = process.argv.slice(2).filter((a) => a !== "--");
const shots = wanted.length ? SHOTS.filter((s) => wanted.includes(s.name)) : SHOTS;
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const sessions = {};
try {
  for (const shot of shots) {
    sessions[shot.role] ??= await login(browser, shot.role);
    const { page } = sessions[shot.role];
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400); // animaciones de entrada
    const file = resolve(OUT, `${shot.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${shot.role.padEnd(7)} ${shot.path.padEnd(18)} -> ${file}`);
  }
} finally {
  await browser.close();
}