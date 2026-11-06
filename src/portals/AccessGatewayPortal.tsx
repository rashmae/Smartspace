import React from 'react';
import { useRouter } from '../router/RouterContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const AccessGatewayPortal: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-95 transition-opacity"
            title="Return to SmartSpace Homepage"
          >
            <SmartSpaceLogo size={34} showTagline={true} />
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-slate-600 hover:text-[#0077C8] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </header>

      {/* Main Gateway Selection */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-between">
        <div className="space-y-10">
          {/* Headline */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0077C8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              SmartSpace Access Gateway
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Select Your SmartSpace Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              SmartSpace strictly separates institutional administration from campus organization booking workflows. Choose your portal below to continue.
            </p>
          </div>

          {/* The Two Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* OPTION A: FOR INSTITUTIONS */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#0077C8] p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-13 h-13 rounded-2xl bg-blue-50 text-[#0077C8] flex items-center justify-center border border-blue-200">
                  <Building2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077C8] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    Primary Customers
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 pt-1 tracking-tight">
                    For Institutions
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 font-medium">
                    Manage your university's facilities, reservations, conflict policies, and administrative operations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-2">
                  <p className="font-bold text-blue-900">Audience Scope:</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Authorized facility managers, physical plant directors, department chairs, and campus administrators representing a registered higher education institution.
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                    <span>Campus facility catalog & operating rules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                    <span>Approval and rejection review workflows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                    <span>Utilization analytics & audit logs</span>
                  </li>
                </ul>
              </div>

              {/* Actions for Option A */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/university/login')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>University Admin Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/university/register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0077C8] border border-blue-200 font-bold text-xs transition-colors text-center cursor-pointer"
                >
                  Register Your Institution
                </button>
              </div>
            </div>

            {/* OPTION B: FOR ORGANIZATIONS AND USERS */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-200">
                  <Users className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    Campus End Users
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 pt-1 tracking-tight">
                    For Organizations & Users
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 font-medium">
                    Find campus facilities, submit reservation requests, and track your organization's bookings.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs text-slate-900 space-y-2">
                  <p className="font-bold text-slate-900">Audience Scope:</p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Student organization officers, clubs, faculty members, academic departments, and recognized university campus offices.
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time venue availability verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Digital reservation submission & tracking</span>
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
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>User Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/user/register')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition-colors text-center cursor-pointer"
                >
                  Create an Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Restricted Super Admin Link at the Bottom */}
        <div className="pt-12 text-center text-xs text-slate-400">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-slate-100 border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Platform Operations:</span>
            <button
              onClick={() => navigate('/superadmin/login')}
              className="text-[#0077C8] font-bold hover:underline cursor-pointer"
            >
              Authorized SmartSpace Administrators
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
