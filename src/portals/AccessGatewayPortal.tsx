import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { GuidedOnboardingWizard } from '../components/GuidedOnboardingWizard';
import { SpringSurface } from '../components/MotionPrimitives';
import { BUSINESS_CONFIG } from '../config/business';
import { useConsent } from '../context/ConsentContext';
import { motion } from 'motion/react';
import {
  Building2,
  Users,
  ArrowLeft,
  ArrowRight,
  Lock,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export const AccessGatewayPortal: React.FC = () => {
  const { navigate } = useRouter();
  const { openPreferences } = useConsent();
  const [gatewayMode, setGatewayMode] = useState<'direct' | 'guided'>('direct');

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            title="Return to SmartSpace Homepage"
          >
            <SmartSpaceLogo size={30} compact={true} showTagline={false} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-slate-600 hover:text-[#0077C8] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Website</span>
          </button>
        </div>
      </header>

      {/* Main Gateway Selection */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-between">
        <div className="space-y-10">
          {/* Headline + Mode Switcher */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0077C8]">
              SmartSpace Access Gateway · Role-Isolated Portals
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-[-0.03em]">
              Select Your SmartSpace Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              SmartSpace cleanly separates university administration from student and faculty booking workflows. Choose directly or use the 30-second guided setup.
            </p>

            {/* Framer-style spring segmented mode switcher */}
            <div className="pt-2 flex justify-center">
              <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-xs">
                {[
                  { id: 'direct' as const, label: 'Direct Portal Selection' },
                  { id: 'guided' as const, label: '30-Sec Guided Setup', icon: <Compass className="w-3.5 h-3.5" /> },
                ].map((tab) => {
                  const active = gatewayMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setGatewayMode(tab.id)}
                      className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        active ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="gateway-mode-pill"
                          transition={{ type: 'spring', stiffness: 440, damping: 32 }}
                          className="absolute inset-0 bg-slate-900 rounded-lg"
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {gatewayMode === 'guided' ? (
            <div className="max-w-3xl mx-auto">
              <GuidedOnboardingWizard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
              {/* OPTION A: FOR INSTITUTIONS */}
              <SpringSurface className="bg-white rounded-2xl border border-slate-200 hover:border-[#0077C8] p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 text-[#0077C8] flex items-center justify-center border border-slate-200">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0077C8]">
                      Primary Customers
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-950 pt-0.5 tracking-tight">
                      For Institutions
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      Manage your university's facilities, reservations, conflict policies, and physical plant operations.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-900">Audience Scope</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Facility managers, physical plant directors, department chairs, and authorized campus administrators.
                    </p>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                      <span>Campus facility catalog &amp; operating rules</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                      <span>Approval and rejection review workflows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                      <span>Utilization analytics &amp; audit logs</span>
                    </li>
                  </ul>
                </div>

                {/* Actions for Option A */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/university/login')}
                    className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>University Admin Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/university/register')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-colors text-center cursor-pointer"
                  >
                    Register Your Institution
                  </button>
                </div>
              </SpringSurface>

              {/* OPTION B: FOR ORGANIZATIONS AND USERS */}
              <SpringSurface className="bg-white rounded-2xl border border-slate-200 hover:border-slate-900 p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-200">
                    <Users className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      Campus End Users
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-950 pt-0.5 tracking-tight">
                      For Organizations &amp; Users
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      Discover campus facilities, submit conflict-checked reservation requests, and track permits.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-900">Audience Scope</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Student organization officers, clubs, faculty members, academic departments, and university offices.
                    </p>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Real-time venue availability verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Digital reservation submission &amp; tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Official QR code gate entry permits</span>
                    </li>
                  </ul>
                </div>

                {/* Actions for Option B */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/user/login')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>User Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/user/register')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-colors text-center cursor-pointer"
                  >
                    Create an Account
                  </button>
                </div>
              </SpringSurface>
            </div>
          )}
        </div>

        {/* Restricted Super Admin Link at the Bottom */}
        <div className="pt-12 text-center text-xs text-slate-500">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-white border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Platform Operations:</span>
            <button
              type="button"
              onClick={() => navigate('/superadmin/login')}
              className="text-[#0077C8] font-bold hover:underline cursor-pointer"
            >
              Authorized SmartSpace Administrators
            </button>
          </div>
        </div>
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
