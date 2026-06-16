// ── PHOTO STACK ──
const photoStack = document.getElementById('photoStack');
if (photoStack) {
  const POSITIONS = [
    { left: '20px',  top: '70px',  rotate: -12, z: 1, scale: 0.92 },
    { left: '80px',  top: '40px',  rotate:  6,  z: 2, scale: 0.95 },
    { left: '110px', top: '20px',  rotate: -3,  z: 3, scale: 0.98 },
    { left: '75px',  top: '35px',  rotate:  0,  z: 4, shadow: '0 30px 90px rgba(0,0,0,0.75)', scale: 1.05 },
  ];

  function applyPositions() {
    const cards = Array.from(photoStack.querySelectorAll('.card'));
    cards.forEach((card, i) => {
      const p = POSITIONS[i];
      card.style.left   = p.left;
      card.style.top    = p.top;
      card.style.zIndex = p.z;
      card.style.boxShadow = p.shadow || 'none';
      card.dataset.rotate  = p.rotate;
      card.style.setProperty('--base-transform', `rotate(${p.rotate}deg) scale(${p.scale || 1})`);
      if (!card.classList.contains('send-back')) {
        card.style.transform = `rotate(${p.rotate}deg) scale(${p.scale || 1})`;
      }
    });
  }

  applyPositions();

  let frontCard = null;

  photoStack.addEventListener('click', e => {
    const cards = Array.from(photoStack.querySelectorAll('.card'));
    const clicked = e.target.closest('.card') || cards[cards.length - 1];
    if (!clicked || clicked.classList.contains('send-back')) return;

    if (frontCard === clicked) {
      clicked.classList.remove('pop');
      clicked.classList.add('send-back');
      frontCard = null;

      clicked.addEventListener('animationend', () => {
        clicked.classList.remove('send-back');
        photoStack.insertBefore(clicked, cards[0]);
        applyPositions();
      }, { once: true });
      return;
    }

    if (frontCard && frontCard !== clicked) {
      frontCard.classList.remove('pop');
    }

    clicked.classList.add('pop');
    frontCard = clicked;
  });
}

// ── DYNAMIC SPRINKLE SYSTEM ──
const COLORS = ['#00e5ff', '#00b0ff', '#2979ff', '#00e676', '#1de9b6', '#0091ea', '#00bfa5'];

function createSingleSprinkle(x, y, isSpreadMode = false) {
  const el = document.createElement('div');
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = Math.random() * 10 + 5;
  const isRect = Math.random() > 0.35;

  el.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${isRect ? size : size * 0.7}px;
    height: ${isRect ? size * 0.55 : size * 0.7}px;
    background: ${color};
    border-radius: ${isRect ? '2px' : '50%'};
    pointer-events: none;
    z-index: 99999;
    transform-origin: center;
    opacity: 0.9;
  `;
  document.body.appendChild(el);

  const angle = Math.random() * Math.PI * 2;
  const speed = isSpreadMode ? (Math.random() * 140 + 60) : (Math.random() * 220 + 100);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed - (isSpreadMode ? (Math.random() * 40) : (Math.random() * 100 + 50));
  const rot = Math.random() * 720 - 360;
  const duration = Math.random() * 400 + 600;
  const start = performance.now();

  function animate(now) {
    const t = (now - start) / duration;
    if (t >= 1) { el.remove(); return; }
    const gravity = 180 * t * t;
    const cx = x + vx * t;
    const cy = y + vy * t + gravity;
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.opacity = (1 - t).toFixed(2);
    el.style.transform = `rotate(${rot * t}deg) scale(${1 - t * 0.5})`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

document.addEventListener('click', e => {
  if (!e.target.closest('a, button')) {
    const count = 28;
    for (let i = 0; i < count; i++) {
      createSingleSprinkle(e.clientX, e.clientY, false);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const showreelBtn = document.querySelector('.btn-primary');
  let hoverInterval = null;

  if (showreelBtn) {
    showreelBtn.addEventListener('mousemove', (e) => {
      createSingleSprinkle(e.clientX, e.clientY, true);
    });

    showreelBtn.addEventListener('mouseenter', () => {
      hoverInterval = setInterval(() => {
        const rect = showreelBtn.getBoundingClientRect();
        const randomX = rect.left + Math.random() * rect.width;
        const randomY = rect.top + Math.random() * rect.height;
        createSingleSprinkle(randomX, randomY, true);
      }, 60);
    });

    showreelBtn.addEventListener('mouseleave', () => {
      if (hoverInterval) {
        clearInterval(hoverInterval);
        hoverInterval = null;
      }
    });
  }
});

// ── CUSTOM CURSOR ──
const cursorDot = document.getElementById('cursor-dot');
const trailContainer = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;
let curX = 0, curY = 0;
const TRAIL_LENGTH = 5;
const trail = [];

for (let i = 0; i < TRAIL_LENGTH; i++) {
  const d = document.createElement('div');
  d.className = 'trail-dot';
  d.style.opacity = (1 - i / TRAIL_LENGTH) * 0.4;
  d.style.width = d.style.height = (6 - i * 0.5) + 'px';
  trailContainer.appendChild(d);
  trail.push({ el: d, x: 0, y: 0 });
}

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const hoverTargets = 'a, button, .work-card, .reel-card, .social-btn, .nav-theme';
document.addEventListener('mouseover', e => {
  if (e.target.closest(hoverTargets)) cursorDot.classList.add('hovering');
});
document.addEventListener('mouseout', e => {
  if (e.target.closest(hoverTargets)) cursorDot.classList.remove('hovering');
});

document.addEventListener('mousedown', () => cursorDot.classList.add('clicking'));
document.addEventListener('mouseup', () => cursorDot.classList.remove('clicking'));

function animateCursor() {
  curX += (mouseX - curX) * 0.18;
  curY += (mouseY - curY) * 0.18;
  cursorDot.style.transform = `translate(${curX}px, ${curY}px)`;

  trail.forEach((t, i) => {
    if (i === 0) {
      t.x += (curX - t.x) * 0.35;
      t.y += (curY - t.y) * 0.35;
    } else {
      t.x += (trail[i-1].x - t.x) * 0.35;
      t.y += (trail[i-1].y - t.y) * 0.35;
    }
    t.el.style.transform = `translate(${t.x - 3}px, ${t.y - 3}px)`;
  });

  requestAnimationFrame(animateCursor);
}
animateCursor();

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

window.addEventListener('load', () => {
  document.querySelectorAll('#home .reveal, #home .reveal-left, #home .reveal-right').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 200);
  });
});

function setActive(el) {
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

let dark = true;
function toggleTheme() {
  dark = !dark;
  document.body.classList.toggle('light', !dark);
  document.querySelector('.nav-theme').textContent = dark ? '🌙' : '☀️';
}

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

function handleSend() {
  const name = document.querySelector('input[placeholder="Your Name"]').value.trim();
  const email = document.querySelector('input[placeholder="Your Email"]').value.trim();
  const msg = document.querySelector('.form-textarea').value.trim();
  if (!name || !email || !msg) { alert('Please fill all fields.'); return; }
  alert(`Thanks ${name}! Message sent. I'll get back to you at ${email} soon.`);
}

const reelModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.getElementById('videoModalClose');

function openVideoModal(src) {
  if (!src) return;
  modalVideo.src = src;
  modalVideo.currentTime = 0;
  modalVideo.play().catch(() => {});
  reelModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  if (!reelModal.classList.contains('open')) return;
  reelModal.classList.remove('open');
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  modalVideo.load();
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeVideoModal);
reelModal.addEventListener('click', e => {
  if (e.target === reelModal) closeVideoModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeVideoModal();
});

document.querySelectorAll('.reel-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    e.stopPropagation();
    const url = overlay.dataset.url;
    if (url) window.open(url, '_blank');
  });
});

const reelsTrack = document.getElementById('reelsTrack');
if (reelsTrack) {
  reelsTrack.querySelectorAll('.reel-card.cloned').forEach(c => c.remove());
  const origCards = Array.from(reelsTrack.querySelectorAll('.reel-card'));
  origCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('cloned');
    reelsTrack.appendChild(clone);
  });

  reelsTrack.querySelectorAll('.reel-card').forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;
    video.muted = true;
    video.loop = true;
    video.preload = 'auto';
    video.play().catch(() => {});
  });

  reelsTrack.querySelectorAll('.reel-card.cloned .reel-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      e.stopPropagation();
      const url = overlay.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

(function curveEffect() {
  const wrapper = document.querySelector('.reels-track-wrapper');
  const track   = document.getElementById('reelsTrack');
  if (!wrapper || !track) return;

  function update() {
    const wLeft   = wrapper.getBoundingClientRect().left;
    const wCenter = wLeft + wrapper.offsetWidth / 2;
    const maxDist = wrapper.offsetWidth * 0.6;

    track.querySelectorAll('.reel-card').forEach((card) => {
      const r    = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = cardCenter - wCenter;
      const absDist = Math.abs(dist);
      const ratio = Math.max(0, 1 - absDist / maxDist);
      const sc   = 0.78 + (ratio * 0.24);
      const op   = 0.50 + (ratio * 0.50);
      const maxRotation = 12;
      let rot = (dist / maxDist) * maxRotation;
      if (rot > maxRotation) rot = maxRotation;
      if (rot < -maxRotation) rot = -maxRotation;
      const ty   = (1 - ratio) * 45;

      if (!card.matches(':hover')) {
        card.style.transform = `translateY(${ty}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        card.style.opacity   = op.toFixed(3);
      }
    });
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
