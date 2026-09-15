import gsap from 'gsap';
import confetti from 'canvas-confetti';

/**
 * Triggers a particle burst of floating hearts using GSAP
 * @param {MouseEvent} event 
 */
export const triggerFloatingHearts = (event) => {
  if (typeof window === 'undefined') return;

  const x = event ? event.clientX : window.innerWidth / 2;
  const y = event ? event.clientY : window.innerHeight / 2;

  const hearts = ['💖', '✨', '🌿', '🤍', '🌸', '💌'];

  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.className = 'floating-heart-particle text-xl font-bold select-none';
    el.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    document.body.appendChild(el);

    const offsetX = (Math.random() - 0.5) * 60;
    gsap.set(el, {
      x: x + offsetX,
      y: y,
      opacity: 1,
      scale: 0.6 + Math.random() * 0.8,
      rotation: (Math.random() - 0.5) * 40
    });

    gsap.to(el, {
      y: y - (100 + Math.random() * 120),
      x: x + offsetX + (Math.random() - 0.5) * 80,
      opacity: 0,
      rotation: (Math.random() - 0.5) * 120,
      duration: 1.4 + Math.random() * 0.8,
      ease: 'power2.out',
      onComplete: () => {
        if (document.body.contains(el)) {
          document.body.removeChild(el);
        }
      }
    });
  }

  confetti({
    particleCount: 25,
    spread: 60,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#849079', '#A3B18A', '#D97757', '#F5EFE6', '#E8AA93'],
    scalar: 0.9,
    disableForReducedMotion: true
  });
};

/**
 * Animate reaction floating toast for partner interaction
 */
export const triggerPartnerReactionAnim = (emoji = '❤️', targetElement) => {
  if (typeof window === 'undefined') return;

  const rect = targetElement ? targetElement.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
  const startX = rect.left + rect.width / 2;
  const startY = rect.top;

  const toast = document.createElement('div');
  toast.className = 'floating-heart-particle font-bold px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-stone-700 text-sm shadow-lg flex items-center gap-1.5 z-[9999] border border-stone-200';
  toast.innerHTML = `<span>${emoji}</span> <span class="text-xs font-semibold text-emerald-700">Dikirim!</span>`;
  document.body.appendChild(toast);

  gsap.set(toast, {
    x: startX - 40,
    y: startY,
    opacity: 0,
    scale: 0.5
  });

  gsap.timeline()
    .to(toast, {
      opacity: 1,
      scale: 1,
      y: startY - 20,
      duration: 0.3,
      ease: 'back.out(1.7)'
    })
    .to(toast, {
      y: startY - 70,
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      ease: 'power2.in',
      delay: 0.4,
      onComplete: () => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }
    });
};
