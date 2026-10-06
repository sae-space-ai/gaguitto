/**
 * PERITO IP — Fase 3: Barrel Export
 * 
 * Todos los registros de la capa probatoria y documental.
 */

// Tipos
export * from './types';

// Capa 3.3-3.4: Documentos e integridad
export { DocumentRegistry, computeDocumentHash, verifyDocumentIntegrity, HASH_LIMITATIONS } from './document-registry';
export type { DocumentInput } from './document-registry';

// Capa 3.5-3.9: Evidencias, verificación, fuentes
export { EvidenceRegistry, SourceRegistry, SOURCE_HIERARCHY, validateStatementSupport } from './evidence-source-registry';
export type { EvidenceInput, SourceInput } from './evidence-source-registry';

// Capa 3.13-3.18: Contratos, derechos, titulares, Rights Graph
export { ContractRegistry, RightsRegistry, PartyRegistry, RightsGraphBuilder } from './contracts-rights-parties';
export type { ContractInput, RightInput, PartyInput } from './contracts-rights-parties';

// Capa 3.19, 3.24-3.26, 3.30, 3.40: Chain, Assumptions, Audit, Conflicts, Gate, Lineage
export {
  ChainOfTitleEngine,
  AssumptionRegistry,
  AuditLog,
  ConflictEngine,
  DataLineageTracker,
  executeEvidenceGate,
} from './chain-audit-conflicts-gate';

// Capa 3.2, 3.23, 3.39: Cases, Health, Phase 2 Bridge
export { CaseManagement, computeCaseHealth, Phase2Bridge } from './case-management';
export type { CaseInput, Phase2BridgeInput } from './case-management';

// Expedientes ficticios
export { createFictitiousCases } from './fixtures';
