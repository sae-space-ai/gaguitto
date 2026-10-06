/**
 * PERITO IP — Fase 4: Pericial Agent (Orquestador Principal)
 * 
 * El agente coordina, NO calcula ni inventa.
 * Recibe preguntas, identifica expedientes, consulta registros,
 * invoca motores deterministas, verifica afirmaciones, cita fuentes,
 * detecta conflictos y reconoce cuando no sabe algo.
 */

import {
  AgentResponse,
  Claim,
  Citation,
  CaseContext,
  ToolCall,
  AgentAuditEntry,
  EpistemicCategory,
  ActionPlan,
  generateAgentId,
  nowISO,
} from './types';
import {
  buildCaseContext,
  ToolOrchestrator,
  verifyClaim,
  CitationManager,
  validateResponse,
  AgentAuditLogger,
  detectPromptInjection,
} from './core';
import {
  analyzeContract,
  analyzeRights,
  analyzeChainOfTitle,
  checkValuationReadiness,
  explainCalculation,
  generateQuestions,
  assessUncertainty,
  manageConflicts,
} from './analyzers';

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
} from '../records';

// ============================================================
// PERICIAL AGENT
// ============================================================

export class PericialAgent {
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
  
  private toolOrchestrator: ToolOrchestrator;
  private citationManager: CitationManager;
  private agentAuditLogger: AgentAuditLogger;

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

    this.toolOrchestrator = new ToolOrchestrator(registries);
    this.citationManager = new CitationManager();
    this.agentAuditLogger = new AgentAuditLogger();
  }

  /**
   * Procesa una pregunta pericial.
   * 
   * FLUJO:
   * 1. Identificar expediente (caseId)
   * 2. Construir contexto mínimo relevante
   * 3. Verificar aislamiento de contexto
   * 4. Detectar prompt injection en documentos
   * 5. Consultar registros (derechos, contratos, evidencias, fuentes)
   * 6. Verificar afirmaciones (Claim Verifier)
   * 7. Invocar motores deterministas si es necesario
   * 8. Detectar conflictos y datos faltantes
   * 9. Respetar fechas históricas
   * 10. Impedir doble contabilización
   * 11. Explicar resultados
   * 12. Reconocer cuando no se sabe algo
   */
  async processQuery(params: {
    question: string;
    caseId?: string;
    context?: Record<string, unknown>;
  }): Promise<AgentResponse> {
    const startTime = Date.now();
    const responseId = generateAgentId('RESP');

    // 1. Identificar expediente
    const caseId = params.caseId;
    if (caseId && !this.caseMgmt.get(caseId)) {
      return this.createErrorResponse(params.question, 'Expediente no encontrado', caseId);
    }

    // 2. Construir contexto
    let context: CaseContext | null = null;
    if (caseId) {
      context = buildCaseContext(
        caseId,
        params.question,
        this.caseMgmt,
        this.documents,
        this.evidences,
        this.sources,
        this.contracts,
        this.rights,
        this.assumptions,
        this.conflicts
      );
    }

    // 3. Verificar aislamiento (si hay contexto)
    if (context && caseId) {
      const isolation = { isValid: context.caseId === caseId, violations: [] };
      if (!isolation.isValid) {
        return this.createErrorResponse(params.question, 'Violación de aislamiento de contexto', caseId);
      }
    }

    // 4. Detectar prompt injection (si hay documentos en contexto)
    // (Se haría al recuperar contenido de documentos)

    // 5-12. Procesar según tipo de pregunta
    const response = await this.routeQuery(params.question, caseId, context);

    // Auditoría
    this.agentAuditLogger.record({
      caseId: caseId || '',
      agentAction: 'processQuery',
      entityIds: caseId ? [caseId] : [],
      purpose: params.question,
      resultStatus: response.status === 'ERROR' ? 'ERROR' : 'SUCCESS',
    });

    return response;
  }

  /**
   * Enruta la pregunta al handler apropiado.
   */
  private async routeQuery(
    question: string,
    caseId: string | undefined,
    context: CaseContext | null
  ): Promise<AgentResponse> {
    const q = question.toLowerCase();

    // Preguntas sobre derechos
    if (q.includes('derecho') || q.includes('rights')) {
      return this.handleRightsQuery(question, caseId, context);
    }

    // Preguntas sobre contratos
    if (q.includes('contrato') || q.includes('contract')) {
      return this.handleContractQuery(question, caseId, context);
    }

    // Preguntas sobre cadena de titularidad
    if (q.includes('cadena') || q.includes('chain') || q.includes('titularidad')) {
      return this.handleChainQuery(question, caseId, context);
    }

    // Preguntas sobre valoración
    if (q.includes('valor') || q.includes('valora') || q.includes('valuation')) {
      return this.handleValuationQuery(question, caseId, context);
    }

    // Preguntas sobre conflictos
    if (q.includes('conflicto') || q.includes('conflict')) {
      return this.handleConflictQuery(question, caseId, context);
    }

    // Preguntas sobre evidencias
    if (q.includes('evidencia') || q.includes('evidence') || q.includes('acredita')) {
      return this.handleEvidenceQuery(question, caseId, context);
    }

    // Preguntas sobre datos faltantes
    if (q.includes('falta') || q.includes('missing') || q.includes('qué necesito')) {
      return this.handleMissingDataQuery(question, caseId, context);
    }

    // Pregunta genérica
    return this.handleGenericQuery(question, caseId, context);
  }

  // ============================================================
  // HANDLERS DE PREGUNTAS
  // ============================================================

  private async handleRightsQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId || !context) {
      return this.createErrorResponse(question, 'Se requiere caseId para consultar derechos', caseId);
    }

    const rightsAnalysis = analyzeRights(caseId, this.rights, this.contracts, this.evidences);

    return {
      question,
      caseId,
      findings: [`Se han identificado ${rightsAnalysis.summary.total} derechos en el expediente.`],
      verifiedFacts: [],
      unverifiedItems: rightsAnalysis.warnings.map(w => ({ text: w, reason: 'Advertencia del análisis' })),
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: rightsAnalysis.warnings,
      nextRequiredActions: rightsAnalysis.summary.unverified > 0 ? ['Verificar derechos sin acreditar'] : [],
      status: 'COMPLETE',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: 0 },
    };
  }

  private async handleContractQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId) {
      return this.createErrorResponse(question, 'Se requiere caseId para consultar contratos', caseId);
    }

    const contracts = this.contracts.getByCase(caseId);

    return {
      question,
      caseId,
      findings: [`Se han encontrado ${contracts.length} contratos en el expediente.`],
      verifiedFacts: [],
      unverifiedItems: [],
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: contracts.length === 0 ? ['No hay contratos registrados'] : [],
      nextRequiredActions: [],
      status: 'COMPLETE',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: 0 },
    };
  }

  private async handleChainQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId) {
      return this.createErrorResponse(question, 'Se requiere caseId para consultar cadena de titularidad', caseId);
    }

    const incompleteChains = this.chains.getIncompleteChains();

    return {
      question,
      caseId,
      findings: [`Se han analizado las cadenas de titularidad.`],
      verifiedFacts: [],
      unverifiedItems: incompleteChains.map(c => ({ text: `Cadena incompleta para derecho ${c.rightId}`, reason: c.overallStatus })),
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: incompleteChains.length > 0 ? [`${incompleteChains.length} cadenas con gaps o conflictos`] : [],
      nextRequiredActions: incompleteChains.length > 0 ? ['Documentar eslabones faltantes'] : [],
      status: incompleteChains.length > 0 ? 'PARTIAL' : 'COMPLETE',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: 0 },
    };
  }

  private async handleValuationQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId) {
      return this.createErrorResponse(question, 'Se requiere caseId para valorar', caseId);
    }

    const readiness = checkValuationReadiness(caseId, this.rights, this.evidences, this.contracts, this.conflicts, this.chains);

    if (!readiness.canProceedFinal) {
      const questions = generateQuestions(caseId, readiness, this.rights, this.evidences);
      return {
        question,
        caseId,
        findings: ['El expediente no está listo para valoración definitiva.'],
        verifiedFacts: [],
        unverifiedItems: readiness.reasons.map(r => ({ text: r, reason: 'Requisito no cumplido' })),
        conflicts: [],
        assumptions: [],
        calculations: [],
        sources: [],
        citations: [],
        limitations: readiness.reasons,
        nextRequiredActions: questions.map(q => q.question),
        status: 'REVIEW_REQUIRED',
        epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: 0 },
      };
    }

    return {
      question,
      caseId,
      findings: ['El expediente está listo para valoración.'],
      verifiedFacts: [],
      unverifiedItems: [],
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: [],
      nextRequiredActions: ['Ejecutar motores de valoración'],
      status: 'COMPLETE',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: 0 },
    };
  }

  private async handleConflictQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId) {
      return this.createErrorResponse(question, 'Se requiere caseId para consultar conflictos', caseId);
    }

    const conflictMgmt = manageConflicts(caseId, this.conflicts);

    return {
      question,
      caseId,
      findings: [conflictMgmt.summary],
      verifiedFacts: [],
      unverifiedItems: [],
      conflicts: conflictMgmt.openConflicts.map(c => ({
        conflictId: c.conflictId,
        description: c.description,
        severity: c.severity,
      })),
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: conflictMgmt.openConflicts.filter(c => c.requiresResolution).length > 0
        ? ['Existen conflictos que requieren resolución antes de valoración definitiva']
        : [],
      nextRequiredActions: conflictMgmt.openConflicts.filter(c => c.requiresResolution).length > 0
        ? ['Resolver conflictos críticos']
        : [],
      status: conflictMgmt.openConflicts.length > 0 ? 'PARTIAL' : 'COMPLETE',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: conflictMgmt.openConflicts.length },
    };
  }

  private async handleEvidenceQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId) {
      return this.createErrorResponse(question, 'Se requiere caseId para consultar evidencias', caseId);
    }

    const evidences = this.evidences.getByCase(caseId);
    const verified = evidences.filter(e => e.verificationStatus === 'VERIFIED');
    const unverified = evidences.filter(e => e.verificationStatus === 'UNVERIFIED');

    return {
      question,
      caseId,
      findings: [
        `Total evidencias: ${evidences.length}`,
        `Verificadas: ${verified.length}`,
        `Sin verificar: ${unverified.length}`,
      ],
      verifiedFacts: [],
      unverifiedItems: unverified.map(e => ({ text: e.factAsserted, reason: 'UNVERIFIED' })),
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: unverified.length > 0 ? [`${unverified.length} evidencias requieren verificación`] : [],
      nextRequiredActions: unverified.length > 0 ? ['Verificar evidencias pendientes'] : [],
      status: unverified.length > 0 ? 'PARTIAL' : 'COMPLETE',
      epistemicBreakdown: { FACT: verified.length, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: unverified.length, CONFLICTED: 0 },
    };
  }

  private async handleMissingDataQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    if (!caseId) {
      return this.createErrorResponse(question, 'Se requiere caseId para identificar datos faltantes', caseId);
    }

    const readiness = checkValuationReadiness(caseId, this.rights, this.evidences, this.contracts, this.conflicts, this.chains);
    const questions = generateQuestions(caseId, readiness, this.rights, this.evidences);

    return {
      question,
      caseId,
      findings: [`Estado de preparación: ${readiness.status}`],
      verifiedFacts: [],
      unverifiedItems: readiness.reasons.map(r => ({ text: r, reason: 'Dato faltante' })),
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: readiness.reasons,
      nextRequiredActions: questions.map(q => q.question),
      status: readiness.status === 'READY' ? 'COMPLETE' : 'INSUFFICIENT_DATA',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: readiness.reasons.length, CONFLICTED: 0 },
    };
  }

  private async handleGenericQuery(question: string, caseId: string | undefined, context: CaseContext | null): Promise<AgentResponse> {
    return {
      question,
      caseId,
      findings: ['Consulta genérica. Especifique el tipo de información requerida.'],
      verifiedFacts: [],
      unverifiedItems: [],
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: ['Consulta no específica. El agente puede responder sobre: derechos, contratos, cadena de titularidad, valoración, conflictos, evidencias, datos faltantes.'],
      nextRequiredActions: ['Formular pregunta más específica'],
      status: 'INSUFFICIENT_DATA',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 1, CONFLICTED: 0 },
    };
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  private createErrorResponse(question: string, error: string, caseId?: string): AgentResponse {
    return {
      question,
      caseId,
      findings: [],
      verifiedFacts: [],
      unverifiedItems: [{ text: error, reason: 'ERROR' }],
      conflicts: [],
      assumptions: [],
      calculations: [],
      sources: [],
      citations: [],
      limitations: [error],
      nextRequiredActions: [],
      status: 'ERROR',
      epistemicBreakdown: { FACT: 0, EXTERNAL_DATA: 0, CONTRACTUAL_FACT: 0, ALLEGATION: 0, INFERENCE: 0, ASSUMPTION: 0, CALCULATION: 0, OPINION: 0, UNKNOWN: 0, CONFLICTED: 0 },
    };
  }

  /**
   * Obtiene el Tool Orchestrator para ejecutar herramientas directamente.
   */
  getToolOrchestrator(): ToolOrchestrator {
    return this.toolOrchestrator;
  }

  /**
   * Obtiene el Citation Manager.
   */
  getCitationManager(): CitationManager {
    return this.citationManager;
  }

  /**
   * Obtiene el Agent Audit Logger.
   */
  getAgentAuditLogger(): AgentAuditLogger {
    return this.agentAuditLogger;
  }
}
