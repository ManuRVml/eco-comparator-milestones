import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { SignJWT } from "jose";
import { startTestServer } from "./lib/test-server.mjs";
if (!process.env.SESSION_SECRET) process.loadEnvFile(".env.local");
const remote = process.env.TIMELINE_VERIFY_URL;
if (!remote) process.env.TEST_SOURCE_DB = "data/reconciliation/preview.db";
const server = remote ? null : await startTestServer(3118, { migrate: true });
const base = remote ?? server.base;
const browser = await chromium.launch();
const out = "data/reconciliation/timeline-names";
mkdirSync(out, { recursive: true });
const receipt = [];
try {
  for (const role of ["cliente", "admin"]) {
    for (const width of [1440, 1120, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const token = await new SignJWT({ role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(new TextEncoder().encode(process.env.SESSION_SECRET));
      await context.addCookies([{ name: "seg_session", value: token, url: base }]);
      const page = await context.newPage();
      const response = await page.goto(base + "/lineas", { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.addStyleTag({ content: "*,*::before,*::after {animation:none!important;transition:none!important}" });
      const geometry = await page.evaluate(() => {
        const rect = el => { const b = el.getBoundingClientRect(); return {left:b.left, right:b.right, top:b.top, bottom:b.bottom}; };
        const nodes = [...document.querySelectorAll(".rm-node")].map(el => {
          const name = el.querySelector(".rm-name"), range = document.createRange(); range.selectNodeContents(name);
          return { id:el.dataset.testid, text:name.textContent, box:rect(el), name:rect(name), textBox:rect(range), track:rect(el.closest(".rm-track")), lane:rect(el.closest(".rm-lane")), clamp:getComputedStyle(name).webkitLineClamp };
        });
        return { nodes, documentWidth: document.documentElement.scrollWidth, viewport: innerWidth };
      });
      assert.equal(geometry.nodes.length, 17);
      assert.ok(geometry.documentWidth <= width, "El scroll horizontal pertenece al timeline");
      for (const n of geometry.nodes) {
        assert.equal(n.clamp, "none", n.id + ": nombre recortado");
        assert.ok(n.textBox.bottom <= n.name.bottom + 1, n.id + ": texto oculto");
        assert.ok(n.box.bottom <= n.lane.bottom + 1, n.id + ": invade la siguiente línea");
        assert.ok(n.box.left >= n.track.left - 1 && n.box.right <= n.track.right + 1, n.id + ": sale de su línea");
      }
      for (let i=0; i<geometry.nodes.length; i++) for (let j=i+1; j<geometry.nodes.length; j++) {
        const a=geometry.nodes[i].box,b=geometry.nodes[j].box;
        assert.ok(!(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top), `${geometry.nodes[i].id} se superpone a ${geometry.nodes[j].id}`);
      }
      await page.getByTestId("roadmap").screenshot({ path: `${out}/${role}-${width}.png`, animations:"disabled" });
      receipt.push({ role, width, ...geometry });
      console.log(JSON.stringify({ role, width, names:geometry.nodes.length, clipped:0, overlaps:0 }));
      await context.close();
    }
  }
  writeFileSync(`${out}/receipt${remote ? "-production" : "-local"}.json`, JSON.stringify(receipt,null,2));
} finally { await browser.close(); server?.stop(); }
