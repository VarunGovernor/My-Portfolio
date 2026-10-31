import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Publish the approved standalone V2 page at the existing GitHub Pages root.
// Leave the source V1 index.html untouched and preserve its case studies.
const dist = resolve("dist");
const oldRoot = await readFile(resolve(dist, "index.html"), "utf8");
const v2Path = resolve(dist, "v2", "index.html");
const v2 = await readFile(v2Path, "utf8");

if (!v2.includes('./assets/kinetic.css') || !v2.includes('./assets/kinetic.js')) {
  throw new Error("V2 entrypoint is missing expected CSS or JavaScript links");
}
if (!oldRoot.includes('id="case-studies"')) {
  throw new Error("Original portfolio case studies were not found; aborting release");
}

await mkdir(resolve(dist, "legacy"), { recursive: true });
// A relative base allows the archived V1 HTML to load original images at /My-Portfolio/images/.
// Its internal #links are directed back to the archived V1 page instead of live V2.
const legacy = oldRoot
  .replace("</head>", '  <base href="../" />\n</head>')
  .replace(/href="#([A-Za-z][\w-]*)"/g, 'href="./legacy/index.html#$1"');
await writeFile(resolve(dist, "legacy", "index.html"), legacy);

// Images are referenced directly by V1, so Vite does not necessarily bundle them.
await cp(resolve("images"), resolve(dist, "images"), { recursive: true });

const legacyLinks = v2.replaceAll("../index.html#", "../legacy/index.html#");
await writeFile(v2Path, legacyLinks);

// The public homepage uses V2 content directly, not a redirect.
// Rebase the two V2 assets and archived case-study links for the root URL.
const live = legacyLinks
  .replaceAll('./assets/kinetic.css', './v2/assets/kinetic.css')
  .replaceAll('./assets/kinetic.js', './v2/assets/kinetic.js')
  .replaceAll('../legacy/index.html#', './legacy/index.html#');
await writeFile(resolve(dist, "index.html"), live);

for (const [label, html] of [["homepage", live], ["V2", legacyLinks], ["legacy V1", legacy]]) {
  if (!html.includes("<html") || !html.includes("</html>")) {
    throw new Error(`Invalid ${label} output`);
  }
}
console.log("Published V2 at /, preserved V2 at /v2/ and V1 case studies at /legacy/");
