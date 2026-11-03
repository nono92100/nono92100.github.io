// ---------- Réglages : à compléter ----------
const CONFIG = {
  email: "noe.bardin@efap.com",
  linkedin: "", // ex. "https://www.linkedin.com/in/noe-bardin" : le bouton reste caché tant que c'est vide
  cv: "",       // ex. "assets/CV_Noe_Bardin_Alternance_Marketing_IA.pdf"
};

// Projets du studio. "recipe" = la "recette" affichée au survol.
const PROJECTS = [
  {
    title: "Spica Life — miniatures YouTube",
    text: "Miniatures pour les chaînes YouTube de Spica Productions. Une seule mission : donner envie de cliquer.",
    media: "assets/spica-guepard.jpg",
    alt: "Miniature YouTube : un guépard à l'avant d'une voiture, une voyageuse et une mosquée sous un ciel bleu",
    hover: "assets/spica-decouverte.jpg",
    tags: ["YouTube", "Composition", "Retouche"],
    recipe: "<b>outils</b> Photoshop · Midjourney<br><b>objectif</b> taux de clic",
  },
  {
    title: "La Sauce Pop — générique animé",
    text: "Générique d'émission généré et animé par IA : personnages, décor néon, titrage.",
    video: "assets/la-sauce-pop.mp4",
    poster: "assets/la-sauce-pop.jpg",
    tags: ["IA vidéo", "Motion", "Émission"],
    recipe: "<b>outils</b> IA générative vidéo<br><b>format</b> générique 8 s",
  },
  {
    title: "Double Or — visuel de certification",
    text: "Annonce de la certification double disque d'or de « Coupé » ft. Theodort. Photo, disque d'or généré par IA, typographie.",
    media: "assets/affiche-double-or.jpg",
    alt: "Visuel « Certification Double Or — Coupé ft. Theodort » avec un disque d'or",
    portrait: true,
    tags: ["Musique", "Social", "IA image"],
    recipe: "<b>outils</b> Photoshop · IA image<br><b>format</b> post 3:4",
  },
  {
    title: "Sauce Ones — générique animé",
    text: "Deuxième générique de la série : mise en scène, expressions et titre lumineux, entièrement générés par IA.",
    video: "assets/sauce-ones.mp4",
    poster: "assets/sauce-ones.jpg",
    tags: ["IA vidéo", "Personnages", "Émission"],
    recipe: "<b>outils</b> IA générative vidéo<br><b>format</b> générique 9 s",
  },
  {
    title: "Until We Dream — affiche de film",
    text: "Affiche d'un court-métrage produit à l'EFAP : duotone électrique et typographie monumentale.",
    media: "assets/affiche-efap-dream.jpg",
    alt: "Affiche de film « Until we dream of life and life becomes a dream », portrait bleu et texte orange",
    portrait: true,
    tags: ["Affiche", "Typographie", "EFAP"],
    recipe: "<b>outils</b> Photoshop<br><b>parti pris</b> duotone bleu / orange",
  },
];

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";

// ---------- Hero : le nom émerge du bruit ----------
function diffusion() {
  const canvas = document.getElementById("diffusion");
  const ctx = canvas.getContext("2d");
  const stepEl = document.getElementById("step");
  const DURATION = 2800;
  const COLORS = ["#f2eee6", "#ff4a1f", "#3fe0ff"];
  let W, H, size, parts = [], start = performance.now(), running = true;
  const mouse = { x: -9999, y: -9999 };

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    if (!W || !H) return false; // page pas encore affichée : on réessaiera au resize
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.fillStyle = "#fff"; o.textAlign = "center"; o.textBaseline = "middle";
    if ("fontStretch" in o) o.fontStretch = "ultra-condensed";
    let fs = Math.min(H * 0.34, W * 0.4);
    o.font = `900 ${fs}px Archivo`;
    const maxW = W * 0.9;
    const wide = o.measureText("BARDIN").width;
    if (wide > maxW) { fs *= maxW / wide; o.font = `900 ${fs}px Archivo`; }
    const cy = H * 0.4;
    o.fillText("NOÉ", W / 2, cy - fs * 0.46);
    o.fillText("BARDIN", W / 2, cy + fs * 0.46);

    let gap = W < 760 ? 3 : 5;
    const data = o.getImageData(0, 0, W, H).data;
    let pts;
    do {
      pts = [];
      for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap)
          if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      if (pts.length > 9000) gap++;
    } while (pts.length > 9000);

    size = Math.max(1.5, gap * 0.72);
    parts = pts.map(([tx, ty]) => {
      const r = Math.random();
      return {
        tx, ty,
        sx: Math.random() * W, sy: Math.random() * H,
        x: 0, y: 0, ox: 0, oy: 0,
        c: r < 0.07 ? 1 : r < 0.11 ? 2 : 0,
      };
    });
  }

  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function frame(now) {
    if (!running) return;
    const t = reduce ? 1 : Math.min((now - start) / DURATION, 1);
    const e = ease(t);
    const jitter = 40 * (1 - e) * (1 - e);
    stepEl.textContent = Math.round(e * 30);

    ctx.clearRect(0, 0, W, H);

    // bruit de fond qui s'efface pendant le "débruitage"
    if (e < 1) {
      ctx.fillStyle = `rgba(242,238,230,${0.35 * (1 - e)})`;
      for (let i = 0; i < 1400 * (1 - e); i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
    }

    const groups = [[], [], []];
    for (const p of parts) {
      let x = p.sx + (p.tx - p.sx) * e + (Math.random() - 0.5) * jitter;
      let y = p.sy + (p.ty - p.sy) * e + (Math.random() - 0.5) * jitter;
      if (t === 1) {
        // le curseur repousse les particules, elles reviennent comme un ressort
        const dx = x + p.ox - mouse.x, dy = y + p.oy - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const f = (1 - d2 / 12000) * 6;
          const d = Math.sqrt(d2) || 1;
          p.ox += (dx / d) * f; p.oy += (dy / d) * f;
        }
        p.ox *= 0.9; p.oy *= 0.9;
        x += p.ox; y += p.oy;
      }
      groups[p.c].push(x, y);
    }
    groups.forEach((g, i) => {
      ctx.fillStyle = COLORS[i];
      for (let k = 0; k < g.length; k += 2) ctx.fillRect(g[k], g[k + 1], size, size);
    });
    requestAnimationFrame(frame);
  }

  canvas.parentElement.addEventListener("mousemove", ev => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ev.clientX - r.left; mouse.y = ev.clientY - r.top;
  });
  canvas.parentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

  // on arrête le rendu quand le hero n'est plus visible
  new IntersectionObserver(([entry]) => {
    const was = running;
    running = entry.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(canvas);

  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { build(); start = performance.now() - DURATION; }, 200);
  });

  build();
  start = performance.now();
  requestAnimationFrame(frame);
}

function typePrompt() {
  const el = document.getElementById("prompt-text");
  const text = "créer — un communicant qui pense en images et parle IA";
  if (reduce) { el.textContent = text; return; }
  let i = 0;
  const tick = () => { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 32); };
  setTimeout(tick, 300);
}

// ---------- Studio ----------
function renderProjects() {
  const track = document.getElementById("track");
  track.innerHTML = PROJECTS.map((p, i) => {
    const media = p.video
      ? `<video src="${p.video}" poster="${p.poster}" muted loop playsinline preload="metadata"></video>
         <button class="sound" type="button">Son off</button>`
      : `<img src="${p.media}" alt="${p.alt}" loading="lazy">` +
        (p.hover ? `<img class="alt" src="${p.hover}" alt="" loading="lazy">` : "");
    return `
      <article class="card${p.portrait ? " portrait" : ""}">
        <div class="card-media"${p.video ? ' data-cursor="son"' : ""}>
          ${media}
          <div class="recipe">${p.recipe}</div>
        </div>
        <div class="card-info">
          <span class="num">${String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3>${p.title}</h3>
            <p>${p.text}</p>
            <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
          </div>
        </div>
      </article>`;
  }).join("");

  track.querySelectorAll(".card-media").forEach(m => {
    const video = m.querySelector("video");
    if (!video) return;
    const btn = m.querySelector(".sound");
    const toggle = () => {
      video.muted = !video.muted;
      btn.textContent = video.muted ? "Son off" : "Son on";
      if (!video.muted) video.play();
    };
    m.addEventListener("click", toggle);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.4 }).observe(video);
  });
}

// ---------- Animations au scroll ----------
function scrollAnimations() {
  if (!hasGsap || reduce) {
    document.getElementById("counter").textContent = (1000000).toLocaleString("fr-FR");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a =>
      a.addEventListener("click", ev => { ev.preventDefault(); lenis.scrollTo(a.getAttribute("href")); })
    );
  }

  gsap.from(".nav", { y: -30, opacity: 0, duration: 1, delay: 0.6, ease: "power3.out" });
  gsap.from(".hero-tag, .hero-meta", { y: 20, opacity: 0, duration: 1, delay: 1.8, stagger: 0.15, ease: "power3.out" });

  // compteur + révélation circulaire de la miniature
  const counter = document.getElementById("counter");
  const n = { v: 0 };
  gsap.timeline({
    scrollTrigger: { trigger: ".chiffre", start: "top 75%", end: "center center", scrub: 1 },
  })
    .to(n, { v: 1000000, ease: "power2.out", onUpdate: () => { counter.textContent = Math.round(n.v).toLocaleString("fr-FR"); } }, 0)
    .to(".chiffre-bg", { clipPath: "circle(75% at 50% 50%)", ease: "none" }, 0)
    .to(".chiffre-bg img", { scale: 1, ease: "none" }, 0);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 761px)", () => {
    // studio horizontal
    const track = document.getElementById("track");
    const bar = document.getElementById("studio-bar");
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: ".studio", start: "top top", end: () => "+=" + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: s => { bar.style.transform = `scaleX(${s.progress})`; },
      },
    });

    // générique qui défile comme à la fin d'un film
    const gen = document.querySelector(".generique");
    const credits = document.getElementById("credits");
    gen.classList.add("rolling");
    gsap.fromTo(credits, { y: () => window.innerHeight }, {
      y: () => -credits.offsetHeight,
      ease: "none",
      scrollTrigger: {
        trigger: gen, start: "top top", end: () => "+=" + credits.offsetHeight * 1.1,
        pin: true, scrub: true, invalidateOnRefresh: true,
      },
    });
    return () => gen.classList.remove("rolling");
  });

  mm.add("(max-width: 760px)", () => {
    gsap.utils.toArray(".card, .credit-block").forEach(el =>
      gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } })
    );
  });

  gsap.from(".apport-list li", {
    y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: ".apport-list", start: "top 80%" },
  });
  // on anime .ci (sans transition CSS) pour ne pas gêner l'effet de survol de .ch
  gsap.from(".contact-title .ci", {
    yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.04, ease: "power4.out",
    scrollTrigger: { trigger: ".contact", start: "top 70%" },
  });
}

// ---------- Contact ----------
function contact() {
  const title = document.getElementById("contact-title");
  title.innerHTML = [...title.textContent].map(ch => ch === " " || ch === " " ? " " : `<span class="ch"><span class="ci">${ch}</span></span>`).join("");

  const btn = document.getElementById("mail-btn");
  const label = document.getElementById("mail-label");
  btn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(CONFIG.email); } catch (e) { /* copie impossible : on ouvre juste le mail */ }
    label.textContent = "Copié — ouverture du mail…";
    setTimeout(() => { window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Alternance — on en parle ?")}`; }, 500);
    setTimeout(() => { label.textContent = CONFIG.email; }, 2200);
  });

  const li = document.getElementById("linkedin-btn");
  if (CONFIG.linkedin) li.href = CONFIG.linkedin; else li.hidden = true;
  const cv = document.getElementById("cv-btn");
  if (CONFIG.cv) cv.href = CONFIG.cv; else cv.hidden = true;

  // boutons magnétiques
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".magnet").forEach(el => {
      el.addEventListener("mousemove", ev => {
        const r = el.getBoundingClientRect();
        const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }
}

// ---------- Curseur ----------
function cursor() {
  if (!window.matchMedia("(hover: hover)").matches) return;
  const c = document.querySelector(".cursor");
  const label = c.querySelector(".cursor-label");
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  window.addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; });
  document.addEventListener("mouseover", e => {
    const t = e.target.closest("[data-cursor]");
    c.classList.toggle("is-label", !!t);
    label.textContent = t ? t.dataset.cursor : "";
  });
  (function loop() {
    cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
    c.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
}

renderProjects();
contact();
cursor();
typePrompt();
(document.fonts ? document.fonts.load("900 100px Archivo").catch(() => {}) : Promise.resolve()).then(() => {
  try { diffusion(); } catch (e) { console.error(e); }
  scrollAnimations();
});
