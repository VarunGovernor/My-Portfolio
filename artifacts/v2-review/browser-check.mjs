import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const out = fileURLToPath(new URL("./", import.meta.url));
const production = process.env.PRODUCTION === "1";
const port = production ? 4173 : 5173;
const base =
  process.env.V2_URL ||
  `http://127.0.0.1:${port}/My-Portfolio/v2/${production ? "" : "index.html"}`;
let server;
try {
  await fetch(base);
} catch {
  server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      ...(production ? ["preview"] : []),
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: fileURLToPath(new URL("../../", import.meta.url)),
      stdio: "ignore",
    },
  );
  process.on("exit", () => server.kill());
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
const label = process.env.REVIEW_PASS || "baseline";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1672, height: 941 },
  deviceScaleFactor: 1,
});
await page.addInitScript(() => {
  window.motionFrames = 0;
  const nativeFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = (callback) =>
    nativeFrame.call(window, (time) => {
      window.motionFrames++;
      callback(time);
    });
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(base);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/${label}-hero.png` });
await page
  .locator("#work")
  .evaluate((el) => scrollTo({ top: el.offsetTop, behavior: "instant" }));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${out}/${label}-work-about.png` });
const geometry = await page.locator(".work-card").evaluateAll((cards) =>
  cards.map((card) => {
    const r = card.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }),
);
await writeFile(
  `${out}/${label}-geometry.json`,
  JSON.stringify(geometry, null, 2),
);
console.log(JSON.stringify({ label, geometry, errors }));
if (process.argv.includes("--responsive") || process.argv.includes("--full")) {
  const responsive = [];
  for (const width of [768, 1024, 1100]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .locator("#work")
      .evaluate((el) => scrollTo({ top: el.offsetTop, behavior: "instant" }));
    await page.waitForTimeout(350);
    responsive.push({
      name: `no horizontal overflow at ${width}px`,
      pass: await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    });
    responsive.push({
      name: `project links stay inside their cards at ${width}px`,
      pass: await page.locator(".work-card").evaluateAll((cards) =>
        cards.every((card) => {
          const box = card.getBoundingClientRect(),
            link = card.querySelector(".work-bottom a").getBoundingClientRect();
          return link.bottom <= box.bottom && link.right <= box.right;
        }),
      ),
    });
  }
  await page.setViewportSize({ width: 1672, height: 941 });
  await page
    .locator("#capabilities")
    .evaluate((el) => scrollTo({ top: el.offsetTop, behavior: "instant" }));
  await page.waitForTimeout(350);
  responsive.push({
    name: "desktop navigation uses dark text on light sections",
    pass: await page.locator(".navigation").evaluate((el) => {
      const rgb = getComputedStyle(el).color.match(/\d+/g).map(Number);
      return Math.max(...rgb) < 150;
    }),
  });
  await page.screenshot({ path: `${out}/desktop-capabilities.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.locator(".menu-toggle").focus();
  await page.keyboard.press("Enter");
  responsive.push({
    name: "keyboard opening focuses the first mobile navigation link",
    pass: await page
      .locator(".nav-list a")
      .first()
      .evaluate((el) => el === document.activeElement),
  });
  await page.keyboard.press("Escape");
  await writeFile(
    `${out}/responsive-results.json`,
    JSON.stringify(responsive, null, 2),
  );
  console.log(JSON.stringify(responsive));
  const failed = responsive.filter((result) => !result.pass);
  assert.equal(
    failed.length,
    0,
    failed.map((result) => result.name).join("; "),
  );
  await page.setViewportSize({ width: 1672, height: 941 });
}
if (process.argv.includes("--check")) {
  assert(Math.abs(geometry[0].x - 240) < 5, "work starts at reference x=240");
  assert(
    Math.abs(geometry[0].width - 704) < 10,
    "featured card matches 704px reference",
  );
  assert(
    Math.abs(geometry[4].y - geometry[2].y) < 2,
    "three cards share the second row",
  );
  assert(
    await page.locator("#work + #about").count(),
    "About immediately follows Work",
  );
  assert.equal(
    await page.locator('.work-bottom a[href="#contact"]').count(),
    0,
    "project links open real project content",
  );
}
if (process.argv.includes("--full")) {
  const report = { checks: [], errors, accessibility: {}, performance: {} };
  const check = (condition, name) => {
    assert(condition, name);
    report.checks.push(name);
    console.log(`PASS ${name}`);
  };
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/motion-t0.png` });
  const initial = await page
    .locator(".light-field")
    .first()
    .evaluate((el) => el.toDataURL());
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${out}/motion-t5.png` });
  check(
    initial !==
      (await page
        .locator(".light-field")
        .first()
        .evaluate((el) => el.toDataURL())),
    "continuous light field changes at five seconds",
  );
  await page.mouse.move(1600, 160);
  await page.waitForTimeout(900);
  const moved = await page
    .locator(".fields")
    .evaluate((el) => getComputedStyle(el).transform);
  await page.screenshot({ path: `${out}/motion-pointer.png` });
  await page.mouse.move(-10, -10);
  await page.waitForTimeout(1400);
  const reset = await page
    .locator(".fields")
    .evaluate((el) => getComputedStyle(el).transform);
  check(moved !== reset, "cursor parallax eases back after pointer leave");
  await page.screenshot({ path: `${out}/motion-leave.png` });
  await page
    .locator("#work")
    .evaluate((el) => scrollTo({ top: el.offsetTop, behavior: "instant" }));
  await page.waitForTimeout(800);
  await page.mouse.move(850, 420);
  await page.waitForTimeout(500);
  check(
    await page
      .locator(".work-card")
      .first()
      .evaluate(
        (el) =>
          Math.abs(parseFloat(el.style.getPropertyValue("--tilt-y"))) > 0.1,
      ),
    "glass card responds with a small eased tilt",
  );
  await page.screenshot({ path: `${out}/motion-card.png` });
  await page.mouse.move(-10, -10);
  await page.waitForTimeout(500);
  check(
    await page
      .locator(".work-card")
      .first()
      .evaluate((el) => el.style.getPropertyValue("--tilt-y") === "0deg"),
    "glass tilt resets on leave",
  );
  await page.locator(".signature-name").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const letter = page.locator(".sig-letter").first();
  const letterAtRest = await letter.evaluate(
    (el) => getComputedStyle(el).transform,
  );
  await letter.hover();
  await page.waitForTimeout(500);
  check(
    letterAtRest !==
      (await letter.evaluate((el) => getComputedStyle(el).transform)),
    "name signature responds to hover after its reveal completes",
  );
  await page.mouse.move(-10, -10);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const offscreenFrames = await page.evaluate(() => window.motionFrames);
  await page.waitForTimeout(600);
  check(
    offscreenFrames === (await page.evaluate(() => window.motionFrames)),
    "motion controller stops when both light scenes are offscreen",
  );
  const links = await page
    .locator(".work-bottom a")
    .evaluateAll((elements) => elements.map((el) => el.href));
  for (const link of links) {
    const url = new URL(link);
    const response = await page.request.get(url.origin + url.pathname);
    check(
      response.ok() &&
        (await response.text()).includes(`id="${url.hash.slice(1)}"`),
      `real project destination ${url.hash}`,
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(300);
  const reducedFrame = await page
    .locator(".light-field")
    .first()
    .evaluate((el) => el.toDataURL());
  await page.waitForTimeout(700);
  check(
    reducedFrame ===
      (await page
        .locator(".light-field")
        .first()
        .evaluate((el) => el.toDataURL())),
    "live reduced-motion preference freezes the light field",
  );
  await page.screenshot({ path: `${out}/reduced-work-about.png` });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .locator("#top")
    .evaluate((el) => scrollTo({ top: el.offsetTop, behavior: "instant" }));
  await page.waitForTimeout(300);
  report.performance = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const samples = [];
        let previous = performance.now();
        function sample(time) {
          samples.push(time - previous);
          previous = time;
          if (samples.length < 90) requestAnimationFrame(sample);
          else {
            samples.sort((a, b) => a - b);
            resolve({
              median_frame_ms: samples[45],
              p95_frame_ms: samples[85],
            });
          }
        }
        requestAnimationFrame(sample);
      }),
  );
  const axeAvailable =
    !!process.env.AXE_SCRIPT && existsSync(process.env.AXE_SCRIPT);
  if (axeAvailable) {
    await page.addScriptTag({ path: process.env.AXE_SCRIPT });
    report.accessibility.desktop = await page.evaluate(async () => {
      const result = await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
      return result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      }));
    });
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.waitForTimeout(500);
  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "no laptop horizontal overflow",
  );
  await page.screenshot({ path: `${out}/laptop-hero.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/mobile-hero.png` });
  check(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "no mobile horizontal overflow",
  );
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  check(
    (await page.locator(".menu-toggle").getAttribute("aria-expanded")) ===
      "true",
    "mobile menu opens accessibly",
  );
  await page.screenshot({ path: `${out}/mobile-menu.png` });
  await page.keyboard.press("Escape");
  check(
    (await page.locator(".menu-toggle").getAttribute("aria-expanded")) ===
      "false" &&
      (await page
        .locator(".menu-toggle")
        .evaluate((el) => el === document.activeElement)),
    "Escape closes menu and restores focus",
  );
  await page.locator(".menu-toggle").click();
  await page.locator('.nav-list a[href="#work"]').click();
  await page.waitForTimeout(1000);
  check(
    (await page.locator(".menu-toggle").getAttribute("aria-expanded")) ===
      "false",
    "mobile navigation closes after anchor selection",
  );
  await page.screenshot({ path: `${out}/mobile-work.png` });
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/mobile-about.png` });
  check(
    (await page.locator(".signature-name span").count()) === 6,
    "Varun name is revealed letter by letter",
  );
  if (axeAvailable) {
    report.accessibility.mobile = await page.evaluate(async () => {
      const result = await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
      return result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      }));
    });
  }
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/mobile-contact.png` });
  await writeFile(`${out}/test-results.json`, JSON.stringify(report, null, 2));
  check(
    report.performance.median_frame_ms < 25,
    "desktop animation sustains a frame budget below 25ms",
  );
  if (Object.keys(report.accessibility).length === 2)
    check(
      Object.values(report.accessibility).every(
        (violations) => violations.length === 0,
      ),
      "no automated WCAG A/AA violations",
    );
  else {
    report.accessibility.skipped =
      "AXE_SCRIPT was unavailable; no automated accessibility result.";
    console.log("SKIP automated accessibility: AXE_SCRIPT unavailable");
  }
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto(base);
  await page.keyboard.press("Tab");
  check(
    await page.locator(".skip").evaluate((el) => el === document.activeElement),
    "keyboard begins at visible skip link",
  );
  await page.keyboard.press("Enter");
  check(
    await page.evaluate(() => document.activeElement.id === "main"),
    "skip link reaches main content",
  );
  const noJs = await browser.newPage({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  await noJs.goto(base);
  check(
    (await noJs.locator("h1").isVisible()) &&
      (await noJs.locator(".signature-name").innerText()) === "Varun.",
    "headline and name remain readable without JavaScript",
  );
  await noJs.close();
  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  await touch.goto(base);
  check(
    await touch.evaluate(() => !matchMedia("(pointer: fine)").matches),
    "touch device disables cursor-only motion",
  );
  await touch.locator(".menu-toggle").tap();
  await touch.locator('.nav-list a[href="#work"]').tap();
  await touch.waitForTimeout(900);
  check(
    (await touch.locator(".menu-toggle").getAttribute("aria-expanded")) ===
      "false",
    "touch navigation opens and follows Work",
  );
  check(
    await touch.evaluate(
      () => document.documentElement.scrollWidth === innerWidth,
    ),
    "touch viewport has no horizontal overflow",
  );
  await touch.screenshot({ path: `${out}/mobile-touch-work.png` });
  await touch.close();
  check(errors.length === 0, "no browser JavaScript errors");
  await writeFile(`${out}/test-results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}
await browser.close();
if (server) server.kill();
