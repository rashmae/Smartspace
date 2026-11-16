import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { SuperAdminView } from '../components/SuperAdminView';
import {
  ShieldCheck,
  Lock,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface SuperAdminPortalProps {
  initialSubRoute?: 'login' | 'dashboard';
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = () => {
  const { navigate, currentPath } = useRouter();
  const {
    currentUser,
    signInWithGoogle,
    logout,
    allInstitutions,
  } = useApp();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isLoginPage = currentPath === '/superadmin/login';

  // Fetch non-sensitive server-side security status only when local dev server exists
  useEffect(() => {
    if (isLoginPage || currentPath === '/superadmin/dashboard') {
      fetch('/api/superadmin/security-status').catch(() => null);
    }
  }, [isLoginPage, currentPath]);

  // -------------------------------------------------------------
  // 1. SUPER ADMIN LOGIN (/superadmin/login)
  // -------------------------------------------------------------
  if (isLoginPage) {
    const handleGoogleSuperAdminLogin = async () => {
      setAuthError(null);
      setIsVerifying(true);
      const res = await signInWithGoogle('super_admin');
      setIsVerifying(false);
      if (res.success) {
        navigate('/superadmin/dashboard');
      } else {
        setAuthError(
          res.error ||
            'Unable to sign in. Ensure you are using an authorized platform administrator Google account.'
        );
      }
    };

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {/* Global Nav Bar */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button type="button" aria-label="SmartSpace Home" onClick={() => navigate('/')} className="cursor-pointer hover:opacity-95">
              <SmartSpaceLogo size={34} showTagline={false} theme="light" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/access')}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        {/* Main Authentication Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
            {/* Left Panel */}
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <SmartSpaceLogo variant="mark-only" size={64} theme="dark" prominent={true} />
                  <SmartSpaceLogo size={32} showTagline={true} theme="dark" />
                </div>

                <div className="space-y-3 pt-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Governance Console</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Platform Super Admin
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Authorized platform engineering and multi-university operations console.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Firebase Auth &amp; Firestore rules enforcement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Cross-campus conflict engine management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Institution registration verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Session-scoped administrative audit trail</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  Firebase Auth Active
                </span>
                <span className="font-mono text-slate-300">HTTPS / TLS</span>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-10 flex flex-col justify-center space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restricted Access</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Super Admin Sign In
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sign in with an authorized Google account verified against Firebase Authentication and Firestore platform governance rules.
                </p>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="font-medium leading-relaxed">{authError}</span>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleGoogleSuperAdminLogin}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 min-h-[48px]"
                >
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                  <span>{isVerifying ? 'Verifying with Firebase...' : 'Continue with Google (Firebase Auth)'}</span>
                </button>
              </div>

              {/* Secure Platform Policy Notice */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Authorized Personnel Only</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Access is restricted to verified platform administrator accounts configured in Firestore and project governance rules.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. SUPER ADMIN DASHBOARD (/superadmin/dashboard)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Super Admin Topbar */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SmartSpaceLogo size={32} showTagline={false} theme="dark" />
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Platform Operations Console
                </span>
                <span className="text-xs font-bold text-white">
                  Multi-University Network ({allInstitutions.length} Workspaces)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white">
                {currentUser?.name || 'Platform Super Admin'}
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">
                {currentUser?.email || 'Authorized Operator'}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/access');
              }}
              aria-label="Sign Out from Platform Console"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out from Platform Console"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Super Admin Management Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SuperAdminView />
      </main>

      {/* Super Admin Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>
            SmartSpace SaaS Platform Administration · Firebase Authentication &amp; Firestore Rules Enforcement
          </p>
          <p className="text-emerald-300 font-medium">
            Multi-Tenant Pilot Network
          </p>
        </div>
      </footer>
    </div>
  );
};

