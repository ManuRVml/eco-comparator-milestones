import { and, eq, inArray, sql } from "drizzle-orm";
import { bitacora, tareas } from "../src/db/schema";
import { openDb } from "./lib/common";

/**
 * Configuración inicial: NADA empieza publicado. El avance oficial arranca en 0/99 hasta que un editor o
 * administrador apruebe y publique. Retira (con registro en bitácora) solo las publicaciones que hizo el antiguo
 * seed automático («seed:publicacion»); nunca toca publicaciones hechas por personas. Idempotente.
 */

const CAMPO = "publicación al equipo Ecopetrol";

async function main() {
  const { client, db } = await openDb();
  const retiradas: string[] = [];
  try {
    await db.transaction(async (tx) => {
      const publicadas = await tx.select({ id: tareas.id }).from(tareas).where(eq(tareas.publicadoCliente, true));
      if (!publicadas.length) return;
      const ids = publicadas.map((t) => t.id);
      const log = await tx
        .select({ id: bitacora.entidadId, actor: bitacora.actorRol, bid: bitacora.id, nuevo: bitacora.valorNuevo })
        .from(bitacora)
        .where(and(eq(bitacora.entidadTipo, "tarea"), inArray(bitacora.entidadId, ids), sql`${bitacora.campo} like 'publicación%'`));
      for (const id of ids) {
        const ultima = log.filter((l) => l.id === id).sort((a, b) => b.bid - a.bid)[0];
        if (!ultima || ultima.actor !== "seed:publicacion") continue;
        await tx
          .update(tareas)
          .set({ publicadoCliente: false, fechaPublicacion: null, notaPublicacion: null, actualizadoEn: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))` })
          .where(eq(tareas.id, id));
        await tx.insert(bitacora).values({
          entidadTipo: "tarea",
          entidadId: id,
          campo: CAMPO,
          valorAnterior: "Publicada",
          valorNuevo: "Retirada",
          origen: "plan",
          actorRol: "configuración inicial",
          detalle: "configuración inicial: sin publicaciones",
        });
        retiradas.push(id);
      }
    });
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(tareas).where(eq(tareas.publicadoCliente, true));
    console.log(retiradas.length ? `Publicaciones automáticas retiradas: ${retiradas.join(", ")}` : "Sin publicaciones automáticas que retirar.");
    console.log(`Tareas publicadas ahora: ${n}`);
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});