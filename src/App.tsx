/**
 * PERITO IP — Aplicación Principal
 * 
 * Integra la UI funcional (Fase 5) con la documentación técnica (Fase 1).
 */

import React from 'react';
import { AppProvider, useApp } from './ui/context';
import { AppShell } from './ui/components/AppShell';
import { Dashboard } from './ui/views/Dashboard';
import { CasesView } from './ui/views/CasesView';
import { CaseDetail } from './ui/views/CaseDetail';
import { AgentWorkspace } from './ui/views/AgentWorkspace';
import { 
  DocumentsView, 
  EvidenceView, 
  ContractsView, 
  ValuationView, 
  ReportsView,
  SettingsView 
} from './ui/views/SimpleViews';
import { RightsWorkspace } from './ui/views/RightsWorkspace';
import { ValuationWorkspace } from './ui/views/ValuationWorkspace';
import { ScenarioLab } from './ui/views/ScenarioLab';
import { ReviewCenter } from './ui/views/ReviewCenter';
import { LibraryView } from './ui/views/LibraryView';
import DocumentationRouter from './DocumentationRouter';

function AppContent() {
  const { uiState } = useApp();

  const renderView = () => {
    switch (uiState.currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'cases':
        return <CasesView />;
      case 'case-detail':
        return <CaseDetail />;
      case 'documents':
        return <DocumentsView />;
      case 'evidence':
        return <EvidenceView />;
      case 'contracts':
        return <ContractsView />;
      case 'rights':
        return <RightsWorkspace />;
      case 'valuation':
        return <ValuationWorkspace />;
      case 'scenarios':
        return <ScenarioLab />;
      case 'review':
        return <ReviewCenter />;
      case 'library':
        return <LibraryView />;
      case 'agent':
        return <AgentWorkspace />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'documentation':
        return <DocumentationRouter />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell>
      {renderView()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
