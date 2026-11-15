import React from 'react';
import { useRouter } from '../router/RouterContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { BUSINESS_CONFIG } from '../config/business';
import { useConsent } from '../context/ConsentContext';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Shield,
  Cookie,
  Receipt,
  Accessibility,
  Scale,
} from 'lucide-react';

export type LegalPageSlug = 'privacy' | 'terms' | 'cookies' | 'refunds' | 'accessibility';

interface LegalPagesPortalProps {
  page: LegalPageSlug;
}

interface StorageInventoryRow {
  keyName: string;
  storageType: 'localStorage' | 'sessionStorage' | 'IndexedDB';
  purpose: string;
  category: 'Strictly Necessary' | 'Functional' | 'Analytics' | 'Marketing';
  duration: string;
  party: 'First-party (SmartSpace)' | 'Third-party (Google Firebase)';
}

const STORAGE_INVENTORY: StorageInventoryRow[] = [
  {
    keyName: 'smartspace_mvp_auth_session_v3',
    storageType: 'localStorage',
    purpose: 'Remembers the currently signed-in portal role, name, email, and organization across page reloads.',
    category: 'Strictly Necessary',
    duration: 'Until sign-out or browser storage is cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_active_institution_v3',
    storageType: 'localStorage',
    purpose: 'Remembers the active campus workspace selected in the interface.',
    category: 'Functional',
    duration: 'Until changed or cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_verified_sessions_v5',
    storageType: 'sessionStorage',
    purpose: 'Keeps temporary custodian/facility handler verification state for the active browser tab.',
    category: 'Strictly Necessary',
    duration: 'Current browser tab session (cleared when tab closes)',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_consent_v1',
    storageType: 'localStorage',
    purpose: 'Stores your storage and cookie preference selection, timestamp, and policy version.',
    category: 'Strictly Necessary',
    duration: 'Until preference is updated or storage is cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_form_consents_v1',
    storageType: 'localStorage',
    purpose: 'Records timestamped form privacy/marketing consent acknowledgements, form name, and policy version in the pilot client.',
    category: 'Strictly Necessary',
    duration: 'Persistent until cleared (scheduled for server/Firestore audit persistence per risk register)',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_institutions_v4, smartspace_mvp_facilities_v4, smartspace_mvp_platform_settings_v4',
    storageType: 'localStorage',
    purpose: 'Caches campus facility catalogs, rules, and workspace settings for pilot continuity.',
    category: 'Functional',
    duration: 'Persistent until browser storage is cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_bookings_v3, smartspace_mvp_participants_v3',
    storageType: 'localStorage',
    purpose: 'Pilot prototype storage for booking requests and usability evaluation observations.',
    category: 'Functional',
    duration: 'Persistent until reset or cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_demo_requests_v4, smartspace_mvp_inst_registrations_v4, smartspace_mvp_registered_users_v4',
    storageType: 'localStorage',
    purpose: 'Pilot prototype fallback cache for demo inquiries, institutional registrations, and portal accounts.',
    category: 'Functional',
    duration: 'Persistent until cleared (scheduled for server-only Firestore migration per risk register)',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_facility_handlers_v5, smartspace_mvp_facility_assignments_v5, smartspace_mvp_facility_logs_v5',
    storageType: 'localStorage',
    purpose: 'Pilot prototype cache for custodian assignments and approval verification logs.',
    category: 'Functional',
    duration: 'Persistent until cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_mvp_ai_workflows_v1, smartspace_mvp_ai_jobs_v1, smartspace_mvp_email_records_v1',
    storageType: 'localStorage',
    purpose: 'Stores super-admin workflow templates, automation job previews, and notification drafts.',
    category: 'Functional',
    duration: 'Persistent until cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'smartspace_security_activities_v1',
    storageType: 'localStorage',
    purpose: 'Records local sign-in activity audit entries in the pilot admin console.',
    category: 'Functional',
    duration: 'Persistent until cleared',
    party: 'First-party (SmartSpace)',
  },
  {
    keyName: 'firebaseLocalStorageDb (Firebase Auth / Firestore cache)',
    storageType: 'IndexedDB',
    purpose: 'Managed by Google Firebase SDK when cloud authentication or Firestore synchronization is active.',
    category: 'Strictly Necessary',
    duration: 'Managed by browser & Firebase session lifecycle',
    party: 'Third-party (Google Firebase)',
  },
];

const LEGAL_NAV_ITEMS: Array<{ slug: LegalPageSlug; path: string; label: string; icon: React.ReactNode }> = [
  { slug: 'privacy', path: '/privacy', label: 'Privacy Policy', icon: <Shield className="w-3.5 h-3.5" /> },
  { slug: 'terms', path: '/terms', label: 'Terms & Conditions', icon: <Scale className="w-3.5 h-3.5" /> },
  { slug: 'cookies', path: '/cookies', label: 'Cookie & Storage Policy', icon: <Cookie className="w-3.5 h-3.5" /> },
  { slug: 'refunds', path: '/refunds', label: 'Refund & Cancellation', icon: <Receipt className="w-3.5 h-3.5" /> },
  { slug: 'accessibility', path: '/accessibility', label: 'Accessibility', icon: <Accessibility className="w-3.5 h-3.5" /> },
];

export const LegalPagesPortal: React.FC<LegalPagesPortalProps> = ({ page }) => {
  const { navigate } = useRouter();
  const { openPreferences } = useConsent();

  const meta = {
    privacy: {
      title: 'Privacy Policy (Philippines — RA 10173)',
      subtitle: 'How SmartSpace collects, uses, stores, and safeguards personal information during our pilot stage and institutional workflows.',
      toc: [
        { id: 'summary', label: 'Quick Summary' },
        { id: 'who-we-are', label: '1. Who We Are & DPO Contact' },
        { id: 'data-collected', label: '2. Personal Data We Collect' },
        { id: 'purposes-basis', label: '3. Purposes & Lawful Basis (RA 10173)' },
        { id: 'recipients', label: '4. Who Receives Data & Sub-Processors' },
        { id: 'cross-border', label: '5. Cross-Border Transfers' },
        { id: 'retention', label: '6. Data Retention' },
        { id: 'security', label: '7. Security Measures & Pilot Disclosures' },
        { id: 'rights', label: '8. Your Rights Under Section 16 & NPC Complaints' },
        { id: 'breaches-minors-updates', label: '9. Breach Handling, Minors, Changes & NPC Status' },
      ],
    },
    terms: {
      title: 'Terms and Conditions',
      subtitle: 'Rules governing access to the SmartSpace pilot-stage prototype and institutional facility booking workflows.',
      toc: [
        { id: 'summary', label: 'Quick Summary' },
        { id: 'service-pilot', label: '1. Service Description & Pilot-Stage Status' },
        { id: 'accounts-roles', label: '2. Accounts, Roles & Responsibilities' },
        { id: 'approvals', label: '3. Institutional Approval Authority' },
        { id: 'acceptable-use', label: '4. Acceptable Use & QR Gate Pass Rules' },
        { id: 'ip-content', label: '5. User Content, IP & Third-Party Services' },
        { id: 'liability', label: '6. Disclaimers & Statutory Consumer Rights' },
        { id: 'termination-changes', label: '7. Suspension, Termination & Notice of Changes' },
        { id: 'governing-law', label: '8. Governing Law, Complaints & Merchant Identity' },
      ],
    },
    cookies: {
      title: 'Cookie and Browser Storage Policy',
      subtitle: 'An exact, plain-English inventory of every browser storage key used by SmartSpace today.',
      toc: [
        { id: 'summary', label: 'Quick Summary' },
        { id: 'no-trackers', label: '1. No Analytics or Advertising Trackers' },
        { id: 'inventory', label: '2. Complete Browser Storage Inventory' },
        { id: 'localstorage-disclosure', label: '3. Pilot Local-Storage Disclosure' },
        { id: 'controls', label: '4. Managing Your Preferences' },
      ],
    },
    refunds: {
      title: 'Refund and Cancellation Policy',
      subtitle: 'Billing, cancellation, and refund terms for pilot evaluations and proposed institutional subscriptions.',
      toc: [
        { id: 'summary', label: 'Quick Summary' },
        { id: 'pilot-and-plans', label: '1. Pilot Access & Proposed Institutional Plans' },
        { id: 'cancellation', label: '2. How to Cancel a Paid Plan' },
        { id: 'refund-eligibility', label: '3. Refund Eligibility & Partial-Month Rules' },
        { id: 'how-to-request', label: '4. How to Request a Refund & Payment Methods' },
        { id: 'statutory-rights', label: '5. Philippine Consumer Protection Rights' },
      ],
    },
    accessibility: {
      title: 'Accessibility Statement',
      subtitle: 'Our commitment to WCAG 2.2 Level AA accessibility, known gaps in the pilot prototype, and how to report barriers.',
      toc: [
        { id: 'summary', label: 'Quick Summary' },
        { id: 'standard', label: '1. Target Standard (WCAG 2.2 AA)' },
        { id: 'known-gaps', label: '2. Known Gaps Under Active Remediation' },
        { id: 'feedback', label: '3. Reporting Accessibility Barriers' },
      ],
    },
  }[page];

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* DRAFT LEGAL REVIEW BANNER */}
      <div
        role="region"
        aria-label="Draft legal status notice"
        className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-xs font-semibold"
      >
        <div className="max-w-6xl mx-auto flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
          <p>{BUSINESS_CONFIG.legalBannerText}</p>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition-opacity shrink-0"
            aria-label="SmartSpace Home"
          >
            <SmartSpaceLogo size={32} compact={true} />
          </button>

          <nav aria-label="Legal documents navigation" className="hidden lg:flex items-center gap-1.5">
            {LEGAL_NAV_ITEMS.map((item) => {
              const active = item.slug === page;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#0B1528] text-white'
                      : 'text-slate-700 hover:text-[#0077C8] hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#0077C8] hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/request-demo')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Request Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Legal Switcher */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50 px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {LEGAL_NAV_ITEMS.map((item) => {
              const active = item.slug === page;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    active ? 'bg-[#0B1528] text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Table of Contents */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                <FileText className="w-4 h-4 text-[#0077C8]" />
                <span>Table of Contents</span>
              </div>
              <nav aria-label="Section index" className="space-y-1">
                {meta.toc.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => scrollToAnchor(entry.id)}
                    className="block w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-[#0077C8] hover:bg-blue-50/70 transition-colors cursor-pointer"
                  >
                    {entry.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs text-slate-700">
              <p className="font-bold text-slate-900">Document Metadata</p>
              <p>
                <strong>Status:</strong> DRAFT — pending legal review
              </p>
              <p>
                <strong>Version:</strong> {BUSINESS_CONFIG.policyVersion}
              </p>
              <p>
                <strong>Last updated / Effective date:</strong> {BUSINESS_CONFIG.effectiveDate}
              </p>
              <p>
                <strong>Service Stage:</strong> {BUSINESS_CONFIG.stage}
              </p>
            </div>
          </aside>

          {/* Article Body */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
            <header className="space-y-3 border-b border-slate-200 pb-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                {BUSINESS_CONFIG.brandName} · Legal &amp; Governance
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-[#0B1528] tracking-tight">
                {meta.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{meta.subtitle}</p>
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-600">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold">
                  Last updated: {BUSINESS_CONFIG.effectiveDate}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-semibold">
                  Version: {BUSINESS_CONFIG.policyVersion}
                </span>
              </div>
            </header>

            {/* ================= PRIVACY POLICY ================= */}
            {page === 'privacy' && (
              <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
                <section id="summary" className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                  <h2 className="text-base font-extrabold text-[#0B1528] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8]" />
                    <span>Quick Summary (Plain English)</span>
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800">
                    <li>
                      <strong>What SmartSpace is:</strong> {BUSINESS_CONFIG.description} ({BUSINESS_CONFIG.stage}).
                    </li>
                    <li>
                      <strong>What we collect:</strong> Information you enter in demo inquiries, account sign-ups, and campus facility reservation requests, plus essential browser storage needed to run the app.
                    </li>
                    <li>
                      <strong>What we do NOT do:</strong> We do not run advertising trackers, Google Analytics, or sell personal data.
                    </li>
                    <li>
                      <strong>Your rights (RA 10173):</strong> You can request access, correction, objection, erasure, blocking, or data portability by contacting our Data Protection Officer at{' '}
                      <span className="font-mono text-xs">{BUSINESS_CONFIG.dpoEmail}</span>.
                    </li>
                  </ul>
                </section>

                <section id="who-we-are" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">1. Who We Are &amp; Data Protection Officer (DPO)</h2>
                  <p>
                    <strong>{BUSINESS_CONFIG.brandName}</strong> is currently a <strong>{BUSINESS_CONFIG.stage}</strong> serving{' '}
                    {BUSINESS_CONFIG.serviceArea}.
                  </p>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs sm:text-sm space-y-1">
                    <p><strong>Personal Information Controller / Legal Entity:</strong> {BUSINESS_CONFIG.legalEntityName}</p>
                    <p><strong>DTI / SEC Registration:</strong> {BUSINESS_CONFIG.businessRegistrationNo} ({BUSINESS_CONFIG.registrationNote})</p>
                    <p><strong>Registered Address:</strong> {BUSINESS_CONFIG.registeredAddress}</p>
                    <p><strong>Data Protection Officer (DPO):</strong> {BUSINESS_CONFIG.dpoName}</p>
                    <p><strong>DPO Contact Email:</strong> {BUSINESS_CONFIG.dpoEmail}</p>
                    <p><strong>General Support Contact:</strong> {BUSINESS_CONFIG.supportEmail} · {BUSINESS_CONFIG.supportPhone}</p>
                  </div>
                </section>

                <section id="data-collected" className="space-y-3">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">2. Personal Data We Collect</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Institutional Demo Request Forms:</strong> Institution name, institution type, contact person's name, role or designation, email address, optional phone number, preferred walkthrough details, message notes, and consent metadata (policy version, consent wording, timestamp, and form identifier).
                    </li>
                    <li>
                      <strong>Portal Accounts &amp; Role Profiles:</strong> Full name, institutional email address, university/college affiliation, student organization or academic department name, and assigned platform role (requester, faculty, facility administrator, handler/custodian, or super administrator).
                    </li>
                    <li>
                      <strong>Facility Booking &amp; Approval Records:</strong> Event title, target venue, requested date and time block, expected attendee count, adviser/endorsement notes, review decisions and rejection reasons, digital QR gate pass references, custodian assignments, and check-in/check-out records.
                    </li>
                    <li>
                      <strong>Technical &amp; Browser Storage Data:</strong> Browser `localStorage` / `sessionStorage` keys and Firebase IndexedDB entries required to keep your session and workspace functional, plus standard HTTP request metadata (such as IP address and browser user-agent) received by our Express server endpoints during active requests.
                    </li>
                  </ul>
                </section>

                <section id="purposes-basis" className="space-y-3">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">3. Purposes &amp; Lawful Basis Under RA 10173</h2>
                  <p>Under Republic Act No. 10173 (Philippine Data Privacy Act of 2012) and its Implementing Rules and Regulations (IRR), we rely on specific lawful criteria depending on how you interact with SmartSpace:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Responding to Demo &amp; Walkthrough Inquiries:</strong> Processed based on your <em>consent</em> and pre-contractual steps requested by you or your institution (Section 12(a)–(b)).
                    </li>
                    <li>
                      <strong>Delivering Campus Facility Search, Reservations, Approvals &amp; QR Passes:</strong> Processed to fulfill institutional service arrangements and authorized campus reservation workflows (Section 12(b)).
                    </li>
                    <li>
                      <strong>Preventing Scheduling Conflicts, Maintaining Audit Trails &amp; Securing Access:</strong> Processed under <em>legitimate interests</em> of participating institutions and SmartSpace to prevent overlapping bookings, verify physical entry permits, and detect unauthorized access (Section 12(f)).
                    </li>
                    <li>
                      <strong>Optional Updates or Outreach Messages:</strong> Sent only if you give separate, unbundled <em>affirmative consent</em> (Section 12(a)).
                    </li>
                  </ul>
                </section>

                <section id="recipients" className="space-y-3">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">4. Who Receives Data &amp; Sub-Processors</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Authorized Institutional Administrators &amp; Custodians:</strong> When you submit a reservation request for a campus workspace, authorized administrators, department reviewers, and assigned facility custodians of that institution can view the booking details to review and check you in.
                    </li>
                    <li>
                      <strong>Google Firebase (Cloud Firestore &amp; Authentication):</strong> Used as our cloud database and authentication processor to synchronize facility, booking, and registration records.
                    </li>
                    <li>
                      <strong>Google Gemini API (Server-Side Demo Triage):</strong> When server-side AI categorization is enabled for demo requests, inquiry fields (applicant name, institution name, type, and estimated space count) are sent from our Express backend (`server.ts`) to Google's Gemini API to draft internal onboarding summaries.
                    </li>
                    <li>
                      <strong>Web &amp; Application Hosting Provider:</strong> {BUSINESS_CONFIG.hostingProvider}.
                    </li>
                  </ul>
                </section>

                <section id="cross-border" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">5. Cross-Border Data Transfers</h2>
                  <p>
                    Cloud services such as Google Firebase and Gemini API may process or store data on servers located outside the Philippines (e.g., regional cloud zones in Asia-Pacific or the United States). Prior to commercial launch, SmartSpace will review cross-border processor agreements with Philippine legal counsel to ensure safeguards consistent with Section 21 of RA 10173.
                  </p>
                </section>

                <section id="retention" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">6. Data Retention</h2>
                  <p>We keep personal data only as long as necessary for pilot evaluation, institutional service delivery, or legal obligations. Final retention schedules are subject to owner and counsel confirmation:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Demo Request Inquiries:</strong> {BUSINESS_CONFIG.retentionPeriods.demoInquiries}</li>
                    <li><strong>User Account Profiles:</strong> {BUSINESS_CONFIG.retentionPeriods.accountProfiles}</li>
                    <li><strong>Booking Records &amp; Audit Logs:</strong> {BUSINESS_CONFIG.retentionPeriods.bookingAndAuditLogs}</li>
                    <li><strong>Consent Records:</strong> {BUSINESS_CONFIG.retentionPeriods.consentRecords}</li>
                  </ul>
                </section>

                <section id="security" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">7. Security Measures &amp; Honest Pilot Disclosures</h2>
                  <p>We aim to apply reasonable organizational, physical, and technical safeguards:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Role-based interface separation between student/faculty requesters, institutional administrators, and platform operators.</li>
                    <li>Transport encryption (HTTPS/TLS) in hosted deployment environments and server-side storage of API keys.</li>
                    <li>
                      <strong>Important Pilot Limitation Notice:</strong> Because SmartSpace is a <strong>{BUSINESS_CONFIG.stage}</strong>, our security audit register (`docs/COMPLIANCE_RISKS.md`) explicitly notes open engineering tasks—including tightening public Firestore rules, hardening server-side super-admin password checks, and removing multi-user PII caching in browser `localStorage`—that must be completed before storing live, sensitive institutional personal data in production.
                    </li>
                  </ul>
                </section>

                <section id="rights" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">8. Your Rights Under RA 10173 (Section 16) &amp; NPC Complaints</h2>
                  <p>As a data subject in the Philippines, you have the following statutory rights under Section 16 of RA 10173:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Right to Be Informed</strong> whether personal data concerning you is being or has been processed.</li>
                    <li><strong>Right to Access</strong> your personal data, sources, recipients, and processing purposes upon reasonable demand.</li>
                    <li><strong>Right to Object</strong> to processing (including withdrawing consent at any time where processing relies on consent).</li>
                    <li><strong>Right to Rectification</strong> to correct inaccurate or incomplete personal data.</li>
                    <li><strong>Right to Erasure or Blocking</strong> where data is incomplete, outdated, unlawfully obtained, or no longer necessary.</li>
                    <li><strong>Right to Data Portability</strong> to obtain a copy of your data in a commonly used electronic format.</li>
                    <li><strong>Right to Damages</strong> to be indemnified for damages sustained due to inaccurate, unauthorized, or unlawful use.</li>
                  </ul>
                  <p>
                    To exercise any of these rights or withdraw consent, email our Data Protection Officer at{' '}
                    <strong>{BUSINESS_CONFIG.dpoEmail}</strong> or contact <strong>{BUSINESS_CONFIG.supportEmail}</strong>. If you believe your privacy rights have been violated, you also have the right to file a complaint with the{' '}
                    <strong>National Privacy Commission (NPC)</strong> of the Philippines (via{' '}
                    <span className="underline">privacy.gov.ph</span>).
                  </p>
                </section>

                <section id="breaches-minors-updates" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">9. Breach Handling, Minors, Changes &amp; NPC Status</h2>
                  <p>
                    <strong>Breach Notification:</strong> In the event of a personal data breach involving sensitive personal information or risk of serious harm, we will evaluate notification obligations to the National Privacy Commission and affected data subjects within 72 hours of discovery in line with NPC Circular No. 16-03.
                  </p>
                  <p>
                    <strong>Children and Minors:</strong> SmartSpace is designed for higher-education institutions, student organization officers, and university staff. Where a student user is under 18 years old, access should occur through authorized school supervision and, where required by law, parent or guardian consent.
                  </p>
                  <p>
                    <strong>NPC Registration Status:</strong> {BUSINESS_CONFIG.npcRegistrationStatus}.
                  </p>
                  <p>
                    <strong>Changes to This Policy:</strong> Material updates will be posted on this page with an updated version number and effective date.
                  </p>
                </section>
              </div>
            )}

            {/* ================= TERMS & CONDITIONS ================= */}
            {page === 'terms' && (
              <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
                <section id="summary" className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                  <h2 className="text-base font-extrabold text-[#0B1528] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8]" />
                    <span>Quick Summary (Plain English)</span>
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800">
                    <li>SmartSpace is currently a <strong>{BUSINESS_CONFIG.stage}</strong> built for {BUSINESS_CONFIG.serviceArea}.</li>
                    <li>Schools and universities retain full control over facility approvals—SmartSpace provides workflow software and does not guarantee room availability or approval.</li>
                    <li>Requesters must submit truthful event details, follow campus rules, and respect digital QR gate passes.</li>
                    <li>Nothing in these Terms waives statutory rights under Philippine law (RA 7394 and RA 11967).</li>
                  </ul>
                </section>

                <section id="service-pilot" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">1. Service Description &amp; Pilot-Stage Status</h2>
                  <p>
                    <strong>{BUSINESS_CONFIG.brandName}</strong> (“{BUSINESS_CONFIG.tagline}”) is {BUSINESS_CONFIG.description}
                  </p>
                  <p>
                    The platform is currently operated as a <strong>{BUSINESS_CONFIG.stage}</strong> for evaluation and pilot walkthroughs. Features, layouts, and sample workspaces may change without guarantee of uninterrupted availability during pilot testing.
                  </p>
                </section>

                <section id="accounts-roles" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">2. Accounts, Roles &amp; Responsibilities</h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Institution Administrators:</strong> Configure facility profiles, operating hours, rules, custodian assignments, and review requests for their institution.</li>
                    <li><strong>Approvers &amp; Facility Handlers / Custodians:</strong> Review assigned venue requests, inspect event requirements, and log physical check-in/check-out status.</li>
                    <li><strong>Requesters (Student Organizations, Faculty &amp; Staff):</strong> Browse available venues, submit accurate reservation requests, and provide required endorsement documents.</li>
                    <li><strong>Campus Security / Gate Staff:</strong> Inspect approved digital QR gate passes at facility entry points.</li>
                  </ul>
                  <p>Users are responsible for keeping login credentials confidential and ensuring submitted contact and event information is truthful.</p>
                </section>

                <section id="approvals" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">3. Institutional Approval Authority</h2>
                  <p>
                    Each participating college or university solely sets its facility policies, scheduling priorities, endorsement requirements, and final approval decisions. Submitting a booking request or checking availability in SmartSpace{' '}
                    <strong>does not guarantee room availability or reservation approval</strong>. Institutions may cancel, reschedule, or reject reservations according to campus policy or emergencies.
                  </p>
                </section>

                <section id="acceptable-use" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">4. Acceptable Use &amp; QR Gate Pass Rules</h2>
                  <p>You agree not to misuse SmartSpace. Prohibited actions include:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Submitting false, duplicate, or speculative reservations to block venues from other campus groups.</li>
                    <li>Sharing, forging, altering, or reusing a digital QR gate pass for an unapproved date, time, or venue.</li>
                    <li>Attempting to bypass role boundaries, security controls, or conflict-checking mechanisms.</li>
                    <li>Uploading unlawful, defamatory, or malicious files or code.</li>
                  </ul>
                  <p>
                    Digital QR gate passes reflect the booking status recorded at the time of approval and may be invalidated immediately if an administrator cancels or updates a reservation. Campus security staff retain final physical authority at facility entrances.
                  </p>
                </section>

                <section id="ip-content" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">5. User Content, Intellectual Property &amp; Third-Party Services</h2>
                  <p>
                    Institutions and users retain ownership of their event descriptions, facility schedules, and uploaded endorsement details, granting SmartSpace a limited license solely to host, process, and display that content within the service.
                  </p>
                  <p>
                    All SmartSpace trademarks, logos, software code, and interface designs remain the intellectual property of {BUSINESS_CONFIG.legalEntityName} and its contributors. SmartSpace integrates third-party cloud infrastructure (such as Google Firebase) and may link to external websites; we are not responsible for third-party websites outside our control.
                  </p>
                </section>

                <section id="liability" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">6. Disclaimers, Liability Limits &amp; Statutory Consumer Rights</h2>
                  <p>
                    During the pilot-stage prototype phase, SmartSpace is provided on an “as is” and “as available” basis without warranties of continuous uptime or error-free operation. Subject to legal review by Philippine counsel, SmartSpace is not liable for indirect or consequential event losses arising from campus administrative decisions, force majeure, or internet outages.
                  </p>
                  <p className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs sm:text-sm text-amber-950 font-medium">
                    <strong>Non-Waivable Consumer Rights (Philippines):</strong> Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, warranty, or statutory right that cannot lawfully be excluded or waived under the{' '}
                    <strong>Consumer Act of the Philippines (Republic Act No. 7394)</strong>, the{' '}
                    <strong>Internet Transactions Act of 2023 (Republic Act No. 11967)</strong>, or the Data Privacy Act of 2012 (RA 10173).
                  </p>
                </section>

                <section id="termination-changes" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">7. Suspension, Termination &amp; Notice of Changes</h2>
                  <p>
                    We or an authorized subscribing institution may suspend or terminate access if these Terms or campus rules are violated, or if a pilot period concludes. We will provide reasonable advance notice of material changes to these Terms by updating the policy version and effective date on this page.
                  </p>
                </section>

                <section id="governing-law" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">8. Governing Law, Complaints &amp; Merchant Identification</h2>
                  <p>
                    These Terms are governed by the laws of the <strong>{BUSINESS_CONFIG.governingLaw}</strong>. Any dispute shall be submitted to the competent courts at <strong>{BUSINESS_CONFIG.governingLawVenue}</strong>, without prejudice to mandatory administrative remedies before the DTI or NPC where applicable.
                  </p>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs sm:text-sm space-y-1">
                    <p><strong>Merchant / Operator Legal Name:</strong> {BUSINESS_CONFIG.legalEntityName}</p>
                    <p><strong>Registration Number (DTI/SEC):</strong> {BUSINESS_CONFIG.businessRegistrationNo}</p>
                    <p><strong>Registered Address:</strong> {BUSINESS_CONFIG.registeredAddress}</p>
                    <p><strong>Complaint &amp; Support Email:</strong> {BUSINESS_CONFIG.supportEmail}</p>
                    <p><strong>Support Phone:</strong> {BUSINESS_CONFIG.supportPhone}</p>
                  </div>
                </section>
              </div>
            )}

            {/* ================= COOKIE & STORAGE POLICY ================= */}
            {page === 'cookies' && (
              <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
                <section id="summary" className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                  <h2 className="text-base font-extrabold text-[#0B1528] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8]" />
                    <span>Quick Summary (Plain English)</span>
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800">
                    <li>SmartSpace currently uses <strong>zero analytics trackers and zero advertising cookies</strong>.</li>
                    <li>We use browser `localStorage`, `sessionStorage`, and Google Firebase IndexedDB strictly to keep sessions working and persist pilot prototype records.</li>
                    <li>You can clear browser storage at any time or manage optional preferences using our Cookie settings control below or in the site footer.</li>
                  </ul>
                </section>

                <section id="no-trackers" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">1. No Analytics or Advertising Trackers</h2>
                  <p>
                    At this time, SmartSpace does <strong>not</strong> load Google Analytics, Meta Pixel, behavioral advertising SDKs, or cross-site tracking cookies. Any future non-essential analytics or marketing script will remain blocked by default unless you affirmatively opt in.
                  </p>
                </section>

                <section id="inventory" className="space-y-3">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">2. Complete Browser Storage Inventory</h2>
                  <p>Below is the complete list of browser storage keys currently created or read in SmartSpace source code:</p>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Key / Store Name</th>
                          <th className="p-3">Storage</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Purpose</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Party</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {STORAGE_INVENTORY.map((row) => (
                          <tr key={row.keyName} className="align-top bg-white">
                            <td className="p-3 font-mono text-[11px] text-[#0B1528] break-all">{row.keyName}</td>
                            <td className="p-3 whitespace-nowrap">{row.storageType}</td>
                            <td className="p-3 whitespace-nowrap font-semibold">{row.category}</td>
                            <td className="p-3 text-slate-700">{row.purpose}</td>
                            <td className="p-3 text-slate-600">{row.duration}</td>
                            <td className="p-3 whitespace-nowrap text-slate-600">{row.party}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="localstorage-disclosure" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">3. Pilot Local-Storage Disclosure</h2>
                  <p>
                    In the current pilot prototype, certain shared operational lists (such as demo requests, registered sample accounts, and bookings) are mirrored in browser `localStorage` for offline-resilient demonstration. Browser `localStorage` is per-device and unencrypted; our compliance register (`RISK-04`) recommends migrating all multi-user personal records exclusively to authenticated Firestore storage prior to live institutional deployment.
                  </p>
                </section>

                <section id="controls" className="space-y-3">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">4. Managing Your Preferences</h2>
                  <p>
                    You can open our Cookie &amp; Storage Preferences panel at any time to adjust or withdraw optional Analytics and Marketing consent, or clear stored keys through your browser’s site-data settings. Questions may be sent to <strong>{BUSINESS_CONFIG.supportEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="px-4 py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Open Cookie &amp; Storage Settings
                  </button>
                </section>
              </div>
            )}

            {/* ================= REFUND & CANCELLATION POLICY ================= */}
            {page === 'refunds' && (
              <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
                <section id="summary" className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                  <h2 className="text-base font-extrabold text-[#0B1528] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8]" />
                    <span>Quick Summary (Plain English)</span>
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800">
                    <li><strong>Pilot prototype:</strong> Free pilot evaluations carry ₱0 fees, and student/faculty users pay ₱0 per booking.</li>
                    <li><strong>Paid plans:</strong> Commercial prices ({BUSINESS_CONFIG.indicativePricingDisclaimer}), billing cycles, and refund eligibility windows are pending owner and legal confirmation.</li>
                    <li><strong>Consumer protections:</strong> Nothing in this policy limits your rights under RA 7394 (Consumer Act) or RA 11967 (Internet Transactions Act).</li>
                  </ul>
                </section>

                <section id="pilot-and-plans" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">1. Pilot Access &amp; Proposed Institutional Plans</h2>
                  <p>
                    SmartSpace is currently a <strong>{BUSINESS_CONFIG.stage}</strong>. No online payment checkout is active, and no fee is charged to students, student organizations, or faculty for individual booking requests.
                  </p>
                  <p>
                    For future commercial subscriptions, our business plan proposes the following institutional tiers (<strong>{BUSINESS_CONFIG.indicativePricingDisclaimer}</strong>):
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    {BUSINESS_CONFIG.indicativePlans.map((plan) => (
                      <li key={plan.id}>
                        <strong>{plan.name}:</strong> {plan.displayPrice} — {plan.scopeSummary}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Billing Cycle:</strong> {BUSINESS_CONFIG.billingCycle}.
                  </p>
                </section>

                <section id="cancellation" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">2. How to Cancel a Paid Plan</h2>
                  <p>
                    Authorized institutional representatives may request cancellation of an institutional subscription prior to the next billing date by sending written notice to <strong>{BUSINESS_CONFIG.supportEmail}</strong> or contacting <strong>{BUSINESS_CONFIG.supportPhone}</strong>. Access remains active until the end of the already-paid billing cycle unless otherwise agreed.
                  </p>
                </section>

                <section id="refund-eligibility" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">3. Refund Eligibility &amp; Partial-Month Rules</h2>
                  <p>
                    <strong>Refund Eligibility Criteria:</strong> {BUSINESS_CONFIG.refundEligibility}.
                  </p>
                  <p>
                    <strong>Partial-Month Refunds:</strong> {BUSINESS_CONFIG.partialMonthRefunds}.
                  </p>
                </section>

                <section id="how-to-request" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">4. How to Request a Refund &amp; Accepted Payment Methods</h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>How to Request:</strong> Email <strong>{BUSINESS_CONFIG.supportEmail}</strong> with your institution name, invoice or payment reference, and reason for the request.</li>
                    <li><strong>Acknowledgement / Response Time:</strong> {BUSINESS_CONFIG.refundResponseTime}</li>
                    <li><strong>Refund Processing Time:</strong> {BUSINESS_CONFIG.refundProcessingTime}</li>
                    <li><strong>Accepted Payment Methods:</strong> {BUSINESS_CONFIG.paymentMethods}</li>
                  </ul>
                </section>

                <section id="statutory-rights" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">5. Philippine Statutory Consumer Rights</h2>
                  <p className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-950 font-medium">
                    Nothing in this Refund and Cancellation Policy limits, waives, or restricts any statutory rights or remedies available to consumers or institutional buyers under the{' '}
                    <strong>Consumer Act of the Philippines (RA 7394)</strong> and the{' '}
                    <strong>Internet Transactions Act of 2023 (RA 11967)</strong>.
                  </p>
                </section>
              </div>
            )}

            {/* ================= ACCESSIBILITY STATEMENT ================= */}
            {page === 'accessibility' && (
              <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
                <section id="summary" className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                  <h2 className="text-base font-extrabold text-[#0B1528] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8]" />
                    <span>Quick Summary (Plain English)</span>
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800">
                    <li>We are working toward <strong>WCAG 2.2 Level AA</strong> accessibility across SmartSpace.</li>
                    <li>Because this is a pilot-stage prototype, known contrast, focus, and form-label gaps are documented below and scheduled for remediation.</li>
                    <li>If you run into a barrier, contact us at <span className="font-mono text-xs">{BUSINESS_CONFIG.supportEmail}</span>.</li>
                  </ul>
                </section>

                <section id="standard" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">1. Target Conformance Standard</h2>
                  <p>
                    SmartSpace aims to conform to the Web Content Accessibility Guidelines (<strong>WCAG 2.2</strong>) at <strong>Level AA</strong>. We respect user reduced-motion preferences (`prefers-reduced-motion`) across animated landing sections and use semantic HTML landmarks (`header`, `nav`, `main`, `footer`).
                  </p>
                </section>

                <section id="known-gaps" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">2. Known Accessibility Gaps Under Active Remediation</h2>
                  <p>As part of our ongoing trust and accessibility cleanup (documented in `docs/COMPLIANCE_RISKS.md`, `RISK-15` &amp; `RISK-17`), we have identified the following areas currently being improved:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Color contrast adjustments on small labels (`&lt; 12px`), muted grey text on white backgrounds, text on amber (`#FDB813`) and green (`#8CC63F`) surfaces, and overlays on photography/video.</li>
                    <li>Consistent visible `&lt;label htmlFor&gt;` bindings, `aria-required`, `aria-describedby`, `aria-live` error announcements, and focus movement on all forms.</li>
                    <li>Keyboard focus trapping, Escape key handling, and focus restoration across every modal dialog.</li>
                    <li>Adding a “Skip to main content” link and a visible Pause control for auto-playing or scroll-animated hero motion exceeding 5 seconds.</li>
                    <li>Completing an automated `eslint-plugin-jsx-a11y` and `axe-core` audit across all portals.</li>
                  </ul>
                </section>

                <section id="feedback" className="space-y-2.5">
                  <h2 className="text-xl font-extrabold text-[#0B1528]">3. Reporting Accessibility Barriers</h2>
                  <p>
                    If you encounter an accessibility barrier or need facility information in an alternative format, please reach out so we can assist you:
                  </p>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs sm:text-sm space-y-1">
                    <p><strong>Support Email:</strong> {BUSINESS_CONFIG.supportEmail}</p>
                    <p><strong>Support Phone:</strong> {BUSINESS_CONFIG.supportPhone}</p>
                    <p><strong>Mailing Address:</strong> {BUSINESS_CONFIG.registeredAddress}</p>
                    <p><strong>Target Acknowledgement / Response Time:</strong> {BUSINESS_CONFIG.accessibilityResponseTime}</p>
                  </div>
                </section>
              </div>
            )}
          </article>
        </div>
      </main>

      {/* Legal Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-slate-900">
              © {new Date().getFullYear()} {BUSINESS_CONFIG.legalEntityName}. All rights reserved.
            </p>
            <p>
              {BUSINESS_CONFIG.brandName} · {BUSINESS_CONFIG.stage} · {BUSINESS_CONFIG.serviceArea}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 font-semibold">
            {LEGAL_NAV_ITEMS.map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => navigate(item.path)}
                className="hover:text-[#0077C8] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={openPreferences}
              className="hover:text-[#0077C8] transition-colors cursor-pointer"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
