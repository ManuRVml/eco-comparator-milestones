import { describe, it, expect } from "vitest";
import { semaforoMilestone } from "./format";

describe("semaforoMilestone", () => {
  const hoy = "2026-10-07";

  it('returns "cumplido" when milestone is completed', () => {
    expect(
      semaforoMilestone(
        { fechaObjetivo: "2026-10-01", cumplido: true, iniciado: true },
        hoy,
      ),
    ).toBe("cumplido");
  });

  it('returns "gris" when not started and objective is in the future', () => {
    expect(
      semaforoMilestone(
        { fechaObjetivo: "2026-10-15", cumplido: false, iniciado: false },
        hoy,
      ),
    ).toBe("gris");
  });

  it('returns "rojo" when objective is in the past and not completed', () => {
    expect(
      semaforoMilestone(
        { fechaObjetivo: "2026-10-01", cumplido: false, iniciado: true },
        hoy,
      ),
    ).toBe("rojo");
  });

  it('returns "rojo" when prevision is more than 5 business days after objective', () => {
    // Mon 2026-10-12 to Tue 2026-10-20 = 6 business days (rojo)
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-12",
          fechaPrevision: "2026-10-20",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("rojo");
  });

  it('returns "ambar" when prevision is exactly 5 business days after objective', () => {
    // Mon 2026-10-12 to Fri 2026-10-16 = 5 business days (ambar)
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-12",
          fechaPrevision: "2026-10-16",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("ambar");
  });

  it('returns "ambar" when prevision is 1-5 business days after objective', () => {
    // Oct 7 to Oct 12 = 5 calendar days ≈ 3 business days
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-07",
          fechaPrevision: "2026-10-12",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("ambar");
  });

  it('returns "verde" when objective is in the future and within tolerance', () => {
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-15",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("verde");
  });

  it('returns "verde" when prevision is same day', () => {
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-07",
          fechaPrevision: "2026-10-07",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("verde");
  });

  it('returns "rojo" when not started but objective is in the past', () => {
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-01",
          cumplido: false,
          iniciado: false,
        },
        hoy,
      ),
    ).toBe("rojo");
  });

  it("handles null prevision correctly", () => {
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-15",
          fechaPrevision: null,
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("verde");
  });

  it('returns "ambar" for Fri->Mon span (1 business day)', () => {
    // Fri 2026-10-09 to Mon 2026-10-12 = 1 business day (ambar)
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-09",
          fechaPrevision: "2026-10-12",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("ambar");
  });

  it('returns "rojo" for span crossing weekend with >5 business days', () => {
    // Fri 2026-10-09 to Wed 2026-10-21 = 9 business days (rojo)
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-09",
          fechaPrevision: "2026-10-21",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
    ).toBe("rojo");
  });
});
