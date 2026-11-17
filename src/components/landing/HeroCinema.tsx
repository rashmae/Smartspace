import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Pause, Play, Presentation } from 'lucide-react';
import { FACILITY_IMAGES } from '../../data/facilityImages';
import { Institution } from '../../types';
import { FloatingSearchBar, VenueCategoryChip } from './FloatingSearchBar';

const CLOUDS_IMAGE_PATH =
  '/assets/aistudio/a03093f2-14a1-48bf-b5b2-0a958b8d6141_7535755_494cda3e.png';

interface HeroSlideSpec {
  id: string;
  imageUrl: string;
  imageAlt: string;
  objectPosition: string;
  titleLines: string[];
  titleSizeVw: number;
  titleLeftVw: number;
  titleTopExpr: string;
  titleLineHeight: number;
  captionTitle: string;
  captionBody: string;
  litThumbSlot: 0 | 1 | 2; // 0 = top, 1 = middle, 2 = bottom
  thumbLabel: string;
}

const HERO_SLIDES: HeroSlideSpec[] = [
  {
    id: 'tennis-courts',
    imageUrl: FACILITY_IMAGES.tennisCourts,
    imageAlt: 'Campus varsity tennis hardcourts illuminated under sunset skies (Illustrative image)',
    objectPosition: 'center 55%',
    titleLines: ['WELCOME TO SMARTSPACE'],
    titleSizeVw: 8.25,
    titleLeftVw: 2.6,
    titleTopExpr: 'calc(74px + 3.2vh)',
    titleLineHeight: 0.9,
    captionTitle: 'Every campus space',
    captionBody:
      'Discover, reserve and manage university facilities across participating campuses.',
    litThumbSlot: 2, // bottom thumbnail
    thumbLabel: 'Show tennis courts slide',
  },
  {
    id: 'auditorium',
    imageUrl: FACILITY_IMAGES.auditorium,
    imageAlt: 'University cultural auditorium stage and tiered acoustic seating (Illustrative image)',
    objectPosition: 'center 50%',
    titleLines: ['FIND YOUR VENUE'],
    titleSizeVw: 8.25,
    titleLeftVw: 2.6,
    titleTopExpr: 'calc(74px + 3.2vh)',
    titleLineHeight: 0.9,
    captionTitle: 'Find your venue',
    captionBody:
      'Auditoriums, gymnasiums, courts, laboratories and lecture halls in one searchable place.',
    litThumbSlot: 1, // middle thumbnail
    thumbLabel: 'Show auditorium slide',
  },
  {
    id: 'computing-lab',
    imageUrl: FACILITY_IMAGES.computingLab,
    imageAlt: 'Modern university computing laboratory with workstation rows (Illustrative image)',
    objectPosition: 'center 50%',
    titleLines: ['BOOK IT.', 'USE IT.'],
    titleSizeVw: 9.6,
    titleLeftVw: 7,
    titleTopExpr: 'calc(74px + 5vh)',
    titleLineHeight: 0.95,
    captionTitle: 'Book with confidence',
    captionBody:
      'A clear approval path and a QR gate pass, with conflicts caught before you request.',
    litThumbSlot: 0, // top thumbnail
    thumbLabel: 'Show computing lab slide',
  },
];

// Slot-to-slide vertical order: top = slide 2 (computingLab), middle = slide 1 (auditorium), bottom = slide 0 (tennisCourts)
const THUMB_SLOTS: { slotIndex: 0 | 1 | 2; slideIndex: number }[] = [
  { slotIndex: 0, slideIndex: 2 },
  { slotIndex: 1, slideIndex: 1 },
  { slotIndex: 2, slideIndex: 0 },
];

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface HeroCinemaProps {
  heroRef: React.RefObject<HTMLDivElement | null>;
  institutions: Institution[];
  campus: string;
  onCampusChange: (campusId: string) => void;
  venueType: VenueCategoryChip;
  onVenueTypeChange: (type: VenueCategoryChip) => void;
  dateISO: string;
  onDateChange: (dateISO: string) => void;
  peopleCount: number;
  onPeopleCountChange: (count: number) => void;
  onSearch: () => void;
  onRequestDemo: () => void;
  onExploreFacilities: () => void;
  onOpenExecutiveDeck: () => void;
}

export const HeroCinema: React.FC<HeroCinemaProps> = ({
  heroRef,
  institutions,
  campus,
  onCampusChange,
  venueType,
  onVenueTypeChange,
  dateISO,
  onDateChange,
  peopleCount,
  onPeopleCountChange,
  onSearch,
  onRequestDemo,
  onExploreFacilities,
  onOpenExecutiveDeck,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [wipeProgress, setWipeProgress] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [cloudImageError, setCloudImageError] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 900
  );

  // Refs updated on rAF for smooth scroll choreography & pointer parallax without full re-renders
  const slideStackRef = useRef<HTMLDivElement>(null);
  const bottomCloudsRef = useRef<HTMLDivElement>(null);
  const topCloudsRef = useRef<HTMLDivElement>(null);
  const railParallaxRef = useRef<HTMLDivElement>(null);
  const activePhotoRef = useRef<HTMLImageElement | null>(null);
  const ringsTiltRef = useRef<HTMLDivElement>(null);

  const wipeRafRef = useRef<number>(0);
  const pointerTargetRef = useRef({ nx: 0, ny: 0 });
  const pointerCurrentRef = useRef({ nx: 0, ny: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMqChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onMqChange);

    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const onVisibility = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibility);

    const heroEl = heroRef.current;
    const onEnter = () => setIsHoveringHero(true);
    const onLeave = () => setIsHoveringHero(false);
    heroEl?.addEventListener('mouseenter', onEnter);
    heroEl?.addEventListener('mouseleave', onLeave);

    return () => {
      mq.removeEventListener('change', onMqChange);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      heroEl?.removeEventListener('mouseenter', onEnter);
      heroEl?.removeEventListener('mouseleave', onLeave);
    };
  }, [heroRef]);

  // Force static slide 1 under prefers-reduced-motion
  useEffect(() => {
    if (prefersReducedMotion) {
      if (wipeRafRef.current) window.cancelAnimationFrame(wipeRafRef.current);
      setActiveIndex(0);
      setOutgoingIndex(null);
      setWipeProgress(1);
    }
  }, [prefersReducedMotion]);

  const startSlideTransition = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeIndex) return;
      if (prefersReducedMotion) {
        setActiveIndex(nextIndex);
        setOutgoingIndex(null);
        setWipeProgress(1);
        return;
      }

      if (wipeRafRef.current) window.cancelAnimationFrame(wipeRafRef.current);
      setOutgoingIndex(activeIndex);
      setActiveIndex(nextIndex);
      setWipeProgress(0);

      const startTime = performance.now();
      const duration = 1250;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const rawP = Math.min(1, elapsed / duration);
        const easedP = easeInOutCubic(rawP);
        setWipeProgress(easedP);
        if (rawP < 1) {
          wipeRafRef.current = window.requestAnimationFrame(step);
        } else {
          setOutgoingIndex(null);
          wipeRafRef.current = 0;
        }
      };

      wipeRafRef.current = window.requestAnimationFrame(step);
    },
    [activeIndex, prefersReducedMotion]
  );

  // Clean up wipe animation on unmount
  useEffect(() => {
    return () => {
      if (wipeRafRef.current) window.cancelAnimationFrame(wipeRafRef.current);
    };
  }, []);

  // Autoplay every 5.2s when active
  useEffect(() => {
    if (
      prefersReducedMotion ||
      isPaused ||
      isHoveringHero ||
      isFocusWithin ||
      isTabHidden
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      startSlideTransition((activeIndex + 1) % HERO_SLIDES.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [
    activeIndex,
    isPaused,
    isHoveringHero,
    isFocusWithin,
    isTabHidden,
    prefersReducedMotion,
    startSlideTransition,
  ]);

  // Scroll choreography + pointer parallax loop (transform & opacity only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyTransforms = () => {
      const sy = prefersReducedMotion ? 0 : window.scrollY;
      const vh = Math.max(1, window.innerHeight);

      if (slideStackRef.current) {
        slideStackRef.current.style.transform = prefersReducedMotion
          ? 'none'
          : `translate3d(0, ${(0.42 * sy).toFixed(2)}px, 0)`;
      }

      if (bottomCloudsRef.current) {
        const cloudScale = 1 + (0.35 * sy) / vh;
        bottomCloudsRef.current.style.transform = prefersReducedMotion
          ? 'none'
          : `translate3d(0, ${(-0.38 * sy).toFixed(2)}px, 0) scale(${cloudScale.toFixed(4)})`;
      }

      if (topCloudsRef.current) {
        const topOpacity = prefersReducedMotion ? 0 : Math.min(0.65, sy / (vh * 0.55));
        topCloudsRef.current.style.opacity = topOpacity.toFixed(3);
      }

      if (railParallaxRef.current) {
        const railOpacity = prefersReducedMotion
          ? 1
          : Math.max(0, 1 - sy / (vh * 0.5));
        railParallaxRef.current.style.transform = prefersReducedMotion
          ? 'none'
          : `translate3d(0, ${(0.2 * sy).toFixed(2)}px, 0)`;
        railParallaxRef.current.style.opacity = railOpacity.toFixed(3);
      }
    };

    let parallaxRaf = 0;
    const tickParallax = () => {
      const cur = pointerCurrentRef.current;
      const tgt = pointerTargetRef.current;
      cur.nx += (tgt.nx - cur.nx) * 0.1;
      cur.ny += (tgt.ny - cur.ny) * 0.1;

      if (!prefersReducedMotion) {
        if (ringsTiltRef.current) {
          const rx = (-cur.ny * 2).toFixed(2);
          const ry = (cur.nx * 2).toFixed(2);
          ringsTiltRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        }
        if (activePhotoRef.current && wipeProgress >= 1) {
          const px = (cur.nx * 0.6).toFixed(3);
          const py = (cur.ny * 0.5).toFixed(3);
          activePhotoRef.current.style.setProperty('--px', `${px}%`);
          activePhotoRef.current.style.setProperty('--py', `${py}%`);
        }
      }

      if (Math.abs(tgt.nx - cur.nx) > 0.002 || Math.abs(tgt.ny - cur.ny) > 0.002) {
        parallaxRaf = window.requestAnimationFrame(tickParallax);
      } else {
        parallaxRaf = 0;
      }
    };

    const onScroll = () => {
      window.requestAnimationFrame(applyTransforms);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion || e.pointerType === 'touch') return;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      pointerTargetRef.current = {
        nx: (e.clientX / w - 0.5) * 2,
        ny: (e.clientY / h - 0.5) * 2,
      };
      if (!parallaxRaf) {
        parallaxRaf = window.requestAnimationFrame(tickParallax);
      }
    };

    applyTransforms();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      if (parallaxRaf) window.cancelAnimationFrame(parallaxRaf);
    };
  }, [prefersReducedMotion, wipeProgress]);

  const currentSlide = HERO_SLIDES[activeIndex];
  const isWiping = outgoingIndex !== null && wipeProgress < 1;

  // Responsive metric calculation for the thumbnail rail
  const railGeometry = useMemo(() => {
    const heroHeight = Math.max(680, viewportHeight);
    const activeSize = Math.min(190, Math.max(96, viewportWidth * 0.113));
    const inactiveSize = Math.min(92, Math.max(46, viewportWidth * 0.054));
    const gap = Math.max(8, viewportWidth * 0.009);
    const railTopBase = 74 + heroHeight * 0.085;
    const centerX = viewportWidth * 0.855;
    const activeSlot = currentSlide.litThumbSlot;

    let cursorY = railTopBase;
    const positions: Record<number, { top: number; left: number; size: number; isActive: boolean }> = {};

    THUMB_SLOTS.forEach((slot) => {
      const isActive = slot.slotIndex === activeSlot;
      const size = isActive ? activeSize : inactiveSize;
      positions[slot.slideIndex] = {
        top: cursorY,
        left: centerX - size / 2,
        size,
        isActive,
      };
      cursorY += size + gap;
    });

    const activePos = positions[activeIndex];
    const activeCenterY = activePos.top + activePos.size / 2;
    const ring1Diameter = activePos.size + viewportWidth * 0.1;
    const ring2Diameter = activePos.size + viewportWidth * 0.216;
    const connectorWidth = Math.max(24, viewportWidth * 0.047);
    const captionBarHeight = Math.max(84, heroHeight * 0.065);

    return {
      positions,
      centerX,
      activeCenterY,
      activePos,
      ring1Diameter,
      ring2Diameter,
      connectorWidth,
      captionBarHeight,
    };
  }, [viewportWidth, viewportHeight, currentSlide.litThumbSlot, activeIndex]);

  // Wipe gradient stops
  const p135 = wipeProgress * 135;
  const opaqueStop = Math.max(0, Math.min(100, p135 - 35));
  const midStop = Math.max(0, Math.min(100, p135 - 17.5));
  const transparentStop = Math.max(0, Math.min(100, p135));
  const wipeMaskImage = isWiping
    ? `linear-gradient(to left, rgba(0,0,0,1) ${opaqueStop.toFixed(2)}%, rgba(0,0,0,0.6) ${midStop.toFixed(2)}%, rgba(0,0,0,0) ${transparentStop.toFixed(2)}%)`
    : undefined;

  const renderSlideLayer = (
    slideIdx: number,
    layerKind: 'outgoing' | 'active'
  ) => {
    const slide = HERO_SLIDES[slideIdx];
    const isIncoming = layerKind === 'active';

    const photoScale = isIncoming
      ? isWiping
        ? 1.12 - 0.08 * wipeProgress
        : 1.04
      : 1.04 + 0.05 * wipeProgress;

    const zIndex = isIncoming ? 4 : 2;
    const isSlideOneEager = slideIdx === 0;

    return (
      <div
        key={`${slide.id}-${layerKind}`}
        className="absolute inset-0 overflow-hidden"
        style={{
          zIndex,
          maskImage: isIncoming ? wipeMaskImage : undefined,
          WebkitMaskImage: isIncoming ? wipeMaskImage : undefined,
          willChange: isWiping ? 'mask-image, transform' : undefined,
        }}
      >
        {/* Photo Layer (inset -3%, cover, subtle settle/parallax scale) */}
        <img
          ref={isIncoming && !isWiping ? activePhotoRef : undefined}
          src={slide.imageUrl}
          alt={slide.imageAlt}
          width={1264}
          height={848}
          loading={isSlideOneEager ? 'eager' : 'lazy'}
          decoding={isSlideOneEager ? 'sync' : 'async'}
          className="absolute -inset-[3%] w-[106%] h-[106%] object-cover pointer-events-none"
          style={{
            objectPosition: slide.objectPosition,
            transform: `translate3d(var(--px, 0%), var(--py, 0%), 0) scale(${photoScale.toFixed(4)})`,
            transition: isWiping || prefersReducedMotion ? 'none' : 'transform 5.2s ease-out',
            willChange: 'transform',
          }}
        />

        {/* Mauve top tint (rgba(84,64,74,.42) to transparent by 46%) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(84, 64, 74, 0.42) 0%, rgba(84, 64, 74, 0) 46%)',
          }}
        />

        {/* Subtle lower readability scrim on left for CTAs & contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 20% 72%, rgba(11, 21, 40, 0.48) 0%, rgba(11, 21, 40, 0) 58%)',
          }}
        />

        {/* Giant Title INSIDE the slide (aria-hidden, masked word rise, gradient fill) */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none max-w-[92vw]"
          style={{
            left: `${slide.titleLeftVw}vw`,
            top: slide.titleTopExpr,
          }}
        >
          {slide.titleLines.map((line, lineIdx) => (
            <div
              key={line}
              className="font-bold uppercase whitespace-nowrap select-none"
              style={{
                fontFamily: "'Onest', sans-serif",
                fontSize: `clamp(26px, ${slide.titleSizeVw}vw, 152px)`,
                lineHeight: slide.titleLineHeight,
                letterSpacing: '-0.02em',
              }}
            >
              {line.split(' ').map((word, wordIdx) => {
                const revealProgress = prefersReducedMotion
                  ? 1
                  : isIncoming
                  ? isWiping
                    ? Math.min(1, Math.max(0, (wipeProgress - 0.12 - wordIdx * 0.08) / 0.55))
                    : 1
                  : 1;
                const translateY = (1 - revealProgress) * 105;

                return (
                  <span
                    key={`${lineIdx}-${wordIdx}`}
                    className="inline-block overflow-hidden align-top mr-[0.22em]"
                  >
                    <span
                      className="inline-block smartspace-hero-title-fill"
                      style={{
                        transform: `translate3d(0, ${translateY.toFixed(1)}%, 0)`,
                        transition: prefersReducedMotion
                          ? 'none'
                          : 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={heroRef}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocusWithin(false);
        }
      }}
      className="relative z-20 w-full h-[100svh] min-h-[760px] sm:min-h-[680px] overflow-hidden smartspace-hero-focus"
      style={{ perspective: '1200px', backgroundColor: '#1b1d28' }}
    >
      {/* Accessibility: ONE visually hidden h1 */}
      <h1 className="sr-only">
        SmartSpace: every campus space, one smarter way to book
      </h1>

      {/* Live region announcing slide changes & pause status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentSlide.captionTitle}: {currentSlide.captionBody}
        {isPaused ? ' (Slideshow paused)' : ''}
      </div>

      {/* Scroll-choreographed Slide Stack */}
      <div
        ref={slideStackRef}
        className="absolute inset-0 pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        {outgoingIndex !== null && renderSlideLayer(outgoingIndex, 'outgoing')}
        {renderSlideLayer(activeIndex, 'active')}

        {/* 34%-wide Blush-white Haze Band riding the wipe edge */}
        {isWiping && !prefersReducedMotion && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 pointer-events-none"
            style={{
              zIndex: 6,
              width: '34%',
              left: `calc(${(100 - midStop).toFixed(2)}% - 17%)`,
              background:
                'linear-gradient(90deg, rgba(255,236,226,0) 0%, rgba(255,236,226,0.75) 50%, rgba(255,236,226,0) 100%)',
              filter: 'blur(10px)',
              opacity: Math.sin(wipeProgress * Math.PI),
            }}
          />
        )}
      </div>

      {/* Top Cloud Layer (fades in on scroll) */}
      <div
        ref={topCloudsRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[42%] pointer-events-none overflow-hidden"
        style={{ zIndex: 8, opacity: 0, willChange: 'opacity' }}
      >
        {!cloudImageError ? (
          <img
            src={CLOUDS_IMAGE_PATH}
            alt=""
            aria-hidden="true"
            onError={() => setCloudImageError(true)}
            className="w-full h-full object-cover opacity-55"
            style={{
              mixBlendMode: 'screen',
              transform: 'rotate(180deg)',
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 92%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 92%)',
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(24px)',
            }}
          />
        )}
      </div>

      {/* Bottom Cloud Bank (two drifting layers + top fade mask, behind search bar) */}
      <div
        ref={bottomCloudsRef}
        aria-hidden="true"
        className="absolute -left-[4%] -right-[4%] -bottom-[6%] h-[78%] pointer-events-none overflow-hidden"
        style={{
          zIndex: 9,
          willChange: 'transform',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 38%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 38%, black 100%)',
        }}
      >
        {!cloudImageError ? (
          <>
            {/* Back mirrored copy drifting +-3% over 34s */}
            <img
              src={CLOUDS_IMAGE_PATH}
              alt=""
              aria-hidden="true"
              onError={() => setCloudImageError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-bottom opacity-85 ${
                prefersReducedMotion ? '' : 'smartspace-cloud-drift-back'
              }`}
              style={{
                mixBlendMode: 'screen',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 38%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 38%, black 100%)',
              }}
            />
            {/* Front copy drifting +-2.5% over 26s */}
            <img
              src={CLOUDS_IMAGE_PATH}
              alt=""
              aria-hidden="true"
              onError={() => setCloudImageError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-bottom opacity-95 ${
                prefersReducedMotion ? '' : 'smartspace-cloud-drift-front'
              }`}
              style={{
                mixBlendMode: 'screen',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 38%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 38%, black 100%)',
              }}
            />
          </>
        ) : (
          <div
            className={`absolute inset-0 ${prefersReducedMotion ? '' : 'smartspace-cloud-drift-front'}`}
            style={{
              background:
                'radial-gradient(circle at 24% 72%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 42%), radial-gradient(circle at 65% 76%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0) 48%), radial-gradient(circle at 86% 64%, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0) 38%)',
              filter: 'blur(26px)',
            }}
          />
        )}
      </div>

      {/* Bottom Seamless Fade into #f6e6d8 over lowest 46% */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[46%] pointer-events-none"
        style={{
          zIndex: 10,
          background:
            'linear-gradient(to bottom, rgba(246,230,216,0) 0%, rgba(246,230,216,0.45) 45%, rgba(246,230,216,0.92) 82%, #f6e6d8 100%)',
        }}
      />

      {/* Right Rail + Concentric Rings + Connector + Caption Reveal */}
      <div
        ref={railParallaxRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 14, willChange: 'transform, opacity' }}
      >
        {/* Subtle 3D tilt group around rings and connector */}
        <div
          ref={ringsTiltRef}
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          {/* Outer ring: radius = activeRadius + 10.8% vw */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute rounded-full border-[1.6px] border-white/50 pointer-events-none"
            style={{
              width: `${railGeometry.ring2Diameter.toFixed(1)}px`,
              height: `${railGeometry.ring2Diameter.toFixed(1)}px`,
              left: `${(railGeometry.centerX - railGeometry.ring2Diameter / 2).toFixed(1)}px`,
              top: `${(railGeometry.activeCenterY - railGeometry.ring2Diameter / 2).toFixed(1)}px`,
              transition: 'top 0.9s var(--out), left 0.9s var(--out), width 0.9s var(--out), height 0.9s var(--out)',
            }}
          />

          {/* Inner ring: radius = activeRadius + 5% vw */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute rounded-full border-[1.6px] border-white/50 pointer-events-none"
            style={{
              width: `${railGeometry.ring1Diameter.toFixed(1)}px`,
              height: `${railGeometry.ring1Diameter.toFixed(1)}px`,
              left: `${(railGeometry.centerX - railGeometry.ring1Diameter / 2).toFixed(1)}px`,
              top: `${(railGeometry.activeCenterY - railGeometry.ring1Diameter / 2).toFixed(1)}px`,
              transition: 'top 0.9s var(--out), left 0.9s var(--out), width 0.9s var(--out), height 0.9s var(--out)',
            }}
          />

          {/* 3px White Connector Line + 3px Vertical Caption Bar + Clip-Path Caption Reveal */}
          <div
            aria-hidden="true"
            className="hidden md:flex items-center absolute pointer-events-none"
            style={{
              top: `${railGeometry.activeCenterY.toFixed(1)}px`,
              right: `${(viewportWidth - railGeometry.activePos.left).toFixed(1)}px`,
              transform: 'translateY(-50%)',
              transition: 'top 0.9s var(--out), right 0.9s var(--out)',
            }}
          >
            {/* Caption text revealed left-to-right + 3px vertical bar */}
            <div className="flex items-center gap-3.5 pr-3">
              <div
                key={`cap-${activeIndex}`}
                className="max-w-[270px] text-right px-3.5 py-2 rounded-xl bg-[#0B1528]/45 backdrop-blur-sm text-white"
                style={{
                  clipPath: isWiping && !prefersReducedMotion
                    ? `inset(0 ${((1 - wipeProgress) * 100).toFixed(1)}% 0 0)`
                    : 'inset(0 0% 0 0)',
                  transition: 'clip-path 0.9s var(--out)',
                }}
              >
                <p className="text-[13px] font-bold leading-snug text-white">
                  {currentSlide.captionTitle}
                </p>
                <p className="text-[11px] leading-relaxed text-white/90 mt-0.5">
                  {currentSlide.captionBody}
                </p>
              </div>
              <span
                className="w-[3px] bg-white rounded-full shrink-0"
                style={{ height: `${railGeometry.captionBarHeight.toFixed(0)}px` }}
              />
            </div>

            {/* 3px Horizontal Connector Line (4.7vw) */}
            <span
              className="h-[3px] bg-white shrink-0"
              style={{ width: `${railGeometry.connectorWidth.toFixed(1)}px` }}
            />
          </div>

          {/* 3 Interactive Round Thumbnail Buttons */}
          {HERO_SLIDES.map((slide, sIdx) => {
            const pos = railGeometry.positions[sIdx];
            const isActive = sIdx === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={slide.thumbLabel}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => startSlideTransition(sIdx)}
                className="pointer-events-auto absolute rounded-full overflow-hidden border-[3px] border-white cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FDB813]"
                style={{
                  top: `${pos.top.toFixed(1)}px`,
                  left: `${pos.left.toFixed(1)}px`,
                  width: `${pos.size.toFixed(1)}px`,
                  height: `${pos.size.toFixed(1)}px`,
                  boxShadow: isActive
                    ? '0 0 0 9px rgba(255,255,255,0.22), 0 18px 40px rgba(11,21,40,0.34)'
                    : '0 10px 24px rgba(11,21,40,0.28)',
                  transition:
                    'top 0.9s var(--out), left 0.9s var(--out), width 0.9s var(--out), height 0.9s var(--out), box-shadow 0.4s var(--out)',
                }}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.imageAlt}
                  width={190}
                  height={190}
                  loading={sIdx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Left Foreground Caption (Mobile/Tablet) + Max 2 Hero CTAs + Executive Deck link + Pause/Play */}
      <div
        className="absolute left-0 right-0 z-15 pointer-events-none"
        style={{
          bottom:
            viewportWidth < 768
              ? 'calc(20vh + 178px)'
              : 'calc(20vh + 114px)',
        }}
      >
        <div className="mx-auto w-[min(900px,calc(100%-40px))] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="pointer-events-auto max-w-md space-y-3">
            {/* Concise readable caption badge over scrim on small/medium viewports */}
            <div className="md:hidden inline-block rounded-2xl bg-[#0B1528]/60 backdrop-blur-md px-4 py-2.5 text-white border border-white/15">
              <p className="text-xs font-bold">{currentSlide.captionTitle}</p>
              <p className="text-[11px] text-white/90 leading-snug mt-0.5">
                {currentSlide.captionBody}
              </p>
            </div>

            {/* Max Two Hero CTAs + Small Tertiary Executive Deck Link */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRequestDemo}
                className="px-6 py-3 rounded-full bg-[#0077C8] hover:bg-[#005fa3] text-white text-xs sm:text-[13px] font-bold shadow-lg shadow-blue-950/30 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <span>Request demo</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreFacilities}
                className="px-6 py-3 rounded-full bg-white/18 hover:bg-white/28 backdrop-blur-md text-white border border-white/40 text-xs sm:text-[13px] font-bold shadow-md transition-colors cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                Explore facilities
              </button>

              <button
                type="button"
                onClick={onOpenExecutiveDeck}
                className="px-3 py-2 rounded-full text-white/95 hover:text-white bg-[#0B1528]/45 hover:bg-[#0B1528]/65 backdrop-blur-xs text-[11px] font-semibold underline underline-offset-4 flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[36px]"
              >
                <Presentation className="w-3.5 h-3.5 text-[#FDB813]" aria-hidden="true" />
                <span>Executive deck</span>
              </button>
            </div>
          </div>

          {/* Visible Pause / Play button + Illustrative image caption */}
          <div className="pointer-events-auto flex items-center gap-2.5 self-start sm:self-end">
            <span className="px-2.5 py-1 rounded-full bg-[#0B1528]/60 text-white/95 text-[10px] font-medium backdrop-blur-xs border border-white/15">
              Illustrative image
            </span>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-pressed={isPaused}
              aria-label={isPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}
              className="px-3.5 py-2 rounded-full bg-[#0B1528]/70 hover:bg-[#0B1528]/90 text-white text-[11px] font-semibold backdrop-blur-md border border-white/25 flex items-center gap-1.5 cursor-pointer transition-colors min-h-[36px]"
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Search Bar at bottom: 20vh + 2px */}
      <div
        className="absolute inset-x-0 z-20"
        style={{ bottom: viewportWidth < 768 ? '12vh' : 'calc(20vh + 2px)' }}
      >
        <FloatingSearchBar
          institutions={institutions}
          campus={campus}
          onCampusChange={onCampusChange}
          venueType={venueType}
          onVenueTypeChange={onVenueTypeChange}
          dateISO={dateISO}
          onDateChange={onDateChange}
          peopleCount={peopleCount}
          onPeopleCountChange={onPeopleCountChange}
          onSearch={onSearch}
        />
      </div>
    </div>
  );
};
