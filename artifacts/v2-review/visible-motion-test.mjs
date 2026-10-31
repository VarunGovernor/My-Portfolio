import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_BINARY,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
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
    (await page.$$eval(".signature-name .sig-letter", nodes => nodes.length)) === 6);

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

  await page.mouse.move(200, 230);
  await wait(400);
  const firstTilt = await prop(".fields", "--field-rotate-y");
  await page.mouse.move(1300, 280);
  await wait(400);
  const secondTilt = await prop(".fields", "--field-rotate-y");
  await check("Selected Fields reacts to cursor depth", async () => firstTilt !== secondTilt);

  const beforeScroll = await prop(".hero", "--copy-y");
  await page.evaluate(() => window.scrollTo({ top: 410, behavior: "instant" }));
  await wait(350);
  const afterScroll = await prop(".hero", "--copy-y");
  await check("Hero copy has independent scroll parallax", async () => beforeScroll !== afterScroll);

  await page.$eval(".about-intro", e => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForFunction(() => document.querySelector(".about-intro")?.classList.contains("in-view"), { timeout: 9000 });
  await check("About signature reveal starts on entry", async () =>
    page.$eval(".signature-name .sig-letter", e => getComputedStyle(e).animationName.includes("letter-enter")));
  await page.screenshot({ path: "previews/v2-motion-about.png", fullPage: false });

  await page.$eval(".work-card:first-child", e => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.hover(".work-card:first-child");
  await wait(450);
  await check("Work card displays moving pink highlight", async () => page.$eval(
    ".work-card:first-child",
    e => Number.parseFloat(getComputedStyle(e, "::before").opacity) > 0.5
  ));
  await page.screenshot({ path: "previews/v2-motion-work.png", fullPage: false });

  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await wait(220);
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth
    }));
    assert(dimensions.scroll <= dimensions.client + 2, "Horizontal overflow at " + width);
    record.push("No horizontal overflow at " + width);
  }

  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await wait(150);
  await check("Reduced-motion toggles off kineticism", async () => page.evaluate(() =>
    !document.documentElement.classList.contains("motion-ready")));
  assert.equal(errors.length, 0, "Browser errors: " + errors.join(" | "));
  record.push("No uncaught browser errors");
  console.log(JSON.stringify({ result: "passed", count: record.length, checks: record }, null, 2));
} finally {
  await browser.close();
}
