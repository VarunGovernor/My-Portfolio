(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)");

  // Cached DOM References
  const nav = document.querySelector(".navigation");
  const menuBtn = document.querySelector(".menu-toggle");
  const heroSection = document.querySelector(".hero");
  const fieldsPanel = document.querySelector(".fields");
  const workSection = document.querySelector(".work-section");
  const aboutSection = document.querySelector(".about-section");
  const skillsSection = document.querySelector(".skills-section");
  const contactSection = document.querySelector(".contact-section");
  const workCards = [...document.querySelectorAll(".work-card")];
  const capCards = [...document.querySelectorAll(".cap-card")];
  const allSections = [...document.querySelectorAll(".section")];
  const signatureEl = document.querySelector(".signature-name");

  // State
  const visibleSections = new Set();
  let frameId = 0;
  let lastTime = 0;
  let lastPaintTime = -100;

  // Mouse interpolation
  let targetX = 0;
  let targetY = 0;
  let mouseX = 0;
  let mouseY = 0;

  // Scroll interpolation
  let currentScrollY = window.scrollY;
  let smoothScrollY = window.scrollY;
  let isScrolling = false;
  let scrollTimeout = null;

  // Card hover tilt
  let activeCard = null;
  let cardTiltX = 0;
  let cardTiltY = 0;

  const startTime = performance.now();

  /* --------------------------------------------------------------------------
     Navigation Controls
     -------------------------------------------------------------------------- */
  const closeMenu = () => {
    if (!nav) return;
    nav.dataset.open = "false";
    menuBtn?.setAttribute("aria-expanded", "false");
  };

  menuBtn?.addEventListener("click", () => {
    const isOpen = nav.dataset.open !== "true";
    nav.dataset.open = String(isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      nav.querySelector(".nav-list a")?.focus({ preventScroll: true });
    }
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.dataset.open === "true") {
      closeMenu();
      menuBtn?.focus();
    }
  });

  nav?.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) closeMenu();
  });

  /* --------------------------------------------------------------------------
     Smooth Anchor Navigation
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#" || targetId === "") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
        if (targetId !== "#top") {
          targetEl.focus({ preventScroll: true });
        }
      }
    });
  });

  /* --------------------------------------------------------------------------
     Varun Name Fallback Animation (Letter-by-Letter Reconstruction)
     -------------------------------------------------------------------------- */
  const NAME_TEXT = "Varun.";
  const CIPHER_GLYPHS = ["0", "1", "<", ">", "/", "_", "#", "$", "%", "&", "*", "+", "X", "Z", "V", "R"];
  let isNameAnimating = false;
  let nameLetters = [];
  let activeNameTimers = [];

  function clearNameTimers() {
    activeNameTimers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    activeNameTimers = [];
  }

  function initSignature() {
    if (!signatureEl) return;
    signatureEl.innerHTML = "";
    signatureEl.setAttribute("role", "button");
    signatureEl.setAttribute("tabindex", "0");
    signatureEl.setAttribute("aria-label", "Varun. (Click to replay animation)");

    nameLetters = [...NAME_TEXT].map((char, index) => {
      const span = document.createElement("span");
      span.className = "sig-letter" + (char === "." ? " sig-dot" : "");
      span.dataset.char = char;
      span.style.setProperty("--i", String(index));
      span.textContent = char;
      signatureEl.appendChild(span);
      return { el: span, target: char, index };
    });

    const triggerReplay = () => {
      if (!reduceMotion.matches) animateNameFallback(true);
    };

    signatureEl.addEventListener("click", triggerReplay);
    signatureEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerReplay();
      }
    });
  }

  function animateNameFallback(isReplay = false) {
    if (!signatureEl || reduceMotion.matches) return;
    if (isNameAnimating && !isReplay) return;

    clearNameTimers();
    isNameAnimating = true;
    signatureEl.classList.remove("has-animated");

    nameLetters.forEach(({ el, target, index }) => {
      el.classList.remove("is-settled");
      el.classList.add("is-scrambling");

      const delay = index * 85;
      const duration = 260 + index * 35;

      const startTimer = setTimeout(() => {
        const cycleTimer = setInterval(() => {
          el.textContent = CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
        }, 30);
        activeNameTimers.push(cycleTimer);

        const endTimer = setTimeout(() => {
          clearInterval(cycleTimer);
          el.textContent = target;
          el.classList.remove("is-scrambling");
          el.classList.add("is-settled");

          // When last letter resolves
          if (index === nameLetters.length - 1) {
            signatureEl.classList.add("has-animated");
            setTimeout(() => {
              isNameAnimating = false;
            }, 250);
          }
        }, duration);
        activeNameTimers.push(endTimer);
      }, delay);

      activeNameTimers.push(startTimer);
    });
  }

  initSignature();

  /* --------------------------------------------------------------------------
     Scroll Reveals
     -------------------------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          if (entry.target.classList.contains("about-intro") || entry.target.closest(".about-intro")) {
            animateNameFallback(false);
          }
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll(".reveal").forEach((element, i) => {
    element.style.setProperty("--delay", `${(i % 3) * 35}ms`);
    revealObserver.observe(element);
  });

  /* --------------------------------------------------------------------------
     Light Field Canvases (Hero & Work) with Volumetric Internal Parallax
     -------------------------------------------------------------------------- */
  function spot(ctx, cx, cy, rx, ry, color, strength = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    const fill = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    fill.addColorStop(0, color);
    fill.addColorStop(0.35, color);
    fill.addColorStop(1, "transparent");
    ctx.globalAlpha = strength;
    ctx.fillStyle = fill;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  function ribbon(ctx, path, color, width, blur = 0) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.stroke(new Path2D(path));
    ctx.restore();
  }

  const scenes = [...document.querySelectorAll(".light-field")].map((canvas) => {
    canvas.width = 836;
    canvas.height = canvas.closest(".hero") ? 471 : 330;
    const refraction = document.createElement("canvas");
    refraction.width = canvas.width;
    refraction.height = canvas.height;
    return {
      canvas,
      refraction,
      ctx: canvas.getContext("2d", { alpha: false }),
      section: canvas.closest(".section"),
      layers: null,
    };
  });

  function buildLights(scene) {
    const { canvas } = scene;
    const layers = [];
    const layer = () => {
      const light = document.createElement("canvas");
      light.width = canvas.width;
      light.height = canvas.height;
      layers.push(light);
      const context = light.getContext("2d");
      context.setTransform(
        canvas.width / 1672,
        0,
        0,
        canvas.height / (scene.section === heroSection ? 941 : 725),
        0,
        0
      );
      return context;
    };

    let ctx = layer();
    if (scene.section === heroSection) {
      // Layer 0: Deep navy / indigo mass
      ribbon(ctx, "M987 -120 C976 90 977 204 1030 335 S1139 540 1191 701", "#05245f", 190, 40);
      spot(ctx, 1040, 355, 195, 350, "#081750", 0.65);
      spot(ctx, 387, 460, 450, 460, "#005caf", 0.65);
      spot(ctx, 63, 500, 160, 85, "#704aab", 0.46);

      // Layer 1: Pink distorted optical ribbons
      ctx = layer();
      ribbon(ctx, "M803 252 C832 302 741 359 718 407", "#d83995", 70, 20);
      ribbon(ctx, "M737 403 C654 475 762 512 843 551 S1015 663 1090 800", "#d83995", 144, 27);
      ribbon(ctx, "M700 222 C920 199 816 263 800 292", "#ff54bb", 66, 13);
      ribbon(ctx, "M727 400 C671 478 768 499 841 557 S936 667 1015 699", "#ff65bf", 86, 17);
      spot(ctx, 1230, 810, 420, 280, "#9654aa", 0.63);
      ribbon(ctx, "M704 491 L870 542 L965 550", "#ffd2e66b", 22, 9);

      // Layer 2: Cyan bloom & sparks
      ctx = layer();
      spot(ctx, 665, 145, 170, 290, "#bceeff", 0.44);
      spot(ctx, 1228, 116, 185, 203, "#9ee6ff", 0.59);
      spot(ctx, 1270, 460, 155, 195, "#67bcfa", 0.24);
      spot(ctx, 1531, 390, 215, 350, "#bcefff", 0.68);
      spot(ctx, 720, 741, 195, 255, "#a5daff", 0.68);
      spot(ctx, 1465, 780, 280, 240, "#b3dcff", 0.38);
      ribbon(ctx, "M1210 600 C1358 610 1505 460 1650 510", "#d9f3ff99", 62, 25);
      ribbon(ctx, "M915 589 C1093 631 1278 611 1481 698 L1634 739", "#efd8ef88", 30, 16);
      ribbon(ctx, "M532 342 L557 320 L576 357", "#fcffffcc", 10, 4);
      ribbon(ctx, "M226 535 L271 521 L300 528", "#e0f7ff99", 9, 3);
    } else {
      // Work section background scene
      spot(ctx, 585, 44, 450, 390, "#72c6ff", 0.7);
      spot(ctx, 1088, 16, 375, 220, "#d7e9ff", 0.64);
      spot(ctx, 190, 330, 260, 355, "#004f9b", 0.8);
      ctx = layer();
      ribbon(ctx, "M1116 118 C1313 167 1274 209 1467 294", "#f74fc3", 99, 25);
      ribbon(ctx, "M-80 294 C80 295 100 342 217 366", "#ad43bcaa", 75, 32);
      ribbon(ctx, "M487 275 C739 256 729 432 914 472", "#ff4cbd", 117, 15);
      ribbon(ctx, "M1200 576 C1400 534 1550 548 1760 410", "#f464ce", 72, 22);
      ctx = layer();
      ribbon(ctx, "M520 190 C670 224 634 320 730 372", "#061f72dd", 100, 20);
      ribbon(ctx, "M601 278 C759 309 747 425 916 468", "#ffe7f188", 21, 9);
      spot(ctx, 834, 421, 125, 99, "#ff40b8", 0.7);
      ribbon(ctx, "M-70 605 C261 664 399 831 713 799", "#f5fdff", 92, 24);
      ribbon(ctx, "M974 661 C1145 653 1331 701 1577 595", "#c8eeff", 90, 35);
      ribbon(ctx, "M1280 382 L1501 262", "#e4e4ff88", 38, 16);
      spot(ctx, 1085, 557, 250, 195, "#cbb7ef", 0.52);
    }

    // Bake fine vertical refraction
    const refract = scene.refraction.getContext("2d");
    for (const light of layers) {
      refract.clearRect(0, 0, canvas.width, canvas.height);
      refract.drawImage(light, 0, 0);
      const context = light.getContext("2d");
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let col = 0; col < canvas.width; col += 2) {
        const shift = Math.sin(col * 1.73) * 1.5 + Math.sin(col * 0.041) * 1.5;
        context.drawImage(scene.refraction, col, 0, 2, canvas.height, col, shift, 2, canvas.height);
      }
    }
    return layers;
  }

  function paintCanvas(scene, seconds) {
    const { canvas, ctx } = scene;
    if (!ctx) return;
    scene.layers ||= buildLights(scene);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0593C6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = scene.section === heroSection ? "#0056ff29" : "#0070ff59";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Internal vertical parallax between the 3 light layers
    const isHero = scene.section === heroSection;
    const internalParallaxRates = isHero ? [0.10, 0.28, 0.18] : [0.08, 0.22, 0.14];

    scene.layers.forEach((light, index) => {
      const direction = index === 0 ? -1 : 1;
      const targetMouse = reduceMotion.matches ? 0 : mouseX * (index + 1) * 12 * direction;
      light.dx = (light.dx || 0) + (targetMouse - (light.dx || 0)) * (0.08 + index * 0.04);
      const drift = Math.sin((seconds * Math.PI) / (11 + index * 3)) * (9 + index * 5);
      const swell = 1.025 + Math.sin((seconds * Math.PI) / (19 + index * 3)) * 0.02;

      // Internal scroll parallax inside the canvas
      const layerScrollOffset = reduceMotion.matches ? 0 : smoothScrollY * internalParallaxRates[index] * 0.25;

      ctx.drawImage(
        light,
        (-canvas.width * (swell - 1)) / 2 + light.dx + drift,
        (-canvas.height * (swell - 1)) / 2 + (mouseY * (index - 1) * 5) + layerScrollOffset,
        canvas.width * swell,
        canvas.height * swell
      );
    });
  }

  /* --------------------------------------------------------------------------
     Central Motion Engine & True Multi-Layer Parallax Scheduler
     -------------------------------------------------------------------------- */
  function queueTick() {
    if (!frameId && !document.hidden) {
      frameId = requestAnimationFrame(tick);
    }
  }

  function tick(time) {
    frameId = 0;
    if (document.hidden) return;

    const isMoving = !reduceMotion.matches;
    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;

    // Smooth mouse coordinates
    const mouseEase = 1 - Math.exp(-7 * dt);
    mouseX += (targetX - mouseX) * mouseEase;
    mouseY += (targetY - mouseY) * mouseEase;

    // Smooth scroll position with buttery cinematic inertia
    const scrollEase = 1 - Math.exp(-12 * dt);
    const scrollDelta = currentScrollY - smoothScrollY;
    if (Math.abs(scrollDelta) < 0.04) {
      smoothScrollY = currentScrollY;
    } else {
      smoothScrollY += scrollDelta * scrollEase;
    }

    const vh = window.innerHeight;

    // Navigation bar states
    if (nav) {
      nav.classList.toggle("scrolled", currentScrollY > 90);
      const activeSurface = allSections.find((sec) => {
        const r = sec.getBoundingClientRect();
        return r.top <= 40 && r.bottom > 40;
      });
      nav.classList.toggle("light-surface", !!activeSurface?.matches(".about-section,.skills-section"));
    }

    /* ----------------------------------------------------------------------
       Hero Multi-Layer Parallax (Visible Range: 50px - 140px+)
       ---------------------------------------------------------------------- */
    if (heroSection && visibleSections.has(heroSection) && isMoving) {
      // 1. Deepest Background Canvas (lags behind scroll at +35%)
      const heroLightY = (smoothScrollY * 0.35).toFixed(2);
      heroSection.style.setProperty("--hero-light-y", `${heroLightY}px`);

      // 2. Vertical Rib Light Channels (moves at +22%)
      const heroRibsY = (smoothScrollY * 0.22).toFixed(2);
      heroSection.style.setProperty("--hero-ribs-y", `${heroRibsY}px`);

      // 3. Cyan Atmospheric Depth A (moves faster up at -20%)
      const depthAY = (smoothScrollY * -0.20).toFixed(2);
      heroSection.style.setProperty("--depth-a-y", `${depthAY}px`);

      // 4. Pink Optical Refraction Depth B (moves down at +32%)
      // Optical separation between Depth A and Depth B reaches 200px+ across scroll!
      const depthBY = (smoothScrollY * 0.32).toFixed(2);
      heroSection.style.setProperty("--depth-b-y", `${depthBY}px`);

      // 5. Main Hero Content (lifts smoothly into scroll at subtle, safe rate)
      const heroCopyY = Math.max(-28, smoothScrollY * -0.06).toFixed(2);
      heroSection.style.setProperty("--hero-copy-y", `${heroCopyY}px`);

      // 6. Floating Selected Fields Glass Panel (stays securely in upper-right; responds with 3D momentum tilt)
      const scrollVelocity = (currentScrollY - smoothScrollY);
      const pitchTilt = Math.min(6, Math.max(-6, -scrollVelocity * 0.08));
      fieldsPanel?.style.setProperty("--field-rotate-x", `${(mouseY * 3 + pitchTilt).toFixed(2)}deg`);
      fieldsPanel?.style.setProperty("--field-rotate-y", `${(-mouseX * 3.5).toFixed(2)}deg`);

      // 7. Bottom Feature Strip (subtle stable movement that preserves layout space)
      const heroFeatureY = Math.max(-14, smoothScrollY * -0.03).toFixed(2);
      heroSection.style.setProperty("--hero-feature-y", `${heroFeatureY}px`);

      // Cursor depth & ambient breathing on hero
      heroSection.style.setProperty("--depth-a-x", `${(mouseX * 36).toFixed(2)}px`);
      heroSection.style.setProperty("--depth-b-x", `${(-mouseX * 58).toFixed(2)}px`);
      heroSection.style.setProperty("--depth-a-pointer-y", `${(mouseY * 26).toFixed(2)}px`);
      heroSection.style.setProperty("--depth-b-pointer-y", `${(-mouseY * 42).toFixed(2)}px`);
      heroSection.style.setProperty("--copy-x", `${(mouseX * 8).toFixed(2)}px`);
      heroSection.style.setProperty("--light-x", `${(-mouseX * 22).toFixed(2)}px`);
      heroSection.style.setProperty("--rib", `${(Math.sin((time * 0.001 * Math.PI * 2) / 13) * 7.5 + mouseX * 2.5).toFixed(2)}px`);

      if (fieldsPanel) {
        const floatDrift = Math.sin(time * 0.001 * 0.8) * 6;
        fieldsPanel.style.setProperty("--field-x", `${(-mouseX * 18).toFixed(2)}px`);
        fieldsPanel.style.setProperty("--field-y", `${(-mouseY * 12 + floatDrift).toFixed(2)}px`);
      }
    }

    /* ----------------------------------------------------------------------
       Selected Work Parallax (Layered Depth & Staggered Cards)
       ---------------------------------------------------------------------- */
    if (workSection && visibleSections.has(workSection) && isMoving) {
      const rect = workSection.getBoundingClientRect();
      const progress = (vh * 0.5) - (rect.top + rect.height * 0.5);

      workSection.style.setProperty("--work-light-y", `${(progress * 0.30).toFixed(2)}px`);
      workSection.style.setProperty("--work-ribs-y", `${(progress * 0.20).toFixed(2)}px`);
      workSection.style.setProperty("--work-heading-y", `${(progress * 0.12).toFixed(2)}px`);
      workSection.style.setProperty("--light-x", `${(mouseX * 12).toFixed(2)}px`);
      workSection.style.setProperty("--rib", `${(Math.sin((time * 0.001 * Math.PI * 2) / 13) * 7.5).toFixed(2)}px`);

      // Staggered card depth: adjacent cards move at contrasting rates
      const cardRates = [0.09, -0.11, 0.07, -0.09, 0.12];
      workCards.forEach((card, index) => {
        const rate = cardRates[index % cardRates.length];
        const cardY = (progress * rate).toFixed(2);
        card.style.setProperty("--card-y", `${cardY}px`);
      });
    }

    /* ----------------------------------------------------------------------
       About Section Parallax (Independent Background, Heading & Copy)
       ---------------------------------------------------------------------- */
    if (aboutSection && visibleSections.has(aboutSection) && isMoving) {
      const rect = aboutSection.getBoundingClientRect();
      const progress = (vh * 0.5) - (rect.top + rect.height * 0.5);

      aboutSection.style.setProperty("--about-bg-y", `${(progress * 0.34).toFixed(2)}px`);
      aboutSection.style.setProperty("--about-intro-y", `${(progress * 0.14).toFixed(2)}px`);
      aboutSection.style.setProperty("--about-copy-y", `${(progress * -0.10).toFixed(2)}px`);
      aboutSection.style.setProperty("--about-points-y", `${(progress * 0.08).toFixed(2)}px`);
      aboutSection.style.setProperty("--signature-y", `${(progress * 0.10).toFixed(2)}px`);
    }

    /* ----------------------------------------------------------------------
       Capabilities Section Parallax
       ---------------------------------------------------------------------- */
    if (skillsSection && visibleSections.has(skillsSection) && isMoving) {
      const rect = skillsSection.getBoundingClientRect();
      const progress = (vh * 0.5) - (rect.top + rect.height * 0.5);

      skillsSection.style.setProperty("--skills-bg-y", `${(progress * 0.34).toFixed(2)}px`);
      skillsSection.style.setProperty("--skills-title-y", `${(progress * 0.12).toFixed(2)}px`);

      const capRates = [-0.07, 0.04, 0.11];
      capCards.forEach((card, index) => {
        const capY = (progress * capRates[index % capRates.length]).toFixed(2);
        card.style.setProperty("--cap-y", `${capY}px`);
      });
    }

    /* ----------------------------------------------------------------------
       Contact Section Parallax
       ---------------------------------------------------------------------- */
    if (contactSection && visibleSections.has(contactSection) && isMoving) {
      const rect = contactSection.getBoundingClientRect();
      const progress = (vh * 0.5) - (rect.top + rect.height * 0.5);

      contactSection.style.setProperty("--contact-bg-y", `${(progress * 0.36).toFixed(2)}px`);
      contactSection.style.setProperty("--contact-title-y", `${(progress * 0.12).toFixed(2)}px`);
      contactSection.style.setProperty("--contact-row-y", `${(progress * -0.08).toFixed(2)}px`);
    }

    /* ----------------------------------------------------------------------
       Interactive Work Card 3D Tilt
       ---------------------------------------------------------------------- */
    if (activeCard && isMoving) {
      const curX = parseFloat(activeCard.style.getPropertyValue("--tilt-x")) || 0;
      const curY = parseFloat(activeCard.style.getPropertyValue("--tilt-y")) || 0;
      activeCard.style.setProperty("--tilt-x", `${(curX + (cardTiltX - curX) * mouseEase).toFixed(2)}deg`);
      activeCard.style.setProperty("--tilt-y", `${(curY + (cardTiltY - curY) * mouseEase).toFixed(2)}deg`);
    }

    /* ----------------------------------------------------------------------
       Paint Visible Canvases
       ---------------------------------------------------------------------- */
    const seconds = isMoving ? (time - startTime) / 1000 : 0;
    if (time - lastPaintTime > 32 || !isMoving) {
      scenes.forEach((scene) => {
        if (visibleSections.has(scene.section) || !isMoving) {
          paintCanvas(scene, seconds);
        }
      });
      lastPaintTime = time;
    }

    // Continue loop if moving, scrolling, active card, or canvas in view
    if (isMoving && (isScrolling || Math.abs(currentScrollY - smoothScrollY) > 0.05 || activeCard || scenes.some(s => visibleSections.has(s.section)))) {
      queueTick();
    }
  }

  /* --------------------------------------------------------------------------
     Observers & Event Listeners
     -------------------------------------------------------------------------- */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });
      queueTick();
    },
    { threshold: [0, 0.1, 0.5] }
  );

  allSections.forEach((sec) => sectionObserver.observe(sec));

  // Pointer move tracking for cursor parallax
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      queueTick();
    },
    { passive: true }
  );

  document.documentElement.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    queueTick();
  });

  // Card hover 3D tilt
  workCards.forEach((card) => {
    card.addEventListener(
      "pointermove",
      (event) => {
        if (!finePointer.matches || reduceMotion.matches) return;
        if (activeCard && activeCard !== card) {
          activeCard.style.removeProperty("--tilt-x");
          activeCard.style.removeProperty("--tilt-y");
        }
        activeCard = card;
        const rect = card.getBoundingClientRect();
        const cx = (event.clientX - rect.left) / rect.width;
        const cy = (event.clientY - rect.top) / rect.height;
        cardTiltX = (cy - 0.5) * -10;
        cardTiltY = (cx - 0.5) * 10;
        card.style.setProperty("--shine-x", `${(cx * 100).toFixed(1)}%`);
        card.style.setProperty("--shine-y", `${(cy * 100).toFixed(1)}%`);
        card.style.setProperty("--glow-angle", `${(Math.atan2(cy - 0.5, cx - 0.5) * 180 / Math.PI + 100).toFixed(1)}deg`);
        queueTick();
      },
      { passive: true }
    );

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      activeCard = null;
      queueTick();
    });
  });

  // Scroll listener
  window.addEventListener(
    "scroll",
    () => {
      currentScrollY = window.scrollY;
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
      queueTick();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 600) closeMenu();
      currentScrollY = window.scrollY;
      queueTick();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    } else {
      currentScrollY = window.scrollY;
      smoothScrollY = window.scrollY;
      queueTick();
    }
  });

  // Handle prefers-reduced-motion changes
  function onMotionPreferenceChange() {
    document.documentElement.classList.toggle("motion-ready", !reduceMotion.matches);
    if (reduceMotion.matches) {
      targetX = targetY = mouseX = mouseY = 0;
      activeCard = null;
      if (fieldsPanel) fieldsPanel.style.cssText = "";
      workCards.forEach((c) => {
        c.style.removeProperty("--tilt-x");
        c.style.removeProperty("--tilt-y");
        c.style.removeProperty("--card-y");
      });
      allSections.forEach((s) => {
        s.style.setProperty("--rib", "0px");
      });
    }
    queueTick();
  }

  reduceMotion.addEventListener("change", onMotionPreferenceChange);

  // Initialize
  onMotionPreferenceChange();
  scenes.forEach((scene) => paintCanvas(scene, 0));
  queueTick();
})();
