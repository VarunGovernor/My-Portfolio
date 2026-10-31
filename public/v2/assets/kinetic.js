(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(pointer: fine)");
  const nav = document.querySelector(".navigation");
  const menu = document.querySelector(".menu-toggle");
  const hero = document.querySelector(".hero");
  const fields = document.querySelector(".fields");
  const cards = [...document.querySelectorAll(".work-card")];
  const sections = [...document.querySelectorAll(".section")];
  const visible = new Set();
  const scenes = [...document.querySelectorAll(".light-field")].map(
    (canvas) => {
      canvas.width = 836;
      canvas.height = canvas.closest(".hero") ? 471 : 330;
      const refraction = document.createElement("canvas");
      refraction.width = canvas.width;
      refraction.height = canvas.height;
      return {
        canvas,
        refraction,
        ctx: canvas.getContext("2d", { alpha: false }),
        section: canvas.parentElement,
      };
    },
  );
  let frameId = 0,
    last = 0,
    lastPaint = -100,
    scrollDirty = true;
  let targetX = 0,
    targetY = 0,
    x = 0,
    y = 0,
    tiltX = 0,
    tiltY = 0,
    activeCard = null;
  const start = performance.now();

  const closeMenu = () => {
    nav.dataset.open = "false";
    menu.setAttribute("aria-expanded", "false");
  };
  menu.addEventListener("click", () => {
    const open = nav.dataset.open !== "true";
    nav.dataset.open = String(open);
    menu.setAttribute("aria-expanded", String(open));
    if (open) nav.querySelector(".nav-list a").focus({ preventScroll: true });
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.dataset.open === "true") {
      closeMenu();
      menu.focus();
    }
  });
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget)) closeMenu();
  });

  const signature = document.querySelector(".signature-name");
  const name = signature.textContent;
  signature.textContent = "";
  [...name].forEach((letter, i) => {
    const span = document.createElement("span");
    span.textContent = letter;
    span.className = "sig-letter";
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--i", i);
    span.style.setProperty("--wave", `${-((i % 3) + 1) * 3}px`);
    signature.append(span);
  });
  // Optional typographic interaction. Text is stable unless someone hovers it.
  const heading = document.getElementById("hero-title");
  if (heading) {
    heading.setAttribute("aria-label", heading.textContent.replace(/\s+/g, " ").trim());
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    heading.querySelectorAll("span").forEach(span => {
      const original = span.textContent;
      let active = false;
      span.addEventListener("pointerenter", event => {
        if (!fine.matches || reduce.matches || active || event.pointerType === "touch") return;
        active = true;
        const began = performance.now();
        function step(now) {
          if (!active || reduce.matches) { span.textContent = original; active = false; return; }
          const t = Math.min(1, (now - began) / 470);
          const fixed = Math.floor(original.length * t);
          span.textContent = [...original].map((char, i) =>
            i < fixed || /[\s.&-]/.test(char) ? char : alphabet[(i * 13 + Math.floor(now / 45)) % alphabet.length]
          ).join("");
          if (t < 1) requestAnimationFrame(step);
          else { span.textContent = original; active = false; }
        }
        requestAnimationFrame(step);
      });
      span.addEventListener("pointerleave", () => { active = false; span.textContent = original; });
    });
  }
  // Keep the original headings and line breaks, but reveal their words in sequence.
  // Text remains present and readable when JavaScript or motion is disabled.
  function prepareWords(heading) {
    let wordIndex = 0;
    function walk(node) {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const tokens = child.textContent.match(/\S+\s*|\s+/g);
          if (!tokens) return;
          const fragment = document.createDocumentFragment();
          tokens.forEach(token => {
            if (!token.trim()) { fragment.append(document.createTextNode(token)); return; }
            const word = document.createElement("span");
            word.className = "motion-word";
            word.textContent = token;
            word.style.setProperty("--word-index", String(Math.min(wordIndex++, 9)));
            fragment.append(word);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") walk(child);
      });
    }
    walk(heading);
  }
  document.querySelectorAll(".section-heading h2,.about-intro h2,.contact-title,.work-card h3").forEach(prepareWords);

  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          reveal.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((element, i) => {
    element.style.setProperty("--delay", `${(i % 3) * 35}ms`);
    reveal.observe(element);
  });

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
        canvas.height / (scene.section === hero ? 941 : 725),
        0,
        0,
      );
      return context;
    };
    let ctx = layer();
    if (scene.section === hero) {
      ribbon(
        ctx,
        "M987 -120 C976 90 977 204 1030 335 S1139 540 1191 701",
        "#05245f",
        190,
        40,
      );
      spot(ctx, 1040, 355, 195, 350, "#081750", 0.65);
      spot(ctx, 387, 460, 450, 460, "#005caf", 0.65);
      spot(ctx, 63, 500, 160, 85, "#704aab", 0.46);
      ctx = layer();
      ribbon(ctx, "M803 252 C832 302 741 359 718 407", "#d83995", 70, 20);
      ribbon(
        ctx,
        "M737 403 C654 475 762 512 843 551 S1015 663 1090 800",
        "#d83995",
        144,
        27,
      );
      ribbon(ctx, "M700 222 C920 199 816 263 800 292", "#ff54bb", 66, 13);
      ribbon(
        ctx,
        "M727 400 C671 478 768 499 841 557 S936 667 1015 699",
        "#ff65bf",
        86,
        17,
      );
      spot(ctx, 1230, 810, 420, 280, "#9654aa", 0.63);
      ribbon(ctx, "M704 491 L870 542 L965 550", "#ffd2e66b", 22, 9);
      ctx = layer();
      spot(ctx, 665, 145, 170, 290, "#bceeff", 0.44);
      spot(ctx, 1228, 116, 185, 203, "#9ee6ff", 0.59);
      spot(ctx, 1270, 460, 155, 195, "#67bcfa", 0.24);
      spot(ctx, 1531, 390, 215, 350, "#bcefff", 0.68);
      spot(ctx, 720, 741, 195, 255, "#a5daff", 0.68);
      spot(ctx, 1465, 780, 280, 240, "#b3dcff", 0.38);
      ribbon(ctx, "M1210 600 C1358 610 1505 460 1650 510", "#d9f3ff99", 62, 25);
      ribbon(
        ctx,
        "M915 589 C1093 631 1278 611 1481 698 L1634 739",
        "#efd8ef88",
        30,
        16,
      );
      ribbon(ctx, "M532 342 L557 320 L576 357", "#fcffffcc", 10, 4);
      ribbon(ctx, "M226 535 L271 521 L300 528", "#e0f7ff99", 9, 3);
    } else {
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
    // Bake refraction once; continuous motion only composites these three light layers.
    const refract = scene.refraction.getContext("2d");
    for (const light of layers) {
      refract.clearRect(0, 0, canvas.width, canvas.height);
      refract.drawImage(light, 0, 0);
      const context = light.getContext("2d");
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let column = 0; column < canvas.width; column += 2) {
        const shift =
          Math.sin(column * 1.73) * 1.5 + Math.sin(column * 0.041) * 1.5;
        context.drawImage(
          scene.refraction,
          column,
          0,
          2,
          canvas.height,
          column,
          shift,
          2,
          canvas.height,
        );
      }
    }
    return layers;
  }
  function paint(scene, seconds) {
    const { canvas, ctx } = scene;
    if (!ctx) return;
    scene.layers ||= buildLights(scene);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#0593C6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = scene.section === hero ? "#0056ff29" : "#0070ff59";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const depth =
      parseFloat(scene.section.style.getPropertyValue("--section-shift")) || 0;
    scene.layers.forEach((light, index) => {
      const direction = index === 0 ? -1 : 1;
      const target = reduce.matches ? 0 : x * (index + 1) * 12 * direction;
      light.dx =
        (light.dx || 0) + (target - (light.dx || 0)) * (0.08 + index * 0.04);
      const drift =
        Math.sin((seconds * Math.PI) / (11 + index * 3)) * (9 + index * 5);
      const swell =
        1.027 + Math.sin((seconds * Math.PI) / (19 + index * 3)) * 0.022;
      ctx.drawImage(
        light,
        (-canvas.width * (swell - 1)) / 2 + light.dx + drift,
        (-canvas.height * (swell - 1)) / 2 + (depth + y * (index - 1) * 5) / 2,
        canvas.width * swell,
        canvas.height * swell,
      );
    });
  }
  function queue() {
    if (!frameId && !document.hidden) frameId = requestAnimationFrame(tick);
  }
  function tick(time) {
    frameId = 0;
    if (document.hidden) return;
    const moving = !reduce.matches;
    const ease =
      1 - Math.exp(-7 * Math.min(0.05, (time - last) / 1000 || 0.016));
    last = time;
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    if (scrollDirty) {
      nav.classList.toggle("scrolled", scrollY > 100);
      const surface = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 32 && rect.bottom > 32;
      });
      nav.classList.toggle(
        "light-surface",
        !!surface?.matches(".about-section,.skills-section"),
      );
      visible.forEach((section) => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty(
          "--section-shift",
          moving
            ? `${Math.max(-43, Math.min(43, -rect.top * 0.04))}px`
            : "0px",
        );
        const phase = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / Math.max(rect.height, innerHeight)));
        section.style.setProperty("--scene-y", moving ? `${(-phase * 29).toFixed(2)}px` : "0px");
        if (section === hero) hero.style.setProperty("--copy-y", moving ? `${(-phase * 8).toFixed(2)}px` : "0px");
        if (section.matches(".work-section")) {
          cards.forEach(card => {
            const box = card.getBoundingClientRect();
            const cardPhase = Math.max(-1, Math.min(1, (box.top + box.height / 2 - innerHeight / 2) / Math.max(box.height, innerHeight)));
            card.style.setProperty("--card-depth", moving ? `${(-cardPhase * 9).toFixed(2)}px` : "0px");
          });
        }
      });
      scrollDirty = false;
    }
    const seconds = moving ? (time - start) / 1000 : 0;
    if (time - lastPaint > 40 || !moving) {
      scenes.forEach((scene) => {
        if (visible.has(scene.section) || !moving) paint(scene, seconds);
      });
      lastPaint = time;
    }
    if (moving) {
      visible.forEach((section) => {
        section.style.setProperty(
          "--rib",
          `${Math.sin((seconds * Math.PI * 2) / 13) * 7.5 + x * 2.5}px`,
        );
        section.style.setProperty(
          "--flow",
          `${Math.sin((seconds * Math.PI * 2) / 17) * 48}%`,
        );
        section.style.setProperty("--ribbon-sweep", `${-115 + ((seconds * 14) % 245)}%`);
      });
      if (visible.has(hero)) {
        fields.style.setProperty("--field-x", `${-x * 17}px`);
        fields.style.setProperty(
          "--field-y",
          `${-y * 10 + Math.sin(seconds * 0.72) * 7}px`,
        );
        fields.style.setProperty("--field-rotate-x", `${(y * 2.2).toFixed(2)}deg`);
        fields.style.setProperty("--field-rotate-y", `${(-x * 2.8).toFixed(2)}deg`);
      }
      if (activeCard) {
        const currentX =
          parseFloat(activeCard.style.getPropertyValue("--tilt-x")) || 0;
        const currentY =
          parseFloat(activeCard.style.getPropertyValue("--tilt-y")) || 0;
        activeCard.style.setProperty(
          "--tilt-x",
          `${currentX + (tiltX - currentX) * ease}deg`,
        );
        activeCard.style.setProperty(
          "--tilt-y",
          `${currentY + (tiltY - currentY) * ease}deg`,
        );
      }
      if (scenes.some((scene) => visible.has(scene.section)) || activeCard)
        queue();
    }
  }
  const visibility = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    scrollDirty = true;
    queue();
  });
  sections.forEach((section) => visibility.observe(section));
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!fine.matches || reduce.matches) return;
      targetX = (event.clientX / innerWidth) * 2 - 1;
      targetY = (event.clientY / innerHeight) * 2 - 1;
      queue();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    queue();
  });
  cards.forEach((card) => {
    card.addEventListener(
      "pointermove",
      (event) => {
        if (!fine.matches || reduce.matches) return;
        if (activeCard && activeCard !== card)
          activeCard.style.removeProperty("--tilt-x");
        activeCard = card;
        const r = card.getBoundingClientRect();
        const cx = (event.clientX - r.left) / r.width,
          cy = (event.clientY - r.top) / r.height;
        tiltX = (cy - 0.5) * -9;
        tiltY = (cx - 0.5) * 9;
        card.style.setProperty("--shine-x", `${cx * 100}%`);
        card.style.setProperty("--shine-y", `${cy * 100}%`);
        card.style.setProperty("--glow-angle", `${Math.atan2(cy - 0.5, cx - 0.5) * 180 / Math.PI + 100}deg`);
        queue();
      },
      { passive: true },
    );
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      activeCard = null;
    });
  });
  function motionPreference() {
    document.documentElement.classList.toggle("motion-ready", !reduce.matches);
    if (reduce.matches) {
      targetX = targetY = x = y = 0;
      activeCard = null;
      fields.style.cssText = "";
      cards.forEach((card) => {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      });
      sections.forEach((section) => {
        section.style.setProperty("--rib", "0px");
        section.style.setProperty("--flow", "0%");
      });
    }
    scrollDirty = true;
    queue();
  }
  reduce.addEventListener("change", motionPreference);
  addEventListener(
    "scroll",
    () => {
      scrollDirty = true;
      queue();
    },
    { passive: true },
  );
  addEventListener(
    "resize",
    () => {
      if (innerWidth > 600) closeMenu();
      scrollDirty = true;
      queue();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else queue();
  });
  scenes.forEach((scene) => paint(scene, 0));
  motionPreference();
})();
