
(() => {
  'use strict';

  /* Helper */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* 1. Active nav highlighting */
  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    const links = $$('header nav a');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (href === 'index.html' && path === '')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  /* 2. Mobile hamburger toggle (requires a .hamburger button in header) */
  function initHamburger() {
    const btn = $('.hamburger');
    const nav = $('header nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
    // close nav on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* 3. Gallery lightbox */
  function initLightbox() {
    const images = $$('[data-lightbox]');
    if (!images.length) return;

    // create modal
    const modal = document.createElement('div');
    modal.className = 'lightbox';
    modal.innerHTML = `
      <div class="lightbox-inner" role="dialog" aria-modal="true" aria-label="Image preview">
        <button class="lightbox-close" aria-label="Close">✕</button>
        <button class="lightbox-prev" aria-label="Previous">‹</button>
        <div class="lightbox-stage"><img alt=""></div>
        <button class="lightbox-next" aria-label="Next">›</button>
      </div>`;
    document.body.appendChild(modal);

    const stageImg = modal.querySelector('.lightbox-stage img');
    const closeBtn = modal.querySelector('.lightbox-close');
    const prevBtn = modal.querySelector('.lightbox-prev');
    const nextBtn = modal.querySelector('.lightbox-next');

    let idx = 0;
    function open(i) {
      idx = i;
      const src = images[idx].dataset.large || images[idx].src;
      stageImg.src = src;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      stageImg.focus?.();
    }
    function close() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      stageImg.src = '';
    }
    function showNext(dir = 1) {
      idx = (idx + dir + images.length) % images.length;
      open(idx);
    }

    images.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(i));
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') open(i);
      });
      img.setAttribute('tabindex', '0');
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => showNext(-1));
    nextBtn.addEventListener('click', () => showNext(1));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') showNext(1);
      if (e.key === 'ArrowLeft') showNext(-1);
    });
  }

  /* 4. Lazy loading images fallback for older browsers */
  function initLazy() {
    const imgs = $$('img[data-src]');
    if ('loading' in HTMLImageElement.prototype) {
      imgs.forEach(img => {
        img.src = img.datasetSrc || img.datasetSrc || img.dataset.src || img.dataset.src;
        img.removeAttribute('data-src');
      });
      return;
    }
    // IntersectionObserver fallback
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.datasetSrc || img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => io.observe(img));
  }

  /* 5. Simple form validation for contact and booking forms */
  function initForms() {
    const forms = $$('form[data-validate]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const required = $$('[required]', form);
        let valid = true;
        required.forEach(field => {
          field.classList.remove('invalid');
          if (!field.value.trim()) {
            field.classList.add('invalid');
            valid = false;
          } else if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value)) {
            field.classList.add('invalid');
            valid = false;
          }
        });
        if (!valid) {
          e.preventDefault();
          const first = form.querySelector('.invalid');
          first?.focus();
        } else {
          // optional: show a friendly message or spinner
          // allow normal submit or integrate with Formspree / server endpoint
        }
      });
    });
  }

  /* 6. Theme toggle persisted in localStorage */
  function initThemeToggle() {
    const toggle = $('.theme-toggle');
    if (!toggle) return;
    const root = document.documentElement;
    const key = 'salon-theme';
    const apply = (mode) => {
      root.dataset.theme = mode;
      localStorage.setItem(key, mode);
    };
    const saved = localStorage.getItem(key) || 'golden';
    apply(saved);
    toggle.addEventListener('click', () => {
      const next = root.dataset.theme === 'golden' ? 'moody' : 'golden';
      apply(next);
    });
  }

  /* 7. Smooth scroll for internal links */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }
    });
  }

  /* Initialize all */
  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initHamburger();
    initLightbox();
    initLazy();
    initForms();
    initThemeToggle();
    initSmoothScroll();
  });

})();
