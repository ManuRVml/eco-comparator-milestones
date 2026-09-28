import { editorRoute } from "@/lib/api";
import { cambiarVisibilidad } from "@/lib/mutations";

export const POST = editorRoute(cambiarVisibilidad);

// Toca la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";
