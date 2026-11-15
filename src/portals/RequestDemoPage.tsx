import React, { useRef, useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { BUSINESS_CONFIG } from '../config/business';
import { useConsent } from '../context/ConsentContext';
import { PrivacyFormConsent } from '../components/PrivacyFormConsent';
import {
  Building2,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const REQUEST_DEMO_CONSENT_TEXT =
  'I have read the Privacy Policy and Terms & Conditions, and I consent to SmartSpace processing my inquiry details to coordinate an institutional walkthrough.';

export const RequestDemoPage: React.FC = () => {
  const { navigate } = useRouter();
  const { submitDemoRequest } = useApp();
  const { openPreferences, recordFormConsent } = useConsent();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('Public University');
  const [position, setPosition] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [message, setMessage] = useState('');

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactEmailRef = useRef<HTMLInputElement>(null);
  const institutionNameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};

    if (!contactName.trim()) {
      errors.contactName = 'Please enter the contact person’s full name.';
    }
    if (!contactEmail.trim() || !contactEmail.includes('@') || !contactEmail.includes('.')) {
      errors.contactEmail = 'Please enter a valid institutional email address (e.g., name@university.edu.ph).';
    }
    if (!institutionName.trim()) {
      errors.institutionName = 'Please enter your university or college name.';
    }
    if (!privacyAgreed) {
      errors.privacyAgreed =
        'Please confirm your consent under the Privacy Policy before submitting.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please correct the highlighted fields below.');
      if (errors.contactName) contactNameRef.current?.focus();
      else if (errors.contactEmail) contactEmailRef.current?.focus();
      else if (errors.institutionName) institutionNameRef.current?.focus();
      else document.getElementById('request-demo-privacy-consent')?.focus();
      return;
    }

    setFieldErrors({});

    recordFormConsent({
      formName: 'RequestDemoPage',
      consentText: REQUEST_DEMO_CONSENT_TEXT,
      marketingOptIn,
    });

    const res = submitDemoRequest({
      institutionName,
      institutionType,
      contactName,
      contactEmail,
      contactNumber: contactNumber.trim(),
      designation: position.trim() || 'Campus Administrator',
      estimatedFacilities: `${institutionType} Campus`,
      message: message.trim() || 'Institutional inquiry submitted via SmartSpace /request-demo form.',
    });

    if (res.success) {
      setIsSubmitted(true);
    } else {
      setErrorMsg(res.error || 'Failed to submit demo request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
            aria-label="Return to SmartSpace Homepage"
          >
            <SmartSpaceLogo size={30} compact={true} />
          </button>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-slate-700 hover:text-[#0077C8] transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Overview</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/access')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Log In
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {isSubmitted ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-12 max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                Institutional Request Logged
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Demo Request Received
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Thank you, <strong>{contactName}</strong>. Your inquiry for <strong>{institutionName}</strong> ({contactEmail}) has been recorded with your privacy preferences (Policy v{BUSINESS_CONFIG.policyVersion}).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0077C8]" aria-hidden="true" />
                <span>Next Pilot Walkthrough Steps</span>
              </h2>
              <ul className="space-y-1.5 text-slate-700 pl-5 list-disc">
                <li>A pilot coordinator will follow up via <strong>{contactEmail}</strong> to schedule a guided walkthrough.</li>
                <li>No account was created; this inquiry does not activate a paid subscription or contractual commitment.</li>
                <li>We tailor the sample walkthrough to your institution’s facility inventory and approval workflow.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Return to SmartSpace Homepage
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Context & Value */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0077C8]">
                  Institutional Demonstration · Guided Walkthrough
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  See SmartSpace in Action for Your University
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Schedule a focused pilot walkthrough with the SmartSpace team. We demonstrate how universities centralize reservations, check time overlaps, and keep digital custodian logs.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#0077C8]" aria-hidden="true" />
                    <span>No Obligation &amp; No Automatic Account</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Requesting a pilot walkthrough does not create an institutional account or commit your university to a purchase.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-[#0077C8]" aria-hidden="true" />
                    <span>Multi-Campus Architecture</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed for colleges and universities in Cebu City, from single campuses to multi-building facility offices.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    <span>Tailored Workflow Walkthrough</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We walk through approval routing, QR gate pass inspection, and space utilization reporting.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Request an Institutional Demo
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Complete this form and our coordinator team will reply via email to arrange a session.
                </p>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="req-demo-name" className="block text-xs font-bold text-slate-800 mb-1">
                      Contact Person Name <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={contactNameRef}
                      id="req-demo-name"
                      type="text"
                      aria-required="true"
                      aria-invalid={fieldErrors.contactName ? 'true' : 'false'}
                      aria-describedby={fieldErrors.contactName ? 'req-demo-name-error' : undefined}
                      placeholder="Full name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        fieldErrors.contactName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.contactName && (
                      <p id="req-demo-name-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                        {fieldErrors.contactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="req-demo-email" className="block text-xs font-bold text-slate-800 mb-1">
                      Institutional Email Address <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={contactEmailRef}
                      id="req-demo-email"
                      type="email"
                      aria-required="true"
                      aria-invalid={fieldErrors.contactEmail ? 'true' : 'false'}
                      aria-describedby={fieldErrors.contactEmail ? 'req-demo-email-error' : undefined}
                      placeholder="e.g. facilities@university.edu.ph"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        fieldErrors.contactEmail ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.contactEmail && (
                      <p id="req-demo-email-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                        {fieldErrors.contactEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="req-demo-institution" className="block text-xs font-bold text-slate-800 mb-1">
                      Institution / University Name <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={institutionNameRef}
                      id="req-demo-institution"
                      type="text"
                      aria-required="true"
                      aria-invalid={fieldErrors.institutionName ? 'true' : 'false'}
                      aria-describedby={fieldErrors.institutionName ? 'req-demo-institution-error' : undefined}
                      placeholder="e.g. Sample University"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        fieldErrors.institutionName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.institutionName && (
                      <p id="req-demo-institution-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                        {fieldErrors.institutionName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="req-demo-type" className="block text-xs font-bold text-slate-800 mb-1">
                      Institution Type
                    </label>
                    <select
                      id="req-demo-type"
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white cursor-pointer"
                    >
                      <option value="Public University">Public / State University</option>
                      <option value="Private University">Private Higher Education Institution</option>
                      <option value="College">College / Institute</option>
                      <option value="Higher Education System">Multi-Campus University System</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="req-demo-role" className="block text-xs font-bold text-slate-800 mb-1">
                      Position or Role <span className="font-normal text-slate-600">(Optional)</span>
                    </label>
                    <input
                      id="req-demo-role"
                      type="text"
                      placeholder="e.g. Director of Physical Plant, Dean"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="req-demo-phone" className="block text-xs font-bold text-slate-800 mb-1">
                      Contact Phone <span className="font-normal text-slate-600">(Optional)</span>
                    </label>
                    <input
                      id="req-demo-phone"
                      type="tel"
                      aria-describedby="req-demo-phone-hint"
                      placeholder="Optional phone number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                    <p id="req-demo-phone-hint" className="text-[11px] text-slate-600 mt-1">
                      Optional — institutional email is sufficient.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="req-demo-notes" className="block text-xs font-bold text-slate-800 mb-1">
                    Facility Management Needs / Questions <span className="font-normal text-slate-600">(Optional)</span>
                  </label>
                  <textarea
                    id="req-demo-notes"
                    rows={3}
                    placeholder="Tell us about your campus facility challenges (e.g. number of buildings, approval routing)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                  />
                </div>

                <PrivacyFormConsent
                  idPrefix="request-demo"
                  purpose="Coordinate an institutional demonstration, assess campus onboarding needs, and respond to your inquiry."
                  recipients="SmartSpace pilot coordinators, Google Firebase cloud storage, and server-side Google Gemini API triage (for inquiry categorization)."
                  retention={BUSINESS_CONFIG.retentionPeriods.demoInquiries}
                  requiredConsentText={REQUEST_DEMO_CONSENT_TEXT}
                  agreed={privacyAgreed}
                  onAgreedChange={setPrivacyAgreed}
                  agreedError={fieldErrors.privacyAgreed}
                  includeMarketing={true}
                  marketingOptIn={marketingOptIn}
                  onMarketingChange={setMarketingOptIn}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Submit Institutional Demo Request</span>
                  </button>
                  <p className="text-xs text-center text-slate-600 mt-2">
                    Submitting this form does not create an institutional account or require payment details.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {BUSINESS_CONFIG.legalEntityName}. All rights reserved.</span>
          <nav aria-label="Legal policies" className="flex flex-wrap items-center gap-4 font-semibold">
            <button type="button" onClick={() => navigate('/privacy')} className="hover:text-[#0077C8] cursor-pointer">Privacy</button>
            <button type="button" onClick={() => navigate('/terms')} className="hover:text-[#0077C8] cursor-pointer">Terms</button>
            <button type="button" onClick={() => navigate('/cookies')} className="hover:text-[#0077C8] cursor-pointer">Cookies</button>
            <button type="button" onClick={() => navigate('/refunds')} className="hover:text-[#0077C8] cursor-pointer">Refunds</button>
            <button type="button" onClick={() => navigate('/accessibility')} className="hover:text-[#0077C8] cursor-pointer">Accessibility</button>
            <button type="button" onClick={openPreferences} className="hover:text-[#0077C8] cursor-pointer">Cookie settings</button>
          </nav>
        </div>
      </footer>
    </div>
  );
};
