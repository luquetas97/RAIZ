/* =============================================
   RAIZ — Main JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);
  /* ---- NAV: scroll effect ---- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ---- NAV: hamburger mobile ---- */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.nav__mobile');
  const mobileLinks = mobileNav?.querySelectorAll('a');
  let isMenuOpen = false;

  hamburger?.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileNav.classList.toggle('open', isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    const spans = hamburger.querySelectorAll('span');
    if (isMenuOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  mobileLinks?.forEach(link => {
    link.addEventListener('click', () => {
      isMenuOpen = false;
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  /* ---- HERO: text line reveal ---- */
  const heroLines = document.querySelectorAll('.hero__title .line span');
  const heroSub = document.querySelector('.hero__sub');
  const heroActions = document.querySelector('.hero__actions');

  setTimeout(() => {
    heroLines.forEach((span, i) => {
      setTimeout(() => span.classList.add('visible'), i * 120);
    });
  }, 200);

  setTimeout(() => {
    heroSub?.classList.add('visible');
    heroActions?.classList.add('visible');
  }, 400);

  /* ---- SCROLL REVEAL: IntersectionObserver ---- */
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => observer.observe(el));

  /* ---- TICKER: duplicate for seamless loop ---- */
  const tickerTrack = document.querySelector('.ticker__track');
  if (tickerTrack) {
    const clone = tickerTrack.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    tickerTrack.parentElement.appendChild(clone);
  }

  /* ---- VALORES SLIDER ---- */
  const valoresSlider = document.querySelector('.valores__slider');
  const valoresDots   = document.querySelectorAll('.valores__dot');
  const prevBtn       = document.querySelector('.valores__arrow--prev');
  const nextBtn       = document.querySelector('.valores__arrow--next');
  const SLIDE_COUNT   = 3;
  const AUTO_DELAY    = 5000;
  let currentSlide    = 0;
  let autoTimer       = null;

  // Barra de progreso
  const progressBar = document.createElement('div');
  progressBar.className = 'valores__progress';
  document.querySelector('.valores')?.appendChild(progressBar);

  const goTo = (index) => {
    currentSlide = (index + SLIDE_COUNT) % SLIDE_COUNT;
    valoresSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    valoresDots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));

    // Reset + animar barra de progreso
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    progressBar.style.transition = `width ${AUTO_DELAY}ms linear`;
    progressBar.style.width = '100%';
  });
});
  };

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(currentSlide + 1), AUTO_DELAY);
  };

  const resetAuto = () => { startAuto(); };

  prevBtn?.addEventListener('click', () => { goTo(currentSlide - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(currentSlide + 1); resetAuto(); });
  valoresDots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  // Swipe touch
  let touchStartX = 0;
  document.querySelector('.valores')?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  document.querySelector('.valores')?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(currentSlide + (diff > 0 ? 1 : -1)); resetAuto(); }
  });

  // Pausar en hover
  document.querySelector('.valores')?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  document.querySelector('.valores')?.addEventListener('mouseleave', () => startAuto());

  goTo(0);
  startAuto();

  /* ---- COUNTER ANIMATION ---- */
  const statNumbers = document.querySelectorAll('[data-count]');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(eased * target);
          el.querySelector('.count-value').textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => countObserver.observe(el));

  /* ---- CANVAS FRAME SCRUBBING ---- */
const heroScrollContainer = document.querySelector('.hero-scroll-container');
const heroVideo = document.querySelector('.hero__video');

const TOTAL_FRAMES = 120;
const frames = new Array(TOTAL_FRAMES);
const framePromises = new Array(TOTAL_FRAMES);

let canvas;
let ctx;
let desiredFrame = 0;
let lastDrawnFrame = -1;
let scrollRaf = null;

if (heroScrollContainer && window.innerWidth > 768) {
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');

  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    display: block;
  `;

  if (heroVideo) {
    heroVideo.replaceWith(canvas);
  } else {
    document.querySelector('.hero')?.prepend(canvas);
  }

  ctx = canvas.getContext('2d', {
    alpha: false
  });

  const frameURL = (index) => {
    const number = String(index).padStart(4, '0');
    return `frame-${number}.jpg`;
  };

  const loadFrame = (index) => {
    if (framePromises[index]) {
      return framePromises[index];
    }

    framePromises[index] = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';

      img.onload = () => {
        frames[index] = img;
        resolve(img);
      };

      img.onerror = () => {
        console.error(`No se pudo cargar: ${frameURL(index)}`);
        reject(new Error(`Error cargando frame ${index}`));
      };

      img.src = frameURL(index);
    });

    return framePromises[index];
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const renderImageCover = (img) => {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const scale = Math.max(
      canvasWidth / img.naturalWidth,
      canvasHeight / img.naturalHeight
    );

    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;

    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  const drawFrame = (index) => {
    const safeIndex = Math.max(
      0,
      Math.min(TOTAL_FRAMES - 1, index)
    );

    desiredFrame = safeIndex;
desiredFrame = safeIndex;

// Precargar solamente los frames cercanos
for (let offset = 1; offset <= 3; offset++) {
  const previousFrame = safeIndex - offset;
  const nextFrame = safeIndex + offset;

  if (previousFrame >= 0) {
    loadFrame(previousFrame).catch(() => {});
  }

  if (nextFrame < TOTAL_FRAMES) {
    loadFrame(nextFrame).catch(() => {});
  }
}

const loadedImage = frames[safeIndex];
    const loadedImage = frames[safeIndex];

    if (loadedImage?.naturalWidth > 0) {
      renderImageCover(loadedImage);
      lastDrawnFrame = safeIndex;
      return;
    }

    loadFrame(safeIndex)
      .then((img) => {
        if (desiredFrame === safeIndex) {
          renderImageCover(img);
          lastDrawnFrame = safeIndex;
        }
      })
      .catch(() => {
        // Si falla un frame, conserva el último frame válido.
      });
  };

  const updateFrameFromScroll = () => {
    const rect = heroScrollContainer.getBoundingClientRect();

    const scrollableDistance = Math.max(
      1,
      heroScrollContainer.offsetHeight - window.innerHeight
    );

    const progress = Math.max(
      0,
      Math.min(1, -rect.top / scrollableDistance)
    );

    const frameIndex = Math.round(
      progress * (TOTAL_FRAMES - 1)
    );

    drawFrame(frameIndex);
    scrollRaf = null;
  };

  const preloadRemainingFrames = async () => {
    let nextFrame = 1;
    const concurrentLoads = 6;

    const worker = async () => {
      while (nextFrame < TOTAL_FRAMES) {
        const currentFrame = nextFrame++;

        try {
          await loadFrame(currentFrame);
        } catch (error) {
          // Continúa cargando aunque algún frame falle.
        }
      }
    };

    await Promise.all(
      Array.from(
        { length: concurrentLoads },
        () => worker()
      )
    );
  };

  window.addEventListener(
    'scroll',
    () => {
      if (scrollRaf === null) {
        scrollRaf = requestAnimationFrame(updateFrameFromScroll);
      }
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      resizeCanvas();

      if (lastDrawnFrame >= 0) {
        drawFrame(desiredFrame);
      }
    });
  });

  resizeCanvas();

  loadFrame(0)
    .then(() => {
      drawFrame(0);
      updateFrameFromScroll();
      
    })
    .catch((error) => {
      console.error('No se pudo iniciar el efecto del hero.', error);
    });
}

  /* ---- SMOOTH hover cursor trail on hero ---- */
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mx', x + '%');
      hero.style.setProperty('--my', y + '%');
    });
  }

  /* ---- PROCESO steps: stagger on scroll ---- */
  const procesoSteps = document.querySelectorAll('.proceso__step');
  const procesoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = Array.from(procesoSteps).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 100);
        procesoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  procesoSteps.forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(30px)';
    step.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), background 0.4s ease';
    procesoObserver.observe(step);
  });

});
