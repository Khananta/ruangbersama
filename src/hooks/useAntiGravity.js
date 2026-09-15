import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Custom hook to apply smooth GSAP anti-gravity floating effect to an element ref
 */
export const useAntiGravity = (options = {}) => {
  const elementRef = useRef(null);

  const {
    floatDistance = 8,
    duration = 3.5,
    delay = Math.random() * 2,
    enableHoverTilt = true
  } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // 1. Idle Floating Animation (Anti-gravity sine wave)
    const floatTween = gsap.to(el, {
      y: `-=${floatDistance}`,
      rotation: (Math.random() - 0.5) * 2,
      duration: duration + Math.random() * 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: delay
    });

    // 2. Hover micro-interaction levitation
    const handleMouseEnter = () => {
      gsap.to(el, {
        y: -12,
        scale: 1.02,
        boxShadow: '0 20px 30px -10px rgba(132, 144, 121, 0.25)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        y: 0,
        scale: 1,
        boxShadow: '0 8px 24px -6px rgba(58, 90, 64, 0.08)',
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    // 3. Mouse Tilt Parallax
    const handleMouseMove = (e) => {
      if (!enableHoverTilt) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(el, {
        rotateX: -y * 0.03,
        rotateY: x * 0.03,
        duration: 0.3,
        ease: 'power1.out'
      });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    if (enableHoverTilt) {
      el.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      floatTween.kill();
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (enableHoverTilt) {
        el.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [floatDistance, duration, delay, enableHoverTilt]);

  return elementRef;
};
