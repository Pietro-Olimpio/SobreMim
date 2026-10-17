document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header');
const readingProgress = document.querySelector('.reading-progress');
const backToTop = document.querySelector('.back-to-top');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileViewport = window.matchMedia('(max-width: 44rem)');
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

function closeMenu({ returnFocus = false } = {}) {
  if (!siteNav || !menuToggle) return;
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  if (returnFocus) menuToggle.focus();
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  siteNav?.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && siteNav?.classList.contains('open')) closeMenu({ returnFocus: true });
});

document.addEventListener('click', (event) => {
  if (siteNav?.classList.contains('open') && event.target instanceof Node && !siteNav.contains(event.target) && !menuToggle?.contains(event.target)) {
    closeMenu();
  }
});

navLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));
mobileViewport.addEventListener('change', (event) => {
  if (!event.matches) closeMenu();
});

const sections = [...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach((section) => sectionObserver.observe(section));

  if (prefersReducedMotion.matches) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -3% 0px' });
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  }
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

let scrollFrame = 0;
function updateScrollUI() {
  scrollFrame = 0;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
  if (readingProgress) readingProgress.style.transform = `scaleX(${progress})`;
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 12);
  backToTop?.classList.toggle('is-visible', window.scrollY > 520);
}

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
window.addEventListener('resize', () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });
updateScrollUI();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
});

const heroArt = document.querySelector('.hero-art');
if (heroArt && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion.matches) {
  let pointerFrame = 0;
  let pointer = null;
  const resetParallax = () => {
    heroArt.style.setProperty('--offset-x', '0px');
    heroArt.style.setProperty('--offset-y', '0px');
  };
  heroArt.addEventListener('pointermove', (event) => {
    pointer = event;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!pointer) return;
      const bounds = heroArt.getBoundingClientRect();
      const x = (pointer.clientX - bounds.left) / bounds.width - 0.5;
      const y = (pointer.clientY - bounds.top) / bounds.height - 0.5;
      heroArt.style.setProperty('--offset-x', `${(x * 9).toFixed(1)}px`);
      heroArt.style.setProperty('--offset-y', `${(y * 9).toFixed(1)}px`);
    });
  }, { passive: true });
  heroArt.addEventListener('pointerleave', () => {
    pointer = null;
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    resetParallax();
  });
}
