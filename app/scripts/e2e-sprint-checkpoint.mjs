import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { SignJWT } from "jose";
import { startTestServer } from "./lib/test-server.mjs";

process.loadEnvFile(".env.local");
process.env.TEST_SOURCE_DB = "data/reconciliation/preview.db";
process.env.APP_HOY = "2026-10-05";
const server = await startTestServer(3114), browser = await chromium.launch();
let passed = 0;
const key = new TextEncoder().encode(process.env.SESSION_SECRET);
mkdirSync("data/reconciliation/screens", { recursive: true });
try {
  for (const role of ["admin", "cliente"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const token = await new SignJWT({ role }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setIssuedAt().setExpirationTime("5m").sign(key);
    await context.addCookies([{ name: "seg_session", value: token, url: server.base }]);
    const page = await context.newPage();
    await page.goto(server.base);
    assert.equal(await page.getByTestId("sprint-reviews").locator("li").count(), 7); passed++;
    assert.match(await page.getByTestId("delivery-note").innerText(), /Un hito puede abarcar varios sprints/); passed++;
    assert.match(await page.locator(".kpi").last().innerText(), /Milestones cumplidos/i); passed++;
    await page.goto(`${server.base}/milestones/M-01`);
    assert.match(await page.getByTestId("delivery-M-01").innerText(), /Criterio de aceptación/); passed++;
    assert.equal(await page.getByTestId("check-delivery-M-01").count(), 0); passed++;
    assert.match(await page.getByTestId("delivery-M-01").innerText(), /Definición de valor pendiente/); passed++;
    await page.goto(`${server.base}/agenda`);
    assert.equal(await page.locator(".agenda-rel").filter({ hasText: /^realizada$/ }).count(), 0); passed++;
    await page.goto(`${server.base}/lineas`);
    assert.equal(await page.locator('.rm-checkpoint [data-testid^="node-S"]').count(), 7); passed++;
    assert.ok((await page.getByTestId("metric-note").first().innerText()).includes("ponderado por días hábiles")); passed++;
    const node = page.getByTestId("node-S0"), panel = page.getByTestId("ms-panel-S0");
    assert.match(await node.innerText(), /25 sep/i); passed++;
    assert.match(await page.getByTestId("node-M-01").innerText(), /Trabajo[\s\S]*Milestone pendiente/); passed++;
    await node.click();
    await panel.waitFor({ state: "visible" });
    assert.equal(new URL(page.url()).searchParams.get("m"), "S0"); passed++;
    assert.match(await panel.innerText(), /Una semana/); passed++;
    assert.equal(await panel.locator(".tarea-row").count(), 7); passed++;
    assert.ok(!(await node.innerText()).includes("Cumplido")); passed++;
    assert.match(await panel.getByTestId("expected-S0").innerText(), /H-01/); passed++;
    assert.equal(await page.getByTestId("check-S0").count(), 0); passed++;
    assert.match(await panel.getByTestId("checkpoint-progress").innerText(), /Peso en el nodo[\s\S]*Aporte al total/i); passed++;
    if (role === "cliente") { assert.equal(await panel.locator(".tarea-edit,.tarea-evidencia").count(), 0); passed++; }
    else { assert.match(await panel.innerText(), /H-01/); passed++; }
    await page.keyboard.press("Escape");
    assert.equal(await page.getByTestId("slot-CP").getAttribute("aria-hidden"), "true"); passed++;
    await page.goto(`${server.base}/lineas?m=S0`);
    await panel.waitFor({ state: "visible" }); passed++;
    await page.screenshot({ path: `data/reconciliation/screens/sprint0-${role}.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await panel.waitFor({ state: "visible" });
    const box = await panel.boundingBox();
    assert.ok(box && box.width <= 390); passed++;
    await context.close();
  }
  console.log(JSON.stringify({ testFiles: 1, casesPassed: passed }));
} finally { await browser.close(); server.stop(); }
