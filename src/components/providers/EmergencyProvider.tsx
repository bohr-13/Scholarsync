'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EmergencyModeState } from '@/types';

interface EmergencyContextType {
  emergency: EmergencyModeState;
  toggleEmergency: () => void;
  deactivateEmergency: () => void;
}

const EmergencyContext = createContext<EmergencyContextType>({
  emergency: { isActive: false },
  toggleEmergency: () => {},
  deactivateEmergency: () => {},
});

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const [emergency, setEmergency] = useState<EmergencyModeState>({
    isActive: false,
  });

  const toggleEmergency = useCallback(() => {
    setEmergency((prev) => ({
      isActive: !prev.isActive,
      activatedAt: !prev.isActive ? new Date().toISOString() : undefined,
    }));
  }, []);

  const deactivateEmergency = useCallback(() => {
    setEmergency({ isActive: false });
  }, []);

  return (
    <EmergencyContext.Provider value={{ emergency, toggleEmergency, deactivateEmergency }}>
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergencyMode() {
  return useContext(EmergencyContext);
}
