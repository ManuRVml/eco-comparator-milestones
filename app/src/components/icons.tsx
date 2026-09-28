/** Iconos de trazo (currentColor), mismo lenguaje visual que los del arquetipo BenchHub. */
import type { ReactNode, SVGProps } from "react";

type P = { size?: number } & Omit<SVGProps<SVGSVGElement>, "width" | "height">;

function Base({ size = 20, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const TrendUpIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </Base>
);
export const BarChartIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Base>
);
export const ClockIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);
export const UserIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
);
export const InfoIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Base>
);
export const HomeIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v10h14V10" />
  </Base>
);
export const TimelineIcon = (p: P) => (
  <Base {...p}>
    <path d="M3 6h10M7 12h14M3 18h8" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="14" cy="18" r="2" />
  </Base>
);
export const AreasIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Base>
);
export const CalendarIcon = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Base>
);
export const EditIcon = (p: P) => (
  <Base {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    <path d="M13 7l4 4" />
  </Base>
);
export const ReportIcon = (p: P) => (
  <Base {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </Base>
);
export const LogoutIcon = (p: P) => (
  <Base {...p}>
    <path d="M9 4H5v16h4" />
    <path d="M16 16l4-4-4-4M20 12H9" />
  </Base>
);export const CheckIcon = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </Base>
);