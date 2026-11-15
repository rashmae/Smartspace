import React, { useEffect, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setHasError(false);
    const el = imgRef.current;
    if (!el) return;
    const handleError = () => setHasError(true);
    el.addEventListener('error', handleError);
    if (el.complete && el.naturalWidth === 0) {
      setHasError(true);
    }
    return () => el.removeEventListener('error', handleError);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#0B1528] via-[#132544] to-[#0077C8]/40 flex flex-col items-center justify-center p-4 text-center select-none"
        role="img"
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2">
          <Building2 className="w-5 h-5 text-white/80" aria-hidden="true" />
        </div>
        <span className="text-[11px] font-semibold text-white/90 line-clamp-2 max-w-[180px]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy="no-referrer"
    />
  );
};
