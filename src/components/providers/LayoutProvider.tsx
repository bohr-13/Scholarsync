'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  isSidebarCollapsed: true,
  setSidebarCollapsed: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    // Check initial viewport size to set correct default state
    const checkWidth = () => {
      if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false); // Expanded on desktop
      } else {
        setSidebarCollapsed(true); // Collapsed on tablet
      }
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
