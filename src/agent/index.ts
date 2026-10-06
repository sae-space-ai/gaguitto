/**
 * PERITO IP — Fase 4: Barrel Export
 * 
 * Todos los componentes del agente pericial.
 */

// Tipos
export * from './types';

// Core
export {
  buildCaseContext,
  verifyContextIsolation,
  ToolOrchestrator,
  verifyClaim,
  CitationManager,
  validateResponse,
  AgentAuditLogger,
  detectPromptInjection,
} from './core';

// Analizadores y coordinadores
export {
  analyzeContract,
  analyzeRights,
  analyzeChainOfTitle,
  checkValuationReadiness,
  explainCalculation,
  generateQuestions,
  assessUncertainty,
  manageConflicts,
} from './analyzers';

// Agente principal
export { PericialAgent } from './pericial-agent';
