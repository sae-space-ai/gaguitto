/**
 * PERITO IP — Fase 5: Configuración de UI
 * 
 * Define configuración global, rutas y tipos de la interfaz.
 */

export const PRODUCT_CONFIG = {
  name: 'PERITO IP',
  version: '1.0.0',
  tagline: 'Sistema Pericial de Valoración de Propiedad Intelectual',
};

export type Route =
  | 'dashboard'
  | 'cases'
  | 'case-detail'
  | 'documents'
  | 'evidence'
  | 'contracts'
  | 'rights'
  | 'valuation'
  | 'scenarios'
  | 'agent'
  | 'review'
  | 'library'
  | 'reports'
  | 'settings'
  | 'documentation';

export interface UIState {
  currentRoute: Route;
  activeCaseId: string | null;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}

export interface NavigationItem {
  route: Route;
  label: string;
  icon: string;
  badge?: number;
  comingSoon?: boolean;
}

export const NAVIGATION: NavigationItem[] = [
  { route: 'dashboard', label: 'Inicio', icon: '🏠' },
  { route: 'cases', label: 'Expedientes', icon: '📁' },
  { route: 'documents', label: 'Documentos', icon: '📄' },
  { route: 'evidence', label: 'Evidencias', icon: '🔍' },
  { route: 'contracts', label: 'Contratos', icon: '📝' },
  { route: 'rights', label: 'Derechos', icon: '⚖️' },
  { route: 'valuation', label: 'Valoración', icon: '💰' },
  { route: 'scenarios', label: 'Escenarios', icon: '📊' },
  { route: 'agent', label: 'Agente Pericial', icon: '🤖' },
  { route: 'review', label: 'Centro de Revisión', icon: '⚠️' },
  { route: 'library', label: 'Biblioteca', icon: '📚' },
  { route: 'reports', label: 'Informes', icon: '📑' },
  { route: 'settings', label: 'Configuración', icon: '⚙️' },
  { route: 'documentation', label: 'Documentación Técnica', icon: '📚' },
];
