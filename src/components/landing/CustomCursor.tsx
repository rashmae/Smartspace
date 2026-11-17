import React, { useEffect, useRef, useState } from 'react';

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], summary, select, label[for], input[type="checkbox"], input[type="radio"]';
const TEXT_INPUT_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, [contenteditable="true"]';

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const finePointerMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluate = () => {
      setEnabled(finePointerMq.matches && !reducedMotionMq.matches);
    };

    evaluate();
    finePointerMq.addEventListener('change', evaluate);
    reducedMotionMq.addEventListener('change', evaluate);
    return () => {
      finePointerMq.removeEventListener('change', evaluate);
      reducedMotionMq.removeEventListener('change', evaluate);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let visible = false;
    let overClickable = false;
    let overTextInput = false;
    let pressed = false;

    const updateVisualState = () => {
      const el = dotRef.current;
      if (!el) return;

      const size = pressed ? 44 : overClickable ? 38 : 26;
      const show = visible && !overTextInput;

      el.style.opacity = show ? '1' : '0';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = pressed ? 'transparent' : 'rgba(11, 21, 40, 0.5)';
      el.style.border = pressed
        ? '2px solid rgba(11, 21, 40, 0.72)'
        : overClickable
        ? '1px solid rgba(255, 255, 255, 0.45)'
        : '1px solid rgba(255, 255, 255, 0.25)';
      el.style.transform = `translate3d(${(currentX - size / 2).toFixed(1)}px, ${(currentY - size / 2).toFixed(1)}px, 0)`;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;
      updateVisualState();

      if (Math.abs(targetX - currentX) > 0.15 || Math.abs(targetY - currentY) > 0.15) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        currentX = targetX;
        currentY = targetY;
        updateVisualState();
        rafId = 0;
      }
    };

    const scheduleTick = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') {
        visible = false;
        updateVisualState();
        return;
      }

      if (!visible) {
        currentX = e.clientX;
        currentY = e.clientY;
      }
      targetX = e.clientX;
      targetY = e.clientY;
      visible = true;

      const target = e.target as Element | null;
      overTextInput = Boolean(target?.closest(TEXT_INPUT_SELECTOR));
      overClickable = !overTextInput && Boolean(target?.closest(CLICKABLE_SELECTOR));
      scheduleTick();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      pressed = true;
      updateVisualState();
    };

    const handlePointerUp = () => {
      pressed = false;
      updateVisualState();
    };

    const handleMouseLeave = () => {
      visible = false;
      pressed = false;
      updateVisualState();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[90] rounded-full pointer-events-none"
      style={{
        width: '26px',
        height: '26px',
        opacity: 0,
        willChange: 'transform, opacity',
        transition:
          'width 180ms cubic-bezier(0.16, 1, 0.3, 1), height 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, border-color 150ms ease, opacity 180ms ease',
      }}
    />
  );
};
