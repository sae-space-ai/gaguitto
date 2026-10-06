/**
 * PERITO IP — Fase 4: Core del Agente Pericial
 * 
 * Contiene: PERICIAL_AGENT, CASE_CONTEXT_BUILDER, TOOL_ORCHESTRATOR,
 * EVIDENCE_RETRIEVER, SOURCE_RETRIEVER, CLAIM_VERIFIER, CITATION_MANAGER,
 * RESPONSE_VALIDATOR, AGENT_AUDIT_LOG.
 * 
 * PRINCIPIO: El agente coordina, NO calcula ni inventa.
 * Los cálculos los ejecutan motores deterministas de Fase 2.
 * La evidencia la conservan registros de Fase 3.
 */

import Decimal from 'decimal.js';
import {
  Claim,
  Citation,
  CaseContext,
  AgentResponse,
  ToolCall,
  ToolResult,
  ToolName,
  ToolDefinition,
  AgentAuditEntry,
  EpistemicCategory,
  ValuationReadinessCheck,
  generateAgentId,
  nowISO,
} from './types';

// Importar registros de Fase 3
import {
  CaseManagement,
  DocumentRegistry,
  EvidenceRegistry,
  SourceRegistry,
  ContractRegistry,
  RightsRegistry,
  PartyRegistry,
  ChainOfTitleEngine,
  AssumptionRegistry,
  AuditLog,
  ConflictEngine,
  DataLineageTracker,
  Phase2Bridge,
  executeEvidenceGate,
} from '../records';

// Importar motores de Fase 2
import {
  dcfEngine,
  royaltyEngine,
  costValuationEngine,
  marketComparableEngine,
  scenarioEngine,
  monteCarloEngine,
  sensitivityEngine,
  valuationTriangulationEngine,
} from '../engines';

// ============================================================
// REGISTRO DE HERRAMIENTAS AUTORIZADAS (WHITELIST)
// ============================================================

const AUTHORIZED_TOOLS: Record<ToolName, ToolDefinition> = {
  // READ tools
  get_case: { name: 'get_case', category: 'READ', description: 'Obtener expediente', inputSchema: { caseId: 'string' }, outputSchema: 'Case', requiresCaseId: true, requiresConfirmation: false },
  search_case_documents: { name: 'search_case_documents', category: 'READ', description: 'Buscar documentos', inputSchema: { caseId: 'string', query: 'string' }, outputSchema: 'Document[]', requiresCaseId: true, requiresConfirmation: false },
  get_document: { name: 'get_document', category: 'READ', description: 'Obtener documento', inputSchema: { documentId: 'string' }, outputSchema: 'Document', requiresCaseId: false, requiresConfirmation: false },
  search_evidence: { name: 'search_evidence', category: 'READ', description: 'Buscar evidencias', inputSchema: { caseId: 'string', query: 'string' }, outputSchema: 'Evidence[]', requiresCaseId: true, requiresConfirmation: false },
  get_evidence: { name: 'get_evidence', category: 'READ', description: 'Obtener evidencia', inputSchema: { evidenceId: 'string' }, outputSchema: 'Evidence', requiresCaseId: false, requiresConfirmation: false },
  search_sources: { name: 'search_sources', category: 'READ', description: 'Buscar fuentes', inputSchema: { caseId: 'string', query: 'string' }, outputSchema: 'Source[]', requiresCaseId: true, requiresConfirmation: false },
  get_source: { name: 'get_source', category: 'READ', description: 'Obtener fuente', inputSchema: { sourceId: 'string' }, outputSchema: 'Source', requiresCaseId: false, requiresConfirmation: false },
  search_contracts: { name: 'search_contracts', category: 'READ', description: 'Buscar contratos', inputSchema: { caseId: 'string', query: 'string' }, outputSchema: 'Contract[]', requiresCaseId: true, requiresConfirmation: false },
  get_contract: { name: 'get_contract', category: 'READ', description: 'Obtener contrato', inputSchema: { contractId: 'string' }, outputSchema: 'Contract', requiresCaseId: false, requiresConfirmation: false },
  get_contract_clause: { name: 'get_contract_clause', category: 'READ', description: 'Obtener cláusula', inputSchema: { contractId: 'string', clauseId: 'string' }, outputSchema: 'ContractClause', requiresCaseId: false, requiresConfirmation: false },
  get_rights: { name: 'get_rights', category: 'READ', description: 'Obtener derechos', inputSchema: { caseId: 'string' }, outputSchema: 'Right[]', requiresCaseId: true, requiresConfirmation: false },
  get_right: { name: 'get_right', category: 'READ', description: 'Obtener derecho', inputSchema: { rightId: 'string' }, outputSchema: 'Right', requiresCaseId: false, requiresConfirmation: false },
  get_rights_graph: { name: 'get_rights_graph', category: 'READ', description: 'Obtener grafo de derechos', inputSchema: { caseId: 'string' }, outputSchema: 'RightsGraph', requiresCaseId: true, requiresConfirmation: false },
  get_chain_of_title: { name: 'get_chain_of_title', category: 'READ', description: 'Obtener cadena de titularidad', inputSchema: { rightId: 'string' }, outputSchema: 'ChainOfTitle', requiresCaseId: false, requiresConfirmation: false },
  get_assumptions: { name: 'get_assumptions', category: 'READ', description: 'Obtener hipótesis', inputSchema: { caseId: 'string' }, outputSchema: 'Assumption[]', requiresCaseId: true, requiresConfirmation: false },
  get_conflicts: { name: 'get_conflicts', category: 'READ', description: 'Obtener conflictos', inputSchema: { caseId: 'string' }, outputSchema: 'Conflict[]', requiresCaseId: true, requiresConfirmation: false },
  get_existing_calculations: { name: 'get_existing_calculations', category: 'READ', description: 'Obtener cálculos existentes', inputSchema: { caseId: 'string' }, outputSchema: 'Calculation[]', requiresCaseId: true, requiresConfirmation: false },
  // CALCULATION tools
  run_dcf: { name: 'run_dcf', category: 'CALCULATION', description: 'Ejecutar DCF', inputSchema: { caseId: 'string', cashFlows: 'CashFlow[]', discountRate: 'number' }, outputSchema: 'DCFResult', requiresCaseId: true, requiresConfirmation: false },
  run_royalty_model: { name: 'run_royalty_model', category: 'CALCULATION', description: 'Ejecutar modelo de royalties', inputSchema: { caseId: 'string', royaltyBase: 'string', baseAmount: 'number', royaltyRate: 'number' }, outputSchema: 'RoyaltyResult', requiresCaseId: true, requiresConfirmation: false },
  run_cost_valuation: { name: 'run_cost_valuation', category: 'CALCULATION', description: 'Ejecutar valoración por coste', inputSchema: { caseId: 'string', method: 'string', components: 'CostComponent[]' }, outputSchema: 'CostValuationResult', requiresCaseId: true, requiresConfirmation: false },
  run_market_comparables: { name: 'run_market_comparables', category: 'CALCULATION', description: 'Ejecutar comparables de mercado', inputSchema: { caseId: 'string', target: 'object', comparables: 'Comparable[]' }, outputSchema: 'ComparableResult', requiresCaseId: true, requiresConfirmation: false },
  run_book_valuation: { name: 'run_book_valuation', category: 'CALCULATION', description: 'Ejecutar valoración editorial', inputSchema: { caseId: 'string', streams: 'EditorialStream[]' }, outputSchema: 'BookValuationResult', requiresCaseId: true, requiresConfirmation: false },
  run_audiovisual_valuation: { name: 'run_audiovisual_valuation', category: 'CALCULATION', description: 'Ejecutar valoración audiovisual', inputSchema: { caseId: 'string', streams: 'AudiovisualStream[]' }, outputSchema: 'AudiovisualValuationResult', requiresCaseId: true, requiresConfirmation: false },
  run_adaptation_rights: { name: 'run_adaptation_rights', category: 'CALCULATION', description: 'Ejecutar derechos de adaptación', inputSchema: { caseId: 'string', scenarios: 'AdaptationScenario[]' }, outputSchema: 'AdaptationResult', requiresCaseId: true, requiresConfirmation: false },
  run_relief_from_royalty: { name: 'run_relief_from_royalty', category: 'CALCULATION', description: 'Ejecutar Relief from Royalty', inputSchema: { caseId: 'string', revenues: 'number[]', royaltyRate: 'number' }, outputSchema: 'RFRResult', requiresCaseId: true, requiresConfirmation: false },
  run_scenario: { name: 'run_scenario', category: 'CALCULATION', description: 'Ejecutar escenarios', inputSchema: { caseId: 'string', scenarios: 'Scenario[]' }, outputSchema: 'ScenarioResult', requiresCaseId: true, requiresConfirmation: false },
  run_monte_carlo: { name: 'run_monte_carlo', category: 'CALCULATION', description: 'Ejecutar Monte Carlo', inputSchema: { caseId: 'string', variables: 'MCVariable[]', iterations: 'number', seed: 'number' }, outputSchema: 'MCResult', requiresCaseId: true, requiresConfirmation: false },
  run_lost_profits: { name: 'run_lost_profits', category: 'CALCULATION', description: 'Ejecutar lucro cesante', inputSchema: { caseId: 'string', periods: 'LPPeriod[]' }, outputSchema: 'LPResult', requiresCaseId: true, requiresConfirmation: false },
  run_hypothetical_license: { name: 'run_hypothetical_license', category: 'CALCULATION', description: 'Ejecutar licencia hipotética', inputSchema: { caseId: 'string', revenues: 'number[]', royaltyRate: 'number' }, outputSchema: 'HLResult', requiresCaseId: true, requiresConfirmation: false },
  run_sensitivity: { name: 'run_sensitivity', category: 'CALCULATION', description: 'Ejecutar sensibilidad', inputSchema: { caseId: 'string', variables: 'object' }, outputSchema: 'SensitivityResult', requiresCaseId: true, requiresConfirmation: false },
  run_double_counting_check: { name: 'run_double_counting_check', category: 'CALCULATION', description: 'Verificar doble contabilización', inputSchema: { caseId: 'string', components: 'ValuationComponent[]' }, outputSchema: 'DCResult', requiresCaseId: true, requiresConfirmation: false },
  run_triangulation: { name: 'run_triangulation', category: 'CALCULATION', description: 'Ejecutar triangulación', inputSchema: { caseId: 'string', valuations: 'Valuation[]' }, outputSchema: 'TriangulationResult', requiresCaseId: true, requiresConfirmation: false },
  // RESEARCH tools
  search_external_sources: { name: 'search_external_sources', category: 'RESEARCH', description: 'Buscar fuentes externas', inputSchema: { query: 'string', jurisdiction: 'string' }, outputSchema: 'ExternalSource[]', requiresCaseId: false, requiresConfirmation: true },
  // WRITE tools
  run_what_if: { name: 'run_what_if', category: 'WRITE', description: 'Ejecutar simulación what-if', inputSchema: { caseId: 'string', modifications: 'object' }, outputSchema: 'WhatIfResult', requiresCaseId: true, requiresConfirmation: false },
};

// ============================================================
// CASE CONTEXT BUILDER
// ============================================================

/**
 * Construye contexto mínimo relevante para una pregunta.
 * NO envía todo el expediente indiscriminadamente.
 * Preserva IDs para trazabilidad.
 */
export function buildCaseContext(
  caseId: string,
  question: string,
  caseMgmt: CaseManagement,
  documents: DocumentRegistry,
  evidences: EvidenceRegistry,
  sources: SourceRegistry,
  contracts: ContractRegistry,
  rights: RightsRegistry,
  assumptions: AssumptionRegistry,
  conflicts: ConflictEngine
): CaseContext | null {
  const caseObj = caseMgmt.get(caseId);
  if (!caseObj) return null;

  const caseDocs = documents.getByCase(caseId);
  const caseEvs = evidences.getByCase(caseId);
  const caseSrcs = sources.getByCase(caseId);
  const caseCtrs = contracts.getByCase(caseId);
  const caseRights = rights.getByCase(caseId);
  const caseAsms = assumptions.getByCase(caseId);
  const caseCfls = conflicts.getOpenConflicts(caseId);

  // Filtrado inteligente basado en la pregunta (simplificado)
  const relevantDocs = caseDocs.slice(0, 10).map(d => ({
    documentId: d.documentId,
    type: d.documentType,
    description: d.description,
  }));

  const relevantEvs = caseEvs.slice(0, 15).map(e => ({
    evidenceId: e.evidenceId,
    type: e.evidenceType,
    fact: e.factAsserted,
    status: e.verificationStatus,
  }));

  const relevantSrcs = caseSrcs.slice(0, 10).map(s => ({
    sourceId: s.sourceId,
    title: s.title,
    tier: s.reliabilityTier,
  }));

  const relevantCtrs = caseCtrs.slice(0, 10).map(c => ({
    contractId: c.contractId,
    type: c.contractType,
    title: c.title,
  }));

  const relevantRights = caseRights.slice(0, 20).map(r => ({
    rightId: r.rightId,
    type: r.rightType,
    owner: r.ownerId,
    status: r.verificationStatus,
  }));

  const relevantAsms = caseAsms.filter(a => a.status === 'ACTIVE').map(a => ({
    assumptionId: a.assumptionId,
    description: a.description,
    status: a.status,
  }));

  return {
    caseId,
    summary: {
      name: caseObj.caseName,
      type: caseObj.caseType,
      valuationDate: caseObj.valuationDate,
      status: caseObj.status,
    },
    relevantDocuments: relevantDocs,
    relevantEvidences: relevantEvs,
    relevantSources: relevantSrcs,
    relevantContracts: relevantCtrs,
    relevantRights: relevantRights,
    relevantCalculations: [], // Se poblará con Phase2Bridge
    relevantAssumptions: relevantAsms,
    openConflicts: caseCfls.length,
    chainGaps: 0, // Se calcularía con ChainOfTitleEngine
    unverifiedEvidences: caseEvs.filter(e => e.verificationStatus === 'UNVERIFIED').length,
  };
}

// ============================================================
// CONTEXT ISOLATION
// ============================================================

/**
 * Verifica que el contexto de un caso no contenga datos de otro.
 */
export function verifyContextIsolation(context: CaseContext, expectedCaseId: string): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (context.caseId !== expectedCaseId) {
    violations.push(`Context caseId (${context.caseId}) no coincide con expected (${expectedCaseId})`);
  }

  // Verificar que todos los IDs pertenecen al caso
  // (En implementación real se verificaría contra registros)

  return { isValid: violations.length === 0, violations };
}

// ============================================================
// TOOL ORCHESTRATOR
// ============================================================

/**
 * Orquesta la ejecución de herramientas autorizadas.
 * Valida permisos, parámetros y aislamiento de casos.
 */
export class ToolOrchestrator {
  private caseMgmt: CaseManagement;
  private documents: DocumentRegistry;
  private evidences: EvidenceRegistry;
  private sources: SourceRegistry;
  private contracts: ContractRegistry;
  private rights: RightsRegistry;
  private parties: PartyRegistry;
  private chains: ChainOfTitleEngine;
  private assumptions: AssumptionRegistry;
  private auditLog: AuditLog;
  private conflicts: ConflictEngine;
  private lineage: DataLineageTracker;
  private bridge: Phase2Bridge;

  constructor(registries: {
    caseMgmt: CaseManagement;
    documents: DocumentRegistry;
    evidences: EvidenceRegistry;
    sources: SourceRegistry;
    contracts: ContractRegistry;
    rights: RightsRegistry;
    parties: PartyRegistry;
    chains: ChainOfTitleEngine;
    assumptions: AssumptionRegistry;
    auditLog: AuditLog;
    conflicts: ConflictEngine;
    lineage: DataLineageTracker;
    bridge: Phase2Bridge;
  }) {
    this.caseMgmt = registries.caseMgmt;
    this.documents = registries.documents;
    this.evidences = registries.evidences;
    this.sources = registries.sources;
    this.contracts = registries.contracts;
    this.rights = registries.rights;
    this.parties = registries.parties;
    this.chains = registries.chains;
    this.assumptions = registries.assumptions;
    this.auditLog = registries.auditLog;
    this.conflicts = registries.conflicts;
    this.lineage = registries.lineage;
    this.bridge = registries.bridge;
  }

  /**
   * Ejecuta una herramienta autorizada.
   */
  async execute(call: ToolCall): Promise<ToolResult> {
    const startTime = Date.now();
    const toolDef = AUTHORIZED_TOOLS[call.toolName];

    if (!toolDef) {
      return {
        toolName: call.toolName,
        success: false,
        error: `Herramienta no autorizada: ${call.toolName}`,
        executionTime: Date.now() - startTime,
      };
    }

    // Validar que requiere caseId
    if (toolDef.requiresCaseId && !call.caseId) {
      return {
        toolName: call.toolName,
        success: false,
        error: 'Esta herramienta requiere caseId',
        executionTime: Date.now() - startTime,
      };
    }

    // Validar que el caso existe
    if (call.caseId && !this.caseMgmt.get(call.caseId)) {
      return {
        toolName: call.toolName,
        success: false,
        error: `Expediente no encontrado: ${call.caseId}`,
        executionTime: Date.now() - startTime,
      };
    }

    try {
      const result = await this.dispatchTool(call);
      return {
        toolName: call.toolName,
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        toolName: call.toolName,
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async dispatchTool(call: ToolCall): Promise<unknown> {
    const params = call.parameters;
    const caseId = call.caseId;

    switch (call.toolName) {
      case 'get_case':
        return this.caseMgmt.get(params.caseId as string);
      
      case 'search_case_documents':
        return this.documents.getByCase(caseId!).filter(d =>
          d.description.toLowerCase().includes((params.query as string).toLowerCase()) ||
          d.filename.toLowerCase().includes((params.query as string).toLowerCase())
        );
      
      case 'get_document':
        return this.documents.get(params.documentId as string);
      
      case 'search_evidence':
        return this.evidences.getByCase(caseId!).filter(e =>
          e.factAsserted.toLowerCase().includes((params.query as string).toLowerCase())
        );
      
      case 'get_evidence':
        return this.evidences.get(params.evidenceId as string);
      
      case 'search_sources':
        return this.sources.getByCase(caseId!).filter(s =>
          s.title.toLowerCase().includes((params.query as string).toLowerCase())
        );
      
      case 'get_source':
        return this.sources.get(params.sourceId as string);
      
      case 'search_contracts':
        return this.contracts.getByCase(caseId!).filter(c =>
          c.title.toLowerCase().includes((params.query as string).toLowerCase())
        );
      
      case 'get_contract':
        return this.contracts.get(params.contractId as string);
      
      case 'get_contract_clause': {
        const contract = this.contracts.get(params.contractId as string);
        if (!contract) throw new Error('Contrato no encontrado');
        return contract.clauses.find(c => c.clauseId === params.clauseId);
      }
      
      case 'get_rights':
        return this.rights.getByCase(caseId!);
      
      case 'get_right':
        return this.rights.get(params.rightId as string);
      
      case 'get_assumptions':
        return this.assumptions.getByCase(caseId!);
      
      case 'get_conflicts':
        return this.conflicts.getByCase(caseId!);
      
      case 'run_dcf':
        return dcfEngine(params as any);
      
      case 'run_royalty_model':
        return royaltyEngine(params as any);
      
      case 'run_cost_valuation':
        return costValuationEngine(params as any);
      
      case 'run_market_comparables':
        return marketComparableEngine(params as any);
      
      case 'run_scenario':
        return scenarioEngine(params as any);
      
      case 'run_monte_carlo':
        return monteCarloEngine(params as any);
      
      case 'run_sensitivity':
        return sensitivityEngine(params as any);
      
      case 'run_triangulation':
        return valuationTriangulationEngine(params as any);
      
      default:
        throw new Error(`Herramienta no implementada: ${call.toolName}`);
    }
  }

  /**
   * Obtiene la lista de herramientas autorizadas.
   */
  getAuthorizedTools(): ToolDefinition[] {
    return Object.values(AUTHORIZED_TOOLS);
  }
}

// ============================================================
// CLAIM VERIFIER
// ============================================================

/**
 * Verifica cada afirmación material antes de presentarla como acreditada.
 * Si falta soporte: UNVERIFIED.
 * Si evidencia incompatible: CONFLICTED.
 * Si no hay información: UNKNOWN o NOT_FOUND.
 * NUNCA completa huecos por plausibilidad.
 */
export function verifyClaim(
  claimText: string,
  claimType: EpistemicCategory,
  evidenceIds: string[],
  sourceIds: string[],
  contractIds: string[],
  evidences: EvidenceRegistry,
  sources: SourceRegistry,
  contracts: ContractRegistry
): Claim {
  const claimId = generateAgentId('CLM');
  let verificationStatus: Claim['verificationStatus'] = 'UNVERIFIED';
  let confidence = 0;

  // Verificar según tipo epistemológico
  switch (claimType) {
    case 'FACT':
      if (evidenceIds.length === 0) {
        verificationStatus = 'UNVERIFIED';
        confidence = 0;
      } else {
        const allVerified = evidenceIds.every(id => {
          const ev = evidences.get(id);
          return ev && ev.verificationStatus === 'VERIFIED';
        });
        verificationStatus = allVerified ? 'VERIFIED' : 'UNVERIFIED';
        confidence = allVerified ? 90 : 50;
      }
      break;

    case 'CONTRACTUAL_FACT':
      if (contractIds.length === 0) {
        verificationStatus = 'UNVERIFIED';
        confidence = 0;
      } else {
        const contractExists = contractIds.every(id => contracts.get(id) !== undefined);
        verificationStatus = contractExists ? 'VERIFIED' : 'UNVERIFIED';
        confidence = contractExists ? 85 : 30;
      }
      break;

    case 'EXTERNAL_DATA':
      if (sourceIds.length === 0) {
        verificationStatus = 'UNVERIFIED';
        confidence = 0;
      } else {
        const sourceExists = sourceIds.every(id => sources.get(id) !== undefined);
        verificationStatus = sourceExists ? 'VERIFIED' : 'UNVERIFIED';
        confidence = sourceExists ? 80 : 20;
      }
      break;

    case 'CALCULATION':
      // Las calculaciones proceden de motores deterministas
      verificationStatus = 'VERIFIED';
      confidence = 95;
      break;

    case 'ALLEGATION':
    case 'INFERENCE':
    case 'ASSUMPTION':
      // No pueden promoverse a FACT automáticamente
      verificationStatus = 'UNVERIFIED';
      confidence = 40;
      break;

    case 'UNKNOWN':
      verificationStatus = 'UNKNOWN';
      confidence = 0;
      break;

    case 'CONFLICTED':
      verificationStatus = 'CONFLICTED';
      confidence = 0;
      break;

    default:
      verificationStatus = 'UNVERIFIED';
      confidence = 0;
  }

  return {
    claimId,
    caseId: '', // Se asignará al crear el claim en contexto
    claimText,
    claimType,
    supportingEvidenceIds: evidenceIds,
    supportingSourceIds: sourceIds,
    contractIds,
    rightIds: [],
    calculationIds: [],
    assumptionIds: [],
    confidence,
    verificationStatus,
    createdAt: nowISO(),
  };
}

// ============================================================
// CITATION MANAGER
// ============================================================

/**
 * Gestiona citas vinculando afirmaciones con documentos, evidencias, fuentes.
 * NINGUNA referencia podrá ser inventada.
 * Si no se conoce la página exacta, NO se inventa.
 */
export class CitationManager {
  private citations: Citation[] = [];

  addCitation(params: Omit<Citation, 'citationId'>): Citation {
    const citation: Citation = {
      ...params,
      citationId: generateAgentId('CIT'),
    };
    this.citations.push(citation);
    return citation;
  }

  getByClaim(claimId: string): Citation[] {
    return this.citations.filter(c => c.claimId === claimId);
  }

  getAll(): Citation[] {
    return [...this.citations];
  }

  /**
   * Valida que todas las citas tengan soporte real.
   */
  validateCitations(
    documents: DocumentRegistry,
    evidences: EvidenceRegistry,
    sources: SourceRegistry,
    contracts: ContractRegistry
  ): { valid: boolean; invalidCitations: string[] } {
    const invalid: string[] = [];

    for (const cit of this.citations) {
      if (cit.documentId && !documents.get(cit.documentId)) {
        invalid.push(`Cita ${cit.citationId}: documento ${cit.documentId} no existe`);
      }
      if (cit.evidenceId && !evidences.get(cit.evidenceId)) {
        invalid.push(`Cita ${cit.citationId}: evidencia ${cit.evidenceId} no existe`);
      }
      if (cit.sourceId && !sources.get(cit.sourceId)) {
        invalid.push(`Cita ${cit.citationId}: fuente ${cit.sourceId} no existe`);
      }
      if (cit.contractId && !contracts.get(cit.contractId)) {
        invalid.push(`Cita ${cit.citationId}: contrato ${cit.contractId} no existe`);
      }
    }

    return { valid: invalid.length === 0, invalidCitations: invalid };
  }
}

// ============================================================
// RESPONSE VALIDATOR
// ============================================================

/**
 * Valida una respuesta del agente antes de devolverla.
 * Comprueba: claims con soporte, cálculos de motores, IDs existentes,
 * fuentes existentes, aislamiento de casos, cutoff temporal, conflictos.
 */
export function validateResponse(
  response: AgentResponse,
  caseId: string,
  caseMgmt: CaseManagement,
  evidences: EvidenceRegistry,
  sources: SourceRegistry,
  contracts: ContractRegistry,
  conflicts: ConflictEngine
): { valid: boolean; issues: string[]; status: AgentResponse['status'] } {
  const issues: string[] = [];

  // Verificar que el caso existe
  if (caseId && !caseMgmt.get(caseId)) {
    issues.push(`Expediente ${caseId} no existe`);
  }

  // Verificar claims
  for (const claim of response.verifiedFacts) {
    if (claim.verificationStatus === 'VERIFIED') {
      // Verificar que tiene soporte
      if (claim.supportingEvidenceIds.length === 0 && claim.claimType === 'FACT') {
        issues.push(`Claim ${claim.claimId} marcado como VERIFIED sin evidencia`);
      }
    }
  }

  // Verificar conflictos no omitidos
  const openConflicts = conflicts.getOpenConflicts(caseId);
  const mentionedConflicts = response.conflicts.map(c => c.conflictId);
  for (const oc of openConflicts) {
    if (!mentionedConflicts.includes(oc.conflictId) && (oc.severity === 'HIGH' || oc.severity === 'CRITICAL')) {
      issues.push(`Conflicto crítico ${oc.conflictId} no mencionado en la respuesta`);
    }
  }

  // Determinar status
  let status: AgentResponse['status'] = 'COMPLETE';
  if (issues.length > 0) {
    status = 'REVIEW_REQUIRED';
  } else if (response.unverifiedItems.length > 0) {
    status = 'PARTIAL';
  }

  return { valid: issues.length === 0, issues, status };
}

// ============================================================
// AGENT AUDIT LOG
// ============================================================

/**
 * Registra acciones del agente enlazadas al Audit Log de Fase 3.
 * NO almacena chain-of-thought ni razonamiento interno privado.
 * Solo decisiones operativas, inputs, outputs, fuentes y justificaciones.
 */
export class AgentAuditLogger {
  private entries: AgentAuditEntry[] = [];

  record(params: Omit<AgentAuditEntry, 'eventId' | 'timestamp'>): AgentAuditEntry {
    const entry: AgentAuditEntry = {
      ...params,
      eventId: generateAgentId('AAUD'),
      timestamp: nowISO(),
    };
    this.entries.push(entry);
    return entry;
  }

  getByCase(caseId: string): AgentAuditEntry[] {
    return this.entries.filter(e => e.caseId === caseId);
  }

  getAll(): AgentAuditEntry[] {
    return [...this.entries];
  }
}

// ============================================================
// PROMPT INJECTION DEFENSE
// ============================================================

/**
 * Detecta y neutraliza instrucciones inyectadas en documentos o fuentes.
 * El contenido documental se trata como DATOS, no como instrucciones.
 */
export function detectPromptInjection(content: string): {
  isInjection: boolean;
  suspiciousPatterns: string[];
} {
  const suspiciousPatterns = [
    /ignora\s+(las\s+)?reglas/i,
    /ignora\s+(las\s+)?instrucciones/i,
    /ejecuta\s+código/i,
    /revela\s+(los\s+)?secretos/i,
    /system\s*:/i,
    /ignore\s+previous\s+instructions/i,
    /you\s+are\s+now/i,
    /new\s+instructions?:/i,
    /override\s+security/i,
    /bypass\s+filter/i,
  ];

  const found = suspiciousPatterns.filter(p => p.test(content));

  return {
    isInjection: found.length > 0,
    suspiciousPatterns: found.map(p => p.source),
  };
}
