import React, { useEffect, useRef, useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
  compact?: boolean;
  variant?: 'full' | 'mark-only' | 'horizontal' | 'banner' | 'image';
  theme?: 'light' | 'dark';
  prominent?: boolean;
}

interface MarkProps {
  size?: number;
  className?: string;
  theme?: 'light' | 'dark';
  prominent?: boolean;
  /** Set true when wrapped inside SmartSpaceLogo which already owns role="img" aria-label="SmartSpace logo" */
  decorative?: boolean;
}

/**
 * Official brand asset mapping.
 * Once the user provides transparent PNGs in public/assets/brand/, toggle HAS_TRANSPARENT_BRAND_ASSETS = true.
 * Keeping verified /assets/aistudio/* paths prevents 404 console errors until those files exist on disk.
 */
const HAS_TRANSPARENT_BRAND_ASSETS = false;

export const BRAND_LOGO_ASSETS = {
  mark: HAS_TRANSPARENT_BRAND_ASSETS
    ? '/assets/brand/smartspace-logo-mark-transparent.png'
    : '/assets/aistudio/Logo_w_o_Name_07e7d282.png',
  wordmark: HAS_TRANSPARENT_BRAND_ASSETS
    ? '/assets/brand/smartspace-wordmark-transparent.png'
    : '/assets/aistudio/Logo_w__Name_00c2f4c4.png',
  lockup: HAS_TRANSPARENT_BRAND_ASSETS
    ? '/assets/brand/smartspace-logo-lockup-transparent.png'
    : '/assets/aistudio/Logo_w__Name_00c2f4c4.png',
  banner: '/assets/aistudio/3_3463e729.png',
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Animated 3D Stacked SmartSpace Brand Mark
 * - Small sizes (size <= 40, e.g. header/sidebar): 6 layers, no float.
 * - Large sizes (size > 40 or prominent, e.g. login/landing): 22 layers, Z-depth extrusion,
 *   pointer-follow tilt, idle sway & gentle float, masked/surface shine sweep, and soft ambient glow.
 * - Strictly honours prefers-reduced-motion (renders completely static).
 */
export const SmartSpaceMark: React.FC<MarkProps> = ({
  size = 38,
  className = '',
  theme = 'light',
  prominent = false,
  decorative = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [tilt, setTilt] = useState<{ rx: number; ry: number; hovering: boolean }>({
    rx: 0,
    ry: 0,
    hovering: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const isLarge = prominent || size > 40;
  const layerCount = isLarge ? 22 : 6;
  const depthStep = isLarge ? 0.85 : 0.65;
  const maxTiltDeg = isLarge ? 13 : 7;

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const handleError = () => setHasError(true);
    el.addEventListener('error', handleError);
    if (el.complete && el.naturalWidth === 0) {
      setHasError(true);
    }
    return () => el.removeEventListener('error', handleError);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 .. 1
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 .. 1
    setTilt({
      rx: Math.max(-maxTiltDeg, Math.min(maxTiltDeg, -ny * maxTiltDeg)),
      ry: Math.max(-maxTiltDeg, Math.min(maxTiltDeg, nx * maxTiltDeg)),
      hovering: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, hovering: false });
  };

  const wrapperA11yProps = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': 'SmartSpace logo' };

  if (hasError) {
    return (
      <div
        {...wrapperA11yProps}
        className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M 50 20 C 65 20 80 32 80 48 C 80 62 68 72 50 80 C 35 72 20 62 20 48 C 20 32 35 20 50 20 Z"
            fill="#0077C8"
          />
          <circle cx="35" cy="45" r="14" fill="#EE2726" />
          <circle cx="65" cy="45" r="14" fill="#FDB813" />
          <circle cx="50" cy="65" r="14" fill="#8CC63F" />
        </svg>
      </div>
    );
  }

  const layers = Array.from({ length: layerCount }, (_, idx) => idx);
  const borderRadius = isLarge ? '24%' : '22%';
  const isDarkSurface = theme === 'dark';

  return (
    <div
      ref={containerRef}
      {...wrapperA11yProps}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
      onPointerLeave={prefersReducedMotion ? undefined : handlePointerLeave}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        perspective: isLarge ? '900px' : '600px',
      }}
    >
      {/* Soft ambient glow underneath large logo */}
      {isLarge && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full blur-md ${
            prefersReducedMotion ? '' : 'smartspace-logo-glow'
          }`}
          style={{
            width: `${Math.round(size * 0.86)}px`,
            height: `${Math.max(10, Math.round(size * 0.22))}px`,
            background: isDarkSurface
              ? 'radial-gradient(ellipse at center, rgba(0, 119, 200, 0.55) 0%, rgba(140, 198, 63, 0.28) 50%, rgba(11, 21, 40, 0) 75%)'
              : 'radial-gradient(ellipse at center, rgba(0, 119, 200, 0.34) 0%, rgba(11, 21, 40, 0.14) 55%, rgba(11, 21, 40, 0) 75%)',
          }}
        />
      )}

      {/* Float wrapper (only on large/prominent logos and when motion is allowed) */}
      <div
        aria-hidden="true"
        className={`relative w-full h-full ${
          isLarge && !prefersReducedMotion ? 'smartspace-logo-float' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Idle sway wrapper (disabled while actively hovering or reduced motion) */}
        <div
          aria-hidden="true"
          className={`relative w-full h-full ${
            isLarge && !prefersReducedMotion && !tilt.hovering ? 'smartspace-logo-sway' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: prefersReducedMotion
              ? 'none'
              : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: tilt.hovering
              ? 'transform 110ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Extruded back depth slices (back-to-front) */}
          {layers.slice(1).reverse().map((layerIndex) => {
            const zOffset = -layerIndex * depthStep;
            const ratio = layerIndex / Math.max(1, layerCount - 1);
            const brightness = Math.max(0.42, 0.96 - ratio * 0.52);

            if (HAS_TRANSPARENT_BRAND_ASSETS) {
              return (
                <img
                  key={layerIndex}
                  src={BRAND_LOGO_ASSETS.mark}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 w-full h-full object-contain"
                  style={{
                    transform: `translateZ(${zOffset.toFixed(2)}px)`,
                    filter: `brightness(${brightness.toFixed(3)})`,
                    opacity: ratio > 0.85 ? 0.65 : 0.92,
                  }}
                />
              );
            }

            // For opaque square logo source, extrude a smooth chamfered tile backing so no grey box appears
            return (
              <div
                key={layerIndex}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  borderRadius,
                  transform: `translateZ(${zOffset.toFixed(2)}px)`,
                  backgroundColor: isDarkSurface
                    ? `rgba(${Math.round(30 * brightness + 11)}, ${Math.round(58 * brightness + 21)}, ${Math.round(108 * brightness + 40)}, 0.95)`
                    : `rgb(${Math.round(226 * brightness)}, ${Math.round(232 * brightness)}, ${Math.round(240 * brightness)})`,
                }}
              />
            );
          })}

          {/* Front artwork face at Z = 0 */}
          <div
            aria-hidden="true"
            className={`relative w-full h-full overflow-hidden ${
              HAS_TRANSPARENT_BRAND_ASSETS
                ? ''
                : isDarkSurface
                ? 'bg-white ring-1 ring-white/25 shadow-md'
                : 'bg-white ring-1 ring-slate-200/90 shadow-xs'
            }`}
            style={{
              borderRadius: HAS_TRANSPARENT_BRAND_ASSETS ? undefined : borderRadius,
              transform: 'translateZ(0px)',
            }}
          >
            <img
              ref={imgRef}
              src={BRAND_LOGO_ASSETS.mark}
              alt=""
              aria-hidden="true"
              width={size}
              height={size}
              draggable={false}
              className={`w-full h-full object-contain select-none ${
                HAS_TRANSPARENT_BRAND_ASSETS ? '' : 'p-[4%]'
              }`}
              loading="eager"
            />

            {/* Soft diagonal shine sweep masked to silhouette or front face */}
            {!prefersReducedMotion && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={
                  HAS_TRANSPARENT_BRAND_ASSETS
                    ? {
                        WebkitMaskImage: `url(${BRAND_LOGO_ASSETS.mark})`,
                        maskImage: `url(${BRAND_LOGO_ASSETS.mark})`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                      }
                    : { borderRadius }
                }
              >
                <div
                  className="smartspace-logo-shine absolute -inset-y-4 w-1/2"
                  style={{
                    background:
                      'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.68) 50%, rgba(255,255,255,0) 100%)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SmartSpaceLogo: React.FC<LogoProps> = ({
  className = '',
  size = 38,
  showTagline = true,
  compact = false,
  variant = 'horizontal',
  theme = 'light',
  prominent = false,
}) => {
  const isDark = theme === 'dark';

  if (variant === 'banner') {
    return (
      <div
        role="img"
        aria-label="SmartSpace logo"
        className={`inline-flex flex-col items-start ${className}`}
      >
        <img
          src={BRAND_LOGO_ASSETS.banner}
          alt=""
          aria-hidden="true"
          className="h-auto max-h-16 w-auto object-contain rounded-lg"
        />
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div
        role="img"
        aria-label="SmartSpace logo"
        className={`inline-flex items-center gap-3 ${className}`}
      >
        <SmartSpaceMark size={size} theme={theme} prominent={prominent} decorative={true} />
        <img
          src={BRAND_LOGO_ASSETS.lockup}
          alt=""
          aria-hidden="true"
          style={{ height: `${size * 1.4}px` }}
          className="w-auto object-contain rounded-lg hidden sm:block"
        />
      </div>
    );
  }

  if (variant === 'mark-only') {
    return (
      <SmartSpaceMark
        size={size}
        className={className}
        theme={theme}
        prominent={prominent}
        decorative={false}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label="SmartSpace logo"
      className={`flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 ${className}`}
    >
      <SmartSpaceMark size={size} theme={theme} prominent={prominent} decorative={true} />
      <div aria-hidden="true" className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-black tracking-tight text-lg sm:text-xl font-sans inline-flex items-baseline">
            <span className="text-[#EE2726]">S</span>
            <span className="text-[#F97316]">M</span>
            <span className="text-[#FDB813]">A</span>
            <span className="text-[#FDB813]">R</span>
            <span className="text-[#FDB813]">T</span>
            <span className="text-[#0077C8]">S</span>
            <span className="text-[#8CC63F]">P</span>
            <span className="text-[#8CC63F]">A</span>
            <span className="text-[#8CC63F]">C</span>
            <span className="text-[#8CC63F]">E</span>
          </span>
          {!compact && (
            <span
              className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                isDark
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              SaaS
            </span>
          )}
        </div>
        {showTagline && !compact && (
          <span
            className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase italic pt-1 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            BOOK IT, TRACK IT, USE IT.
          </span>
        )}
      </div>
    </div>
  );
};

export default SmartSpaceLogo;
