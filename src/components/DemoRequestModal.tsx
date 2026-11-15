import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useConsent } from '../context/ConsentContext';
import { BUSINESS_CONFIG } from '../config/business';
import { PrivacyFormConsent } from './PrivacyFormConsent';
import {
  Building2,
  X,
  Calendar,
  Mail,
  User,
  Phone,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const DEMO_CONSENT_TEXT =
  'I have read the Privacy Policy and Terms & Conditions, and I consent to SmartSpace processing my inquiry details to evaluate and coordinate an institutional demonstration.';

export const DemoRequestModal: React.FC = () => {
  const { isDemoModalOpen, setIsDemoModalOpen, submitDemoRequest } = useApp();
  const { recordFormConsent } = useConsent();

  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('State University');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [designation, setDesignation] = useState('Vice President for Administration');
  const [estimatedFacilities, setEstimatedFacilities] = useState('15-30 Spaces');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const instInputRef = useRef<HTMLInputElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const designationRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDemoModalOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isDemoModalOpen]);

  useEffect(() => {
    if (!isDemoModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsDemoModalOpen(false);
        setSubmitted(false);
        setErrorMsg(null);
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
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isDemoModalOpen, setIsDemoModalOpen]);

  if (!isDemoModalOpen) return null;

  const handleClose = () => {
    setIsDemoModalOpen(false);
    setSubmitted(false);
    setErrorMsg(null);
    setFieldErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};

    if (!institutionName.trim()) {
      errors.institutionName = 'Please enter your university or college name.';
    }
    if (!contactName.trim()) {
      errors.contactName = 'Please provide the official contact person name.';
    }
    if (!designation.trim()) {
      errors.designation = 'Please enter your official role or designation.';
    }
    if (!contactEmail.trim() || !contactEmail.includes('@') || !contactEmail.includes('.')) {
      errors.contactEmail = 'Please provide a valid institutional email address.';
    }
    if (!privacyAgreed) {
      errors.privacyAgreed =
        'Please confirm that you consent to the Privacy Policy before submitting this form.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please review the highlighted fields before submitting.');
      if (errors.institutionName) instInputRef.current?.focus();
      else if (errors.contactName) contactNameRef.current?.focus();
      else if (errors.designation) designationRef.current?.focus();
      else if (errors.contactEmail) emailRef.current?.focus();
      else document.getElementById('demo-modal-privacy-consent')?.focus();
      return;
    }

    setFieldErrors({});

    recordFormConsent({
      formName: 'DemoRequestModal',
      consentText: DEMO_CONSENT_TEXT,
      marketingOptIn,
    });

    const res = submitDemoRequest({
      institutionName,
      institutionType,
      contactName,
      contactEmail,
      contactNumber: contactNumber.trim(),
      designation,
      estimatedFacilities,
      preferredDate,
      message,
    });

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.error || 'Failed to submit demo request.');
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white relative">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2.5 text-purple-200 text-xs font-semibold tracking-wider uppercase mb-1">
            <Building2 className="w-4 h-4 text-purple-300" aria-hidden="true" />
            <span>Institutional Consultation</span>
          </div>
          <h2 id="demo-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Request an Institutional Demo
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-md">
            Schedule a personalized walkthrough of SmartSpace for your university’s administration and facilities division.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Demo Request Received
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto">
                  Thank you, <strong>{contactName}</strong>. Your inquiry for <strong>{institutionName}</strong> ({contactEmail}) has been recorded with your privacy consent preferences (Policy v{BUSINESS_CONFIG.policyVersion}).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-left text-xs text-purple-950 space-y-1.5 max-w-md mx-auto">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" aria-hidden="true" />
                  <span>Important Governance Policy</span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Demo requests introduce your leadership to the platform. They do not automatically grant administrator access or create an active university workspace. Formal onboarding requires administrative review.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Done &amp; Return to SmartSpace
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

              {/* Notice Banner */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs text-purple-950 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong>Notice:</strong> This form requests a personalized walkthrough. It will not automatically register or activate a university account.
                </div>
              </div>

              {/* University Name & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="demo-modal-institution" className="block text-xs font-bold text-slate-800 mb-1">
                    University / College Name <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={instInputRef}
                      id="demo-modal-institution"
                      type="text"
                      aria-required="true"
                      aria-invalid={fieldErrors.institutionName ? 'true' : 'false'}
                      aria-describedby={fieldErrors.institutionName ? 'demo-modal-institution-error' : undefined}
                      placeholder="e.g. Sample Higher Education Institution"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                        fieldErrors.institutionName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {fieldErrors.institutionName && (
                    <p id="demo-modal-institution-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                      {fieldErrors.institutionName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demo-modal-type" className="block text-xs font-bold text-slate-800 mb-1">
                    Sector / Type
                  </label>
                  <select
                    id="demo-modal-type"
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white cursor-pointer"
                  >
                    <option value="State University">State University</option>
                    <option value="Private University">Private University</option>
                    <option value="Private College">Private College</option>
                    <option value="Student Organization">Student Organization</option>
                  </select>
                </div>
              </div>

              {/* Contact Person & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demo-modal-contact-name" className="block text-xs font-bold text-slate-800 mb-1">
                    Contact Person <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={contactNameRef}
                      id="demo-modal-contact-name"
                      type="text"
                      aria-required="true"
                      aria-invalid={fieldErrors.contactName ? 'true' : 'false'}
                      aria-describedby={fieldErrors.contactName ? 'demo-modal-contact-name-error' : undefined}
                      placeholder="Full name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                        fieldErrors.contactName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {fieldErrors.contactName && (
                    <p id="demo-modal-contact-name-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                      {fieldErrors.contactName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demo-modal-designation" className="block text-xs font-bold text-slate-800 mb-1">
                    Official Designation <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={designationRef}
                      id="demo-modal-designation"
                      type="text"
                      aria-required="true"
                      aria-invalid={fieldErrors.designation ? 'true' : 'false'}
                      aria-describedby={fieldErrors.designation ? 'demo-modal-designation-error' : undefined}
                      placeholder="e.g. VP for Administration / Dean"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                        fieldErrors.designation ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {fieldErrors.designation && (
                    <p id="demo-modal-designation-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                      {fieldErrors.designation}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Optional Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demo-modal-email" className="block text-xs font-bold text-slate-800 mb-1">
                    Official Institutional Email <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={emailRef}
                      id="demo-modal-email"
                      type="email"
                      aria-required="true"
                      aria-invalid={fieldErrors.contactEmail ? 'true' : 'false'}
                      aria-describedby={fieldErrors.contactEmail ? 'demo-modal-email-error' : undefined}
                      placeholder="name@university.edu.ph"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                        fieldErrors.contactEmail ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {fieldErrors.contactEmail && (
                    <p id="demo-modal-email-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                      {fieldErrors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demo-modal-phone" className="block text-xs font-bold text-slate-800 mb-1">
                    Contact Number <span className="font-normal text-slate-600">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="demo-modal-phone"
                      type="tel"
                      aria-describedby="demo-modal-phone-hint"
                      placeholder="Optional phone number"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                  <p id="demo-modal-phone-hint" className="text-[11px] text-slate-600 mt-1">
                    Optional — institutional email is sufficient.
                  </p>
                </div>
              </div>

              {/* Estimated Facilities & Preferred Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demo-modal-spaces" className="block text-xs font-bold text-slate-800 mb-1">
                    Estimated Campus Spaces
                  </label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <select
                      id="demo-modal-spaces"
                      value={estimatedFacilities}
                      onChange={(e) => setEstimatedFacilities(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white cursor-pointer"
                    >
                      <option value="5-15 Spaces">5 - 15 Spaces (Single Campus)</option>
                      <option value="15-30 Spaces">15 - 30 Spaces (Standard College)</option>
                      <option value="30-75 Spaces">30 - 75 Spaces (Major University)</option>
                      <option value="75+ Spaces Multi-Campus">75+ Spaces (Multi-Campus System)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="demo-modal-date" className="block text-xs font-bold text-slate-800 mb-1">
                    Target Demo Date <span className="font-normal text-slate-600">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="demo-modal-date"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="demo-modal-message" className="block text-xs font-bold text-slate-800 mb-1">
                  Space Management Objectives / Key Needs <span className="font-normal text-slate-600">(Optional)</span>
                </label>
                <textarea
                  id="demo-modal-message"
                  rows={2}
                  placeholder="Tell us about your campus facility reservation workflows or current challenges..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white resize-none"
                />
              </div>

              {/* RA 10173 Collection Notice & Unbundled Checkboxes */}
              <PrivacyFormConsent
                idPrefix="demo-modal"
                purpose="Review your demo inquiry, prepare a campus walkthrough brief, and reply via email."
                recipients="SmartSpace pilot coordinators, Google Firebase cloud storage, and server-side Google Gemini API triage (for inquiry categorization)."
                retention={BUSINESS_CONFIG.retentionPeriods.demoInquiries}
                requiredConsentText={DEMO_CONSENT_TEXT}
                agreed={privacyAgreed}
                onAgreedChange={setPrivacyAgreed}
                agreedError={fieldErrors.privacyAgreed}
                includeMarketing={true}
                marketingOptIn={marketingOptIn}
                onMarketingChange={setMarketingOptIn}
                onBeforeNavigate={handleClose}
                compact={true}
              />

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>Submit Institutional Demo Request</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
