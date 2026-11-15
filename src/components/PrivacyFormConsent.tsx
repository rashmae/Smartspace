import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { useRouter } from '../router/RouterContext';

interface PrivacyFormConsentProps {
  idPrefix: string;
  purpose: string;
  recipients: string;
  retention: string;
  requiredConsentText: string;
  agreed: boolean;
  onAgreedChange: (checked: boolean) => void;
  agreedError?: string;
  includeMarketing?: boolean;
  marketingOptIn?: boolean;
  onMarketingChange?: (checked: boolean) => void;
  onBeforeNavigate?: () => void;
  compact?: boolean;
}

export const PrivacyFormConsent: React.FC<PrivacyFormConsentProps> = ({
  idPrefix,
  purpose,
  recipients,
  retention,
  requiredConsentText,
  agreed,
  onAgreedChange,
  agreedError,
  includeMarketing = false,
  marketingOptIn = false,
  onMarketingChange,
  onBeforeNavigate,
  compact = false,
}) => {
  const { navigate } = useRouter();
  const consentCheckboxId = `${idPrefix}-privacy-consent`;
  const consentErrorId = `${idPrefix}-privacy-consent-error`;
  const marketingCheckboxId = `${idPrefix}-marketing-optin`;

  const openLegalPage = (path: string) => {
    if (onBeforeNavigate) onBeforeNavigate();
    navigate(path);
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 ${
        compact ? 'p-3 space-y-2' : 'p-4 space-y-3'
      }`}
    >
      {/* RA 10173 Collection Notice */}
      <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0B1528]">
          <ShieldCheck className="w-4 h-4 text-[#0077C8] shrink-0" aria-hidden="true" />
          <span>Data Privacy Notice (RA 10173)</span>
        </div>
        <p>
          <strong>Purpose:</strong> {purpose}
        </p>
        <p>
          <strong>Recipients:</strong> {recipients}
        </p>
        <p>
          <strong>Retention &amp; Rights:</strong> {retention}. You may exercise your rights under Section 16 of RA 10173 via{' '}
          <span className="font-mono text-[11px]">{BUSINESS_CONFIG.dpoEmail}</span>. Read our{' '}
          <button
            type="button"
            onClick={() => openLegalPage(BUSINESS_CONFIG.legalRoutes.privacy)}
            className="font-semibold text-[#0077C8] underline hover:text-[#005a99] cursor-pointer"
          >
            Privacy Policy
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => openLegalPage(BUSINESS_CONFIG.legalRoutes.terms)}
            className="font-semibold text-[#0077C8] underline hover:text-[#005a99] cursor-pointer"
          >
            Terms &amp; Conditions
          </button>
          .
        </p>
      </div>

      {/* Required Unchecked Service Consent Checkbox */}
      <div className="pt-1 border-t border-slate-200/80 space-y-1">
        <div className="flex items-start gap-2.5">
          <input
            id={consentCheckboxId}
            type="checkbox"
            checked={agreed}
            onChange={(e) => onAgreedChange(e.target.checked)}
            aria-required="true"
            aria-invalid={agreedError ? 'true' : 'false'}
            aria-describedby={agreedError ? consentErrorId : undefined}
            className="mt-0.5 h-4 w-4 accent-[#0077C8] rounded border-slate-400 cursor-pointer shrink-0"
          />
          <label
            htmlFor={consentCheckboxId}
            className="text-xs text-slate-900 font-medium leading-relaxed cursor-pointer"
          >
            {requiredConsentText} <span className="text-red-700 font-bold" aria-hidden="true">*</span>
          </label>
        </div>
        {agreedError && (
          <p id={consentErrorId} role="alert" className="text-xs font-semibold text-red-700 pl-6">
            {agreedError}
          </p>
        )}
      </div>

      {/* Optional Unbundled Marketing Checkbox (never pre-ticked) */}
      {includeMarketing && onMarketingChange && (
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id={marketingCheckboxId}
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => onMarketingChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#0077C8] rounded border-slate-400 cursor-pointer shrink-0"
          />
          <label
            htmlFor={marketingCheckboxId}
            className="text-xs text-slate-700 leading-relaxed cursor-pointer"
          >
            Optional: I would like to receive SmartSpace pilot updates and product announcements. (Not required; withdrawable anytime.)
          </label>
        </div>
      )}
    </div>
  );
};
