(() => {
  const WHATSAPP = "5500000000000";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Entrada da página ---------- */
  window.addEventListener("load", () => document.body.classList.add("is-loaded"));
  setTimeout(() => document.body.classList.add("is-loaded"), 1200);

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Header: fundo ao rolar e esconde ao descer ---------- */
  const header = document.getElementById("header");
  let lastY = 0;
  const onHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 400 && !nav.classList.contains("is-open"));
    lastY = y;
  };

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const toggleMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------- Parallax ---------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  const onParallax = () => {
    const vh = window.innerHeight;
    parallaxEls.forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.dataset.parallax);
      // no hero o deslocamento parte de zero no topo da página
      const base = el.closest(".hero") ? rect.top : rect.top + rect.height / 2 - vh / 2;
      const offset = base * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onHeader();
      if (!reduceMotion) onParallax();
      ticking = false;
    });
  }, { passive: true });
  if (!reduceMotion) onParallax();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  revealEls.forEach((el) => el.style.setProperty("--d", `${el.dataset.delay || 0}ms`));
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => revealObs.observe(el));

  /* ---------- Contadores ---------- */
  const fmt = new Intl.NumberFormat("pt-BR");
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = parseInt(el.dataset.to, 10);
      const duration = 1800;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt.format(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".count").forEach((el) => countObs.observe(el));

  /* ---------- Carrossel de posts (duplicado para loop infinito) ---------- */
  // TODO: adicionar os posts do Instagram da LiveAr (assets/img/postN.jpg) e remover o hidden de #feed
  const posts = [];
  const fillTrack = (id, list) => {
    const track = document.getElementById(id);
    const html = list.map((src) => `
      <a class="post" href="https://instagram.com/livear" target="_blank" rel="noopener">
        <img src="${src}" alt="Publicação da LiveAr no Instagram" decoding="async">
      </a>`).join("");
    track.innerHTML = html + html;
    [...track.children].slice(list.length).forEach((a) => a.setAttribute("aria-hidden", "true"));
  };
  fillTrack("marqueeA", posts.slice(0, 8));
  fillTrack("marqueeB", posts.slice(7).reverse());

  /* ---------- Tilt 3D nos cards ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });

    /* ---------- Botões magnéticos ---------- */
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Neve no hero ---------- */
  const canvas = document.getElementById("snow");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, flakes = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(w, 1400) / 14);
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.6,
        s: Math.random() * 0.6 + 0.25,
        d: Math.random() * Math.PI * 2,
        o: Math.random() * 0.5 + 0.25,
      }));
    };
    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      flakes.forEach((f) => {
        f.d += 0.01;
        f.y += f.s;
        f.x += Math.sin(f.d) * 0.4;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.o})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(canvas);
    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  /* ---------- Garante o vídeo em loop (alguns navegadores pausam) ---------- */
  const video = document.querySelector(".hero__video");
  if (video) {
    video.addEventListener("ended", () => { video.currentTime = 0; video.play(); });
    video.play().catch(() => {});
  }

  /* ---------- Quiz ---------- */
  const quiz = document.getElementById("quiz");
  const result = document.getElementById("quizResult");
  quiz.querySelectorAll(".quiz__opt").forEach((opt) => {
    opt.addEventListener("click", () => {
      quiz.querySelectorAll(".quiz__opt").forEach((o) => o.classList.remove("is-active"));
      opt.classList.add("is-active");
      result.innerHTML = `<p>${opt.dataset.msg} <a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener">Agendar agora →</a></p>`;
      result.classList.add("is-visible");
    });
  });

  /* ---------- Formulário → WhatsApp ---------- */
  document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const msg = `Olá, LiveAr! Gostaria de um orçamento.
Nome: ${data.get("nome")}
Telefone: ${data.get("tel")}
Serviço: ${data.get("servico")}
Tipo: ${data.get("tipo")}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
})();
