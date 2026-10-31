# V2 fidelity review

Branch: `feat/v2-reference-fidelity-20261031`
Base: latest fetched `origin/design/independent-v2-v3-v4`, `f869432`.

V2 is independent HTML, one consolidated stylesheet, and one motion module. Local, licensed DM Sans and IBM Plex Mono remove network-dependent font shifts. Original portfolio content supplies all five projects and real case-study destinations. About follows Work; Capabilities and Contact remain fully functional.

## Run

```powershell
npm ci
npm run dev
# http://localhost:5173/My-Portfolio/v2/index.html

npm run build
npm run preview
# http://localhost:4173/My-Portfolio/v2/
```

Vite development requires the explicit `index.html` for this static public route; its directory URL falls back to V1. The production directory route was verified.

## Actual browser output

All desktop reference frames are real production Chromium screenshots at **1672 × 941**, device scale 1. The Work capture scrolls to the actual Work section, with the single fixed navbar above it.

| Scene | Browser frame | Overlay | Difference | Side by side |
| --- | --- | --- | --- | --- |
| Hero | [Final](final-hero.png) | [50% overlay](final-hero-overlay.png) | [Amplified difference](final-hero-diff.png) | [Reference / actual](final-hero-comparison.png) |
| Work / About | [Final](final-work-about.png) | [50% overlay](final-work-about-overlay.png) | [Amplified difference](final-work-about-diff.png) | [Reference / actual](final-work-about-comparison.png) |

The original remote candidate is captured in [baseline hero](baseline-hero.png) and [baseline Work](baseline-work-about.png). [Iteration history](iteration-history.json) records comparison measurements across five visual passes and the final production capture. RGB error is a diagnostic, not proof of visual equivalence; factual copy differences also contribute.

Additional frames: [1366 × 768 laptop](laptop-hero.png), [390 × 844 mobile hero](mobile-hero.png), [menu](mobile-menu.png), [Work](mobile-work.png), [About](mobile-about.png), [Contact](mobile-contact.png), [touch navigation](mobile-touch-work.png), [light-section desktop navigation](desktop-capabilities.png), and [reduced motion](reduced-work-about.png).

## Verification

- Production build passes. V1, V3, V4, React source, package manifest and lockfile have no changes from the base commit. CI assertions now follow V2's consolidated files.
- The build emits the existing stale Browserslist-data advisory; no dependency changes were made for it.
- Five desktop geometry/link assertions, eight responsive regressions at 768/1024/1100 px, and 27 interaction/performance/accessibility assertions pass. See [test results](test-results.json), [responsive results](responsive-results.json), and [verification log](verification.log).
- Axe WCAG 2 A/AA and 2.1 AA: zero violations in the recorded desktop/mobile scans. Keyboard navigation, skip link, Escape/focus restoration, touch menu, reduced motion, readable no-JavaScript text, project fragment destinations and no horizontal overflow were exercised.
- One requestAnimationFrame controller schedules input, section depth, independently eased light layers, rib phase, floating glass and card tilt. Blurred paths/refraction are cached. The controller stops when both light scenes are offscreen and cancels when the document is hidden.
- [Frame 0](motion-t0.png), [five seconds](motion-t5.png), [pointer movement](motion-pointer.png), [pointer leave](motion-leave.png), and [glass hover](motion-card.png) show motion. The browser separately compares Canvas pixels so text entrance alone cannot pass the motion check. [Motion comparison](motion-comparison.json) measures changes in a background-only crop.
- Final headless desktop timing: approximately 16.7 ms median, 33.4 ms 95th percentile. This is an observed local run, not a physical-device performance guarantee.

## Reproduce browser checks

Test tooling is isolated from application dependencies. Install Playwright and axe-core in a temporary tools directory and Chromium with the matching Playwright version; Pillow is needed only for image comparisons.

```powershell
npm install --prefix "$env:TEMP/v2-review-tools" --no-save --no-package-lock playwright axe-core
node "$env:TEMP/v2-review-tools/node_modules/playwright/cli.js" install chromium
$env:PLAYWRIGHT_MODULE="$env:TEMP/v2-review-tools/node_modules/playwright"
$env:AXE_SCRIPT="$env:TEMP/v2-review-tools/node_modules/axe-core/axe.min.js"
$env:PRODUCTION='1'
$env:REVIEW_PASS='final'
npm run build
node artifacts/v2-review/browser-check.mjs --check --full
python -m pip install Pillow
python artifacts/v2-review/compare.py final
```

The runner starts/stops a local server if needed. Set `V2_URL` to test an already running route. Missing axe tooling is explicitly reported as skipped.

## Remaining differences

Desktop geometry is close: featured card **704 × 241 px**, second-row widths **462 / 365 / 333 px**, and About divider near **y=724**. The light contours remain smoother and ribs more regular than the supplied images. Some fine horizontal hero streaks and diagonal Work sweeps differ in shape/intensity; About's left pink bloom is broader. Actual project content changes wrapping in three cards. This is not pixel-perfect.

See [independent review](review.md) for the four functional findings and their verified fixes. No merge, push or deployment was performed. Physical devices, Safari/Firefox, and live external profile destinations were not tested; local project destinations were verified.
