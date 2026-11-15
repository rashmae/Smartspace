import React, { useEffect, useRef, useState } from 'react';
import { Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { useConsent } from '../context/ConsentContext';
import { useRouter } from '../router/RouterContext';
import { BUSINESS_CONFIG } from '../config/business';

export const ConsentBanner: React.FC = () => {
  const {
    consent,
    isBannerVisible,
    isPreferencesOpen,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
  } = useConsent();
  const { navigate } = useRouter();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Sync toggle defaults whenever preferences dialog opens
  useEffect(() => {
    if (isPreferencesOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setAnalyticsEnabled(consent?.analytics ?? false);
      setMarketingEnabled(consent?.marketing ?? false);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isPreferencesOpen, consent]);

  // Focus first interactive element inside preferences dialog and trap Escape / Tab
  useEffect(() => {
    if (!isPreferencesOpen) return;

    const container = dialogRef.current;
    if (container) {
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePreferences();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreferencesOpen, closePreferences]);

  const navigatePolicy = (path: '/cookies' | '/privacy') => {
    closePreferences();
    navigate(path);
  };

  return (
    <>
      {/* First-visit non-blocking storage notice */}
      {isBannerVisible && (
        <aside
          aria-label="Cookie and browser storage notice"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-50 bg-white border border-slate-300 shadow-2xl rounded-2xl p-4 sm:p-5 text-slate-900"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-[#0B1528]">
              <Cookie className="w-4 h-4" aria-hidden="true" />
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <h2 className="text-sm font-extrabold text-[#0B1528]">
                  Browser storage &amp; privacy choices
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  SmartSpace uses strictly necessary browser storage (`localStorage`, `sessionStorage`, and Firebase session storage) to keep reservations and logins working. Optional analytics and marketing scripts remain{' '}
                  <strong>off by default</strong>.{' '}
                  <button
                    type="button"
                    onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.cookies)}
                    className="font-semibold text-[#0077C8] underline hover:text-[#005a99] cursor-pointer"
                  >
                    Read Cookie &amp; Storage Policy
                  </button>
                  .
                </p>
              </div>

              {/* Equal-prominence Accept & Reject controls + Customize */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl border border-slate-900 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reject non-essential
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl border border-[#0077C8] bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Cookie & Storage Preferences Modal */}
      {isPreferencesOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePreferences();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-modal-title"
            aria-describedby="consent-modal-desc"
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 text-slate-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077C8]">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Storage Preferences</span>
                </div>
                <h2 id="consent-modal-title" className="text-xl font-extrabold text-[#0B1528]">
                  Manage Cookie &amp; Storage Settings
                </h2>
              </div>
              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close storage preferences"
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p id="consent-modal-desc" className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Choose which categories of optional browser storage you permit. Essential storage remains active so session authentication, campus booking controls, and this preference record work properly. See our{' '}
              <button
                type="button"
                onClick={() => navigatePolicy('/cookies')}
                className="font-semibold text-[#0077C8] underline hover:text-[#005a99] cursor-pointer"
              >
                Cookie &amp; Storage Policy
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => navigatePolicy('/privacy')}
                className="font-semibold text-[#0077C8] underline hover:text-[#005a99] cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </p>

            <div className="space-y-3">
              {/* Strictly Necessary */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#0B1528]">Strictly Necessary Storage</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Required for active session login, custodian verification state, campus workspace caches, and saving your consent selection. Cannot be switched off.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-800 bg-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0">
                  Always active
                </span>
              </div>

              {/* Analytics Toggle */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="consent-toggle-analytics" className="text-sm font-bold text-[#0B1528] block cursor-pointer">
                    Analytics &amp; Product Diagnostics
                  </label>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Off by default. SmartSpace does not currently run third-party analytics scripts; opting in authorizes future anonymized usage diagnostics if introduced.
                  </p>
                </div>
                <input
                  id="consent-toggle-analytics"
                  type="checkbox"
                  role="switch"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-[#0077C8] rounded cursor-pointer shrink-0"
                />
              </div>

              {/* Marketing Toggle */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="consent-toggle-marketing" className="text-sm font-bold text-[#0B1528] block cursor-pointer">
                    Marketing &amp; Outreach Personalization
                  </label>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Off by default. SmartSpace does not load third-party ad pixels or sell data. Opting in permits optional pilot outreach preferences if introduced later.
                  </p>
                </div>
                <input
                  id="consent-toggle-marketing"
                  type="checkbox"
                  role="switch"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="mt-1 h-5 w-5 accent-[#0077C8] rounded cursor-pointer shrink-0"
                />
              </div>
            </div>

            {consent && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                Current preference saved on{' '}
                <span className="font-mono">{new Date(consent.timestamp).toLocaleString()}</span> (Policy v
                {consent.policyVersion}).
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="px-4 py-2.5 rounded-xl border border-slate-900 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={() => savePreferences({ analytics: analyticsEnabled, marketing: marketingEnabled })}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="px-4 py-2.5 rounded-xl border border-[#0077C8] bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
