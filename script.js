const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Project filter with a sliding thumb ---------- */
const filter = document.querySelector('.filter');
const buttons = filter.querySelectorAll('button');
const thumb = filter.querySelector('.filter__thumb');
const projects = document.querySelectorAll('.project');

function moveThumb(button) {
  thumb.style.setProperty('--thumb-x', `${button.offsetLeft}px`);
  thumb.style.setProperty('--thumb-w', `${button.offsetWidth}px`);
  filter.dataset.active = button.dataset.filter;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const choice = button.dataset.filter;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    moveThumb(button);

    projects.forEach((project) => {
      const show = choice === 'all' || project.dataset.tags.split(' ').includes(choice);
      if (reduceMotion) { project.hidden = !show; return; }
      if (!show && !project.hidden) {
        project.classList.add('is-leaving');
        setTimeout(() => { project.hidden = true; project.classList.remove('is-leaving'); }, 220);
      } else if (show && project.hidden) {
        setTimeout(() => {
          project.hidden = false;
          project.classList.remove('is-entering');
          void project.offsetWidth; // restart the animation
          project.classList.add('is-entering');
        }, 230);
      }
    });
  });
});

const pressed = filter.querySelector('[aria-pressed="true"]');
document.fonts.ready.then(() => moveThumb(pressed));
window.addEventListener('resize', () => moveThumb(filter.querySelector('[aria-pressed="true"]')));

/* ---------- Scroll progress bar ---------- */
const progress = document.querySelector('.progress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------- Scroll reveal ---------- */
const revealGroups = [
  ['.projects > .project', true],
  ['.timeline > li', true],
  ['.plain > li', true],
  ['.section > h2, .section__head', false],
  ['.coursework, .prose > p', false],
];
revealGroups.forEach(([selector, stagger]) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    if (stagger) el.style.setProperty('--i', i % 2 === 0 ? 0 : 1);
  });
});

/* ---------- Count-up figures ---------- */
function countUp(dd) {
  const match = dd.textContent.trim().match(/^([\d.]+)(.*)$/);
  if (!match) return;
  const target = parseFloat(match[1]);
  const suffix = match[2];
  const decimals = (match[1].split('.')[1] || '').length;
  const duration = 1400;
  const start = performance.now();
  dd.setAttribute('aria-label', dd.textContent.trim());
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    dd.textContent = (target * eased).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  dd.textContent = (0).toFixed(decimals) + suffix;
  requestAnimationFrame(frame);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('is-visible');
    if (el.matches('.figures') && !reduceMotion) el.querySelectorAll('dd').forEach(countUp);
    observer.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .timeline, .figures').forEach((el) => {
  if (reduceMotion) el.classList.add('is-visible');
  else observer.observe(el);
});

/* ---------- Character sheet: tilt and glare that follow the pointer ---------- */
const sheet = document.querySelector('.sheet');
sheet.addEventListener('animationend', () => sheet.classList.add('is-dealt'), { once: true });
if (reduceMotion) sheet.classList.add('is-dealt');

if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  sheet.addEventListener('pointermove', (e) => {
    const r = sheet.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    sheet.classList.remove('is-settling');
    sheet.classList.add('is-tilting', 'is-dealt');
    sheet.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
    sheet.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
    sheet.style.setProperty('--mx', `${x * 100}%`);
    sheet.style.setProperty('--my', `${y * 100}%`);
  });
  sheet.addEventListener('pointerleave', () => {
    sheet.classList.add('is-settling');
    sheet.style.setProperty('--rx', '0deg');
    sheet.style.setProperty('--ry', '0deg');
    setTimeout(() => sheet.classList.remove('is-tilting'), 600);
  });
}
