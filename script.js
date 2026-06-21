document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ===== Intro loader ===== */
  const loader = document.getElementById('loader');
  const finishLoading = () => {
    loader.classList.add('loaded');
    document.body.classList.add('loaded');
    setTimeout(() => { loader.style.display = 'none'; }, 700);
  };
  if (prefersReducedMotion) {
    finishLoading();
  } else {
    window.addEventListener('load', () => setTimeout(finishLoading, 350));
    // Safety net in case 'load' fires very late
    setTimeout(finishLoading, 2200);
  }

  /* ===== Footer year ===== */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ===== Header scroll state + scroll progress ===== */
  const header = document.getElementById('siteHeader');
  const scrollFill = document.getElementById('scrollFill');
  const backTop = document.getElementById('backTop');
  const heroShape = document.getElementById('heroShape');

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    backTop.classList.toggle('show', y > 600);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;
    scrollFill.style.width = pct + '%';

    if (heroShape && !prefersReducedMotion && y < window.innerHeight) {
      heroShape.style.transform = `translate(0, calc(-50% + ${y * 0.18}px))`;
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ===== Mobile nav toggle ===== */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ===== Custom split-circle cursor (desktop only) ===== */
  const cursor = document.querySelector('.cursor-mark');

  if (isFinePointer && !prefersReducedMotion && cursor) {
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.classList.add('active');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('active'));

    document.querySelectorAll('a, button, .service-card, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });

    const animateCursor = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);
  }

  /* ===== Magnetic buttons ===== */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ===== Scroll reveal ===== */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in-view'), (i % 4) * 70);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ===== Animated stat counters ===== */
  const statEls = document.querySelectorAll('.stat-number');

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    if (prefersReducedMotion) {
      el.textContent = target;
    } else {
      requestAnimationFrame(tick);
    }
  };

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach(el => statObserver.observe(el));
  } else {
    statEls.forEach(animateCount);
  }

  /* ===== Portfolio filtering ===== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workItems = document.querySelectorAll('.work-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      workItems.forEach(item => {
        const match = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('hide', !match);
      });
    });
  });

  /* ===== Portfolio lightbox ===== */
  const lightbox = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCat = document.getElementById('lightboxCat');

  const catLabels = { logo: 'شعار', identity: 'هوية تجارية', social: 'سوشيال ميديا', print: 'مطبوعات' };

  const lightboxVisual = document.querySelector('.lightbox-visual');

  const openLightbox = (item) => {
    lightboxTitle.textContent = item.dataset.title || '';
    lightboxDesc.textContent = item.dataset.desc || '';
    lightboxCat.textContent = catLabels[item.dataset.cat] || '';
    
    // Transfer background image or default gradient
    if (item.style.backgroundImage) {
      lightboxVisual.style.backgroundImage = item.style.backgroundImage;
      lightboxVisual.style.backgroundSize = 'cover';
      lightboxVisual.style.backgroundPosition = 'center';
    } else {
      lightboxVisual.style.backgroundImage = '';
    }

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  workItems.forEach(item => item.addEventListener('click', () => openLightbox(item)));
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  /* ===== Testimonials slider ===== */
  const testiTrack = document.getElementById('testiTrack');
  const testiCards = document.querySelectorAll('.testi-card');
  const testiDotsWrap = document.getElementById('testiDots');
  const testiPrev = document.getElementById('testiPrev');
  const testiNext = document.getElementById('testiNext');
  let testiIndex = 0;
  let testiTimer;

  testiCards.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToTesti(i));
    testiDotsWrap.appendChild(dot);
  });
  const testiDots = testiDotsWrap.querySelectorAll('span');

  function goToTesti(i) {
    testiIndex = (i + testiCards.length) % testiCards.length;
    testiTrack.style.transform = `translateX(${testiIndex * 100}%)`;
    testiDots.forEach((d, di) => d.classList.toggle('active', di === testiIndex));
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    clearInterval(testiTimer);
    testiTimer = setInterval(() => goToTesti(testiIndex + 1), 6000);
  }

  testiNext.addEventListener('click', () => { goToTesti(testiIndex + 1); startAutoplay(); });
  testiPrev.addEventListener('click', () => { goToTesti(testiIndex - 1); startAutoplay(); });
  goToTesti(0);
  startAutoplay();

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ===== Contact form validation ===== */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'برجاء كتابة الاسم بالكامل',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'برجاء كتابة بريد إلكتروني صحيح',
    message: (v) => v.trim().length >= 10 ? '' : 'برجاء كتابة رسالة لا تقل عن 10 أحرف'
  };

  const showError = (field, msg) => {
    const fieldEl = form.querySelector(`#${field}`).closest('.field');
    const errorEl = form.querySelector(`.error-msg[data-for="${field}"]`);
    fieldEl.classList.toggle('invalid', Boolean(msg));
    errorEl.textContent = msg;
  };

  Object.keys(validators).forEach(field => {
    const input = form.querySelector(`#${field}`);
    input.addEventListener('input', () => showError(field, validators[field](input.value)));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successMsg.classList.remove('show');

    let hasError = false;
    Object.keys(validators).forEach(field => {
      const input = form.querySelector(`#${field}`);
      const msg = validators[field](input.value);
      showError(field, msg);
      if (msg) hasError = true;
    });

    if (hasError) {
      form.querySelector('.invalid input, .invalid textarea')?.focus();
      return;
    }

    // No backend connected yet — show confirmation locally.
    successMsg.classList.add('show');
    form.reset();
    Object.keys(validators).forEach(field => showError(field, ''));

    setTimeout(() => successMsg.classList.remove('show'), 6000);
  });

});
