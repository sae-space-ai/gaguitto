/**
 * PERITO IP — Fase 5: Contexto Global de Aplicación
 * 
 * Maneja estado de UI, datos de registros y navegación.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Route, UIState } from './config';
import { createFictitiousCases } from '../records';
import { PericialAgent } from '../agent';
import { createCatalogFixtures, CatalogFixtures } from '../catalog';

interface AppContextType {
  // UI State
  uiState: UIState;
  setRoute: (route: Route, caseId?: string) => void;
  toggleSidebar: () => void;
  
  // Data
  registries: ReturnType<typeof createFictitiousCases>;
  agent: PericialAgent;
  catalog: CatalogFixtures | null;
  
  // Active Case
  activeCase: ReturnType<typeof createFictitiousCases>['caseManagement'] extends infer T ? T extends { get: (id: string) => infer R } ? R | null : never : never;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [registries] = useState(() => createFictitiousCases());
  const [agent] = useState(() => new PericialAgent({
    caseMgmt: registries.caseManagement,
    documents: registries.documents,
    evidences: registries.evidences,
    sources: registries.sources,
    contracts: registries.contracts,
    rights: registries.rights,
    parties: registries.parties,
    chains: registries.chains,
    assumptions: registries.assumptions,
    auditLog: registries.auditLog,
    conflicts: registries.conflicts,
    lineage: registries.lineage,
    bridge: registries.bridge,
  }));
  
  // Fase 6: Catálogo maestro
  const [catalog, setCatalog] = useState<CatalogFixtures | null>(null);
  
  useEffect(() => {
    createCatalogFixtures().then(setCatalog);
  }, []);
  
  const [uiState, setUIState] = useState<UIState>({
    currentRoute: 'dashboard',
    activeCaseId: null,
    sidebarCollapsed: false,
    theme: 'light',
  });

  const setRoute = (route: Route, caseId?: string) => {
    setUIState(prev => ({
      ...prev,
      currentRoute: route,
      activeCaseId: caseId !== undefined ? caseId : prev.activeCaseId,
    }));
  };

  const toggleSidebar = () => {
    setUIState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  };

  const activeCase = uiState.activeCaseId 
    ? registries.caseManagement.get(uiState.activeCaseId) || null
    : null;

  return (
    <AppContext.Provider value={{
      uiState,
      setRoute,
      toggleSidebar,
      registries,
      agent,
      catalog,
      activeCase,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
