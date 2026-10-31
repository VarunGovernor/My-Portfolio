import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_BINARY,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
// Headless Chromium may report (pointer: fine) as false even with a desktop mouse.
// Force only this capability before the site loads; reduced-motion remains native.
await page.evaluateOnNewDocument(() => {
  const native = window.matchMedia.bind(window);
  window.matchMedia = query => {
    const list = native(query);
    if (query !== "(pointer: fine)") return list;
    return new Proxy(list, {
      get(target, prop) {
        if (prop === "matches") return true;
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      }
    });
  };
});
const errors = [];
page.on("pageerror", e => errors.push(e.message));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:4174/My-Portfolio/v2/";
const record = [];

async function check(label, predicate) {
  assert(await predicate(), label);
  record.push(label);
  console.log("PASS:", label);
}
async function prop(sel, name) {
  return page.$eval(sel, (node, propName) => node.style.getPropertyValue(propName), name);
}

try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await page.goto(base, { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForFunction(() => document.documentElement.classList.contains("motion-ready"));
  await check("No typographic em or en dashes", async () => page.evaluate(() =>
    !/[—–]/.test(document.title + " " + document.body.innerText)));
  await check("Headline preserves three lines", async () =>
    (await page.$$eval("#hero-title > span", nodes => nodes.length)) === 3);
  await check("Section word reveals are wired", async () =>
    (await page.$$eval(".motion-word", nodes => nodes.length)) >= 15);
  await check("Name fallback contains animated letters", async () =>
    (await page.$eval(".signature-name .sig-letter", nodes => nodes.length)) === 6);
  await check("Three meaningful continuous capability animations exist", async () =>
    page.evaluate(() => ["code-flow", "radar-sweep", "phone-handset"].every(name => {
      const item = document.querySelector("." + name);
      return item && getComputedStyle(item).animationIterationCount.includes("infinite");
    })));
  await check("Name has a persistent animated caret", async () =>
    page.$eval(".signature-name .sig-caret", e =>
      getComputedStyle(e).animationName.includes("signature-caret")));

  const canvasHash = async () => page.$eval(".hero canvas.light-field", canvas => {
    const { width, height } = canvas;
    const data = canvas.getContext("2d").getImageData(0, 0, width, height).data;
    let hash = 0;
    for (let i = 0; i < data.length; i += 113) hash = (hash * 33 + data[i]) >>> 0;
    return hash;
  });
  const firstCanvas = await canvasHash();
  const firstRib = await prop(".hero", "--rib");
  await wait(2300);
  const lastCanvas = await canvasHash();
  const lastRib = await prop(".hero", "--rib");
  await check("Light field continuously changes", async () => firstCanvas !== lastCanvas);
  await check("Rib field visibly moves", async () => firstRib !== lastRib);
  await page.screenshot({ path: "previews/v2-motion-hero-stable.png", fullPage: false });

  await page.mouse.move(200, 230);
  await wait(400);
  const firstTilt = await prop(".fields", "--field-rotate-y");
  await page.mouse.move(1300, 280);
  await wait(400);
  const secondTilt = await prop(".fields", "--field-rotate-y");
  const pointerState = await page.evaluate(() => ({
    fine: matchMedia("(pointer: fine)").matches,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    visible: document.querySelector(".hero")?.getBoundingClientRect().bottom > 0
  }));
  console.log("Cursor test:", JSON.stringify({ firstTilt, secondTilt, pointerState }));
  await check("Selected Fields reacts to cursor depth", async () => firstTilt !== secondTilt);

  const beforeScroll = await prop(".hero", "--copy-y");
  await page.evaluate(() => window.scrollTo({ top: 410, behavior: "instant" }));
  await wait(350);
  const afterScroll = await prop(".hero", "--copy-y");
  await check("Hero copy has independent scroll parallax", async () => beforeScroll !== afterScroll);
  await check("Hero depth is not identical to typography movement", async () => {
    const deep = await prop(".hero", "--depth-a-y");
    return deep !== afterScroll && parseFloat(deep) !== 0;
  });
  await check("Floating panel has independent scroll depth", async () => {
    const floating = await prop(".hero", "--field-scroll-y");
    return Number.isFinite(parseFloat(floating)) && Math.abs(parseFloat(floating)) > 3;
  });

  await page.$eval(".about-intro", e => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector(".about-intro")?.classList.contains("in-view"), { timeout: 9000 });
  await check("About signature reveal starts on entry", async () =>
    page.$eval(".signature-name .sig-letter", e => getComputedStyle(e).animationName.includes("letter-enter")));
  const aboutBefore = await prop(".about-section", "--about-intro-y");
  await page.evaluate(() => scrollBy({ top: 150, behavior: "instant" }));
  await wait(320);
  const aboutAfter = await prop(".about-section", "--about-intro-y");
  await check("About has scroll-linked depth, not static positioning", async () =>
    aboutBefore !== aboutAfter);
  await check("About text columns move at different rates", async () => {
    const intro = parseFloat(await prop(".about-section", "--about-intro-y"));
    const copy = parseFloat(await prop(".about-section", "--about-copy-y"));
    return Number.isFinite(intro) && Number.isFinite(copy) && Math.sign(intro) !== Math.sign(copy);
  });
  await check("Build code runs continuously", async () => {
    const getDash = () => page.$eval(".code-flow", e => getComputedStyle(e).strokeDashoffset);
    const a = await getDash();
    await wait(250);
    return a !== await getDash();
  });
  await check("Explore radar rotates continuously", async () => {
    const getRotation = () => page.$eval(".radar-sweep", e => getComputedStyle(e).transform);
    const a = await getRotation();
    await wait(290);
    return a !== await getRotation();
  });
  await page.screenshot({ path: "previews/v2-motion-about.png", fullPage: false });

  await page.$eval(".work-card:first-child", e => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.hover(".work-card:first-child");
  await wait(450);
  await check("Work card displays moving pink highlight", async () => page.$eval(
    ".work-card:first-child",
    e => Number.parseFloat(getComputedStyle(e, "::before").opacity) > 0.5
  ));
  await page.screenshot({ path: "previews/v2-motion-work.png", fullPage: false });
  // Real screenshot galleries must load locally and work with keyboard controls.
  await page.$eval('[data-gallery="quantum"]', button => button.click());
  await page.waitForSelector("#project-gallery[open]");
  await page.waitForFunction(() => {
    const image = document.querySelector(".gallery-image");
    return image?.complete && image.naturalWidth > 100;
  }, { timeout: 10000 });
  await check("Quantum Digital gallery serves actual project images", async () =>
    page.$eval(".gallery-image", img => img.naturalWidth > 100 && img.src.includes("quantum")));
  await check("Gallery exposes four screenshot thumbnails", async () =>
    (await page.$(".gallery-dot")).length === 4);
  const firstSrc = await page.$eval(".gallery-image", img => img.src);
  await page.keyboard.press("ArrowRight");
  await check("Gallery keyboard navigation changes the real image", async () =>
    (await page.$eval(".gallery-image", img => img.src)) !== firstSrc);
  await page.screenshot({ path: "previews/v2-quantum-gallery.png", fullPage: false });
  await page.keyboard.press("Escape");
  await check("Gallery closes with Escape", async () =>
    !(await page.$eval("#project-gallery", e => e.open)));

  await page.$eval('[data-gallery="liva"]', button => button.click());
  await page.waitForSelector("#project-gallery[open]");
  await page.waitForFunction(() => document.querySelector(".gallery-image")?.naturalWidth > 100);
  await check("Liva gallery serves authentic storefront screenshots", async () =>
    page.$eval(".gallery-image", img => img.naturalWidth > 100 && img.src.includes("liva")));
  await page.screenshot({ path: "previews/v2-liva-gallery.png", fullPage: false });
  await page.click(".gallery-close");

  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await wait(220);
    if(width === 390) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await wait(1200);
      await page.screenshot({ path: "previews/v2-motion-mobile-stable.png", fullPage: false });
    }
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth
    }));
    assert(dimensions.scroll <= dimensions.client + 2, "Horizontal overflow at " + width);
    record.push("No horizontal overflow at " + width);
  }

  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  // Reload under the new system preference, as browsers do after settings changes.
  await page.reload({ waitUntil: "networkidle0" });
  await check("Reduced-motion disables ongoing animations", async () => page.evaluate(() =>
    matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !document.documentElement.classList.contains("motion-ready")));
  assert.equal(errors.length, 0, "Browser errors: " + errors.join(" | "));
  record.push("No uncaught browser errors");
  console.log(JSON.stringify({ result: "passed", count: record.length, checks: record }, null, 2));
} finally {
  await browser.close();
}
