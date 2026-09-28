import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { exigirEntornoDeProduccion } from "./src/lib/env-check";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        // App privada de proyecto: nunca indexar.
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

/**
 * Guardia de arranque: `next start` (fase servidor) y el build en Vercel se niegan a seguir si faltan los PIN o el
 * SESSION_SECRET, si son los de demostración, o si la base es un archivo local (ver src/lib/env-check.ts).
 */
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_SERVER || (phase === PHASE_PRODUCTION_BUILD && process.env.VERCEL)) {
    exigirEntornoDeProduccion(phase === PHASE_PRODUCTION_SERVER ? "next start" : "build en Vercel");
  }
  return nextConfig;
}