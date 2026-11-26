/* ==========================================================================
   Muhammet Ali — MOBİL sürüm (sinematik scrollytelling)
   - Tema anahtarı (kalıcı)
   - Three.js: scroll ile biçim değiştiren parçacık sahnesi (sabit tuval)
   - GSAP ScrollTrigger: pinned sahneler, kelime kelime açılışlar, 3D geçişler
   Her katman bağımsızdır: GSAP veya Three.js yüklenemezse içerik yine okunur.
   ========================================================================== */

const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* --------------------------------------------------------------------------
   1) Tema
   -------------------------------------------------------------------------- */
const themeSwitch = $("#theme-switch");
const themeColor = $('meta[name="theme-color"]');

function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-theme", isLight);
    if (themeSwitch) {
        themeSwitch.checked = isLight;
        themeSwitch.setAttribute("aria-checked", String(isLight));
    }
    if (themeColor) themeColor.content = isLight ? "#f5f6f9" : "#070b16";
    window.dispatchEvent(new CustomEvent("themechange", { detail: { light: isLight } }));
}

function readTheme() {
    try { return localStorage.getItem("theme") || "dark"; } catch (e) { return "dark"; }
}

if (themeSwitch) {
    applyTheme(readTheme());
    themeSwitch.addEventListener("change", () => {
        const theme = themeSwitch.checked ? "light" : "dark";
        applyTheme(theme);
        try { localStorage.setItem("theme", theme); } catch (e) { /* özel mod */ }
    });
}

/* --------------------------------------------------------------------------
   2) Sahne ile scroll arasındaki ortak durum
      Scroll bu nesneyi sürer, Three.js her karede okur.
   -------------------------------------------------------------------------- */
const fx = { morph: 0, x: 0, y: 0, s: 1, tilt: 0, roll: 0, rot: 0, op: 1, ring: 1, zoom: 0 };

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Tuval CSS'te 100lvh; çizim tamponu da tam aynı yükseklikte olmalı, yoksa gezegen telefonda gerilip ovalleşir */
const lvhProbe = document.createElement("div");
lvhProbe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
document.body.appendChild(lvhProbe);
const lvhPx = () => lvhProbe.offsetHeight || window.innerHeight;

/* --------------------------------------------------------------------------
   3) Three.js — parçacık sahnesi
      5 biçim arasında morph: küre → düğüm → ekran → sarmal → portal
   -------------------------------------------------------------------------- */
async function initScene() {
    const canvas = $("#scene");
    if (!canvas) return;

    let THREE;
    try {
        THREE = await import("three");
    } catch (err) {
        console.warn("Three.js yüklenemedi, sahne atlandı.", err);
        return;
    }

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch (err) {
        console.warn("WebGL kullanılamıyor, sahne atlandı.", err);
        return;
    }

    const small = window.innerWidth < 700;
    const N = small ? 5200 : 11000;
    const TAU = Math.PI * 2;
    const rnd = Math.random;

    renderer.setClearColor(0x000000, 0);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    renderer.setPixelRatio(pixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const group = new THREE.Group();
    scene.add(group);

    /* --- biçimler --- */
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

    const shapeFns = [
        // 0 · küre (Fibonacci)
        (i, out) => {
            const y = 1 - (2 * (i + 0.5)) / N;
            const r = Math.sqrt(1 - y * y);
            const phi = i * 2.399963;
            const R = 1.55 * (0.97 + 0.06 * rnd());
            out[0] = Math.cos(phi) * r * R; out[1] = y * R; out[2] = Math.sin(phi) * r * R;
        },
        // 1 · (2,3) torus düğümü
        (i, out) => {
            const t = rnd() * TAU;
            const k = Math.cos(3 * t) + 2;
            const S = 0.62;
            out[0] = k * Math.cos(2 * t) * S + gauss() * 0.14;
            out[1] = k * Math.sin(2 * t) * S + gauss() * 0.14;
            out[2] = -Math.sin(3 * t) * S * 1.4 + gauss() * 0.14;
        },
        // 2 · ekran / veri duvarı
        (i, out) => {
            let x = (rnd() - 0.5) * 4.8;
            let y = (rnd() - 0.5) * 3;
            if (rnd() < 0.55) { x = Math.round(x / 0.13) * 0.13; y = Math.round(y / 0.13) * 0.13; }
            out[0] = x; out[1] = y;
            out[2] = Math.sin(x * 1.3) * 0.22 + Math.cos(y * 1.7) * 0.14 + (rnd() - 0.5) * 0.05;
        },
        // 3 · çift sarmal + basamaklar
        (i, out) => {
            const yy = (rnd() - 0.5) * 5.2;
            const ang = yy * 2.6;
            const R = 0.95;
            if (rnd() < 0.2) {
                const lv = Math.round(yy / 0.32) * 0.32;
                const a = lv * 2.6;
                const s = rnd() * 2 - 1;
                out[0] = Math.cos(a) * R * s; out[1] = lv; out[2] = Math.sin(a) * R * s;
            } else {
                const a = ang + (rnd() < 0.5 ? 0 : Math.PI);
                out[0] = Math.cos(a) * R + gauss() * 0.05; out[1] = yy; out[2] = Math.sin(a) * R + gauss() * 0.05;
            }
        },
        // 4 · portal: çekirdek + halka
        (i, out) => {
            if (rnd() < 0.36) {
                const u = rnd() * 2 - 1, a = rnd() * TAU, r = Math.sqrt(1 - u * u), R = 0.85;
                out[0] = Math.cos(a) * r * R; out[1] = u * R; out[2] = Math.sin(a) * r * R;
            } else {
                const a = rnd() * TAU;
                const r = 1.7 + Math.pow(rnd(), 2) * 1.5;
                const x = Math.cos(a) * r, z = Math.sin(a) * r, y = (rnd() - 0.5) * 0.07;
                const tl = 0.35;
                out[0] = x; out[1] = y * Math.cos(tl) - z * Math.sin(tl); out[2] = y * Math.sin(tl) + z * Math.cos(tl);
            }
        },
    ];

    const tmp = [0, 0, 0];
    const buffers = shapeFns.map((fn) => {
        const arr = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
            fn(i, tmp);
            arr[i * 3] = tmp[0]; arr[i * 3 + 1] = tmp[1]; arr[i * 3 + 2] = tmp[2];
        }
        return arr;
    });
    const randoms = new Float32Array(N * 4);
    for (let i = 0; i < randoms.length; i++) randoms[i] = rnd();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(buffers[0], 3));
    for (let k = 1; k < 5; k++) geometry.setAttribute("aS" + k, new THREE.BufferAttribute(buffers[k], 3));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(randoms, 4));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12); // frustum kırpmasını önler

    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uMorph: { value: 0 },
            uTime: { value: 0 },
            uSize: { value: 2.1 },
            uPixel: { value: pixelRatio },
            uOpacity: { value: 1 },
            uColA: { value: new THREE.Color("#78f0cf") },
            uColB: { value: new THREE.Color("#7aa7ff") },
        },
        vertexShader: /* glsl */ `
            uniform float uMorph, uTime, uSize, uPixel, uOpacity;
            attribute vec3 aS1; attribute vec3 aS2; attribute vec3 aS3; attribute vec3 aS4;
            attribute vec4 aRand;
            varying float vMix; varying float vAlpha;
            vec3 pick(int i) {
                if (i == 0) return position;
                if (i == 1) return aS1;
                if (i == 2) return aS2;
                if (i == 3) return aS3;
                return aS4;
            }
            void main() {
                float m = clamp(uMorph, 0.0, 3.9999);
                int i = int(floor(m));
                float fr = m - float(i);
                // her parçacık biraz farklı zamanda yola çıkar: akışkan geçiş
                float f = smoothstep(0.0, 1.0, clamp(fr * 1.7 - aRand.x * 0.7, 0.0, 1.0));
                vec3 p = mix(pick(i), pick(i + 1), f);
                float tr = sin(fr * 3.14159265);
                float ang = tr * (aRand.y - 0.5) * 2.4;
                float c = cos(ang), s = sin(ang);
                p.xz = mat2(c, -s, s, c) * p.xz;
                p += (vec3(aRand.z, aRand.w, aRand.y) - 0.5) * tr * 1.1;
                float t = uTime * 0.5 + aRand.x * 6.2831;
                p += vec3(sin(t + p.y * 1.7), cos(t * 1.3 + p.x * 1.3), sin(t * 0.8 + p.z * 1.5)) * 0.035;
                vec4 mv = modelViewMatrix * vec4(p, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = uSize * (0.45 + aRand.w * 0.9) * uPixel * (6.0 / -mv.z);
                vMix = clamp(p.y * 0.25 + 0.5 + (aRand.y - 0.5) * 0.5, 0.0, 1.0);
                vAlpha = uOpacity * (0.35 + 0.65 * aRand.z);
            }
        `,
        fragmentShader: /* glsl */ `
            uniform vec3 uColA; uniform vec3 uColB;
            varying float vMix; varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - 0.5);
                float a = pow(smoothstep(0.5, 0.0, d), 1.6);
                gl_FragColor = vec4(mix(uColA, uColB, vMix), a * vAlpha);
            }
        `,
    });

    const points = new THREE.Points(geometry, material);
    group.add(points);

    /* --- yörünge halkaları (orijinal tasarımdaki iki halkanın 3D karşılığı) --- */
    const ringMat = new THREE.LineBasicMaterial({ color: 0x78f0cf, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
    const makeRing = (rx, ry, rotZ, rotX) => {
        const pts = [];
        for (let i = 0; i < 160; i++) {
            const a = (i / 160) * TAU;
            pts.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0));
        }
        const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
        line.rotation.set(rotX, 0, rotZ);
        return line;
    };
    const ringA = makeRing(3.0, 1.55, -0.42, 0.5);
    const ringB = makeRing(2.7, 1.95, 0.74, -0.3);
    group.add(ringA, ringB);

    /* --- tema --- */
    function setSceneTheme(light) {
        material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        material.uniforms.uColA.value.set(light ? "#087f68" : "#78f0cf");
        material.uniforms.uColB.value.set(light ? "#2f5fd0" : "#7aa7ff");
        material.uniforms.uSize.value = light ? 2.4 : 2.1;
        ringMat.color.set(light ? "#087f68" : "#78f0cf");
        ringMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        ringMat.opacity = light ? 0.3 : 0.22;
        material.needsUpdate = true;
        ringMat.needsUpdate = true;
        sceneState.lightMul = light ? 0.85 : 1;
        if (!animating) draw();
    }

    /* --- boyut --- */
    function resize() {
        const w = window.innerWidth, h = lvhPx();
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const a = w / h;
        camera.position.z = a < 1 ? 6.6 / Math.max(a, 0.42) * 0.72 : 6.6;
        camera.updateProjectionMatrix();
        if (!animating) draw();
    }

    /* --- döngü --- */
    const sceneState = { lightMul: 1, px: 0, py: 0, tx: 0, ty: 0 };
    let animating = false;
    let raf = 0;
    const clock = new THREE.Clock();

    window.addEventListener("pointermove", (e) => {
        sceneState.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        sceneState.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function draw() {
        const t = clock.getElapsedTime();
        sceneState.px += (sceneState.tx - sceneState.px) * 0.05;
        sceneState.py += (sceneState.ty - sceneState.py) * 0.05;

        const scale = fx.s * (1 + fx.zoom * 1.8);
        group.scale.setScalar(scale);
        group.position.set(fx.x, fx.y, 0);
        group.rotation.set(fx.tilt + sceneState.py * 0.14, fx.rot + t * 0.07 + sceneState.px * 0.22, fx.roll);

        material.uniforms.uMorph.value = fx.morph;
        material.uniforms.uTime.value = t;
        material.uniforms.uOpacity.value = clamp(fx.op * (1 - fx.zoom * 0.75), 0, 1) * sceneState.lightMul;

        const ringVis = clamp(fx.ring * (1 - fx.zoom), 0, 1);
        ringA.visible = ringB.visible = ringVis > 0.02;
        ringA.rotation.y = t * 0.12; ringB.rotation.y = -t * 0.09;
        ringA.scale.setScalar(0.4 + ringVis * 0.6);
        ringB.scale.setScalar(0.4 + ringVis * 0.6);
        ringMat.opacity = (sceneState.lightMul < 1 ? 0.3 : 0.22) * ringVis;

        renderer.render(scene, camera);
    }

    function loop() {
        if (!animating) return;
        draw();
        raf = requestAnimationFrame(loop);
    }

    function start() {
        if (animating || reducedMotion.matches || document.hidden) return;
        animating = true;
        raf = requestAnimationFrame(loop);
    }
    function stop() {
        animating = false;
        cancelAnimationFrame(raf);
    }

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    let lw = 0, lh = 0;
    window.addEventListener("resize", () => { // adres çubuğu açılıp kapanırken yeniden boyutlandırma yapma
        const w = window.innerWidth, h = lvhPx();
        if (Math.abs(w - lw) > 1 || Math.abs(h - lh) > 160) { lw = w; lh = h; resize(); }
    });
    window.addEventListener("themechange", (e) => setSceneTheme(e.detail.light));
    reducedMotion.addEventListener?.("change", () => { stop(); start(); draw(); });

    setSceneTheme(document.body.classList.contains("light-theme"));
    resize();
    start();
    draw();
    root.classList.add("has-webgl");
}

/* --------------------------------------------------------------------------
   4) Yardımcılar: kelime bölme
   -------------------------------------------------------------------------- */
function splitWords(el) {
    if (!el) return [];
    if (el.dataset.split) return $$(".wi", el);
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const walk = (node) => {
        [...node.childNodes].forEach((n) => {
            if (n.nodeType === 3) {
                const frag = document.createDocumentFragment();
                n.textContent.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(" "));
                    } else {
                        const w = document.createElement("span");
                        w.className = "w";
                        w.setAttribute("aria-hidden", "true");
                        const i = document.createElement("span");
                        i.className = "wi";
                        i.textContent = part;
                        w.appendChild(i);
                        frag.appendChild(w);
                    }
                });
                n.replaceWith(frag);
            } else if (n.nodeType === 1 && n.tagName !== "BR") {
                walk(n);
            }
        });
    };
    walk(el);
    el.dataset.split = "1";
    return $$(".wi", el);
}

/* --------------------------------------------------------------------------
   MOBİL · Menü
   -------------------------------------------------------------------------- */
const page = document.body.dataset.page;

function initMenu() {
    const btn = $(".burger");
    if (!btn) return;
    const set = (open) => {
        root.classList.toggle("menu-lock", open);
        document.body.classList.toggle("menu-open", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    };
    btn.addEventListener("click", () => set(!document.body.classList.contains("menu-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    $$(".sheet a").forEach((a) => a.addEventListener("click", (e) => {
        const u = new URL(a.href, location.href);
        const target = u.pathname === location.pathname && u.hash ? document.getElementById(u.hash.slice(1)) : null;
        set(false);
        if (!target) return;
        e.preventDefault();
        history.replaceState(null, "", u.hash);
        requestAnimationFrame(() => target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" }));
    }));
    // telefon yan çevrilip ekran genişlerse masaüstü tasarıma geç
    const wide = matchMedia("(min-width: 861px)");
    wide.addEventListener?.("change", (e) => { if (e.matches) location.replace(document.body.dataset.desktop + location.hash); });
}

/* --------------------------------------------------------------------------
   MOBİL · Kaydırma sahneleri (GSAP'siz): sticky giriş, 3B kart geçişleri,
   kelime kelime açılış, parçacık sahnesinin scroll ile biçim değiştirmesi
   -------------------------------------------------------------------------- */
const KEYS = ["morph", "x", "y", "s", "tilt", "roll", "op", "ring"];
const KF = {
    top: { morph: 0, x: 0, y: 0, s: 1, tilt: 0, roll: 0, op: 1, ring: 1 },
    hakkimda: { morph: 0, x: 0, y: 0, s: 1.05, tilt: 0.2, roll: 0, op: 0.55, ring: 0.5 },
    projeler: { morph: 0, x: 0, y: 0, s: 1.15, tilt: -0.15, roll: 0, op: 0.3, ring: 0.2 },
    teknolojiler: { morph: 0, x: 0, y: 0, s: 1.05, tilt: 0, roll: 0, op: 0.5, ring: 0.3 },
    iletisim: { morph: 0, x: 0, y: -0.1, s: 1.1, tilt: 0.5, roll: -0.2, op: 0.9, ring: 1 },
};
const IDS = Object.keys(KF);
const mix = (a, b, t) => Object.fromEntries(KEYS.map((k) => [k, a[k] + (b[k] - a[k]) * t]));
const out2 = (t) => 1 - (1 - t) * (1 - t);

function initMobile() {
    if (!("IntersectionObserver" in window)) return;
    const home = page === "home";
    const bar = $(".progress i");
    const header = $(".bar");

    /* sahne başlangıcı */
    if (home) Object.assign(fx, KF.top, { zoom: 0, rot: 0 });
    else Object.assign(fx, { morph: 0, x: 0, y: 0, s: 1.1, tilt: 0.1, roll: 0, op: 0.5, ring: 0.5, zoom: 0, rot: 0 });
    const tgt = { ...fx };

    /* kelime bölme */
    const heads = $$(".hero h1, h2.big, .featured-copy h3, .project-entry h2, .projects-hero h1");
    const techIntro = $("#teknolojiler .intro");
    [...heads, techIntro].filter(Boolean).forEach((h) => splitWords(h).forEach((w, i) => w.style.setProperty("--i", i)));

    /* açılış hedefleri */
    const heroItems = $$(".hero-copy .eyebrow, .hero-lead, .hero-note, .hero-actions, .hero-meta");
    heroItems.forEach((el, i) => { el.setAttribute("data-rv", ""); el.style.setProperty("--i", i + 3); });
    $$(".eyebrow.kicker, .intro, .topline .link, .info-card, .featured, .skill-group, .contact-links a, .project-count, .project-entry, .projects-back, .site-footer, .projects-hero .eyebrow, .projects-lead")
        .forEach((el, i) => { el.setAttribute("data-rv", ""); if (el.matches(".contact-links a")) el.style.setProperty("--i", i % 2); });
    $(".projects-lead")?.style.setProperty("--i", 5);
    $$(".tags, .currency-window").forEach((g) => $$("span, .currency-row", g).forEach((s, i) => s.style.setProperty("--j", i)));

    const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    const watch = [...$$("[data-rv]"), ...heads, techIntro].filter((el) => el && !el.closest(".hero"));

    /* scroll durumu */
    const hero = $(".hero");
    const copy = $(".hero-copy");
    const card = $(".hero-card");
    const chips = $$(".floating-chip");
    const hbottom = $(".hero-bottom");
    const secs = IDS.slice(1).map((id) => document.getElementById(id));
    const about = secs[0];
    const cards = $$(".info-card");
    const words = techIntro ? $$(".wi", techIntro) : [];
    const projHero = $(".projects-hero");
    const projHead = $(".projects-header");
    const menuLinks = $$(".sheet a");

    function update() {
        const y = window.scrollY, H = window.innerHeight;
        const max = Math.max(1, document.documentElement.scrollHeight - H);
        const prog = clamp(y / max, 0, 1);
        if (bar) bar.style.transform = `scaleX(${prog})`;
        header?.classList.toggle("solid", y > 24);
        tgt.rot = prog * Math.PI * 2.2;

        if (home) {
            /* parçacık sahnesi: bölüm girdikçe bir sonraki biçime geçer */
            let st = KF.top;
            secs.forEach((el, i) => {
                const pr = clamp((H - el.getBoundingClientRect().top) / H, 0, 1);
                if (pr > 0) st = mix(KF[IDS[i]], KF[IDS[i + 1]], pr);
            });
            KEYS.forEach((k) => { tgt[k] = st[k]; });

            /* giriş sahnesi (sticky): metin dağılır → MA kartı 3B döner → üstümüze uçar */
            const hr = hero.getBoundingClientRect();
            const p = clamp(-hr.top / Math.max(1, hr.height - H), 0, 1);
            const c = clamp(p / 0.35, 0, 1);
            copy.style.opacity = String(1 - c);
            copy.style.transform = `translate3d(0,${-c * 6}%,0) scale(${1 + c * 0.12})`;
            copy.style.pointerEvents = c > 0.5 ? "none" : "";
            hbottom.style.opacity = String(1 - clamp(p / 0.1, 0, 1));
            const a = out2(clamp((p - 0.32) / 0.3, 0, 1));
            const o = clamp((p - 0.8) / 0.2, 0, 1);
            card.style.opacity = String(a * (1 - o));
            card.style.transform = `perspective(900px) translate3d(0,${(1 - a) * 12}%,0) rotateY(${-85 * (1 - a)}deg) scale(${(0.55 + 0.45 * a) * (1 + 0.8 * o)})`;
            chips.forEach((ch, i) => {
                const t = out2(clamp((p - 0.56 - i * 0.06) / 0.12, 0, 1));
                ch.style.opacity = String(t);
                ch.style.translate = `0 ${(1 - t) * 28}px`;
                ch.style.scale = String(0.8 + 0.2 * t);
            });
            const ap = clamp((H - about.getBoundingClientRect().top) / H, 0, 1);
            tgt.zoom = ap > 0 ? 1 - ap : p < 0.35 ? 0.55 * (p / 0.35) : p < 0.7 ? 0.55 : 0.55 + 0.45 * ((p - 0.7) / 0.3);

            /* kart destesi: üstüne yenisi gelen kart küçülür */
            cards.forEach((cd, i) => {
                const nx = cards[i + 1];
                if (!nx || !cd.classList.contains("in")) return;
                const d = clamp(1 - (nx.getBoundingClientRect().top - cd.getBoundingClientRect().top) / (cd.offsetHeight * 0.9), 0, 1);
                cd.style.transform = d > 0.001 ? `scale(${1 - 0.06 * d})` : "";
            });

            /* araç kutusu: cümle kelime kelime aydınlanır */
            if (words.length) {
                const r = techIntro.getBoundingClientRect();
                const q = clamp((H * 0.85 - r.top) / (H * 0.35 + r.height), 0, 1);
                words.forEach((w, i) => { w.style.opacity = String(0.14 + 0.86 * clamp(q * words.length * 1.15 - i, 0, 1)); });
            }

            /* menüde aktif bölüm */
            let cur = "";
            IDS.slice(1).forEach((id, i) => { if (secs[i].getBoundingClientRect().top < H * 0.4) cur = id; });
            menuLinks.forEach((l) => l.classList.toggle("on", l.dataset.s === cur));
        } else {
            const q = clamp(y / Math.max(1, projHead.offsetHeight * 0.7), 0, 1);
            projHero.style.opacity = String(1 - q);
            projHero.style.transform = `translate3d(0,${-q * 14}%,0)`;
        }
    }

    let ticking = false;
    const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);

    /* sahne değerleri kaydırmayı yumuşakça takip eder */
    (function ease() {
        for (const k in tgt) fx[k] += (tgt[k] - fx[k]) * 0.1;
        requestAnimationFrame(ease);
    })();

    update();
    root.classList.add("m-anim"); // gizli başlangıç durumları en sonda: hata olursa içerik görünür kalır
    watch.forEach((el) => io.observe(el));
    setTimeout(() => {
        $(".hero h1")?.classList.add("in");
        heroItems.forEach((el) => el.classList.add("in"));
    }, 250);
}

/* --------------------------------------------------------------------------
   Başlat
   -------------------------------------------------------------------------- */
function boot() {
    initMenu();
    try {
        if (!reducedMotion.matches) initMobile();
    } catch (err) {
        console.error("Mobil sahneler başlatılamadı:", err);
        root.classList.remove("m-anim");
    } finally {
        root.classList.add("ready");
    }
    initScene().catch((err) => console.warn("Sahne başlatılamadı:", err));
}

boot();
