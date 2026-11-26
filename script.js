/* ==========================================================================
   Muhammet Ali — sinematik scrollytelling
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
    let lastW = 0, lastH = 0;
    function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        // mobil adres çubuğu kaydırırken yüksekliği oynatır: küçük değişimlerde yeniden boyutlandırma
        if (lastW && w === lastW && Math.abs(h - lastH) < 140) return;
        lastW = w; lastH = h;
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
    window.addEventListener("resize", resize);
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
   5) GSAP ScrollTrigger
   -------------------------------------------------------------------------- */
function initScroll() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
        console.warn("GSAP yüklenemedi; animasyonsuz (statik) sürüm gösteriliyor.");
        return false;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const page = document.body.dataset.page;
    const header = $(".site-header");
    const bar = $(".progress i");
    const railLinks = $$(".rail a");
    const navLinks = $$(".nav-links > a");

    /* --- bölüm başlangıçları (pin'e duyarlı) --- */
    const sectionIds = page === "home" ? ["top", "hakkimda", "projeler", "teknolojiler", "iletisim"] : [];
    let starts = [];

    const targetY = (id, forLanding = false) => {
        if (id === "top") return 0;
        const el = document.getElementById(id);
        if (!el) return null;
        const pinned = ScrollTrigger.getAll().find((t) => t.pin === el);
        // pinli sahnelerde başlangıçta içerik henüz gelmemiştir: animasyon neredeyse bittiği noktaya in
        if (pinned) return pinned.start + (pinned.end - pinned.start) * (forLanding ? 0.9 : 0);
        return el.getBoundingClientRect().top + window.scrollY;
    };

    const computeStarts = () => { starts = sectionIds.map(targetY); };
    ScrollTrigger.addEventListener("refresh", computeStarts);

    function setActive(i) {
        railLinks.forEach((a, k) => a.classList.toggle("is-active", k === i));
        navLinks.forEach((a) => {
            const id = (a.getAttribute("href") || "").split("#")[1];
            a.classList.toggle("is-active", sectionIds[i] === id && id !== "top");
        });
    }

    /* --- genel: ilerleme çubuğu, nav, aktif bölüm --- */
    ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate(self) {
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
            header?.classList.toggle("is-solid", window.scrollY > 24);
            if (starts.length) {
                const probe = window.scrollY + window.innerHeight * 0.4;
                let idx = 0;
                starts.forEach((s, k) => { if (s !== null && s <= probe) idx = k; });
                setActive(idx);
            }
        },
    });

    /* --- bağlantılar: pin'li bölümlere doğru konuma kaydır --- */
    function goTo(id, smooth = true) {
        const y = targetY(id, true);
        if (y === null) return false;
        window.scrollTo({ top: y, behavior: smooth && !reducedMotion.matches ? "smooth" : "auto" });
        return true;
    }

    document.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
        if (goTo(url.hash.slice(1))) {
            e.preventDefault();
            history.replaceState(null, "", url.hash);
        }
    });

    /* --- hareket varsa: sahneler --- */
    const mm = gsap.matchMedia();
    mm.add(
        {
            desktop: "(min-width: 861px) and (prefers-reduced-motion: no-preference)",
            mobile: "(max-width: 860px) and (prefers-reduced-motion: no-preference)",
            reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
            const { desktop, mobile } = ctx.conditions;
            if (!desktop && !mobile) return; // reduced-motion: statik, eksiksiz içerik

            root.classList.add("is-scrolly");
            if (desktop) root.classList.add("is-pinned");

            if (page === "home") buildHome(gsap, desktop);
            else buildProjects(gsap);

            return () => root.classList.remove("is-scrolly", "is-pinned");
        }
    );

    // font yüklenince ölçüler değişir; ayrıca <details> açılınca sayfa boyu değişir
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
        if (location.hash) goTo(location.hash.slice(1), false);
    });
    let tT;
    document.addEventListener("toggle", () => { clearTimeout(tT); tT = setTimeout(() => ScrollTrigger.refresh(), 120); }, true);

    return true;
}

/* ===== Ana sayfa sahneleri ===== */
function buildHome(gsap, desktop) {
    const pinEnd = (pct) => (desktop ? `+=${pct}%` : `+=${Math.round(pct * 0.8)}%`);

    /* --- 3D sahne anahtar kareleri (bölüm girişinde geçiş) --- */
    const KF = {
        top: { morph: 0, x: 0, y: 0, s: 1, tilt: 0, roll: 0, op: 1, ring: 1 },
        hakkimda: { morph: 1, x: 0, y: 0, s: 1.05, tilt: 0.2, roll: 0, op: 0.55, ring: 0.5 },
        projeler: { morph: 2, x: 0, y: 0, s: 1.15, tilt: -0.15, roll: 0, op: 0.3, ring: 0.2 },
        teknolojiler: { morph: 3, x: 0, y: 0, s: 1.05, tilt: 0, roll: 0, op: 0.5, ring: 0.3 },
        iletisim: { morph: 4, x: 0, y: -0.1, s: 1.1, tilt: 0.5, roll: -0.2, op: 0.9, ring: 1 },
    };
    const ids = Object.keys(KF);
    Object.assign(fx, KF.top, { zoom: 0, rot: 0 });

    for (let i = 1; i < ids.length; i++) {
        gsap.fromTo(fx, { ...KF[ids[i - 1]] }, {
            ...KF[ids[i]],
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: "#" + ids[i], start: "top bottom", end: "top top", scrub: 0.8 },
        });
    }
    // sayfa boyunca yavaş dönüş
    gsap.to(fx, { rot: Math.PI * 2.2, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1 } });

    /* ---------- 01 · Giriş ---------- */
    {
        const hero = $("#top");
        const copy = $(".hero-copy", hero);
        const card = $(".hero-card", hero);
        const chips = $$(".floating-chip", hero);
        const bottom = $(".hero-bottom", hero);
        const words = splitWords($("h1", hero));

        // açılış (yükleme anında oynar)
        gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } })
            .from($(".eyebrow", copy), { y: 24, autoAlpha: 0, duration: 0.9 }, 0)
            .from(words, { yPercent: 118, rotate: 4, stagger: 0.09, duration: 1.2, ease: "expo.out" }, 0.1)
            .from([$(".hero-lead", copy), $(".hero-note", copy)], { y: 28, autoAlpha: 0, stagger: 0.12, duration: 1 }, 0.55)
            .from($(".hero-actions", copy), { y: 28, autoAlpha: 0, duration: 1 }, 0.8)
            .from($(".hero-meta", copy), { y: 20, autoAlpha: 0, duration: 1 }, 0.95)
            .from(bottom, { y: 20, duration: 1 }, 1);

        // scroll: metin dağılır, MA kartı 3B dönerek gelir, sonra üstümüze uçar
        const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: "top top", end: pinEnd(260), pin: true, scrub: 0.7, anticipatePin: 1 },
        });
        tl.to(copy, { yPercent: -10, scale: 1.14, autoAlpha: 0, filter: "blur(14px)", duration: 1.1 }, 0.1)
            .to(bottom, { autoAlpha: 0, duration: 0.3 }, 0)
            .to(fx, { zoom: 0.55, duration: 1.2 }, 0)
            .fromTo(card, { autoAlpha: 0, rotateY: -85, scale: 0.55, yPercent: 14 },
                { autoAlpha: 1, rotateY: 0, scale: 1, yPercent: 0, duration: 1.1, ease: "power2.out" }, 0.95)
            .fromTo(chips, { autoAlpha: 0, y: 36, scale: 0.8 },
                { autoAlpha: 1, y: 0, scale: 1, stagger: 0.18, duration: 0.5, ease: "back.out(1.6)" }, 1.55)
            .to({}, { duration: 0.5 })
            .to(card, { scale: 1.9, autoAlpha: 0, rotateY: 35, yPercent: -12, duration: 0.95, ease: "power2.in" }, 2.45)
            .to(fx, { zoom: 1, duration: 0.95 }, 2.4);
    }

    // (hero zaman çizelgesinden SONRA oluşturulmalı: sayfa ortada yenilenince sıra önemli)
    // hero'dan çıkışta "içinden geçme" yakınlaşması geri sarılır
    gsap.fromTo(fx, { zoom: 1 }, {
        zoom: 0, ease: "none", immediateRender: false,
        scrollTrigger: { trigger: "#hakkimda", start: "top bottom", end: "top top", scrub: 0.8 },
    });

    /* ---------- 02 · Hakkımda ---------- */
    {
        const sec = $("#hakkimda");
        const head = $(".section-heading", sec);
        const kicker = $(".section-kicker", head);
        const intro = $(".section-intro", head);
        const words = splitWords($("h2", head));
        const cards = $$(".info-card", sec);

        if (desktop) {
            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: sec, start: "top top", end: pinEnd(300), pin: true, scrub: 0.7, anticipatePin: 1 },
            });
            tl.from(kicker, { autoAlpha: 0, y: 20, duration: 0.3 }, 0)
                .from(words, { yPercent: 115, stagger: 0.05, duration: 0.55, ease: "power3.out" }, 0.05)
                .from(intro, { autoAlpha: 0, y: 20, duration: 0.4 }, 0.4);
            cards.forEach((c, i) => {
                const at = 0.45 + i * 1.1;
                tl.fromTo(c, { yPercent: i ? 120 : 70, rotateX: -40, scale: 0.92, autoAlpha: 0 },
                    { yPercent: 0, rotateX: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "power2.out" }, at);
                for (let j = 0; j < i; j++) {
                    const d = i - j;
                    tl.to(cards[j], { yPercent: -9 * d, scale: 1 - 0.055 * d, autoAlpha: Math.max(0, 1 - 0.4 * d), duration: 0.9 }, at);
                }
            });
            tl.to({}, { duration: 0.5 });
        } else {
            gsap.from([kicker, intro], { y: 24, autoAlpha: 0, stagger: 0.15, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: head, start: "top 85%" } });
            gsap.from(words, { yPercent: 115, stagger: 0.05, duration: 1, ease: "expo.out", scrollTrigger: { trigger: head, start: "top 82%" } });
            cards.forEach((c) => gsap.from(c, {
                y: 70, rotateX: -18, scale: 0.96, autoAlpha: 0, duration: 1, ease: "power3.out", transformPerspective: 900,
                scrollTrigger: { trigger: c, start: "top 90%" },
            }));
        }
    }

    /* ---------- 03 · Projeler ---------- */
    {
        const sec = $("#projeler");
        const kicker = $(".section-kicker", sec);
        const words = splitWords($(".section-topline h2", sec));
        const link = $(".section-topline .text-link", sec);
        const visual = $(".project-visual", sec);
        const win = $(".currency-window", sec);
        const rows = $$(".currency-row", sec);
        const api = $(".api-tag", sec);
        const orbit = $(".visual-orbit", sec);
        const h3words = splitWords($(".featured-copy h3", sec));
        const tags = $$(".featured-copy .tag-list span", sec);

        if (desktop) {
            const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: { trigger: sec, start: "top top", end: pinEnd(280), pin: true, scrub: 0.7, anticipatePin: 1 },
            });
            tl.from(kicker, { autoAlpha: 0, y: 20, duration: 0.3 }, 0)
                .from(words, { yPercent: 115, stagger: 0.07, duration: 0.55, ease: "power3.out" }, 0.05)
                .from(link, { autoAlpha: 0, x: 20, duration: 0.4 }, 0.4)
                .from(visual, { autoAlpha: 0, scale: 0.88, yPercent: 10, duration: 0.8, ease: "power2.out" }, 0.25)
                .from(orbit, { scale: 0.4, autoAlpha: 0, duration: 1.2, ease: "power2.out" }, 0.45)
                .fromTo(win, { yPercent: 70, rotateX: 62, rotateZ: -12, scale: 0.8, autoAlpha: 0, transformPerspective: 900 },
                    { yPercent: 0, rotateX: 10, rotateZ: -4, scale: 1, autoAlpha: 1, transformPerspective: 900, duration: 1.1, ease: "power3.out" }, 0.45)
                .from(rows, { x: -44, autoAlpha: 0, stagger: 0.18, duration: 0.45, ease: "power2.out" }, 1.25)
                .from(api, { autoAlpha: 0, y: 12, duration: 0.35 }, 1.85)
                .to(win, { rotateY: 14, rotateX: 4, rotateZ: -2, duration: 1.8 }, 1.3)
                .to(orbit, { rotate: -12, duration: 1.8 }, 1.3)
                .from(h3words, { yPercent: 115, stagger: 0.07, duration: 0.5, ease: "power3.out" }, 1.9)
                .from($(".featured-copy .project-type", sec), { autoAlpha: 0, y: 24, duration: 0.4 }, 1.85)
                .from(tags, { scale: 0.6, autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.35, ease: "back.out(2)" }, 2.3)
                .from($(".project-links", sec), { autoAlpha: 0, y: 24, duration: 0.45 }, 2.75)
                .to({}, { duration: 0.6 });
        } else {
            gsap.from([kicker, link], { y: 24, autoAlpha: 0, stagger: 0.15, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: kicker, start: "top 88%" } });
            gsap.from(words, { yPercent: 115, stagger: 0.07, duration: 1, ease: "expo.out", scrollTrigger: { trigger: kicker, start: "top 85%" } });
            gsap.fromTo(win, { rotateX: 50, rotateZ: -8, y: 60, autoAlpha: 0, transformPerspective: 800 },
                { rotateX: 8, rotateZ: -3, y: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: visual, start: "top 90%", end: "center 55%", scrub: 0.6 } });
            gsap.from(rows, { x: -30, autoAlpha: 0, stagger: 0.14, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: visual, start: "top 55%" } });
            gsap.from(h3words, { yPercent: 115, stagger: 0.07, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".featured-copy", start: "top 85%" } });
            gsap.from([$(".featured-copy .project-type", sec), ...tags, $(".project-links", sec)], {
                y: 22, autoAlpha: 0, stagger: 0.05, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".featured-copy", start: "top 78%" },
            });
        }
    }

    /* ---------- 04 · Teknolojiler ---------- */
    {
        const sec = $("#teknolojiler");
        const h2 = $("h2", sec);
        const introEl = $(".section-intro", sec);
        const words = splitWords(h2);
        const introWords = splitWords(introEl);

        gsap.from($(".section-kicker", sec), { autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: h2, start: "top 88%" } });
        gsap.from(words, { yPercent: 115, stagger: 0.06, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: h2, start: "top 85%" } });
        // Apple tarzı: cümle scroll ile kelime kelime aydınlanır
        gsap.fromTo(introWords, { opacity: 0.14 }, {
            opacity: 1, stagger: 0.06, ease: "none",
            scrollTrigger: { trigger: introEl, start: "top 85%", end: "bottom 50%", scrub: true },
        });

        $$(".skill-group", sec).forEach((g, i) => {
            const tl = gsap.timeline({ scrollTrigger: { trigger: g, start: "top 88%", toggleActions: "play none none reverse" } });
            tl.from(g, { y: 100, rotateX: 22, autoAlpha: 0, transformPerspective: 900, duration: 1.1, ease: "power3.out", delay: desktop ? i * 0.06 : 0 })
                .from($$(".tag-list span", g), { scale: 0.5, autoAlpha: 0, y: 14, stagger: 0.06, duration: 0.5, ease: "back.out(2)" }, 0.35);
            gsap.fromTo($(".skill-number", g), { yPercent: 35 }, {
                yPercent: -35, ease: "none",
                scrollTrigger: { trigger: g, start: "top bottom", end: "bottom top", scrub: true },
            });
        });
    }

    /* ---------- 05 · İletişim ---------- */
    {
        const sec = $("#iletisim");
        const h2 = $("h2", sec);
        const words = splitWords(h2);
        gsap.from($(".section-kicker", sec), { autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 65%" } });
        gsap.from(words, { yPercent: 118, stagger: 0.07, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: sec, start: "top 62%" } });
        gsap.fromTo(h2, { scale: 0.9, transformOrigin: "0% 50%" }, {
            scale: 1, ease: "none",
            scrollTrigger: { trigger: sec, start: "top bottom", end: "top 25%", scrub: true },
        });
        gsap.from($$(".contact-links a", sec), {
            y: 36, autoAlpha: 0, stagger: 0.14, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: $(".contact-links", sec), start: "top 90%" },
        });
        gsap.from(".site-footer", { autoAlpha: 0, y: 20, duration: 0.8, scrollTrigger: { trigger: ".site-footer", start: "top 100%" } });
    }
}

/* ===== Projeler sayfası sahneleri ===== */
function buildProjects(gsap) {
    const ScrollTrigger = window.ScrollTrigger;
    Object.assign(fx, { morph: 1, x: 0, y: 0, s: 1.1, tilt: 0.1, roll: 0, op: 0.5, ring: 0.5, zoom: 0, rot: 0 });
    gsap.to(fx, { morph: 3, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1 } });
    gsap.to(fx, { rot: Math.PI * 1.6, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1 } });

    /* --- açılış --- */
    const hero = $(".projects-hero");
    const words = splitWords($("h1", hero));
    gsap.timeline({ delay: 0.15, defaults: { ease: "power3.out" } })
        .from($(".eyebrow", hero), { y: 24, autoAlpha: 0, duration: 0.9 }, 0)
        .from(words, { yPercent: 118, rotate: 4, stagger: 0.09, duration: 1.2, ease: "expo.out" }, 0.1)
        .from($(".projects-lead", hero), { y: 28, autoAlpha: 0, duration: 1 }, 0.6);

    // scroll: başlık hafifçe dağılır (elle hesaplanır; refresh / <details> açılınca durum bozulmaz)
    const headerEl = $(".projects-header");
    const fade = (self) => {
        const p = clamp(self.progress, 0, 1);
        hero.style.opacity = String(1 - p);
        hero.style.transform = `translate3d(0, ${-p * 14}%, 0)`;
        hero.style.filter = p > 0.01 ? `blur(${p * 12}px)` : "";
    };
    ScrollTrigger.create({ trigger: headerEl, start: "top top", end: "bottom 20%", onUpdate: fade, onRefresh: fade });

    /* --- proje kartları --- */
    gsap.from(".project-count", { autoAlpha: 0, y: 20, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".project-count", start: "top 92%" } });

    $$(".project-entry").forEach((entry) => {
        const titleWords = splitWords($("h2", entry));
        const tl = gsap.timeline({ scrollTrigger: { trigger: entry, start: "top 82%", toggleActions: "play none none reverse" } });
        tl.from(entry, { y: 110, rotateX: 14, scale: 0.95, autoAlpha: 0, transformPerspective: 1100, duration: 1.2, ease: "power3.out" })
            .from(titleWords, { yPercent: 115, stagger: 0.05, duration: 0.9, ease: "expo.out" }, 0.25)
            .from($$(".tag-list span", entry), { scale: 0.6, autoAlpha: 0, stagger: 0.04, duration: 0.45, ease: "back.out(2)" }, 0.55)
            .from($$(".project-entry-actions > *, .project-details", entry), { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" }, 0.7);
        gsap.fromTo($(".project-entry-number", entry), { y: 20 }, {
            y: -20, ease: "none",
            scrollTrigger: { trigger: entry, start: "top bottom", end: "bottom top", scrub: true },
        });
    });

    gsap.from([".projects-back", ".site-footer"], { autoAlpha: 0, y: 20, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: ".projects-back", start: "top 100%" } });
}

/* --------------------------------------------------------------------------
   6) Başlat
   -------------------------------------------------------------------------- */
function boot() {
    try {
        initScroll();
    } catch (err) {
        console.error("Scroll animasyonları başlatılamadı:", err);
    } finally {
        root.classList.add("ready");
    }
    initScene().catch((err) => console.warn("Sahne başlatılamadı:", err));
}

boot();
