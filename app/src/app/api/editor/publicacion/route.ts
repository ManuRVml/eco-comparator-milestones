import { editorRoute } from "@/lib/api";
import { cambiarPublicacion } from "@/lib/mutations";

/** Aprobar y publicar / retirar publicación de una tarea o un milestone: editor o admin (403 para roles de consulta). */
export const POST = editorRoute(cambiarPublicacion);

// Toca la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";
