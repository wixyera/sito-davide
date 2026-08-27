/* ===================================================================
   MOTION.JS — livello puramente visivo, non tocca la logica dell'app.
   Reveal on-enter, cursore custom, hover magnetico, tilt 3D, effetto
   "acqua" sull'hero pilotato dal mouse.
   =================================================================== */
(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer:fine)').matches;

  /* ---------------- REVEAL ON-ENTER (al cambio modulo) ---------------- */
  function revealModule(mod){
    if (!mod) return;
    const items = mod.querySelectorAll('[data-reveal]');
    items.forEach((el, i) => {
      el.classList.remove('is-in');
      el.style.transitionDelay = reducedMotion ? '0ms' : Math.min(i * 55, 480) + 'ms';
    });
    // forza reflow poi attiva
    void mod.offsetWidth;
    requestAnimationFrame(() => items.forEach(el => el.classList.add('is-in')));
  }

  const mainEl = document.querySelector('main');
  if (mainEl) {
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const el = m.target;
          if (el.classList.contains('module') && el.classList.contains('active')) {
            revealModule(el);
          }
        }
      });
    });
    document.querySelectorAll('.module').forEach(m => obs.observe(m, { attributes: true }));
    // reveal iniziale del modulo attivo
    window.addEventListener('DOMContentLoaded', () => {
      revealModule(document.querySelector('.module.active'));
      const homeHero = document.querySelector('.home-hero');
      if (homeHero) setTimeout(() => homeHero.classList.add('is-loaded'), 120);
    });
  }

  /* ---------------- CURSORE CUSTOM ---------------- */
  if (!reducedMotion && isFinePointer) {
    document.body.classList.add('custom-cursor');
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    (function loop(){
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();

    // bagliore "sott'acqua" che segue il cursore su tutta la pagina
    const glow = document.getElementById('ambientGlow');
    if (glow) {
      let gx = mx, gy = my;
      (function glowLoop(){
        gx += (mx - gx) * 0.06; gy += (my - gy) * 0.06;
        glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
        requestAnimationFrame(glowLoop);
      })();
    }

    const growSelector = 'a, button, .quick-card, input, select, textarea, [data-goto]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest && e.target.closest(growSelector)) ring.classList.add('big');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest && e.target.closest(growSelector)) ring.classList.remove('big');
    });
  }

  /* ---------------- BOTTONI MAGNETICI ---------------- */
  /* selettore generico: copre anche i bottoni creati dinamicamente dai vari moduli */
  const MAGNETIC_SELECTOR = '.tab-btn, .theme-toggle-btn, .go, .ev-add-btn, .export-all-btn, .nav-toggle, .quick-card .go, .hero-explore, .go-btn, .carousel-arrow';
  if (!reducedMotion && isFinePointer) {
    document.addEventListener('mousemove', e => {
      document.querySelectorAll(MAGNETIC_SELECTOR).forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(r.width, r.height) * 1.4;
        if (dist < radius) {
          const pull = (1 - dist / radius) * 0.35;
          el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
        } else if (el.style.transform) {
          el.style.transform = '';
        }
      });
    });
  }

  /* ---------------- TILT 3D SULLE CARD ---------------- */
  if (!reducedMotion && isFinePointer) {
    document.querySelectorAll('.quick-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------------- EFFETTO "ACQUA" SULL'HERO ---------------- */
  const heroVisual = document.getElementById('heroVisual');
  const turb = document.getElementById('waterTurb');
  const disp = document.getElementById('waterDisp');
  if (heroVisual && turb && disp) {
    let targetScale = 0, curScale = 0;
    let t = 0;
    function animateWater(){
      t += 0.006;
      const idleFreq = 0.012 + Math.sin(t) * 0.004;
      turb.setAttribute('baseFrequency', idleFreq.toFixed(4) + ' ' + (idleFreq * 1.6).toFixed(4));
      curScale += (targetScale - curScale) * 0.08;
      disp.setAttribute('scale', curScale.toFixed(1));
      requestAnimationFrame(animateWater);
    }
    animateWater();

    if (isFinePointer && !reducedMotion) {
      heroVisual.addEventListener('mousemove', e => {
        const r = heroVisual.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const distFromCenter = Math.hypot(px - 0.5, py - 0.5);
        targetScale = Math.max(0, (0.5 - distFromCenter) * 130);
      });
      heroVisual.addEventListener('mouseleave', () => { targetScale = 10; });
      targetScale = 10;
    } else {
      targetScale = 10;
    }
  }

  /* ---------------- STATS DINAMICHE (numeri reali, non finti) ---------------- */
  window.addEventListener('DOMContentLoaded', () => {
    const expCount = document.querySelectorAll('a.go[href^="experiments/"]').length;
    const statExp = document.getElementById('statExperiments');
    if (statExp) statExp.innerHTML = String(expCount).padStart(2, '0') + '<span class="accent">+</span>';

    const careerMenu = document.getElementById('careerMenu');
    const statCareer = document.getElementById('statCareer');
    if (careerMenu && statCareer) {
      const updateCareerStat = () => {
        const n = careerMenu.querySelectorAll('details').length;
        statCareer.textContent = String(n).padStart(2, '0');
      };
      updateCareerStat();
      new MutationObserver(updateCareerStat).observe(careerMenu, { childList: true });
    }
  });

  /* ---------------- CAROSELLO ORIZZONTALE (progetti/demo) ---------------- */
  document.querySelectorAll('.carousel-track').forEach(track => {
    const wrap = track.closest('.carousel-wrap');
    const prevBtn = wrap && wrap.querySelector('.carousel-arrow.prev');
    const nextBtn = wrap && wrap.querySelector('.carousel-arrow.next');
    const scrollAmount = () => Math.min(track.clientWidth * 0.8, 620);
    if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: reducedMotion ? 'auto' : 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: reducedMotion ? 'auto' : 'smooth' }));

    // drag-to-scroll col mouse (desktop)
    let isDown = false, startX = 0, startScroll = 0;
    track.addEventListener('mousedown', e => {
      isDown = true; track.classList.add('dragging');
      startX = e.pageX; startScroll = track.scrollLeft;
    });
    window.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
    window.addEventListener('mousemove', e => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.pageX - startX);
    });
  });

  /* ---------------- HEADER TRASPARENTE SU HOME + SOLIDO ALLO SCROLL ---------------- */
  const bodyEl = document.body;
  const headerEl2 = document.querySelector('header');
  function syncHomeActive(){
    const homeMod = document.getElementById('mod-home');
    bodyEl.classList.toggle('home-active', !!(homeMod && homeMod.classList.contains('active')));
  }
  function syncHeaderSolid(){
    if (headerEl2) headerEl2.classList.toggle('solid', window.scrollY > 40);
  }
  window.addEventListener('scroll', syncHeaderSolid, { passive: true });
  syncHeaderSolid();
  syncHomeActive();
  const bodyObs = new MutationObserver(syncHomeActive);
  document.querySelectorAll('.module').forEach(m => bodyObs.observe(m, { attributes: true, attributeFilter: ['class'] }));

  /* ---------------- TIMER NELL'ANGOLO DELL'HERO (minuti sulla pagina) ---------------- */
  const heroTimer = document.getElementById('heroTimer');
  if (heroTimer) {
    const startedAt = Date.now();
    setInterval(() => {
      const mins = Math.floor((Date.now() - startedAt) / 60000);
      heroTimer.textContent = String(mins).padStart(2, '0') + "'";
    }, 5000);
  }

  /* ---------------- INDICATORE TAB FLUIDO ---------------- */
  const tabNav = document.getElementById('tabNav');
  const tabIndicator = document.getElementById('tabIndicator');
  function positionIndicator(){
    if (!tabNav || !tabIndicator) return;
    const active = tabNav.querySelector('.tab-btn.active');
    if (!active) return;
    const navRect = tabNav.getBoundingClientRect();
    const btnRect = active.getBoundingClientRect();
    tabIndicator.style.left = (btnRect.left - navRect.left + tabNav.scrollLeft) + 'px';
    tabIndicator.style.top = (btnRect.top - navRect.top + tabNav.scrollTop) + 'px';
    tabIndicator.style.width = btnRect.width + 'px';
    tabIndicator.style.height = btnRect.height + 'px';
    tabIndicator.classList.add('ready');
  }
  if (tabNav && tabIndicator) {
    tabNav.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => setTimeout(positionIndicator, 10)));
    window.addEventListener('resize', positionIndicator);
    window.addEventListener('DOMContentLoaded', () => setTimeout(positionIndicator, 200));
    setTimeout(positionIndicator, 500);
  }

  /* ---------------- SCROLL PROGRESS BAR ---------------- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------------- PARALLAX LOGO ---------------- */
  if (!reducedMotion && isFinePointer) {
    const logo = document.querySelector('.logo');
    const headerEl = document.querySelector('header');
    if (logo && headerEl) {
      headerEl.addEventListener('mousemove', e => {
        const r = headerEl.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        logo.style.transform = `translate(${px * 6}px, ${py * 6}px)`;
      });
      headerEl.addEventListener('mouseleave', () => { logo.style.transform = ''; });
    }
  }

  /* ---------------- CONTATORI ANIMATI (stats-strip) ---------------- */
  document.querySelectorAll('.stat-box .stat-num').forEach(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/(\d+)/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = el.querySelector('.accent') ? el.querySelector('.accent').outerHTML : '';
    let done = false;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !done) {
          done = true;
          if (reducedMotion) { el.innerHTML = target + suffix; return; }
          const start = performance.now(), dur = 900;
          const step = now => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.innerHTML = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ---------------- RIPPLE + ABERRAZIONE CROMATICA SULL'ACQUA (click) ---------------- */
  if (heroVisual) {
    heroVisual.addEventListener('click', e => {
      const r = heroVisual.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.className = 'water-ripple';
      ripple.style.left = (e.clientX - r.left) + 'px';
      ripple.style.top = (e.clientY - r.top) + 'px';
      heroVisual.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());

      const offR = document.getElementById('waterOffR');
      const offB = document.getElementById('waterOffB');
      if (offR && offB && !reducedMotion) {
        let boost = 6;
        const decay = () => {
          boost *= 0.88;
          offR.setAttribute('dx', boost.toFixed(1));
          offB.setAttribute('dx', (-boost).toFixed(1));
          if (boost > 0.15) requestAnimationFrame(decay); else { offR.setAttribute('dx', 0); offB.setAttribute('dx', 0); }
        };
        decay();
      }
    });
  }

  /* ---------------- DOTS CAROSELLO ---------------- */
  document.querySelectorAll('.carousel-track').forEach(track => {
    const wrap = track.closest('.carousel-wrap');
    const dotsWrap = wrap && wrap.querySelector('.carousel-dots');
    const cards = track.querySelectorAll('.quick-card');
    if (dotsWrap && cards.length) {
      cards.forEach((c, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Vai alla card ' + (i + 1));
        dot.addEventListener('click', () => c.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' }));
        dotsWrap.appendChild(dot);
      });
      let ticking = false;
      track.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const idx = Math.round(track.scrollLeft / (cards[0].getBoundingClientRect().width + 20));
          dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
          ticking = false;
        });
      }, { passive: true });
    }
  });
})();
