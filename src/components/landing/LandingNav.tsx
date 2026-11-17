import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import SmartSpaceLogo from '../SmartSpaceLogo';

interface LandingNavProps {
  onNavigate: (path: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'facilities-catalog', label: 'Facilities' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'universities', label: 'Universities' },
] as const;

export const LandingNav: React.FC<LandingNavProps> = ({
  onNavigate,
  onScrollToSection,
}) => {
  const [scrolledPastThreshold, setScrolledPastThreshold] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.3;
      setScrolledPastThreshold(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        burgerRef.current?.focus();
      }
      return;
    }

    wasOpenRef.current = true;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLinkClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(sectionId);
  };

  const navStyle: React.CSSProperties = scrolledPastThreshold
    ? {
        backgroundColor: 'rgba(246, 230, 216, 0.86)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottomColor: 'rgba(11, 21, 40, 0.12)',
        transition: 'background-color 0.5s var(--ease), color 0.5s var(--ease), border-color 0.5s var(--ease)',
      }
    : {
        backgroundImage:
          'linear-gradient(180deg, rgba(20, 14, 24, 0.58) 0%, rgba(20, 14, 24, 0.24) 100%)',
        backgroundColor: 'transparent',
        borderBottomColor: 'rgba(255, 255, 255, 0.28)',
        transition: 'background-color 0.5s var(--ease), color 0.5s var(--ease), border-color 0.5s var(--ease)',
      };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[74px] border-b flex items-center ${
        scrolledPastThreshold ? 'text-[#0B1528]' : 'text-white smartspace-hero-focus'
      }`}
      style={navStyle}
    >
      <div className="w-full smartspace-nav-padding flex items-center justify-between gap-6">
        {/* Left: Logo + wordmark + 1x42px divider */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="cursor-pointer rounded-lg py-1 text-left transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
            aria-label="SmartSpace Home"
          >
            <SmartSpaceLogo
              size={30}
              compact={true}
              showTagline={false}
              theme={scrolledPastThreshold ? 'light' : 'dark'}
            />
          </button>
          <span
            aria-hidden="true"
            className={`hidden sm:block w-px h-[42px] transition-colors duration-500 ${
              scrolledPastThreshold ? 'bg-[#0B1528]/18' : 'bg-white/30'
            }`}
          />
        </div>

        {/* Centre: 4 single-line links with wiping underline */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              className={`group relative py-1.5 text-[13px] font-semibold tracking-tight whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-300 ${
                scrolledPastThreshold
                  ? 'text-[#0B1528] hover:text-[#0077C8]'
                  : 'text-white hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  scrolledPastThreshold ? 'bg-[#0077C8]' : 'bg-white'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Right: Log in + pill Request demo (Desktop & Tablet) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/access')}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors min-h-[40px] ${
              scrolledPastThreshold
                ? 'text-[#0B1528] hover:bg-[#0B1528]/8'
                : 'text-white hover:bg-white/15'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/request-demo')}
            className="px-5 py-2.5 rounded-full bg-[#0077C8] hover:bg-[#005fa3] text-white text-[13px] font-bold shadow-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors min-h-[40px]"
          >
            Request demo
          </button>
        </div>

        {/* Mobile: burger button opening drawer */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            ref={burgerRef}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              scrolledPastThreshold
                ? 'text-[#0B1528] hover:bg-[#0B1528]/10'
                : 'text-white bg-black/25 hover:bg-black/40 border border-white/25'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div
          id="landing-mobile-nav"
          role="region"
          aria-label="Mobile navigation"
          className="lg:hidden fixed top-[74px] left-0 right-0 bg-[#fbf8f4]/95 backdrop-blur-lg border-b border-[#0B1528]/15 shadow-2xl px-6 py-6 space-y-2 text-[#0B1528]"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              className="w-full text-left py-3 px-3 rounded-xl text-sm font-semibold text-[#0B1528] hover:bg-[#f6e6d8]/70 transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 mt-2 border-t border-[#0B1528]/10 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/access');
              }}
              className="w-full py-3 px-4 rounded-full border border-[#0B1528]/20 text-center text-sm font-semibold text-[#0B1528] hover:bg-[#f6e6d8] transition-colors cursor-pointer min-h-[44px]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/request-demo');
              }}
              className="w-full py-3 px-4 rounded-full bg-[#0077C8] hover:bg-[#005fa3] text-center text-sm font-bold text-white transition-colors cursor-pointer min-h-[44px]"
            >
              Request demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
