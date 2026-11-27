/* ==========================================================================
   script.js — tema anahtarı + GSAP ScrollTrigger sahneleri
   GSAP yüklenemezse veya "azaltılmış hareket" tercih edilmişse sayfa
   hiçbir animasyon olmadan, normal akışta okunabilir kalır.
   ========================================================================== */
(() => {
    const html = document.documentElement;

    /* ---------- Tema (önceki davranış korunur) ---------- */
    const themeSwitch = document.getElementById("theme-switch");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* yoksay */ } },
    };

    function applyTheme(theme) {
        const isLight = theme === "light";
        document.body.classList.toggle("light-theme", isLight);
        if (themeSwitch) {
            themeSwitch.checked = isLight;
            themeSwitch.setAttribute("aria-checked", String(isLight));
        }
        if (themeColor) themeColor.content = isLight ? "#f6f8fb" : "#0b1020";
    }

    if (themeSwitch) {
        applyTheme(store.get("theme") || "dark");
        themeSwitch.addEventListener("change", () => {
            const theme = themeSwitch.checked ? "light" : "dark";
            applyTheme(theme);
            store.set("theme", theme);
        });
    }

    /* ---------- Başlık: scroll'da cam efekti ---------- */
    const header = document.querySelector(".site-header");
    const onScrollHeader = () => header && header.classList.toggle("is-scrolled", scrollY > 24);
    addEventListener("scroll", onScrollHeader, { passive: true });
    onScrollHeader();

    /* ---------- GSAP kontrolü ---------- */
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    if (!gsap || !ST || reduce) return;

    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    html.classList.add("scrolly");

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* ---------- Yardımcılar ---------- */

    // Metni kelimelere böler (iç içe <span> ve <br> yapısını korur)
    function splitWords(el) {
        if (!el) return [];
        if (el.dataset.splitDone) return Array.from(el.querySelectorAll(".w"));
        el.dataset.splitDone = "1";
        const words = [];
        (function walk(node) {
            Array.from(node.childNodes).forEach((child) => {
                if (child.nodeType === 3) {
                    const parts = child.textContent.split(/(\s+)/);
                    const frag = document.createDocumentFragment();
                    parts.forEach((p) => {
                        if (!p) return;
                        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
                        const s = document.createElement("span");
                        s.className = "w";
                        s.textContent = p;
                        words.push(s);
                        frag.appendChild(s);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && child.tagName !== "BR") {
                    child.classList.add("is-split");
                    walk(child);
                }
            });
        })(el);
        return words;
    }

    // Sabitlenmiş (sticky) sahne için scrub'lı zaman çizelgesi
    function pinned(block, extra = {}) {
        return gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: block,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8,
                invalidateOnRefresh: true,
                ...extra,
            },
        });
    }

    // Akış içindeki (sabitlenmeyen) öğe için scrub
    function flow(trigger, start = "top 88%", end = "top 40%") {
        return gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger, start, end, scrub: 0.7, invalidateOnRefresh: true },
        });
    }

    const wordsIn = (tl, words, at, each = 0.14, dur = 0.7) =>
        tl.fromTo(words, { opacity: 0.12, y: 26 }, { opacity: 1, y: 0, stagger: each, duration: dur, ease: "power2.out" }, at);

    /* ---------- İlerleme çubuğu ---------- */
    gsap.to(".progress i", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
    });

    /* ======================================================================
       ANA SAYFA
       ====================================================================== */
    const heroBlock = $(".hero-block");

    if (heroBlock) {
        /* --- HERO: açılış animasyonu (zamana bağlı) --- */
        const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
        intro
            .from(".hero-p1 .eyebrow", { y: 16, autoAlpha: 0, duration: 0.9 }, 0.2)
            .from(".hero h1 .line > span", { yPercent: 115, duration: 1.3, stagger: 0.14 }, 0.3)
            .from(".hero-lead", { y: 22, autoAlpha: 0, duration: 1 }, 0.9)
            .from(".hero-bottom", { autoAlpha: 0, duration: 1 }, 1.4);

        /* --- HERO: scroll ile 1. perde → 2. perde --- */
        const heroTl = pinned(heroBlock);
        heroTl
            .to(".hero-bottom", { autoAlpha: 0, duration: 0.8 }, 0.4)
            .to(".hero-p1", { y: -80, scale: 0.9, autoAlpha: 0, filter: "blur(12px)", ease: "power2.in", duration: 3 }, 1.6)
            .fromTo(".hero-p2", { y: 80, autoAlpha: 0, filter: "blur(10px)" }, { y: 0, autoAlpha: 1, filter: "blur(0px)", ease: "power2.out", duration: 3 }, 3.8)
            .fromTo(".visual-card",
                { rotateY: -70, rotateX: 18, scale: 0.55, z: -420, autoAlpha: 0 },
                { rotateY: -14, rotateX: 6, scale: 1, z: 0, autoAlpha: 1, ease: "power3.out", duration: 4.2 }, 3.2)
            .fromTo(".floating-chip", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.4, duration: 1.4, ease: "power2.out" }, 5.8)
            .fromTo(".visual-glow, .visual-ring", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, stagger: 0.2, duration: 3 }, 3.6)
            .to(".visual-card", { rotateY: 0, rotateX: 0, duration: 3 }, 7.6)
            .to({}, { duration: 1.5 }); // son duraklama

        // başlangıç durumunu hemen uygula (ilk karede parlamasın)
        gsap.set(".hero-p2", { autoAlpha: 0 });
        gsap.set(".visual-card, .floating-chip, .visual-glow, .visual-ring", { autoAlpha: 0 });

        /* --- HAKKIMDA: kelime kelime başlık + 3B kart destesi --- */
        const aboutBlock = $(".about-block");
        const cards = $$(".info-card", aboutBlock);
        const aboutTl = pinned(aboutBlock);
        const h2Words = splitWords($(".about-block h2"));
        const introWords = splitWords($(".about-block .section-intro"));
        gsap.set([...h2Words, ...introWords], { opacity: 0.12 });
        gsap.set(".about-block .section-kicker", { autoAlpha: 0.3 });

        aboutTl.to(".about-block .section-kicker", { autoAlpha: 1, duration: 1 }, 0);
        wordsIn(aboutTl, h2Words, 0.2, 0.22, 1.1);
        wordsIn(aboutTl, introWords, 2.4, 0.07, 0.8);

        const step = 3.6;
        const startAt = 4.4;
        cards.forEach((card, i) => {
            const t = startAt + i * step;
            aboutTl.fromTo(card,
                { y: 320, z: -520, rotateX: 38, autoAlpha: 0 },
                { y: 0, z: 0, rotateX: 0, autoAlpha: 1, ease: "power3.out", duration: 2.6 }, t);
            // önceki kartlar desteye geri çekilir
            for (let k = 0; k < i; k++) {
                const depth = i - k;
                aboutTl.to(cards[k], {
                    y: -34 * depth,
                    scale: 1 - depth * 0.055,
                    autoAlpha: Math.max(0.55 - (depth - 1) * 0.25, 0.18),
                    duration: 2.6,
                }, t);
            }
        });
        aboutTl.to({}, { duration: 2.2 });
        gsap.set(cards, { autoAlpha: 0 });

        /* --- PROJELER / TEKNOLOJİLER: masaüstünde sabitlenir, mobilde akar --- */
        const mm = gsap.matchMedia();

        mm.add("(min-width: 761px)", () => {
            buildProjects(true);
            buildSkills(true);
        });
        mm.add("(max-width: 760px)", () => {
            buildProjects(false);
            buildSkills(false);
        });

        function buildProjects(isPinned) {
            const block = $(".projects-block");
            const words = splitWords($(".projects-block h2"));
            const visual = $(".project-visual", block);
            const rows = $$(".currency-row", block);
            const apiTag = $(".api-tag", block);
            const copyBits = [$(".project-type", block), $(".featured-copy h3", block)];
            const tags = $$(".featured-copy .tag-list span", block);
            const links = $$(".project-links > *", block);
            const topLink = $(".section-topline > .text-link", block);
            const orbit = $(".visual-orbit", block);
            const tl = isPinned ? pinned(block) : flow(visual, "top 92%", "bottom 55%");
            const k = isPinned ? 1 : 0.55; // mobilde daha kısa süreler

            gsap.set(words, { opacity: 0.12 });
            if (isPinned) {
                wordsIn(tl, words, 0, 0.3, 1.2);
                tl.fromTo(topLink, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 1.2 }, 1.4);
            } else {
                // mobil: başlığı kendi tetikleyicisiyle aç
                wordsIn(flow($(".projects-block .section-heading"), "top 90%", "top 55%"), words, 0, 0.3, 1);
            }

            tl.fromTo(visual,
                { rotateX: 64, rotateY: 30, scale: 0.6, y: 260 * k, autoAlpha: 0, transformPerspective: 1300 },
                { rotateX: 9, rotateY: -11, scale: 1, y: 0, autoAlpha: 1, ease: "power3.out", duration: 5 }, 1.6 * k)
              .fromTo(rows, { x: -70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.55, duration: 1.4, ease: "power3.out" }, 4.4 * k)
              .fromTo(apiTag, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "back.out(2)" }, 6.4 * k)
              .to(visual, { rotateX: 0, rotateY: 0, duration: 4, ease: "power2.inOut" }, 7.2 * k)
              .fromTo(orbit, { rotate: 0 }, { rotate: 260, duration: 12 * k }, 0);

            // metin tarafı: masaüstünde aynı çizelgede, mobilde kendi tetikleyicisinde
            const ct = isPinned ? tl : flow($(".featured-copy", block), "top 92%", "top 48%");
            const at = isPinned ? [4.2, 6.2, 9.2] : [0, 1.1, 2.4];
            ct.fromTo(copyBits, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.4, duration: 1.4, ease: "power3.out" }, at[0])
              .fromTo(tags, { y: 24, autoAlpha: 0, scale: 0.85 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.28, duration: 0.9, ease: "back.out(1.8)" }, at[1])
              .fromTo(links, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.3, duration: 1.2, ease: "power3.out" }, at[2]);
            if (isPinned) tl.to({}, { duration: 2 });

        }

        function buildSkills(isPinned) {
            const block = $(".skills-block");
            const h2Ws = splitWords($(".skills-block h2"));
            const introWs = splitWords($(".skills-block .section-intro"));
            const groups = $$(".skill-group", block);
            const tl = isPinned ? pinned(block) : null;

            gsap.set([...h2Ws, ...introWs], { opacity: 0.12 });

            if (isPinned) {
                wordsIn(tl, h2Ws, 0, 0.26, 1.1);
                wordsIn(tl, introWs, 1.8, 0.07, 0.8);
                groups.forEach((g, i) => {
                    const at = 3.6 + i * 1.5;
                    tl.fromTo(g,
                        { y: 220, z: -560, rotateY: (i - 1) * -48, rotateX: 16, autoAlpha: 0 },
                        { y: 0, z: 0, rotateY: 0, rotateX: 0, autoAlpha: 1, ease: "power3.out", duration: 3 }, at)
                      .fromTo($$(".tag-list span", g),
                        { autoAlpha: 0, scale: 0.5, y: 14 },
                        { autoAlpha: 1, scale: 1, y: 0, stagger: 0.14, duration: 0.8, ease: "back.out(2.2)" }, at + 1.9);
                });
                tl.to({}, { duration: 2.5 });
            } else {
                const head = flow($(".skills-block .section-heading"), "top 90%", "top 50%");
                wordsIn(head, h2Ws, 0, 0.26, 1);
                wordsIn(head, introWs, 1.2, 0.07, 0.8);
                groups.forEach((g) => {
                    const t = flow(g, "top 92%", "top 52%");
                    t.fromTo(g, { y: 90, rotateX: 28, autoAlpha: 0, transformPerspective: 900 }, { y: 0, rotateX: 0, autoAlpha: 1, ease: "power3.out" }, 0)
                     .fromTo($$(".tag-list span", g), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.6 }, 0.5);
                });
            }
        }

        /* --- İLETİŞİM: dev başlık + bağlantılar --- */
        const contactBlock = $(".contact-block");
        const cWords = splitWords($(".contact-block h2"));
        const cTl = pinned(contactBlock);
        gsap.set(cWords, { opacity: 0.1 });
        gsap.set(".contact-block .section-kicker", { autoAlpha: 0 });
        gsap.set(".contact-links a", { autoAlpha: 0 });
        cTl.to(".contact-block .section-kicker", { autoAlpha: 1, duration: 1 }, 1.2)
           .fromTo(cWords, { opacity: 0.1, y: 40 }, { opacity: 1, y: 0, stagger: 0.28, duration: 1.2, ease: "power3.out" }, 1.6)
           .fromTo(".contact-links a", { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.4, duration: 1.4, ease: "power3.out" }, 4.6)
           .to({}, { duration: 2.4 });

        /* --- Gezinmede aktif bölüm vurgusu --- */
        const linkFor = (id) => $(`.nav-links > a[href="#${id}"]`);
        ["hakkimda", "projeler", "teknolojiler", "iletisim"].forEach((id) => {
            const el = document.getElementById(id);
            const link = linkFor(id);
            if (!el || !link) return;
            ST.create({
                trigger: el,
                start: "top 60%",
                end: "bottom 40%",
                onToggle: (self) => link.classList.toggle("is-active", self.isActive),
            });
        });
    }

    /* ======================================================================
       PROJELER SAYFASI
       ====================================================================== */
    const pageHero = $(".page-hero");
    if (pageHero) {
        const h1 = $(".projects-hero h1");
        const words = splitWords(h1);
        gsap.from(".projects-hero .eyebrow", { y: 16, autoAlpha: 0, duration: 0.9, ease: "power3.out", delay: 0.2 });
        gsap.from(words, { yPercent: 90, autoAlpha: 0, stagger: 0.12, duration: 1.2, ease: "power4.out", delay: 0.3 });
        gsap.from(".projects-hero > p:last-child", { y: 24, autoAlpha: 0, duration: 1, ease: "power3.out", delay: 1 });

        // kahraman bölümü scroll'da geriye çekilir
        gsap.to(".projects-hero", {
            y: -120, scale: 0.92, autoAlpha: 0, filter: "blur(10px)", ease: "none",
            scrollTrigger: { trigger: pageHero, start: "top top", end: "bottom 25%", scrub: 0.6 },
        });

        gsap.from(".project-count", {
            autoAlpha: 0, y: 20, ease: "none",
            scrollTrigger: { trigger: ".project-count", start: "top 95%", end: "top 75%", scrub: 0.5 },
        });

        $$(".project-entry").forEach((entry) => {
            const tl = flow(entry, "top 94%", "top 34%");
            tl.fromTo(entry,
                { rotateX: 22, y: 160, scale: 0.92, autoAlpha: 0, transformPerspective: 1500 },
                { rotateX: 0, y: 0, scale: 1, autoAlpha: 1, ease: "power3.out" }, 0);

            const bits = $$(".project-entry-top, h2, :scope > p, .tag-list span, .project-details, .project-entry-actions > *", entry);
            gsap.set(bits, { autoAlpha: 0, y: 28 });
            ST.create({
                trigger: entry,
                start: "top 68%",
                once: true,
                onEnter: () => gsap.to(bits, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.9, ease: "power3.out" }),
            });

            const num = $(".project-entry-number", entry);
            if (num) {
                gsap.fromTo(num, { yPercent: 40 }, {
                    yPercent: -40, ease: "none",
                    scrollTrigger: { trigger: entry, start: "top bottom", end: "bottom top", scrub: true },
                });
            }
        });

        gsap.from(".projects-back", {
            autoAlpha: 0, y: 30, ease: "none",
            scrollTrigger: { trigger: ".projects-back", start: "top 98%", end: "top 80%", scrub: 0.5 },
        });

        // detay aç/kapa sonrası yüksekliği yeniden ölç
        $$(".project-details").forEach((d) => {
            d.addEventListener("toggle", () => {
                setTimeout(() => { ST.refresh(); dispatchEvent(new Event("scrolly:refresh")); }, 60);
            });
        });
    }

    /* ======================================================================
       Bağlantılar: sabitlenmiş sahnelere doğru noktadan git
       ====================================================================== */
    function targetFor(el) {
        const top = el.getBoundingClientRect().top + scrollY;
        const stage = el.querySelector(":scope > .stage");
        if (stage && getComputedStyle(stage).position === "sticky") {
            const frac = parseFloat(el.dataset.anchor || "0.5");
            return top + (el.offsetHeight - innerHeight) * frac;
        }
        return top - 24;
    }

    document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute("href").slice(1);
        if (id === "main") return;
        if (id === "top") { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); return; }
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        scrollTo({ top: targetFor(el), behavior: "smooth" });
    });

    // Başka sayfadan #hash ile gelindiyse doğru sahneye yerleş
    addEventListener("load", () => {
        ST.refresh();
        dispatchEvent(new Event("scrolly:refresh"));
        const id = decodeURIComponent(location.hash.slice(1));
        const el = id && document.getElementById(id);
        if (el && id !== "main" && id !== "top") {
            setTimeout(() => scrollTo({ top: targetFor(el), behavior: "auto" }), 80);
        }
    });
})();
