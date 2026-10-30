import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute =
  | '/'
  | '/request-demo'
  | '/access'
  | '/user/login'
  | '/user/register'
  | '/user/dashboard'
  | '/university/login'
  | '/university/register'
  | '/university/dashboard'
  | '/superadmin/login'
  | '/superadmin/dashboard';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
        setCurrentPath(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
