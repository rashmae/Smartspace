import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
  variant?: 'full' | 'mark-only' | 'horizontal';
  theme?: 'light' | 'dark';
}

export const SmartSpaceMark: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40,
  className = "" 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="SmartSpace Logo Mark"
    >
      {/* Outer Black Border Frame with crisp rounded edges */}
      <rect
        x="8"
        y="8"
        width="184"
        height="184"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="11"
        rx="14"
      />

      {/* Grid dividing spacing lines (visual alignment) */}
      <g transform="translate(18, 18)">
        {/* TOP-LEFT: Blue Quadrant 'S' */}
        <path
          d="M 10 10 
             C 10 4, 16 0, 36 0 
             L 66 0 
             C 74 0, 78 4, 78 12 
             L 78 28 
             C 78 35, 74 38, 66 38 
             L 30 38 
             C 24 38, 20 40, 20 46 
             C 20 52, 24 54, 32 54 
             L 68 54 
             C 75 54, 78 58, 78 64 
             L 78 72 
             C 78 77, 73 80, 64 80 
             L 24 80 
             C 8 80, 0 72, 0 58 
             L 0 46 
             C 0 34, 8 28, 22 28 
             L 58 28 
             C 62 28, 64 26, 64 22 
             C 64 18, 62 16, 56 16 
             L 20 16 
             C 14 16, 10 14, 10 10 Z"
          fill="#0077D8"
        />

        {/* TOP-RIGHT: Yellow/Amber Quadrant 'Pin / P' */}
        <g transform="translate(86, 0)">
          <path
            d="M 12 0 
               L 42 0 
               C 68 0, 78 10, 78 36 
               L 78 46 
               C 78 68, 68 78, 46 78 
               L 12 78 
               C 4 78, 0 74, 0 66 
               L 0 12 
               C 0 4, 4 0, 12 0 Z"
            fill="#F5A623"
          />
          {/* Sharp diagonal pointer slit */}
          <path
            d="M 4 72 L 50 28 L 54 32 L 8 76 Z"
            fill="#FFFFFF"
          />
          {/* Black circle pin head */}
          <circle cx="56" cy="22" r="10" fill="#18181B" />
        </g>

        {/* BOTTOM-LEFT: Red Quadrant 'A / Arch' */}
        <g transform="translate(0, 86)">
          <path
            d="M 10 0 
               L 68 0 
               C 75 0, 78 4, 78 10 
               L 78 70 
               C 78 76, 74 78, 68 78 
               L 52 78 
               C 48 78, 46 75, 45 70 
               L 40 32 
               L 38 32 
               L 33 70 
               C 32 75, 30 78, 26 78 
               L 10 78 
               C 4 78, 0 75, 0 70 
               L 0 10 
               C 0 4, 4 0, 10 0 Z"
            fill="#E52424"
          />
          {/* Triangular arch negative space */}
          <path
            d="M 39 30 L 52 78 L 26 78 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* BOTTOM-RIGHT: Green Quadrant 'Leaf / C' */}
        <g transform="translate(86, 86)">
          <path
            d="M 10 0 
               L 70 0 
               C 76 0, 78 4, 78 10 
               L 78 40 
               C 78 66, 66 78, 40 78 
               L 10 78 
               C 4 78, 0 74, 0 68 
               L 0 10 
               C 0 4, 4 0, 10 0 Z"
            fill="#8CC63F"
          />
          {/* Angled incision line */}
          <path
            d="M 32 0 L 58 66 L 54 68 L 28 0 Z"
            fill="#FFFFFF"
          />
        </g>
      </g>
    </svg>
  );
};

export const SmartSpaceLogo: React.FC<LogoProps> = ({
  className = "",
  size = 38,
  showTagline = true,
  variant = 'horizontal',
  theme = 'light'
}) => {
  if (variant === 'mark-only') {
    return <SmartSpaceMark size={size} className={className} />;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SmartSpaceMark size={size} />
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className={`text-xl font-black tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
            SMART<span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>SPACE</span>
          </span>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${
            isDark 
              ? 'bg-slate-800 text-slate-300 border-slate-700' 
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            SaaS
          </span>
        </div>
        {showTagline && (
          <span className={`text-[11px] font-medium tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            “Book It, Track It, Use It.”
          </span>
        )}
      </div>
    </div>
  );
};

export default SmartSpaceLogo;
