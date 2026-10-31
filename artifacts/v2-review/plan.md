# V2 reference fidelity implementation

Goal: reproduce the two supplied 1672×941 references in the actual V2 route.
Base: origin/design/independent-v2-v3-v4 at f869432. Work in the explicitly requested feature branch; retain untracked user inputs.

1. Capture baseline and establish browser checks for desktop card geometry, functional links, mobile menu, overflow and live reduced-motion changes.
2. Replace the V2 inline/override styles with assets/kinetic.css; retain factual projects, connect to existing V1 case studies, and move About directly after Work. Use DM Sans, IBM Plex Mono, #0593C6 / #FCFFFF / #D83995; hero shell 1336px, work shell 1192px.
3. Consolidate animation into one culled rAF controller with independently eased light fields, rib phase, glass tilt, scroll depth and accessible letter reveals. Render the atmosphere as original low-resolution Canvas light paths with crisp CSS ribs over it.
4. Capture actual desktop, laptop, mobile, reduced-motion and interaction frames. Generate reference overlays/diffs, inspect both compositions and iterate. Run production build, check original/V3/V4 preservation and commit only the feature branch.

Review focus: readable first frame and JS fallback; resize and mobile menu focus; dynamic reduced-motion changes; working case-study anchors under the Vite base path; no animation work when hidden/offscreen.
