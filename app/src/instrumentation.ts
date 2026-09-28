import { exigirEntornoDeProduccion } from "@/lib/env-check";

/** Al iniciar el servidor en producción (p. ej. en Vercel) se valida el entorno: sin PIN de demo ni secretos débiles. */
export function register() {
  if (process.env.NODE_ENV === "production") exigirEntornoDeProduccion("arranque");
}