import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_BINARY,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
const root = "http://127.0.0.1:4174/My-Portfolio/";
let passed = 0;
function check(name, value) {
  assert(value, name);
  passed++;
  console.log("PASS:", name);
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const rect = el => {
  const { top, right, bottom, left, width, height } = el.getBoundingClientRect();
  return { top, right, bottom, left, width, height };
};
const overlaps = (a, b) => a.left < b.right && a.right > b.left &&
  a.top < b.bottom && a.bottom > b.top;

try {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  await page.goto(root, { waitUntil: "networkidle0", timeout: 50000 });
  await sleep(1450); // Allow approved entry animation to settle before measuring geometry.
  check("Public root serves approved V2",
    await page.$eval("#hero-title", e => e.textContent.includes("Full-stack")));
  check("Root references V2 stylesheet",
    await page.$eval('link[rel="stylesheet"]', e => e.getAttribute("href") === "./v2/assets/kinetic.css"));
  check("Root loads motion script",
    await page.$eval('script[src]', e => e.getAttribute("src") === "./v2/assets/kinetic.js"));
  check("V2 kinetic controller initializes",
    await page.evaluate(() => document.documentElement.classList.contains("motion-ready")));
  check("Project links open V2-styled text case studies",
    (await page.$$('a[href*="v2/work/index.html#"]')).length === 5);
  check("No em dashes in public title or visible text",
    await page.evaluate(() => !/[—–]/.test(document.title + document.body.innerText)));

  const geometry = await page.evaluate(() => {
    const toRect = el => {
      const { top, right, bottom, left, width, height } = el.getBoundingClientRect();
      return { top, right, bottom, left, width, height };
    };
    return {
      fields: toRect(document.querySelector(".hero .fields")),
      title: toRect(document.querySelector(".hero h1")),
      glyphs: [...document.querySelectorAll("#hero-title > span")].map(span => {
        const range = document.createRange();
        range.selectNodeContents(span);
        return toRect(range);
      }),
      feature: toRect(document.querySelector(".hero .feature-bar")),
      work: toRect(document.querySelector("#work"))
    };
  });
  console.log("Desktop geometry:", JSON.stringify(geometry));
  check("Glass panel rests in upper-right without headline text overlap",
    geometry.fields.left > 850 && geometry.glyphs.every(glyph => !overlaps(geometry.fields, glyph)));
  check("Hero feature bar stays above Selected Work",
    geometry.feature.bottom <= geometry.work.top + 5);
  check("Hero headline appears within opening viewport",
    geometry.title.top > 100 && geometry.title.top < 650);
  await page.screenshot({ path: "previews/live-root-desktop.png" });

  const before = await page.evaluate(() => ({
    canvas: getComputedStyle(document.querySelector(".hero .light-field")).transform,
    ribs: getComputedStyle(document.querySelector(".hero .ribs")).transform
  }));
  await page.evaluate(() => scrollTo({ top: 550, behavior: "instant" }));
  await sleep(650);
  const after = await page.evaluate(() => ({
    canvas: getComputedStyle(document.querySelector(".hero .light-field")).transform,
    ribs: getComputedStyle(document.querySelector(".hero .ribs")).transform
  }));
  check("Live homepage visibly transforms parallax layers during scroll",
    before.canvas !== after.canvas && before.ribs !== after.ribs);

  await page.goto(root + "v2/index.html", { waitUntil: "networkidle0" });
  check("Standalone V2 route still serves the approved portfolio",
    await page.$eval("#hero-title", e => e.textContent.includes("Full-stack")));
  check("Standalone V2 links open its own project details",
    (await page.$$('a[href*="./work/index.html#"]')).length === 5);

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.goto(root, { waitUntil: "networkidle0" });
  const mobile = await page.evaluate(() => {
    const r = el => {
      const { top, right, bottom, left } = el.getBoundingClientRect();
      return { top, right, bottom, left };
    };
    return {
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      glass: r(document.querySelector(".hero .fields")),
      heading: r(document.querySelector(".hero-copy"))
    };
  });
  check("Mobile homepage has no horizontal overflow",
    mobile.scrollWidth <= mobile.viewport + 2);
  check("Mobile glass panel and hero copy do not overlap",
    !overlaps(mobile.glass, mobile.heading));
  await page.screenshot({ path: "previews/live-root-mobile.png" });

  await page.goto(root + "v2/work/index.html#liva", { waitUntil: "networkidle0" });
  check("V2 project details load with consistent theme",
    (await page.$("#liva")) !== null && (await page.$('img')).length === 0);
  check("V2 details page contains no legacy gallery or screenshot buttons",
    await page.evaluate(() => !document.body.innerText.includes("Liva Storefront Screens")));
  const v2Errors = errors.slice();
  await page.goto(root + "legacy/index.html#cs1", { waitUntil: "networkidle0" });
  check("Legacy project case studies survive the upgrade",
    (await page.$("#cs1")) !== null);
  const imageStatus = await page.evaluate(async () =>
    (await fetch("./images/quantum-digital/01-cdr-link-analysis.png")).status
  );
  check("Original case-study image assets are published", imageStatus === 200);

  check("No uncaught V2 browser errors", v2Errors.length === 0);
  console.log(JSON.stringify({ result: "passed", checks: passed }, null, 2));
} finally {
  await browser.close();
}
