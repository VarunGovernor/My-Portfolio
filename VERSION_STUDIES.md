# Independent Portfolio Versions — V2 / V3 / V4

This branch starts from **main**, not from the abandoned palette-switcher experiment. 
It does not edit the current website at `/index.html` or its existing `src/` tree.

## Independent preview paths

| Version | Source | In Vite dev / GitHub Pages |
| --- | --- | --- |
| Original (V1) | `index.html` | `/My-Portfolio/` |
| V2 — Sky / Distortion | `public/v2/index.html` | `/My-Portfolio/v2/` |
| V3 — Midnight / Stars / Equalizer | `public/v3/index.html` | `/My-Portfolio/v3/` |
| V4 — Paper / Blue / Pink | `public/v4/index.html` | `/My-Portfolio/v4/` |

Run `npm ci && npm run dev`, then visit the Vite URL with `/My-Portfolio/v2/`, `/My-Portfolio/v3/` or `/My-Portfolio/v4/`.
For standalone use, each `public/vN/index.html` has its own CSS and JavaScript embedded in that file. 
No version imports components, styles, animation helpers or data from another version.
No framework or JavaScript library is required to render a version.

## Exact palettes and backgrounds

- **V2**: `#0593C6` blue is the **background**, `#FCFFFF` is the main **text**, `#D83995` is the displaced pink visual. The line field is a 1px vertical CSS line, separated by 12px of plain blue (13px repeat), and is only in the hero, not a page-wide curtain overlay.
- **V3**: `#02070A` is the near-black **background**, `#0297DE` shapes the starlight and blue glow, `#FC734D` drives the orange equalizer. Star points and bars are independent shapes. The hero headline is editorial serif instead of a generic tech dashboard.
- **V4**: `#F0F0F0` off-white **background**, `#105BFF` primary blue, `#ff48a5` vibrant pink. Solid panels, blueprint lines and a diagram instead of a generic blurred gradient.

## Page structure / removed repetitive copy

One concise flow per version: 
**Hero → Selected Work → Capabilities → About → Contact.**

Actual public portfolio work is preserved in the condensed content:
CRM Staffing Platform, Offline-First POS, My Voters Hub, Quantum Digital Forensics, Liva With Love (explicitly in progress).
Work panels cover a project once instead of repeating it in Case Studies, Recent Designs and Ongoing Projects.
No invented stats, bar percentages, customer testimonials or inflated claims.

## Motion and accessibility

- Small independent vanilla-JS controller per version for menu state, reveal-on-view and section-edge parallax.
- Existing V1 animation loops are not loaded on V2, V3 or V4.
- Offscreen elements are skipped when setting parallax variables.
- `prefers-reduced-motion` disables reveal motion, star/equalizer motion, and parallax.
- Navigation uses anchors with keyboard-accessible menu buttons.
- Typography uses Google Fonts when reachable, but has browser/system fallbacks.

## Notes before deployment

Do not merge simply to pick a palette: inspect actual desktop, mobile and reduced-motion views first.
The original root landing page will remain unchanged after merge; the additional pages are alternate URLs. 
Only a later intentional routing/deployment decision should change the homepage to one selected version.

The original main entry is a single-file site; a parallel React `src/` implementation exists but is not imported by the root HTML. Refactor the original only after a preferred design is selected.
