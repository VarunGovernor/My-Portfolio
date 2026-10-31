# Portfolio redesign — implementation & structure audit

## Active version

GitHub Pages deploys `npm run build`, and Vite uses the **root `index.html`**
as its entry. That file is a standalone HTML/CSS/JavaScript application, **not**
the React project under `src/`. The React components are not imported by the
root HTML, so changing only them has no visible effect on the deployed site.

## Changes in this branch

- Three saved, user-selectable palettes: Sky Glaze, Midnight Pulse, Galactic Canvas.
- Centralized theme tokens in `assets/portfolio-theme.css` rather than injecting
  more literal colors throughout the existing file.
- Replaced the profile `img` with a typographic **V / VARUN.** fallback and
  deleted the unused image from this branch.
- Added the thin vertical stripe texture from reference one.
- Added section-depth atmospheric glows and bottom-edge markers to all
  14 non-cube? (actually 14 of the 15 sections carry IDs) existing named
  sections, with one IntersectionObserver and one scroll-throttled rAF.
- Preserved the current hero animation, content, routing, and project screenshots.
- Kept a non-deploying branch; the live site only changes on merge to main.

## Duplication and content recommendations

1. **Two divergent application implementations:** `index.html` (active) and
   `src/` (unused React/Vite scaffold). Decide which to retain before
   deleting or migrating anything. Do not keep authoring both.
2. **Monolithic source:** the active HTML is around 180 KB and includes a very
   large inline stylesheet and animation engine. Move page sections, data,
   styles and behavior into organized modules in a separate, tested follow-up.
3. **Overlapping page sections:** Case Studies, Recent Designs and Ongoing
   Projects all showcase work; Systems I Build, Services and Skills overlap;
   Why Choose Me and FAQ read like a services landing page rather than a
   portfolio. Consolidate editorially without dropping real case studies.
4. **Duplicate copy and metadata:** React `src/data/content.js` describes
   projects that can diverge from the static page; README also claims
   a zero-tool, zero-dependency build while GitHub Pages runs Vite.
5. **Motion budget:** the legacy hero already has a continuously scheduled
   animation loop. New section-depth motion is passive-scroll-triggered,
   uses IntersectionObserver and honors reduced motion. A later refactor
   should pause the legacy hero loop when offscreen or reduced motion.
6. **Accessibility:** verify contrast and keyboard behavior in each palette,
   especially the legacy dark-mode panels, before selecting a production theme.

## Suggested streamlined content hierarchy

Home (hero + typographic portrait) → Featured Work (case studies plus
ongoing work) → Capabilities (skills, services) → Approach (experience/process)
→ Contact. Keep an optional links area for open-source and FAQs only if needed.

## Verification

Run `npm ci && npm run build` and serve `npm run preview`. Check all
three palettes at desktop and phone widths, portrait removal, parallax,
reduced-motion, internal anchors, contact actions, and case-study links.
The PR workflow checks the build artifact and rejects old profile image links.

**Why this branch does not delete the React files yet:** merging an
unrelated migration into a visual redesign increases regression risk.
