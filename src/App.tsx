import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RouterProvider, useRouter } from './router/RouterContext';
import { PublicMarketingPortal } from './portals/PublicMarketingPortal';
import { RequestDemoPage } from './portals/RequestDemoPage';
import { AccessGatewayPortal } from './portals/AccessGatewayPortal';
import { EndUserPortal } from './portals/EndUserPortal';
import { UniversityAdminPortal } from './portals/UniversityAdminPortal';
import { SuperAdminPortal } from './portals/SuperAdminPortal';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';
import { ToastContainer } from './components/ToastContainer';

const AppRouteDispatcher: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { currentUser, currentRole, isLoggedIn } = useApp();

  // Normalize path
  const path = currentPath || '/';

  // -------------------------------------------------------------
  // ROUTE 1: PUBLIC MARKETING WEBSITE (/)
  // -------------------------------------------------------------
  if (path === '/' || path === '') {
    return <PublicMarketingPortal />;
  }

  // -------------------------------------------------------------
  // ROUTE 2: INSTITUTIONAL DEMO REQUEST (/request-demo)
  // -------------------------------------------------------------
  if (path === '/request-demo') {
    return <RequestDemoPage />;
  }

  // -------------------------------------------------------------
  // ROUTE 3: ACCESS SELECTION GATEWAY (/access)
  // -------------------------------------------------------------
  if (path === '/access') {
    return <AccessGatewayPortal />;
  }

  // -------------------------------------------------------------
  // ROUTE 4: END-USER PORTAL (/user/*)
  // -------------------------------------------------------------
  if (path === '/user/login') {
    return <EndUserPortal initialSubRoute="login" />;
  }

  if (path === '/user/register') {
    return <EndUserPortal initialSubRoute="register" />;
  }

  if (path === '/user/dashboard') {
    // If user is not authenticated at all, redirect to login
    if (!isLoggedIn || !currentUser) {
      return <EndUserPortal initialSubRoute="login" />;
    }

    // If an authenticated user is super_admin or university_admin, show boundary or render user portal
    return <EndUserPortal initialSubRoute="dashboard" />;
  }

  // -------------------------------------------------------------
  // ROUTE 5: UNIVERSITY ADMIN PORTAL (/university/*)
  // -------------------------------------------------------------
  if (path === '/university/login') {
    return <UniversityAdminPortal initialSubRoute="login" />;
  }

  if (path === '/university/register') {
    return <UniversityAdminPortal initialSubRoute="register" />;
  }

  if (path === '/university/dashboard') {
    // If not authenticated, redirect to university login
    if (!isLoggedIn || !currentUser) {
      return <UniversityAdminPortal initialSubRoute="login" />;
    }

    // Role Guard: Student or faculty end users cannot access university admin
    if (currentRole === 'student' || currentRole === 'faculty') {
      return <AccessDeniedScreen requiredRole="university_admin" attemptedPath="/university/dashboard" />;
    }

    return <UniversityAdminPortal initialSubRoute="dashboard" />;
  }

  // -------------------------------------------------------------
  // ROUTE 6: SUPER ADMIN PORTAL (/superadmin/*)
  // -------------------------------------------------------------
  if (path === '/superadmin/login') {
    return <SuperAdminPortal initialSubRoute="login" />;
  }

  if (path === '/superadmin/dashboard') {
    // If not authenticated, redirect to superadmin login
    if (!isLoggedIn || !currentUser) {
      return <SuperAdminPortal initialSubRoute="login" />;
    }

    // Role Guard: Only super_admin can enter
    if (currentRole !== 'super_admin') {
      return <AccessDeniedScreen requiredRole="super_admin" attemptedPath="/superadmin/dashboard" />;
    }

    return <SuperAdminPortal initialSubRoute="dashboard" />;
  }

  // Fallback 404: Return to public homepage
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-200">
        <h2 className="text-2xl font-black text-slate-900">Page Not Found (404)</h2>
        <p className="text-xs text-slate-500">
          The requested route <code className="font-mono text-[#0077C8]">{path}</code> does not exist on SmartSpace.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs cursor-pointer shadow-md"
        >
          Return to Public Homepage
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <RouterProvider>
        <AppRouteDispatcher />
        <ToastContainer />
      </RouterProvider>
    </AppProvider>
  );
}
