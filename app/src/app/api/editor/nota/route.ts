import { editorRoute } from "@/lib/api";
import { agregarNota } from "@/lib/mutations";

export const POST = editorRoute(agregarNota);

// Toca la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";
