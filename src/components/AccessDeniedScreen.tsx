import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, LogOut } from 'lucide-react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from './SmartSpaceLogo';

interface AccessDeniedScreenProps {
  requiredRole: 'super_admin' | 'university_admin' | 'user';
  attemptedPath: string;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({ requiredRole, attemptedPath }) => {
  const { navigate } = useRouter();
  const { currentUser, currentRole, logout } = useApp();

  let requiredRoleLabel = 'Platform Super Administrator';
  let redirectPath = '/';
  let redirectLabel = 'Return to Homepage';

  if (requiredRole === 'university_admin') {
    requiredRoleLabel = 'University Facility Administrator';
  } else if (requiredRole === 'user') {
    requiredRoleLabel = 'Authorized End-User (Student / Faculty)';
  }

  if (currentRole === 'super_admin') {
    redirectPath = '/superadmin/dashboard';
    redirectLabel = 'Return to Super Admin Console';
  } else if (currentRole === 'university_admin' || currentRole === 'admin') {
    redirectPath = '/university/dashboard';
    redirectLabel = 'Return to University Admin Dashboard';
  } else if (currentRole === 'student' || currentRole === 'faculty') {
    redirectPath = '/user/dashboard';
    redirectLabel = 'Return to User Dashboard';
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-red-200 shadow-xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Security Authorization Boundary
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Access Denied (HTTP 403)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You do not have the required permissions to access this route. SmartSpace strictly enforces role-based access control and multi-tenant isolation.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Attempted Route:</span>
            <span className="font-mono font-bold text-slate-800">{attemptedPath}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Required Privilege:</span>
            <span className="font-bold text-red-700">{requiredRoleLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Current Session:</span>
            <span className="font-semibold text-slate-700">
              {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Unauthenticated Visitor'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(redirectPath)}
            className="flex-1 py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{redirectLabel}</span>
          </button>
          {currentUser && (
            <button
              onClick={() => {
                logout();
                navigate('/access');
              }}
              className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
