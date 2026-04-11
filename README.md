<div align="center">

# ⚡ Varun — Systems Engineer & Product Developer

[![Live Portfolio](https://img.shields.io/badge/🌐_Live_Portfolio-View_Site-16C784?style=for-the-badge&logoColor=white)](https://varungovernor.github.io/My-Portfolio/)
[![GitHub](https://img.shields.io/badge/GitHub-VarunGovernor-181717?style=for-the-badge&logo=github)](https://github.com/VarunGovernor)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Varun_M-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/varun-m-a62418172/)
[![Email](https://img.shields.io/badge/Email-varunmanikanta15%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:varunmanikanta15@gmail.com)

<br/>

> **"I design *systems*, not just features."**
> 
> Full Stack Developer specializing in backend systems, automation, and real-world applications that ship to production.

<br/>

![Portfolio Preview](https://img.shields.io/badge/Built%20with-Pure%20HTML%20%2B%20CSS%20%2B%20JS-16C784?style=flat-square)
![No Dependencies](https://img.shields.io/badge/Zero%20Dependencies-No%20Frameworks%20Needed-0fa96d?style=flat-square)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20%26%20Desktop-4285F4?style=flat-square)

</div>

---

## 🗂️ Table of Contents

- [About This Portfolio](#-about-this-portfolio)
- [✨ Design Philosophy & Features](#-design-philosophy--features)
- [🏗️ Architecture & How It's Built](#️-architecture--how-its-built)
  - [Design System](#design-system)
  - [Animation Engine](#animation-engine)
  - [3D Scene (CSS Only)](#3d-scene-css-only)
  - [Scroll & Interaction System](#scroll--interaction-system)
- [📁 File Structure](#-file-structure)
- [🚀 Featured Projects](#-featured-projects)
- [🛠️ Tech Stack Showcased](#️-tech-stack-showcased)
- [🏃 Running Locally](#-running-locally)
- [📬 Contact](#-contact)
- [©️ License](#️-license)

---

## 🧑‍💻 About This Portfolio

This is my personal developer portfolio — a **single-file, zero-dependency** web experience built entirely with raw HTML, CSS, and vanilla JavaScript. No React. No build tools. No npm install. Just a crafted `.html` file that opens and _wows_.

It showcases my key projects, skills, engineering philosophy, and contact information — designed to leave a strong first impression on clients and hiring teams alike.

---

## ✨ Design Philosophy & Features

This portfolio is engineered to feel **premium and alive**. Every visual decision has intent:

| Feature | Details |
|---|---|
| 🎨 **Glassmorphism UI** | Frosted-glass cards using `backdrop-filter: blur()` throughout |
| 🌊 **Smooth Animations** | All transitions use `cubic-bezier(.22,1,.36,1)` — Apple's spring curve |
| 🖱️ **Cursor Glow** | Radial gradient follows the mouse cursor for a premium feel |
| 🧲 **Parallax Scene** | Hero section has multi-layer CSS parallax driven by mouse position |
| 💻 **3D Laptop (Pure CSS)** | An animated laptop with scrolling code — zero images, pure CSS |
| ☕ **CSS Coffee Cup** | Steam animation and floating cup built entirely with CSS `::before/::after` |
| 🏷️ **Orbital Tech Tags** | JS-positioned tags (`JS`, `SQL`, `Flutter`, etc.) float with `sin/cos` math |
| 📜 **Scroll Progress Bar** | Fixed top progress bar tracks reading depth |
| 🔤 **Collapsing Logo** | On scroll, `Varun.` collapses to `V.` with staggered letter animations |
| 📱 **Fully Responsive** | Mobile-first breakpoints at 480px, 768px, 1024px, 1440px, 1920px, 2560px |
| ♿ **Accessible** | Semantic HTML5, `aria-label`, `lang="en"`, proper heading hierarchy |

---

## 🏗️ Architecture & How It's Built

This is a **single-file architecture** — all CSS, HTML, and JavaScript live in one `index.html`. Here's how each system works:

### Design System

All visual tokens are defined as CSS custom properties in `:root`:

```css
:root {
  --green: #16C784;          /* Primary brand accent */
  --green-light: #e8faf1;    /* Tinted backgrounds */
  --green-dark: #0fa96d;     /* Hover states */
  --bg: #fafbfc;             /* Page background */
  --text: #1a1a2e;           /* Primary text */
  --text-muted: #6b7280;     /* Secondary text */
  --glass: rgba(255,255,255,.45);           /* Glass card fill */
  --glass-border: rgba(255,255,255,.6);     /* Glass card border */
  --shadow-glass: 0 8px 32px rgba(0,0,0,.08); /* Card shadow */
  --radius: 20px;            /* Card border radius */
}
```

All fonts are loaded from Google Fonts:
- **Outfit** — headings (900 weight for hero)
- **Plus Jakarta Sans** — body text
- **JetBrains Mono** — code snippets and tech tags

### Animation Engine

The main animation loop runs on `requestAnimationFrame` with a **LERP (Linear Interpolation)** function for smooth mouse tracking:

```js
const lerp = (a, b, t) => a + (b - a) * t;

// Smooth cursor follow — 5% interpolation per frame
sx = lerp(sx, mx, 0.05);
sy = lerp(sy, my, 0.05);
```

All animated elements use `will-change: transform` for GPU acceleration. Each frame:
1. Parallax layers shift based on mouse delta from scene center
2. Orbital tags float using `sin(time + offset)` math
3. The floating CSS laptop 3D-tilts toward the cursor with `perspective()` + `rotateX/Y`
4. The coffee cup bobs on a sine wave with a slight rotation

### 3D Scene (CSS Only)

The hero's right-side visual is built with pure CSS — **no SVGs, no images, no canvas**:

```
.scene
├── .layer[data-depth="0.015"]   ← Background rings (slow parallax)
│   ├── .bg-ring × 3             ← Spinning concentric rings
│   └── .bg-blob × 2             ← Soft blurred green blobs
├── .layer[data-depth="0.04"]    ← Mid layer (fast parallax)
│   ├── .code-float × 8          ← Floating CLI commands
│   ├── .g-particle × 16         ← Tiny green dots
│   └── .g-ring × 6              ← Spinning ring particles
└── .layer[data-depth="0.065"]   ← Foreground (fastest parallax)
    └── .coffee-wrap             ← CSS coffee cup
```

Each `data-depth` value determines how far the layer moves relative to cursor — creating genuine depth.

### Scroll & Interaction System

| Mechanism | Implementation |
|---|---|
| **Scroll reveal** | `IntersectionObserver` — elements gain `.visible` class at 8% threshold |
| **Scroll progress** | `scrollY / (scrollHeight - innerHeight) * 100` → bar width |
| **Nav collapse** | Logo animates with `max-width: 0` on each character + CSS transitions |
| **Case study expand** | `scrollHeight` injection for smooth accordion height animation |
| **Card tilt** | `mousemove` → `perspective(900px) rotateY() rotateX()` per card |

---

## 📁 File Structure

```
My-Portfolio/
├── index.html          ← The entire portfolio (single-file architecture)
└── README.md           ← This file
```

> The portfolio is intentionally self-contained in one file — no build step, no node_modules, no config. Load it in a browser and it works.

---

## 🚀 Featured Projects

### 🗳️ My Voters Hub — `Flutter + Supabase`
> Political campaign management platform for Telangana elections

- Cross-platform Flutter app (iOS & Android) with a Telugu-first UI
- Supabase PostgreSQL backend with **Row-Level Security**
- **Smart Folder** voter filtering system with Offline-First sync for rural field agents
- Twilio SMS voter outreach integration
- Shipped live on **Play Store & App Store**

**Stack:** `Flutter` `Dart` `Supabase` `PostgreSQL` `Twilio` `RLS` `iOS/Android`

---

### 🏢 CRM Staffing Portal — `React + Redux`
> Enterprise CRM for staffing operations and pipeline management

- "San Synapse-CRM" — multi-stage drag-and-drop pipeline management
- Redux Toolkit state management with role-based access control
- Framer Motion animated UI with lazy-loaded Vite production bundle
- Client-ready demo environment with TailwindCSS design system

**Stack:** `React` `Vite` `Redux Toolkit` `TailwindCSS` `Framer Motion` `REST APIs`

---

## 🛠️ Tech Stack Showcased

<table>
<tr>
<td><strong>Mobile</strong></td>
<td>Flutter, Dart, iOS, Android, Swift, Kotlin</td>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>React, Vite, HTML/CSS/JS, TailwindCSS, Framer Motion</td>
</tr>
<tr>
<td><strong>Backend & Data</strong></td>
<td>Supabase, PostgreSQL, REST APIs, Socket.io, Row-Level Security</td>
</tr>
<tr>
<td><strong>Automation</strong></td>
<td>Excel VBA, Data Pipelines, Process Optimization</td>
</tr>
<tr>
<td><strong>Embedded</strong></td>
<td>Bluetooth LE, Protocol Buffers, APK Reverse Engineering</td>
</tr>
<tr>
<td><strong>DevOps</strong></td>
<td>CI/CD, App Store Deployment, Docker, Git</td>
</tr>
</table>

---

## 🏃 Running Locally

No build tools or dependencies required.

```bash
# Clone the repo
git clone https://github.com/VarunGovernor/My-Portfolio.git
cd My-Portfolio

# Open directly in your browser
# Option 1: Double-click index.html
# Option 2: Use VS Code Live Server extension
# Option 3: Python quick server
python -m http.server 8080
# Then visit http://localhost:8080
```

That's it. No `npm install`. No `.env`. Just open and run.

---

## 📬 Contact

| Channel | Link |
|---|---|
| 📧 Email | [varunmanikanta15@gmail.com](mailto:varunmanikanta15@gmail.com) |
| 💼 LinkedIn | [linkedin.com/in/varun-m-a62418172](https://www.linkedin.com/in/varun-m-a62418172/) |
| 🐙 GitHub | [github.com/VarunGovernor](https://github.com/VarunGovernor) |
| 💬 Discord | [mrgovernor.](https://discord.com/users/mrgovernor.) |
| 📱 Phone | [+91 79813 83407](tel:+917981383407) |

---

## ©️ License

© 2026 Varun. All rights reserved.

This portfolio and its design are my original work. Feel free to draw inspiration, but please do not copy and publish it as your own.
