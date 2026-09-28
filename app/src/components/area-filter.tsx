import Link from "next/link";
import { AreaDot } from "@/components/ui";
import type { Area } from "@/lib/model";

export function AreaFilter({ areas, actual, base }: { areas: Area[]; actual: string | null; base: string }) {
  const sep = base.includes("?") ? "&" : "?";
  return (
    <nav className="filter-chips" aria-label="Filtrar por área">
      <Link href={base} className={`fchip ${actual ? "" : "is-on"}`} aria-current={actual ? undefined : "true"}>
        Todas las áreas
      </Link>
      {areas.map((a) => (
        <Link key={a.id} href={`${base}${sep}area=${a.id}`} className={`fchip ${actual === a.id ? "is-on" : ""}`} aria-current={actual === a.id ? "true" : undefined}>
          <AreaDot areaId={a.id} />
          {a.nombre}
        </Link>
      ))}
    </nav>
  );
}