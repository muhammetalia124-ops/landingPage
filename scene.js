/* ==========================================================================
   scene.js — Three.js arka plan sahnesi
   Tek bir parçacık sistemi, scroll'a bağlı olarak 5 farklı biçim arasında
   dönüşür:  0 küre · 1 düğüm (torus knot) · 2 katmanlar · 3 galaksi · 4 "MA"
   Sayfadaki [data-scene="n"] öğeleri hangi biçimin ne zaman gösterileceğini
   belirler. GSAP'tan bağımsızdır; yüklenemezse sayfa yine de çalışır.
   ========================================================================== */
import * as THREE from "three";

const html = document.documentElement;
const canvas = document.getElementById("scene");

if (canvas) {
    start().catch((err) => {
        console.warn("[scene] 3D sahne başlatılamadı:", err);
        html.classList.add("no-webgl");
    });
}

async function start() {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = () => innerWidth <= 760;
    let small = isSmall();

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const group = new THREE.Group();
    scene.add(group);

    /* ---------- Parçacık biçimleri ---------- */
    const COUNT = small ? 5200 : 11000;

    const rng = mulberry32(20261127);
    const rnd = () => rng();
    const gauss = () => rnd() + rnd() + rnd() - 1.5; // ≈ N(0, 0.5)

    const shapes = [
        shapeSphere(COUNT),
        shapeKnot(COUNT),
        shapeLayers(COUNT),
        shapeGalaxy(COUNT),
        await shapeText(COUNT, "MA"),
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    for (let i = 1; i < shapes.length; i++) {
        geometry.setAttribute("p" + i, new THREE.BufferAttribute(shapes[i], 3));
    }
    const rand = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
        rand[i * 3] = rnd() * 2 - 1;
        rand[i * 3 + 1] = rnd() * 2 - 1;
        rand[i * 3 + 2] = rnd() * 2 - 1;
        seed[i] = rnd();
    }
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uW: { value: [1, 0, 0, 0, 0] },
            uTime: { value: 0 },
            uIntro: { value: reduceMotion ? 1 : 0 },
            uTrans: { value: 0 },
            uSize: { value: 2.1 },
            uPixel: { value: 1 },
            uAlpha: { value: 1 },
            uLight: { value: 0 },
            uColA: { value: new THREE.Color("#78f0cf") },
            uColB: { value: new THREE.Color("#8fb4ff") },
        },
        vertexShader: /* glsl */ `
            uniform float uW[5];
            uniform float uTime, uIntro, uTrans, uSize, uPixel;
            attribute vec3 p1, p2, p3, p4, aRand;
            attribute float aSeed;
            varying float vSeed;
            varying float vDepth;
            void main() {
                vec3 pos = position * uW[0] + p1 * uW[1] + p2 * uW[2] + p3 * uW[3] + p4 * uW[4];
                float s = aSeed;
                // hafif nefes alma
                pos += vec3(
                    sin(uTime * 0.6 + s * 40.0),
                    cos(uTime * 0.5 + s * 31.0),
                    sin(uTime * 0.7 + s * 23.0)
                ) * 0.045;
                // biçimler arası geçişte dağılma
                pos += aRand * uTrans * 1.7;
                // açılış: dağınıktan toparlanma
                float k = smoothstep(0.0, 1.0, clamp(uIntro * 1.5 - s * 0.5, 0.0, 1.0));
                pos = mix(aRand * 9.0, pos, k);

                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = uSize * uPixel * (0.55 + s * 0.95) * (9.0 / -mv.z);
                vSeed = s;
                vDepth = clamp((-mv.z - 5.0) / 10.0, 0.0, 1.0);
            }
        `,
        fragmentShader: /* glsl */ `
            uniform vec3 uColA, uColB;
            uniform float uAlpha, uLight;
            varying float vSeed;
            varying float vDepth;
            void main() {
                vec2 c = gl_PointCoord - 0.5;
                float d = length(c);
                if (d > 0.5) discard;
                float a = pow(1.0 - smoothstep(0.0, 0.5, d), 1.5);
                vec3 col = mix(uColA, uColB, vSeed);
                col = mix(col, vec3(1.0), (1.0 - vDepth) * 0.2 * (1.0 - uLight));
                float fade = 0.5 + 0.5 * (1.0 - vDepth);
                gl_FragColor = vec4(col, a * uAlpha * fade);
                #include <colorspace_fragment>
            }
        `,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    group.add(points);

    /* ---------- Aşama ayarları (masaüstü / mobil) ---------- */
    //            x,    y,  ölçek, opaklık, eğim(x)
    const DESKTOP = [
        [2.5, 0.0, 1.0, 1.0, 0.18],
        [-2.55, 0.0, 1.0, 0.95, 0.12],
        [2.7, -0.1, 1.0, 0.5, 0.62],
        [0.0, 0.0, 1.12, 0.52, 0.95],
        [0.0, 1.55, 0.7, 1.0, 0.0],
    ];
    const MOBILE = [
        [0.0, -1.1, 0.72, 0.85, 0.18],
        [0.0, 1.6, 0.74, 0.7, 0.12],
        [0.0, 1.5, 0.72, 0.42, 0.62],
        [0.0, 1.3, 0.8, 0.42, 0.95],
        [0.0, 1.9, 0.6, 0.95, 0.0],
    ];
    const cfg = () => (small ? MOBILE : DESKTOP);

    /* ---------- Scroll → biçim haritası ---------- */
    let segments = []; // {x0, x1, from, to}
    let firstV = 0;
    let lastV = 0;

    function measure() {
        const vh = innerHeight;
        const blocks = [...document.querySelectorAll("[data-scene]")];
        const pts = [];
        for (const el of blocks) {
            const v = Number(el.dataset.scene);
            const stage = el.querySelector(":scope > .stage");
            const pinned = stage && getComputedStyle(stage).position === "sticky";
            const rect = el.getBoundingClientRect();
            const top = rect.top + scrollY;
            const S = pinned ? top : top - vh * 0.5;
            const E = pinned ? top + rect.height - vh : top + rect.height - vh * 0.5;
            const span = Math.max(E - S, 1);
            pts.push({ x: S + span * 0.32, v });
            pts.push({ x: S + span * 0.86, v });
        }
        pts.sort((a, b) => a.x - b.x);
        segments = [];
        for (let i = 0; i < pts.length - 1; i++) {
            segments.push({ x0: pts[i].x, x1: Math.max(pts[i + 1].x, pts[i].x + 1), from: pts[i].v, to: pts[i + 1].v });
        }
        firstV = pts.length ? pts[0].v : 0;
        lastV = pts.length ? pts[pts.length - 1].v : 0;
    }

    // scroll konumundan { weights, trans } üretir
    function sample(y) {
        const w = [0, 0, 0, 0, 0];
        let trans = 0;
        if (!segments.length) { w[firstV] = 1; return { w, trans }; }
        if (y <= segments[0].x0) { w[firstV] = 1; return { w, trans }; }
        const lastSeg = segments[segments.length - 1];
        if (y >= lastSeg.x1) { w[lastV] = 1; return { w, trans }; }
        for (const s of segments) {
            if (y >= s.x0 && y < s.x1) {
                let f = (y - s.x0) / (s.x1 - s.x0);
                f = f * f * (3 - 2 * f); // smoothstep
                w[s.from] += 1 - f;
                w[s.to] += f;
                if (s.from !== s.to) trans = Math.sin(Math.PI * f);
                return { w, trans };
            }
        }
        w[lastV] = 1;
        return { w, trans };
    }

    /* ---------- Boyut, tema, imleç ---------- */
    let width = 0;
    let height = 0;
    function resize(force) {
        const nw = innerWidth;
        const nh = innerHeight;
        // mobilde adres çubuğu yüzünden oluşan küçük yükseklik değişimlerini yoksay
        if (!force && nw === width && Math.abs(nh - height) < 140) return;
        width = nw;
        height = nh;
        small = isSmall();
        const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        material.uniforms.uPixel.value = dpr;
        camera.aspect = width / height;
        camera.position.z = small ? 11 : 9;
        camera.updateProjectionMatrix();
        measure();
        requestRender();
    }

    function applyTheme() {
        const light = document.body.classList.contains("light-theme");
        const u = material.uniforms;
        u.uLight.value = light ? 1 : 0;
        u.uColA.value.set(light ? "#087f68" : "#78f0cf");
        u.uColB.value.set(light ? "#3b5bdb" : "#8fb4ff");
        u.uSize.value = light ? 2.6 : 2.1;
        material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        material.needsUpdate = true;
        requestRender();
    }
    new MutationObserver(applyTheme).observe(document.body, { attributes: true, attributeFilter: ["class"] });

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    addEventListener("pointermove", (e) => {
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });

    /* ---------- Döngü ---------- */
    let curT = scrollY;       // yumuşatılmış scroll
    let needsRender = true;
    let running = false;
    const t0 = performance.now();
    let last = t0;

    function requestRender() {
        needsRender = true;
        if (reduceMotion && !running) { running = true; requestAnimationFrame(frame); }
    }

    function frame(now) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const time = (now - t0) / 1000;

        if (document.hidden) { requestAnimationFrame(frame); return; }

        // scroll yumuşatma
        const target = scrollY;
        curT = reduceMotion ? target : curT + (target - curT) * (1 - Math.exp(-dt * 6));
        const { w, trans } = sample(curT);

        // aşama ayarlarını ağırlıklarla karıştır
        const c = cfg();
        let px = 0, py = 0, sc = 0, al = 0, tilt = 0;
        for (let i = 0; i < 5; i++) {
            px += c[i][0] * w[i];
            py += c[i][1] * w[i];
            sc += c[i][2] * w[i];
            al += c[i][3] * w[i];
            tilt += c[i][4] * w[i];
        }

        const u = material.uniforms;
        u.uW.value = w;
        u.uTrans.value = trans;
        u.uAlpha.value = al;
        u.uTime.value = reduceMotion ? 0 : time;
        if (!reduceMotion) u.uIntro.value = Math.min(time / 2.6, 1);

        // yazı biçimi (MA) kameraya dönük kalmalı; diğerleri yavaşça döner
        const spin = 1 - w[4];
        const spinY = reduceMotion ? 0.35 : time * 0.09 + curT / Math.max(innerHeight, 1) * 0.28;
        group.rotation.y = spinY * spin;
        group.rotation.x = tilt;
        group.position.set(px, py, 0);
        group.scale.setScalar(sc);

        // imleç paralaksı + scroll'a bağlı hafif kamera hareketi
        pointer.sx += (pointer.x - pointer.sx) * 0.05;
        pointer.sy += (pointer.y - pointer.sy) * 0.05;
        const baseZ = small ? 11 : 9;
        camera.position.x = pointer.sx * 0.55;
        camera.position.y = -pointer.sy * 0.35;
        camera.position.z = baseZ - trans * 0.9;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        needsRender = false;

        if (reduceMotion) { running = false; return; }
        requestAnimationFrame(frame);
    }

    /* ---------- Başlat ---------- */
    applyTheme();
    resize(true);
    addEventListener("resize", () => resize(false), { passive: true });
    addEventListener("load", () => { measure(); requestRender(); });
    if ("ResizeObserver" in window) {
        let raf = 0;
        new ResizeObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => { measure(); requestRender(); });
        }).observe(document.body);
    }
    addEventListener("scrolly:refresh", () => { measure(); requestRender(); });
    if (reduceMotion) addEventListener("scroll", requestRender, { passive: true });

    renderer.render(scene, camera);
    html.classList.add("scene-on");
    requestAnimationFrame(frame);

    /* ======================================================================
       Biçim üreticileri
       ====================================================================== */
    function shapeSphere(n) {
        const a = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            let x, y, z;
            if (rnd() < 0.72) {
                // Fibonacci küresi (kabuk)
                const yy = 1 - (2 * (i + 0.5)) / n;
                const r = Math.sqrt(Math.max(0, 1 - yy * yy));
                const th = i * 2.399963;
                const R = 2.35 + (rnd() - 0.5) * 0.14;
                x = Math.cos(th) * r * R; y = yy * R; z = Math.sin(th) * r * R;
            } else {
                // iç hacim
                let dx = gauss(), dy = gauss(), dz = gauss();
                const l = Math.hypot(dx, dy, dz) || 1;
                const R = 2.1 * Math.cbrt(rnd());
                x = (dx / l) * R; y = (dy / l) * R; z = (dz / l) * R;
            }
            a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
        }
        return a;
    }

    function shapeKnot(n) {
        const a = new Float32Array(n * 3);
        const p = 2, q = 3;
        for (let i = 0; i < n; i++) {
            const t = rnd() * Math.PI * 2;
            const r = 0.82 * (Math.cos(q * t) + 2);
            const x = r * Math.cos(p * t);
            const y = r * Math.sin(p * t);
            const z = -1.15 * Math.sin(q * t);
            a[i * 3] = x + gauss() * 0.34;
            a[i * 3 + 1] = y + gauss() * 0.34;
            a[i * 3 + 2] = z + gauss() * 0.34;
        }
        return a;
    }

    // "Layered Architecture": üst üste 4 ızgara katmanı
    function shapeLayers(n) {
        const a = new Float32Array(n * 3);
        const W = 5.4, D = 3.5, step = 0.27;
        for (let i = 0; i < n; i++) {
            const layer = i % 4;
            const y = (layer - 1.5) * 1.3;
            let x, z, yy = y + gauss() * 0.02;
            const m = rnd();
            if (m < 0.26) {
                // kenar çizgisi
                const per = 2 * (W + D);
                let s = rnd() * per;
                if (s < W) { x = s - W / 2; z = -D / 2; }
                else if (s < W + D) { x = W / 2; z = s - W - D / 2; }
                else if (s < 2 * W + D) { x = W / 2 - (s - W - D); z = D / 2; }
                else { x = -W / 2; z = D / 2 - (s - 2 * W - D); }
            } else if (m < 0.33) {
                // katmanları bağlayan dikey hatlar
                const cx = rnd() < 0.5 ? -W / 2 : W / 2;
                const cz = rnd() < 0.5 ? -D / 2 : D / 2;
                x = cx; z = cz; yy = (rnd() * 3 - 1.5) * 1.3 * 1.0 + 0.0;
            } else {
                x = Math.round(((rnd() - 0.5) * W) / step) * step + gauss() * 0.03;
                z = Math.round(((rnd() - 0.5) * D) / step) * step + gauss() * 0.03;
            }
            a[i * 3] = x; a[i * 3 + 1] = yy; a[i * 3 + 2] = z;
        }
        return a;
    }

    function shapeGalaxy(n) {
        const a = new Float32Array(n * 3);
        const arms = 3;
        for (let i = 0; i < n; i++) {
            const bulge = rnd() < 0.14;
            let r = bulge ? Math.abs(gauss()) * 1.1 : Math.pow(rnd(), 0.58) * 4.7;
            const arm = i % arms;
            const ang = (arm * Math.PI * 2) / arms + r * 0.95 + gauss() * (bulge ? 3 : 0.42);
            a[i * 3] = Math.cos(ang) * r;
            a[i * 3 + 1] = gauss() * 0.34 * (1.1 - Math.min(r / 5, 1));
            a[i * 3 + 2] = Math.sin(ang) * r;
        }
        return a;
    }

    // Yazıyı (MA) 2B tuvalde çizip piksellerden parçacık konumu örnekler
    async function shapeText(n, text) {
        try {
            if (document.fonts && document.fonts.load) {
                await Promise.race([
                    document.fonts.load('800 240px "Manrope"'),
                    new Promise((r) => setTimeout(r, 1500)),
                ]);
            }
        } catch (_) { /* yazı tipi gelmezse yedek yazı tipiyle devam */ }

        const W = 720, H = 360;
        const c = document.createElement("canvas");
        c.width = W; c.height = H;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        const out = new Float32Array(n * 3);
        let cand = [];
        if (ctx) {
            ctx.fillStyle = "#fff";
            ctx.font = '800 270px "Manrope", "Segoe UI", Arial, sans-serif';
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, W / 2, H / 2 + 14);
            const data = ctx.getImageData(0, 0, W, H).data;
            for (let y = 0; y < H; y += 2) {
                for (let x = 0; x < W; x += 2) {
                    if (data[(y * W + x) * 4 + 3] > 140) cand.push(x, y);
                }
            }
        }
        const m = cand.length / 2;
        for (let i = 0; i < n; i++) {
            let x, y, z;
            if (m > 0 && rnd() < 0.88) {
                const k = Math.floor(rnd() * m) * 2;
                x = (cand[k] / W - 0.5) * 7.6 + gauss() * 0.02;
                y = -(cand[k + 1] / H - 0.5) * 3.8 + gauss() * 0.02;
                z = gauss() * 0.16;
            } else {
                // yazının çevresinde halka
                const ang = rnd() * Math.PI * 2;
                const R = 4.1 + gauss() * 0.5;
                x = Math.cos(ang) * R * 1.12;
                y = Math.sin(ang) * R * 0.62;
                z = gauss() * 0.6;
            }
            out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
        }
        return out;
    }
}

function mulberry32(a) {
    return function () {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
