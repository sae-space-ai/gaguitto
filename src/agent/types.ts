/**
 * PERITO IP — Fase 4: Tipos del Agente Pericial
 * 
 * Define la estructura del agente, herramientas, claims, citas,
 * clasificación epistemológica y respuestas estructuradas.
 * 
 * PRINCIPIO: El agente NO es fuente autónoma de verdad ni calculadora.
 * El agente coordina, consulta, verifica y explica.
 * Los cálculos los ejecutan los motores deterministas de Fase 2.
 * La evidencia la conservan los registros de Fase 3.
 */

// ============================================================
// CLASIFICACIÓN EPISTEMOLÓGICA
// ============================================================

export type EpistemicCategory =
  | 'FACT'              // Requiere evidencia identificable
  | 'EXTERNAL_DATA'     // Vinculado a Source Registry
  | 'CONTRACTUAL_FACT'  // Vinculado a contrato y cláusula
  | 'ALLEGATION'        // Afirmación no acreditada
  | 'INFERENCE'         // Deriva de hechos declarados
  | 'ASSUMPTION'        // Registrada y visible
  | 'CALCULATION'       // Procedente de motor determinista
  | 'OPINION'           // Juicio analítico identificado
  | 'UNKNOWN'           // Ausencia de conocimiento suficiente
  | 'CONFLICTED';       // Evidencia incompatible

// ============================================================
// CLAIM OBJECT
// ============================================================

export interface Claim {
  claimId: string;
  caseId: string;
  claimText: string;
  claimType: EpistemicCategory;
  supportingEvidenceIds: string[];
  supportingSourceIds: string[];
  contractIds: string[];
  rightIds: string[];
  calculationIds: string[];
  assumptionIds: string[];
  confidence: number; // 0-100
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'CONFLICTED' | 'UNKNOWN' | 'NOT_FOUND';
  createdAt: string;
  modelVersion?: string;
}

// ============================================================
// CITATION
// ============================================================

export interface Citation {
  citationId: string;
  claimId: string;
  documentId?: string;
  pageOrSection?: string; // NO inventar si no se conoce
  evidenceId?: string;
  sourceId?: string;
  contractId?: string;
  clauseId?: string;
  rightId?: string;
  calculationId?: string;
  quote?: string;
}

// ============================================================
// HERRAMIENTAS AUTORIZADAS (WHITELIST)
// ============================================================

export type ToolName =
  // Lectura de expedientes
  | 'get_case'
  | 'search_case_documents'
  | 'get_document'
  | 'search_evidence'
  | 'get_evidence'
  | 'search_sources'
  | 'get_source'
  | 'search_contracts'
  | 'get_contract'
  | 'get_contract_clause'
  | 'get_rights'
  | 'get_right'
  | 'get_rights_graph'
  | 'get_chain_of_title'
  | 'get_assumptions'
  | 'get_conflicts'
  | 'get_existing_calculations'
  // Motores de Fase 2
  | 'run_dcf'
  | 'run_royalty_model'
  | 'run_cost_valuation'
  | 'run_market_comparables'
  | 'run_book_valuation'
  | 'run_audiovisual_valuation'
  | 'run_adaptation_rights'
  | 'run_relief_from_royalty'
  | 'run_scenario'
  | 'run_monte_carlo'
  | 'run_lost_profits'
  | 'run_hypothetical_license'
  | 'run_sensitivity'
  | 'run_double_counting_check'
  | 'run_triangulation'
  // Investigación
  | 'search_external_sources'
  // What-if
  | 'run_what_if';

export type ToolCategory = 'READ' | 'WRITE' | 'DESTRUCTIVE' | 'CALCULATION' | 'RESEARCH';

export interface ToolDefinition {
  name: ToolName;
  category: ToolCategory;
  description: string;
  inputSchema: Record<string, string>; // param -> description
  outputSchema: string;
  requiresCaseId: boolean;
  requiresConfirmation: boolean;
}

export interface ToolCall {
  toolName: ToolName;
  parameters: Record<string, unknown>;
  caseId?: string;
  purpose: string;
}

export interface ToolResult {
  toolName: ToolName;
  success: boolean;
  data?: unknown;
  error?: string;
  warnings?: string[];
  executionTime: number;
}

// ============================================================
// CONTEXTO DE CASO
// ============================================================

export interface CaseContext {
  caseId: string;
  summary: {
    name: string;
    type: string;
    valuationDate: string;
    status: string;
  };
  relevantDocuments: { documentId: string; type: string; description: string }[];
  relevantEvidences: { evidenceId: string; type: string; fact: string; status: string }[];
  relevantSources: { sourceId: string; title: string; tier: number }[];
  relevantContracts: { contractId: string; type: string; title: string }[];
  relevantRights: { rightId: string; type: string; owner: string; status: string }[];
  relevantCalculations: { calculationId: string; method: string; value: string }[];
  relevantAssumptions: { assumptionId: string; description: string; status: string }[];
  openConflicts: number;
  chainGaps: number;
  unverifiedEvidences: number;
}

// ============================================================
// RESPUESTA DEL AGENTE
// ============================================================

export interface AgentResponse {
  question: string;
  caseId?: string;
  findings: string[];
  verifiedFacts: Claim[];
  unverifiedItems: { text: string; reason: string }[];
  conflicts: { conflictId: string; description: string; severity: string }[];
  assumptions: { assumptionId: string; description: string }[];
  calculations: { calculationId: string; method: string; value: string; trace: string }[];
  sources: { sourceId: string; title: string }[];
  citations: Citation[];
  limitations: string[];
  nextRequiredActions: string[];
  status: 'COMPLETE' | 'PARTIAL' | 'REVIEW_REQUIRED' | 'INSUFFICIENT_DATA' | 'ERROR';
  epistemicBreakdown: Record<EpistemicCategory, number>;
}

// ============================================================
// VALUATION READINESS
// ============================================================

export type ValuationReadiness = 'READY' | 'PARTIALLY_READY' | 'NOT_READY' | 'REVIEW_REQUIRED';

export interface ValuationReadinessCheck {
  status: ValuationReadiness;
  reasons: string[];
  missingInputs: string[];
  unverifiedEvidences: string[];
  openConflicts: string[];
  chainGaps: string[];
  canProceedExploratory: boolean;
  canProceedFinal: boolean;
}

// ============================================================
// AUDITORÍA DEL AGENTE
// ============================================================

export interface AgentAuditEntry {
  eventId: string;
  timestamp: string;
  caseId: string;
  agentAction: string;
  toolUsed?: ToolName;
  entityIds: string[];
  purpose: string;
  resultStatus: 'SUCCESS' | 'ERROR' | 'BLOCKED' | 'UNKNOWN';
  modelVersion?: string;
}

// ============================================================
// WHAT-IF SIMULATION
// ============================================================

export interface WhatIfSimulation {
  simulationId: string;
  caseId: string;
  description: string;
  modifiedInputs: { field: string; originalValue: string; simulatedValue: string }[];
  results: { calculationId: string; originalValue: string; simulatedValue: string }[];
  isSimulation: true; // Siempre etiquetado como simulación
  createdAt: string;
}

// ============================================================
// PLAN DE ACCIÓN
// ============================================================

export interface ActionPlan {
  planId: string;
  caseId: string;
  objective: string;
  steps: {
    stepNumber: number;
    action: string;
    tool?: ToolName;
    parameters?: Record<string, unknown>;
    expectedOutcome: string;
  }[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresHumanReview: boolean;
}

// ============================================================
// FALLBACK STATES
// ============================================================

export type FallbackState =
  | 'INSUFFICIENT_DATA'
  | 'SOURCE_UNAVAILABLE'
  | 'TOOL_ERROR'
  | 'CONFLICT_REQUIRES_REVIEW'
  | 'PERMISSION_DENIED'
  | 'UNSUPPORTED_REQUEST';

// ============================================================
// SOURCE QUALITY
// ============================================================

export type SourceQuality =
  | 'PRIMARY_OFFICIAL'
  | 'PRIMARY_NON_OFFICIAL'
  | 'PROFESSIONAL_DATABASE'
  | 'SECONDARY_RELIABLE'
  | 'SECONDARY_UNVERIFIED'
  | 'UNKNOWN_SOURCE';

// ============================================================
// UTILIDADES
// ============================================================

export function generateAgentId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${ts}-${rnd}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
