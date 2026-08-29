/* ===================================
   Vida Estate — Finishing Services
   JavaScript — Interactions & Animations
   =================================== */

   document.addEventListener('DOMContentLoaded', () => {

    // ───────────────────────────────
    // Header scroll effect
    // ───────────────────────────────
    const header = document.querySelector('.header');
    let lastScroll = 0;
  
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    };
  
    window.addEventListener('scroll', handleScroll, { passive: true });
  
    // ───────────────────────────────
    // Mobile navigation
    // ───────────────────────────────
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
  
    const toggleMenu = () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('open');
      navOverlay.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    };
  
    menuToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);
  
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          toggleMenu();
        }
      });
    });
    // ───────────────────────────────
    // Counter animation (stats)
    // ───────────────────────────────
    const counters = document.querySelectorAll('.stat-number');
  
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();
  
      const step = (timestamp) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
  
      requestAnimationFrame(step);
    };
  
    // ───────────────────────────────
    // Scroll reveal / Intersection Observer
    // ───────────────────────────────
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    const statSection = document.querySelector('.stats');
    let statsAnimated = false;
  
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.15
    };
  
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);
  
    revealElements.forEach(el => revealObserver.observe(el));
  
    // Stats counter observer
    if (statSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            counters.forEach(counter => animateCounter(counter));
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statsObserver.observe(statSection);
    }
  
    // ───────────────────────────────
    // Testimonial showcase (single-card carousel)
    // ───────────────────────────────
    const showcase = document.querySelector('.testimonial-showcase');
    const showcaseStage = showcase ? showcase.querySelector('.showcase-stage') : null;
    const showcaseSlides = showcase ? Array.from(showcase.querySelectorAll('.showcase-slide')) : [];
    const showcaseDots = showcase ? Array.from(showcase.querySelectorAll('.showcase-dot')) : [];
    const showcasePrev = showcase ? showcase.querySelector('.showcase-prev') : null;
    const showcaseNext = showcase ? showcase.querySelector('.showcase-next') : null;
    const counterCurrent = showcase ? showcase.querySelector('.showcase-counter-current') : null;

    if (showcase && showcaseStage && showcaseSlides.length) {
      let activeIndex = showcaseSlides.findIndex(s => s.classList.contains('is-active'));
      if (activeIndex < 0) activeIndex = 0;
      let showcaseAutoplay;
      let isAnimating = false;
      const AUTOPLAY_MS = 6000;

      const pad = (n) => String(n + 1).padStart(2, '0');

      const setActiveDotProgress = (durationMs) => {
        showcaseDots.forEach((dot, i) => {
          const bar = dot.querySelector('span');
          if (!bar) return;
          bar.style.transition = 'none';
          bar.style.transform = 'translateX(-100%)';
          if (i === activeIndex && durationMs) {
            // Force reflow so the transition restarts cleanly
            void bar.offsetWidth;
            bar.style.transition = `transform ${durationMs}ms linear`;
            bar.style.transform = 'translateX(0%)';
          }
        });
      };

      const goToSlide = (index, { userInitiated = false } = {}) => {
        if (isAnimating) return;
        const total = showcaseSlides.length;
        const nextIndex = ((index % total) + total) % total;
        if (nextIndex === activeIndex) return;

        isAnimating = true;
        const current = showcaseSlides[activeIndex];
        const next = showcaseSlides[nextIndex];

        current.classList.add('is-leaving');
        current.classList.remove('is-active');

        // Let layout settle, then bring in the next slide
        requestAnimationFrame(() => {
          next.classList.add('is-active');

          window.setTimeout(() => {
            current.classList.remove('is-leaving');
            isAnimating = false;
          }, 560);
        });

        activeIndex = nextIndex;

        showcaseDots.forEach((dot, i) => {
          const active = i === activeIndex;
          dot.classList.toggle('active', active);
          dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        if (counterCurrent) counterCurrent.textContent = pad(activeIndex);

        setActiveDotProgress(userInitiated ? 0 : AUTOPLAY_MS);

        if (userInitiated) {
          restartAutoplay();
        }
      };

      const startAutoplay = () => {
        setActiveDotProgress(AUTOPLAY_MS);
        showcaseAutoplay = window.setInterval(() => {
          goToSlide(activeIndex + 1);
        }, AUTOPLAY_MS);
      };

      const stopAutoplay = () => {
        window.clearInterval(showcaseAutoplay);
      };

      const restartAutoplay = () => {
        stopAutoplay();
        startAutoplay();
      };

      if (showcasePrev) {
        showcasePrev.addEventListener('click', () => {
          goToSlide(activeIndex - 1, { userInitiated: true });
        });
      }

      if (showcaseNext) {
        showcaseNext.addEventListener('click', () => {
          goToSlide(activeIndex + 1, { userInitiated: true });
        });
      }

      showcaseDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          goToSlide(i, { userInitiated: true });
        });
      });

      // Pause on hover / focus for readability
      showcase.addEventListener('mouseenter', stopAutoplay);
      showcase.addEventListener('mouseleave', startAutoplay);
      showcase.addEventListener('focusin', stopAutoplay);
      showcase.addEventListener('focusout', startAutoplay);

      // Touch / swipe support
      let touchStartX = 0;
      let touchEndX = 0;

      showcaseStage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      }, { passive: true });

      showcaseStage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          goToSlide(activeIndex + (diff > 0 ? 1 : -1), { userInitiated: true });
        } else {
          startAutoplay();
        }
      }, { passive: true });

      if (counterCurrent) counterCurrent.textContent = pad(activeIndex);
      startAutoplay();
    }
  
    // ───────────────────────────────
    // Accordion (FAQ)
    // ───────────────────────────────
    const accordionItems = document.querySelectorAll('.accordion-item');
  
    accordionItems.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content');
  
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
  
        // Close all
        accordionItems.forEach(i => {
          i.classList.remove('active');
          i.querySelector('.accordion-content').style.maxHeight = null;
        });
  
        // Open clicked (if wasn't already open)
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  
    // Open first by default
    if (accordionItems.length > 0) {
      const firstItem = accordionItems[0];
      firstItem.classList.add('active');
      firstItem.querySelector('.accordion-content').style.maxHeight = firstItem.querySelector('.accordion-content').scrollHeight + 'px';
    }
  
    // ───────────────────────────────
    // Lightbox for portfolio images
    // ───────────────────────────────
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const portfolioItems = document.querySelectorAll('.portfolio-item');
  
    portfolioItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  
    const closeLightbox = () => {
      if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    };
  
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  
    // ───────────────────────────────
    // Smooth scroll for anchor links
    // ───────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const headerHeight = header.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  
    // ───────────────────────────────
    // Contact form (basic validation)
    // ───────────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.form-submit');
        const originalText = btn.textContent;
        btn.textContent = 'Изпратено! ✓';
        btn.style.background = '#34A853';
        btn.disabled = true;
  
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      });
    }
  });