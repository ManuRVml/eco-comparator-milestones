import { describe, it, expect } from "vitest";
import { diasHabilesEntre, semaforoMilestone } from "./format";

describe("diasHabilesEntre", () => {
  it("returns 0 for same day", () => {
    expect(diasHabilesEntre("2026-10-07", "2026-10-07")).toBe(0);
  });

  it("returns 5 for Mon 2026-10-12 to Mon 2026-10-19 (Tue-Fri + Mon)", () => {
    // Start exclusive: Tue, Wed, Thu, Fri (4) + next Mon (1) = 5 business days
    expect(diasHabilesEntre("2026-10-12", "2026-10-19")).toBe(5);
  });

  it("returns 6 for Mon 2026-10-12 to Tue 2026-10-20", () => {
    // Start exclusive: Tue-Fri (4) + Mon (1) + Tue (1) = 6 business days
    expect(diasHabilesEntre("2026-10-12", "2026-10-20")).toBe(6);
  });

  it("returns 1 for Fri 2026-10-09 to Mon 2026-10-12", () => {
    // Start exclusive: only Mon (1 business day, skipping weekend)
    expect(diasHabilesEntre("2026-10-09", "2026-10-12")).toBe(1);
  });
});

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
    // Mon 2026-10-12 to Mon 2026-10-19 = 5 business days (ambar)
    expect(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-12",
          fechaPrevision: "2026-10-19",
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
