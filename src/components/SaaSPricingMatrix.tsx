import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../router/RouterContext';
import { BUSINESS_CONFIG } from '../config/business';
import {
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SaaSPricingMatrixProps {
  showFaq?: boolean;
}

export const SaaSPricingMatrix: React.FC<SaaSPricingMatrixProps> = ({ showFaq = true }) => {
  const { setIsDemoModalOpen } = useApp();
  const { navigate } = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const tiers = [
    {
      name: BUSINESS_CONFIG.indicativePlans[0].name,
      tagline: BUSINESS_CONFIG.indicativePlans[0].scopeSummary,
      monthlyPrice: BUSINESS_CONFIG.indicativePlans[0].indicativeMonthlyPhp,
      popular: false,
      ctaLabel: 'Request Pilot Walkthrough',
      specs: [
        'Digital facility profiles & room specs',
        'Schedule availability calendar viewing',
        'Conflict-checked booking requests',
        'Administrator approval & rejection notes',
        'Email inquiry & pilot support',
      ],
      missingSpecs: [
        'Multi-tier custodian approval workflows',
        'Space utilization analytics exports',
        'Multi-campus directory administration',
      ],
    },
    {
      name: BUSINESS_CONFIG.indicativePlans[1].name,
      tagline: BUSINESS_CONFIG.indicativePlans[1].scopeSummary,
      monthlyPrice: BUSINESS_CONFIG.indicativePlans[1].indicativeMonthlyPhp,
      popular: true,
      badge: 'Indicative Mid-Tier',
      ctaLabel: 'Request Pilot Walkthrough',
      specs: [
        'Everything in Basic tier',
        'Multi-tier approval workflows',
        'Facility custodian assignment & verification',
        'Utilization reports & CSV export',
        'Digital QR gate pass generation',
        'Student orgs & faculty: ₱0 per-booking fee',
      ],
      missingSpecs: [
        'Cross-campus consolidated administration',
      ],
    },
    {
      name: BUSINESS_CONFIG.indicativePlans[2].name,
      tagline: BUSINESS_CONFIG.indicativePlans[2].scopeSummary,
      monthlyPrice: BUSINESS_CONFIG.indicativePlans[2].indicativeMonthlyPhp,
      popular: false,
      badge: 'Indicative Multi-Campus',
      ctaLabel: 'Inquire About Pilot Scope',
      specs: [
        'Everything in Professional tier',
        'Multi-campus directory governance',
        'Structured reservation audit trail logs',
        'QR gate-pass workflow configuration',
        'Guided institutional onboarding support',
        'Custom endorsement & clearance rules',
      ],
      missingSpecs: [],
    },
  ];

  const comparisonFeatures = [
    {
      category: 'Space & Inventory Workflows',
      items: [
        { name: 'Digital Facility Profiles & Equipment Specs', starter: true, pro: true, enterprise: true },
        { name: 'Custom Operating Hours & Buffer Rules', starter: true, pro: true, enterprise: true },
        { name: '3D Campus Spatial Preview', starter: true, pro: true, enterprise: true },
        { name: 'Multi-Campus Tenant Directory', starter: false, pro: false, enterprise: true },
      ],
    },
    {
      category: 'Booking & Approval Workflows',
      items: [
        { name: 'Slot Conflict Detection Engine', starter: true, pro: true, enterprise: true },
        { name: 'Digital QR Gate Passes', starter: false, pro: true, enterprise: true },
        { name: 'Custodian & Multi-Tier Approvals', starter: false, pro: true, enterprise: true },
        { name: 'Capacity & Advance Notice Guardrails', starter: true, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Administration & Reporting',
      items: [
        { name: 'Mandatory Rejection Justifications', starter: true, pro: true, enterprise: true },
        { name: 'Campus Space Utilization Summaries', starter: 'Basic', pro: 'Standard', enterprise: 'Multi-Campus' },
        { name: 'Digital Approval & Audit Logs', starter: true, pro: true, enterprise: true },
        { name: 'Institution-Scoped Workspaces', starter: true, pro: true, enterprise: true },
      ],
    },
  ];

  const faqs = [
    {
      q: 'How do colleges and universities onboard with SmartSpace during the pilot?',
      a: 'Institutions start by requesting a 15-minute pilot walkthrough. Once confirmed, our team works with your facility coordinator to set up sample buildings, room capacities, operating schedules, and approval roles.',
    },
    {
      q: 'Does SmartSpace support the Philippine Data Privacy Act (RA 10173)?',
      a: (
        <>
          SmartSpace is designed with the Philippine Data Privacy Act (RA 10173) principles in mind—such as transparency, legitimate purpose, and proportionality. Please review our{' '}
          <button
            type="button"
            onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.privacy)}
            className="text-[#0077C8] font-bold underline hover:text-[#005a99] cursor-pointer"
          >
            Privacy Policy
          </button>{' '}
          for current data handling disclosures and open pilot safeguards.
        </>
      ),
    },
    {
      q: 'Can student organizations request spaces from mobile devices?',
      a: 'Yes. SmartSpace works in modern mobile browsers so student officers and faculty can check availability, submit reservation details, and view approved digital QR gate passes on their phones.',
    },
    {
      q: 'Are there per-booking fees for student organizations or guards?',
      a: 'Under proposed institutional licensing, student organizations and faculty incur ₱0 per-booking fees, and security personnel scan digital QR gate passes without separate per-user booking charges.',
    },
    {
      q: 'What payment and billing terms apply?',
      a: `${BUSINESS_CONFIG.indicativePricingDisclaimer}. Billing cadence (${BUSINESS_CONFIG.billingCycle}) and accepted payment methods (${BUSINESS_CONFIG.paymentMethods}) will be confirmed prior to any commercial agreement.`,
    },
  ];

  return (
    <div className="space-y-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
          {BUSINESS_CONFIG.indicativePricingDisclaimer}
        </p>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          Indicative Institutional Plans for Cebu City Campuses
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Proposed monthly per-institution tiers under pilot evaluation. All figures shown are indicative estimates and subject to written confirmation.
        </p>

        {/* Explicit Indicative Pricing Notice */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{BUSINESS_CONFIG.indicativePricingDisclaimer} · {BUSINESS_CONFIG.stage}</span>
          </div>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              tier.popular
                ? 'bg-[#0B1528] text-white border-2 border-[#0077C8] shadow-2xl ring-4 ring-[#0077C8]/15 md:-translate-y-2'
                : 'bg-white text-slate-900 border border-slate-200 shadow-xs hover:shadow-md'
            }`}
          >
            {tier.badge && (
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                tier.popular
                  ? 'bg-[#0077C8] text-white'
                  : 'bg-slate-900 text-white'
              }`}>
                {tier.badge}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black tracking-tight">{tier.name}</h3>
                <p className={`text-xs mt-2 leading-relaxed min-h-[36px] ${tier.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                  {tier.tagline}
                </p>
              </div>

              <div className={`pt-4 border-t ${tier.popular ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
                    ₱{tier.monthlyPrice.toLocaleString()}
                  </span>
                  <span className={`text-xs font-semibold ${tier.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                    / institution / month
                  </span>
                </div>
                <p className={`text-[11px] mt-1 font-medium ${tier.popular ? 'text-[#FDB813]' : 'text-amber-700'}`}>
                  {BUSINESS_CONFIG.indicativePricingDisclaimer}
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${tier.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                  Planned Scope
                </p>
                <ul className="space-y-2.5 text-xs">
                  {tier.specs.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-[#8CC63F]' : 'text-[#0077C8]'}`} />
                      <span className={tier.popular ? 'text-slate-200' : 'text-slate-700'}>{spec}</span>
                    </li>
                  ))}
                  {tier.missingSpecs.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2.5 opacity-60">
                      <X className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                      <span className={tier.popular ? 'text-slate-400' : 'text-slate-500'}>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`pt-6 mt-8 border-t ${tier.popular ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  tier.popular
                    ? 'bg-[#0077C8] hover:bg-[#0060a3] text-white shadow-blue-900/30'
                    : 'bg-slate-900 hover:bg-[#0B1528] text-white'
                }`}
              >
                <span>{tier.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Planned Capability Matrix
            </h3>
            <p className="text-xs text-slate-600">
              Overview of planned workflow capabilities across proposed institutional tiers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.privacy)}
            className="text-[11px] font-semibold text-[#0077C8] hover:underline text-left sm:text-right cursor-pointer"
          >
            Designed with Data Privacy Act (RA 10173) principles in mind
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-bold text-slate-800">Capability</th>
                <th className="py-3.5 px-4 text-center font-bold text-slate-700">Basic</th>
                <th className="py-3.5 px-4 text-center font-bold text-[#0077C8] bg-blue-50/40 rounded-t-xl">Professional</th>
                <th className="py-3.5 px-4 text-center font-bold text-slate-900">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonFeatures.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="bg-slate-50/90">
                    <td colSpan={4} className="py-2.5 px-4 font-black text-slate-800 uppercase tracking-wider text-[10px]">
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item, iIdx) => (
                    <tr key={iIdx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof item.starter === 'boolean' ? (
                          item.starter ? (
                            <CheckCircle2 className="w-4 h-4 text-[#8CC63F] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-400 mx-auto" />
                          )
                        ) : (
                          <span className="font-semibold text-slate-700">{item.starter}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/30">
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <CheckCircle2 className="w-4 h-4 text-[#0077C8] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-400 mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-[#0077C8]">{item.pro}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof item.enterprise === 'boolean' ? (
                          item.enterprise ? (
                            <CheckCircle2 className="w-4 h-4 text-[#8CC63F] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-400 mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-slate-900">{item.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion (optional for standalone usage) */}
      {showFaq && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-950">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-600">
              Key pilot details for university administrators and student organizations.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm hover:text-[#0077C8] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#0077C8] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-slate-600 pt-2.5 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
