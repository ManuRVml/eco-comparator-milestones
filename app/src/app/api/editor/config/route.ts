import { editorRoute } from "@/lib/api";
import { cambiarConfig } from "@/lib/mutations";

export const POST = editorRoute(cambiarConfig);

// Toca la base de datos: runtime Node.js (nunca edge).
export const runtime = "nodejs";
