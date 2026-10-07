import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { diasHabilesEntre, semaforoMilestone } from "../../src/lib/format";

describe("diasHabilesEntre", () => {
  it("returns 0 for same day", () => {
    assert.equal(diasHabilesEntre("2026-10-07", "2026-10-07"), 0);
  });

  it("returns 5 for Mon 2026-10-12 to Mon 2026-10-19 (Tue-Fri + Mon)", () => {
    // Start exclusive: Tue, Wed, Thu, Fri (4) + next Mon (1) = 5 business days
    assert.equal(diasHabilesEntre("2026-10-12", "2026-10-19"), 5);
  });

  it("returns 6 for Mon 2026-10-12 to Tue 2026-10-20", () => {
    // Start exclusive: Tue-Fri (4) + Mon (1) + Tue (1) = 6 business days
    assert.equal(diasHabilesEntre("2026-10-12", "2026-10-20"), 6);
  });

  it("returns 1 for Fri 2026-10-09 to Mon 2026-10-12", () => {
    // Start exclusive: only Mon (1 business day, skipping weekend)
    assert.equal(diasHabilesEntre("2026-10-09", "2026-10-12"), 1);
  });
});

describe("semaforoMilestone", () => {
  const hoy = "2026-10-07";

  it('returns "cumplido" when milestone is completed', () => {
    assert.equal(
      semaforoMilestone(
        { fechaObjetivo: "2026-10-01", cumplido: true, iniciado: true },
        hoy,
      ),
      "cumplido",
    );
  });

  it('returns "gris" when not started and objective is in the future', () => {
    assert.equal(
      semaforoMilestone(
        { fechaObjetivo: "2026-10-15", cumplido: false, iniciado: false },
        hoy,
      ),
      "gris",
    );
  });

  it('returns "rojo" when objective is in the past and not completed', () => {
    assert.equal(
      semaforoMilestone(
        { fechaObjetivo: "2026-10-01", cumplido: false, iniciado: true },
        hoy,
      ),
      "rojo",
    );
  });

  it('returns "rojo" when prevision is more than 5 business days after objective', () => {
    // Mon 2026-10-12 to Tue 2026-10-20 = 6 business days (rojo)
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-12",
          fechaPrevision: "2026-10-20",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "rojo",
    );
  });

  it('returns "ambar" when prevision is exactly 5 business days after objective', () => {
    // Mon 2026-10-12 to Mon 2026-10-19 = 5 business days (ambar)
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-12",
          fechaPrevision: "2026-10-19",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "ambar",
    );
  });

  it('returns "ambar" when prevision is 1-5 business days after objective', () => {
    // Oct 7 to Oct 12 = 5 calendar days ≈ 3 business days
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-07",
          fechaPrevision: "2026-10-12",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "ambar",
    );
  });

  it('returns "verde" when objective is in the future and within tolerance', () => {
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-15",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "verde",
    );
  });

  it('returns "verde" when prevision is same day', () => {
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-07",
          fechaPrevision: "2026-10-07",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "verde",
    );
  });

  it('returns "rojo" when not started but objective is in the past', () => {
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-01",
          cumplido: false,
          iniciado: false,
        },
        hoy,
      ),
      "rojo",
    );
  });

  it("handles null prevision correctly", () => {
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-15",
          fechaPrevision: null,
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "verde",
    );
  });

  it('returns "ambar" for Fri->Mon span (1 business day)', () => {
    // Fri 2026-10-09 to Mon 2026-10-12 = 1 business day (ambar)
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-09",
          fechaPrevision: "2026-10-12",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "ambar",
    );
  });

  it('returns "rojo" for span crossing weekend with >5 business days', () => {
    // Fri 2026-10-09 to Wed 2026-10-21 = 9 business days (rojo)
    assert.equal(
      semaforoMilestone(
        {
          fechaObjetivo: "2026-10-09",
          fechaPrevision: "2026-10-21",
          cumplido: false,
          iniciado: true,
        },
        hoy,
      ),
      "rojo",
    );
  });
});
