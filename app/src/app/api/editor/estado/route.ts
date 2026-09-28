import { editorRoute } from "@/lib/api";
import { cambiarEstado } from "@/lib/mutations";

export const POST = editorRoute(cambiarEstado);

// Toca la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";
