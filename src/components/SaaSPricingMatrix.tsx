import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  X, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Zap,
  Lock,
  Headphones
} from 'lucide-react';

export const SaaSPricingMatrix: React.FC = () => {
  const { openAuthPortal, setIsDemoModalOpen } = useApp();
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const tiers = [
    {
      name: 'Campus Starter',
      tagline: 'Ideal for single colleges, specialized departments, or pilot campuses.',
      monthlyPrice: 4900,
      annualPrice: 3920,
      popular: false,
      ctaLabel: 'Start Starter Onboarding',
      specs: [
        'Up to 15 facilities & spaces',
        'Up to 500 monthly bookings',
        '3 University Admin seats',
        'Standard availability calendar',
        'Digital PDF permit issuance',
        'Standard email support',
      ],
      missingSpecs: [
        'Automated real-time conflict blocker',
        'Verifiable dynamic QR permits',
        'Multi-campus unified directory',
        'University SSO (LDAP / Google Workspace)',
      ],
    },
    {
      name: 'University Pro',
      tagline: 'The complete enterprise solution for full university campuses and faculties.',
      monthlyPrice: 14900,
      annualPrice: 11920,
      popular: true,
      badge: 'Most Popular',
      ctaLabel: 'Deploy University Pro',
      specs: [
        'Up to 100 facilities & spaces',
        'Unlimited monthly bookings',
        '15 University Admin seats',
        'Live Conflict Prevention Engine',
        'Dynamic QR Code Permits & Scanner',
        'Multi-Level Approval Hierarchies',
        'Utilization Reports & CSV Export',
        'SMS & Priority Email Notifications',
        'Dedicated Onboarding Specialist',
      ],
      missingSpecs: [
        'Multi-campus unified directory',
        'Custom SSO / Active Directory Integration',
      ],
    },
    {
      name: 'Multi-Campus Enterprise',
      tagline: 'System-wide governance for multi-campus university networks and consortia.',
      monthlyPrice: 29900,
      annualPrice: 23920,
      popular: false,
      badge: 'Enterprise Grade',
      ctaLabel: 'Contact Institutional Sales',
      specs: [
        'Unlimited facilities across all campuses',
        'Unlimited bookings & user accounts',
        'Unlimited University Admin seats',
        'System-wide Super Admin Console',
        'Custom SSO (LDAP / Google / Azure AD)',
        'Custom approval rules & delegation flows',
        'Enterprise SLA (99.9% Uptime Guarantee)',
        'Institutional Data Sovereignty (RA 10173)',
        '24/7 Priority Emergency Hotline',
      ],
      missingSpecs: [],
    },
  ];

  const comparisonFeatures = [
    {
      category: 'Space & Inventory Governance',
      items: [
        { name: 'Max Registered Facilities', starter: '15 Spaces', pro: '100 Spaces', enterprise: 'Unlimited' },
        { name: 'Multi-Floor 3D Spatial Maps', starter: 'Ground Only', pro: 'All Floors', enterprise: 'Unlimited' },
        { name: 'Custom Operating Hours & Buffer Windows', starter: true, pro: true, enterprise: true },
        { name: 'Facility Equipment & Asset Tagging', starter: true, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Booking Engine & Conflict Prevention',
      items: [
        { name: 'Real-Time Conflict Blocking Algorithm', starter: false, pro: true, enterprise: true },
        { name: 'Verifiable Encrypted QR Permits', starter: false, pro: true, enterprise: true },
        { name: 'Recurring Semester Schedule Holds', starter: false, pro: true, enterprise: true },
        { name: 'Overcapacity & Safety Guardrails', starter: true, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Administration & Reporting',
      items: [
        { name: 'Mandatory Rejection Justifications', starter: true, pro: true, enterprise: true },
        { name: 'Campus Space Utilization Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Executive Custom' },
        { name: 'Audit Trail Logs (CHED & ISO Compliance)', starter: '30 Days', pro: '1 Year', enterprise: 'Permanent' },
        { name: 'Institutional Isolation (No Data Bleed)', starter: true, pro: true, enterprise: true },
      ],
    },
  ];

  const faqs = [
    {
      q: 'How quickly can our university deploy SmartSpace?',
      a: 'A typical single-campus rollout takes less than 48 hours. Our onboarding team provides pre-formatted CSV templates to import your existing room inventory, operating hours, and equipment catalogs in one click.',
    },
    {
      q: 'Does SmartSpace comply with the Philippine Data Privacy Act (RA 10173)?',
      a: 'Yes, absolutely. SmartSpace is architected with strict multi-tenant institutional isolation. Student IDs, faculty records, and reservation justifications remain private to your institution and are never shared across universities.',
    },
    {
      q: 'Can student organizations book spaces directly from mobile phones?',
      a: 'Yes! SmartSpace is fully responsive across all modern mobile browsers. Requesters can check slot availability, attach activity endorsement forms, and present their approved QR permits directly from their smartphones to security guards at facility gates.',
    },
    {
      q: 'Do security personnel or building custodians need a paid license?',
      a: 'No. Security guards and building custodians can scan and verify QR permits using any standard mobile camera without requiring a paid SmartSpace license.',
    },
    {
      q: 'What payment and procurement terms are supported?',
      a: 'We accept government and institutional purchase orders (PO), bank wire transfers, and corporate card billing. Annual subscriptions include official BIR compliant receipts and university vendor accredited invoicing.',
    },
  ];

  return (
    <section id="pricing" className="space-y-12 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Transparent Institutional Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Scalable Plans for Single Campuses & Multi-University Systems
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Predictable SaaS subscriptions designed for higher education budgets. No hidden per-booking surcharges or unexpected student access fees.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAnnual
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                isAnnual ? 'bg-amber-300 text-slate-950' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          return (
            <div
              key={tier.name}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? 'bg-slate-950 text-white border-2 border-purple-500 shadow-2xl ring-4 ring-purple-500/20 md:-translate-y-2'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight">{tier.name}</h3>
                  <p className={`text-xs mt-2 leading-relaxed ${tier.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                    {tier.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                      ₱{price.toLocaleString()}
                    </span>
                    <span className={`text-xs font-semibold ${tier.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      / month
                    </span>
                  </div>
                  <p className={`text-[11px] mt-1 ${tier.popular ? 'text-purple-300' : 'text-slate-400'}`}>
                    {isAnnual ? 'Billed annually · Includes 2 months free' : 'Billed monthly · Cancel anytime'}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <p className={`text-xs font-bold uppercase tracking-wider ${tier.popular ? 'text-slate-300' : 'text-slate-700'}`}>
                    Plan Capabilities
                  </p>
                  <ul className="space-y-2.5 text-xs">
                    {tier.specs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-emerald-400' : 'text-purple-600'}`} />
                        <span className={tier.popular ? 'text-slate-200' : 'text-slate-700'}>{spec}</span>
                      </li>
                    ))}
                    {tier.missingSpecs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-2.5 opacity-40">
                        <X className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                        <span className={tier.popular ? 'text-slate-400' : 'text-slate-400'}>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-slate-200/20">
                <button
                  type="button"
                  onClick={() => {
                    if (tier.name === 'Multi-Campus Enterprise') {
                      setIsDemoModalOpen(true);
                    } else {
                      openAuthPortal('institution', 'register', 'login');
                    }
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                      : 'bg-purple-700 hover:bg-purple-800 text-white'
                  }`}
                >
                  <span>{tier.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-950">
            Comprehensive Feature Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Detailed breakdown of capabilities across all SmartSpace subscription tiers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold text-slate-700">Feature</th>
                <th className="py-3 px-4 text-center font-bold text-slate-700">Campus Starter</th>
                <th className="py-3 px-4 text-center font-bold text-purple-700">University Pro</th>
                <th className="py-3 px-4 text-center font-bold text-slate-900">Multi-Campus Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonFeatures.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="bg-slate-50/80">
                    <td colSpan={4} className="py-2.5 px-4 font-black text-slate-800 uppercase tracking-wider text-[10px]">
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item, iIdx) => (
                    <tr key={iIdx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                      <td className="py-3 px-4 text-center">
                        {typeof item.starter === 'boolean' ? (
                          item.starter ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="font-semibold text-slate-600">{item.starter}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center bg-purple-50/40">
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <CheckCircle2 className="w-4 h-4 text-purple-700 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="font-bold text-purple-900">{item.pro}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {typeof item.enterprise === 'boolean' ? (
                          item.enterprise ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 mx-auto" />
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

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-950">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500">
            Everything university boards and physical plant managers need to know about SmartSpace.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm hover:text-purple-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
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
    </section>
  );
};
