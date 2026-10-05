import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cliArgs } from "./lib/common";
import { parseSources } from "./lib/reconciliation-sources";
const folder = resolve(cliArgs()[0] ?? "../new base");
const files = readdirSync(folder).filter((f) => f.endsWith(".md")).sort();
const bundle = parseSources(files.map((nombre) => ({ nombre, contenido: readFileSync(resolve(folder, nombre), "utf8") })));
writeFileSync(resolve("seed/reconciliation.json"), JSON.stringify(bundle, null, 2) + "\n");
console.log(`Paquete versionado: ${bundle.fuentes.length} fuentes, ${bundle.tareas.length} tareas, ${bundle.prerrequisitos.length} actividades MVP y ${bundle.hitos.length} hitos. Sin cambios en la base.`);
