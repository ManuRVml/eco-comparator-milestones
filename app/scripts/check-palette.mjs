// Guarda de paleta: falla si en src/** aparece un color literal (hex, rgb(), hsl()) que no sea un valor del
// set de tokens portado del arquetipo (src/app/theme.css, copia literal de eco-comparator-web). Uso: pnpm run check:palette
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const TOKENS = "src/app/theme.css";
const norm = (h) => {
  let x = h.slice(1).toLowerCase();
  if (x.length === 3 || x.length === 4) x = [...x].map((c) => c + c).join("");
  return `#${x}`;
};
const HEX = /#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z_-])/g;
const FUNC = /\b(?:rgba?|hsla?)\s*\(/g;

const permitidos = new Set((readFileSync(TOKENS, "utf8").match(HEX) ?? []).filter((h) => [4, 5, 7, 9].includes(h.length)).map(norm));

function* archivos(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* archivos(p);
    else if (/\.(css|tsx?|mjs|jsx?)$/.test(n)) yield p;
  }
}

const fallas = [];
let literales = 0;
let revisados = 0;
for (const f of archivos("src")) {
  const rel = relative(".", f).replaceAll("\\", "/");
  if (rel === TOKENS) continue;
  revisados++;
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((linea, i) => {
      for (const m of linea.matchAll(HEX)) {
        if (![4, 5, 7, 9].includes(m[0].length)) continue;
        literales++;
        if (!permitidos.has(norm(m[0]))) fallas.push(`${rel}:${i + 1}  ${m[0]}  (no es un token)`);
      }
      for (const m of linea.matchAll(FUNC)) fallas.push(`${rel}:${i + 1}  ${m[0]}…)  (use tokens o color-mix con tokens)`);
    });
}

console.log(`Tokens del arquetipo: ${permitidos.size} colores (${TOKENS})`);
console.log(`Archivos revisados en src/: ${revisados} · literales hex encontrados: ${literales}`);
if (fallas.length) {
  console.error(`\n${fallas.length} colores fuera de la paleta:`);
  for (const f of fallas) console.error(`  ${f}`);
  process.exit(1);
}
console.log("OK: ningún color fuera de la paleta del arquetipo.");