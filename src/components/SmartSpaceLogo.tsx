import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
  variant?: 'full' | 'mark-only' | 'horizontal' | 'banner' | 'image';
  theme?: 'light' | 'dark';
}

/**
 * SmartSpace official brand mark.
 * Renders the authentic high-resolution ribbon logo mark provided in /assets/aistudio/Logo_w_o_Name_07e7d282.png
 */
export const SmartSpaceMark: React.FC<{ size?: number; className?: string }> = ({
  size = 38,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Graceful SVG fallback preserving official palette
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
        aria-label="SmartSpace Logo Mark"
      >
        <path
          d="M 50 20 C 65 20 80 32 80 48 C 80 62 68 72 50 80 C 35 72 20 62 20 48 C 20 32 35 20 50 20 Z"
          fill="#0077C8"
        />
        <circle cx="35" cy="45" r="14" fill="#EE2726" />
        <circle cx="65" cy="45" r="14" fill="#F59E0B" />
        <circle cx="50" cy="65" r="14" fill="#8CC63F" />
      </svg>
    );
  }

  return (
    <img
      src="/assets/aistudio/Logo_w_o_Name_07e7d282.png"
      alt="SmartSpace Logo Mark"
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={`shrink-0 object-contain select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="eager"
    />
  );
};

export const SmartSpaceLogo: React.FC<LogoProps> = ({
  className = '',
  size = 38,
  showTagline = true,
  variant = 'horizontal',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Direct banner variant (incorporating official "BOOK IT, TRACK IT, USE IT." artwork)
  if (variant === 'banner') {
    return (
      <div className={`inline-flex flex-col items-start ${className}`}>
        <img
          src="/assets/aistudio/3_3463e729.png"
          alt="SmartSpace - Book It, Track It, Use It."
          className="h-auto max-h-16 w-auto object-contain"
        />
      </div>
    );
  }

  // Official stacked logo with name artwork
  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/assets/aistudio/Logo_w__Name_00c2f4c4.png"
          alt="SmartSpace"
          style={{ height: `${size * 1.6}px` }}
          className="w-auto object-contain"
        />
      </div>
    );
  }

  if (variant === 'mark-only') {
    return <SmartSpaceMark size={size} className={className} />;
  }

  // Standard horizontal branded lockup with authentic letter-colored branding & official tagline
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <SmartSpaceMark size={size} />
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-black tracking-tight text-lg sm:text-xl font-sans inline-flex items-baseline">
            <span className="text-[#EE2726]">S</span>
            <span className="text-[#F97316]">M</span>
            <span className="text-[#F59E0B]">A</span>
            <span className="text-[#F59E0B]">R</span>
            <span className="text-[#F59E0B]">T</span>
            <span className="text-[#0077C8]">S</span>
            <span className="text-[#8CC63F]">P</span>
            <span className="text-[#8CC63F]">A</span>
            <span className="text-[#8CC63F]">C</span>
            <span className="text-[#8CC63F]">E</span>
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border ${
              isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            SaaS
          </span>
        </div>
        {showTagline && (
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
