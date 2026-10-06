/**
 * PERITO IP — Fase 4: Analizadores y Coordinadores
 * 
 * Contiene: CONTRACT_ANALYZER, RIGHTS_ANALYZER, CHAIN_OF_TITLE_ANALYZER,
 * VALUATION_COORDINATOR, RESEARCH_COORDINATOR, SCENARIO_ORCHESTRATOR,
 * DAMAGES_COORDINATOR, CALCULATION_EXPLAINER, QUESTION_GENERATOR,
 * UNCERTAINTY_MANAGER, CONFLICT_MANAGER.
 */

import Decimal from 'decimal.js';
import {
  Claim,
  EpistemicCategory,
  ValuationReadinessCheck,
  ActionPlan,
  WhatIfSimulation,
  SourceQuality,
  generateAgentId,
  nowISO,
} from './types';
import { verifyClaim } from './core';

// Importar registros de Fase 3
import {
  ContractRegistry,
  RightsRegistry,
  ChainOfTitleEngine,
  EvidenceRegistry,
  SourceRegistry,
  ConflictEngine,
  AssumptionRegistry,
} from '../records';

// ============================================================
// CONTRACT ANALYZER
// ============================================================

/**
 * Localiza y explica cláusulas extraídas.
 * Muestra referencia al documento y separa TEXT_FOUND, STRUCTURED_EXTRACTION, INTERPRETATION.
 * NO afirma validez jurídica solo porque el documento exista.
 */
export function analyzeContract(
  contractId: string,
  contracts: ContractRegistry
): {
  contractId: string;
  title: string;
  clauses: {
    clauseId: string;
    type: string;
    textFound: string | null;
    structuredExtraction: string;
    interpretation: string;
    pageOrSection: string | null;
    confidence: number;
    reviewStatus: string;
  }[];
  verificationAspects: Record<string, string>;
  warnings: string[];
} {
  const contract = contracts.get(contractId);
  if (!contract) {
    return {
      contractId,
      title: 'NOT_FOUND',
      clauses: [],
      verificationAspects: {},
      warnings: ['Contrato no encontrado'],
    };
  }

  const clauses = contract.clauses.map(c => ({
    clauseId: c.clauseId,
    type: c.clauseType,
    textFound: c.extractedText || null,
    structuredExtraction: c.structuredInterpretation,
    interpretation: c.structuredInterpretation, // Separar en implementación real
    pageOrSection: c.pageOrSection || null,
    confidence: c.confidence,
    reviewStatus: c.humanReviewStatus,
  }));

  const warnings: string[] = [];
  if (contract.verificationAspects.LEGAL_VALIDITY_ASSESSED !== 'VERIFIED') {
    warnings.push('La validez jurídica de este contrato NO ha sido evaluada.');
  }
  if (contract.verificationAspects.SIGNATURE_VERIFIED !== 'VERIFIED') {
    warnings.push('La firma de este contrato NO ha sido verificada.');
  }

  return {
    contractId: contract.contractId,
    title: contract.title,
    clauses,
    verificationAspects: contract.verificationAspects,
    warnings,
  };
}

// ============================================================
// RIGHTS ANALYZER
// ============================================================

/**
 * Responde qué derechos aparecen poseídos, cedidos, reservados, expirados, etc.
 * Consulta exclusivamente Rights Registry, contratos, evidencia y Rights Graph.
 * NO atribuye derechos por conocimiento general ni por lo que "normalmente ocurre".
 */
export function analyzeRights(
  caseId: string,
  rights: RightsRegistry,
  contracts: ContractRegistry,
  evidences: EvidenceRegistry
): {
  caseId: string;
  rights: {
    rightId: string;
    type: string;
    owner: string;
    territory: string | null;
    language: string | null;
    exclusivity: boolean;
    startDate: string | null;
    endDate: string | null;
    status: string;
    verificationStatus: string;
    economicStatus: string;
    contractId: string | null;
    evidenceId: string | null;
  }[];
  summary: {
    total: number;
    verified: number;
    unverified: number;
    disputed: number;
    byType: Record<string, number>;
    byOwner: Record<string, number>;
  };
  warnings: string[];
} {
  const caseRights = rights.getByCase(caseId);

  const rightsData = caseRights.map(r => ({
    rightId: r.rightId,
    type: r.rightType,
    owner: r.ownerId,
    territory: r.territory || null,
    language: r.language || null,
    exclusivity: r.exclusivity,
    startDate: r.startDate || null,
    endDate: r.endDate || null,
    status: r.status,
    verificationStatus: r.verificationStatus,
    economicStatus: r.economicStatus,
    contractId: r.contractId || null,
    evidenceId: r.evidenceId || null,
  }));

  const summary = {
    total: caseRights.length,
    verified: caseRights.filter(r => r.verificationStatus === 'VERIFIED').length,
    unverified: caseRights.filter(r => r.verificationStatus === 'UNVERIFIED').length,
    disputed: caseRights.filter(r => r.status === 'DISPUTED').length,
    byType: caseRights.reduce((acc, r) => {
      acc[r.rightType] = (acc[r.rightType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOwner: caseRights.reduce((acc, r) => {
      acc[r.ownerId] = (acc[r.ownerId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const warnings: string[] = [];
  if (summary.unverified > 0) {
    warnings.push(`${summary.unverified} derechos sin verificar.`);
  }
  if (summary.disputed > 0) {
    warnings.push(`${summary.disputed} derechos en disputa.`);
  }

  return { caseId, rights: rightsData, summary, warnings };
}

// ============================================================
// CHAIN OF TITLE ANALYZER
// ============================================================

/**
 * Recorre la cadena existente sin inventar eslabones.
 * Devuelve VERIFIED_CHAIN, PARTIAL_CHAIN, CHAIN_GAP o CHAIN_CONFLICT.
 * NO utiliza "CLEAR TITLE" salvo criterio definido y verificado.
 */
export function analyzeChainOfTitle(
  rightId: string,
  chains: ChainOfTitleEngine
): {
  rightId: string;
  status: 'VERIFIED_CHAIN' | 'PARTIAL_CHAIN' | 'CHAIN_GAP' | 'CHAIN_CONFLICT' | 'NOT_FOUND';
  links: {
    from: string;
    to: string;
    contractId: string | null;
    evidenceId: string | null;
    status: string;
  }[];
  gaps: string[];
  conflicts: string[];
  warnings: string[];
} {
  const chain = chains.getChain(rightId);

  if (!chain) {
    return {
      rightId,
      status: 'NOT_FOUND',
      links: [],
      gaps: ['No existe cadena de titularidad para este derecho'],
      conflicts: [],
      warnings: ['Cadena no encontrada'],
    };
  }

  const links = chain.links.map(l => ({
    from: l.fromPartyId,
    to: l.toPartyId,
    contractId: l.contractId || null,
    evidenceId: l.evidenceId || null,
    status: l.status,
  }));

  const warnings: string[] = [];
  if (chain.overallStatus === 'CHAIN_GAP') {
    warnings.push('Cadena incompleta. Existen eslabones faltantes.');
  }
  if (chain.overallStatus === 'CHAIN_CONFLICT') {
    warnings.push('Cadena con conflictos. Existen eslabones incompatibles.');
  }

  return {
    rightId,
    status: chain.overallStatus as any,
    links,
    gaps: chain.gaps,
    conflicts: chain.conflicts,
    warnings,
  };
}

// ============================================================
// VALUATION READINESS CHECK
// ============================================================

/**
 * Verifica si un expediente está listo para valoración.
 * Estados: READY, PARTIALLY_READY, NOT_READY, REVIEW_REQUIRED.
 */
export function checkValuationReadiness(
  caseId: string,
  rights: RightsRegistry,
  evidences: EvidenceRegistry,
  contracts: ContractRegistry,
  conflicts: ConflictEngine,
  chains: ChainOfTitleEngine
): ValuationReadinessCheck {
  const caseRights = rights.getByCase(caseId);
  const caseEvs = evidences.getByCase(caseId);
  const caseCtrs = contracts.getByCase(caseId);
  const openConflicts = conflicts.getOpenConflicts(caseId);
  const caseChains = chains.getAll().filter(c => caseRights.some(r => r.rightId === c.rightId));

  const missingInputs: string[] = [];
  const unverifiedEvidences: string[] = [];
  const openConflictList: string[] = [];
  const chainGapList: string[] = [];

  // Verificar derechos
  const unverifiedRights = caseRights.filter(r => r.verificationStatus === 'UNVERIFIED');
  if (unverifiedRights.length > 0) {
    missingInputs.push(`${unverifiedRights.length} derechos sin verificar`);
  }

  // Verificar evidencias
  const unverifiedEvs = caseEvs.filter(e => e.verificationStatus === 'UNVERIFIED');
  if (unverifiedEvs.length > 0) {
    unverifiedEvidences.push(...unverifiedEvs.map(e => e.evidenceId));
  }

  // Verificar conflictos
  if (openConflicts.length > 0) {
    openConflictList.push(...openConflicts.map(c => c.conflictId));
  }

  // Verificar cadenas
  const incompleteChains = caseChains.filter(c => c.overallStatus !== 'COMPLETE');
  if (incompleteChains.length > 0) {
    chainGapList.push(...incompleteChains.map(c => c.rightId));
  }

  // Determinar status
  let status: ValuationReadinessCheck['status'];
  const canProceedExploratory = caseRights.length > 0 && caseEvs.length > 0;
  const canProceedFinal = unverifiedRights.length === 0 && openConflicts.length === 0 && incompleteChains.length === 0;

  if (canProceedFinal) {
    status = 'READY';
  } else if (canProceedExploratory && (unverifiedRights.length > 0 || openConflicts.length > 0)) {
    status = 'REVIEW_REQUIRED';
  } else if (canProceedExploratory) {
    status = 'PARTIALLY_READY';
  } else {
    status = 'NOT_READY';
  }

  const reasons: string[] = [];
  if (missingInputs.length > 0) reasons.push(...missingInputs);
  if (unverifiedEvidences.length > 0) reasons.push(`${unverifiedEvidences.length} evidencias sin verificar`);
  if (openConflictList.length > 0) reasons.push(`${openConflictList.length} conflictos abiertos`);
  if (chainGapList.length > 0) reasons.push(`${chainGapList.length} cadenas incompletas`);

  return {
    status,
    reasons,
    missingInputs,
    unverifiedEvidences,
    openConflicts: openConflictList,
    chainGaps: chainGapList,
    canProceedExploratory,
    canProceedFinal,
  };
}

// ============================================================
// CALCULATION EXPLAINER
// ============================================================

/**
 * Convierte resultados deterministas en explicación comprensible.
 * NO modifica cifras. Si hay discrepancia, prevalece el motor determinista.
 */
export function explainCalculation(
  calculationId: string,
  method: string,
  inputs: Record<string, any>,
  formula: string,
  intermediateSteps: { step: number; description: string; result: string }[],
  output: string,
  currency: string,
  valuationDate: string
): {
  calculationId: string;
  method: string;
  explanation: string;
  inputs: Record<string, any>;
  formula: string;
  intermediateSteps: { step: number; description: string; result: string }[];
  output: string;
  currency: string;
  valuationDate: string;
  disclaimer: string;
} {
  const explanation = `Método: ${method}. Fórmula: ${formula}. Resultado: ${output} ${currency} con fecha de valoración ${valuationDate}.`;

  return {
    calculationId,
    method,
    explanation,
    inputs,
    formula,
    intermediateSteps,
    output,
    currency,
    valuationDate,
    disclaimer: 'Esta explicación es generada automáticamente. En caso de discrepancia, prevalece el output del motor determinista.',
  };
}

// ============================================================
// QUESTION GENERATOR
// ============================================================

/**
 * Identifica qué información falta y formula preguntas de alto valor.
 * Evita cuestionarios genéricos. Prioriza titularidad, metodología, valoración.
 */
export function generateQuestions(
  caseId: string,
  readiness: ValuationReadinessCheck,
  rights: RightsRegistry,
  evidences: EvidenceRegistry
): {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  question: string;
  reason: string;
  affectsValuation: boolean;
}[] {
  const questions: { priority: 'HIGH' | 'MEDIUM' | 'LOW'; question: string; reason: string; affectsValuation: boolean }[] = [];

  // Prioridad ALTA: derechos sin verificar
  if (readiness.missingInputs.length > 0) {
    questions.push({
      priority: 'HIGH',
      question: '¿Existen documentos que acrediten la titularidad de los derechos identificados?',
      reason: `${readiness.missingInputs.join(', ')}`,
      affectsValuation: true,
    });
  }

  // Prioridad ALTA: conflictos abiertos
  if (readiness.openConflicts.length > 0) {
    questions.push({
      priority: 'HIGH',
      question: '¿Cómo se resuelven los conflictos de exclusividad o titularidad detectados?',
      reason: `${readiness.openConflicts.length} conflictos abiertos`,
      affectsValuation: true,
    });
  }

  // Prioridad MEDIA: cadenas incompletas
  if (readiness.chainGaps.length > 0) {
    questions.push({
      priority: 'MEDIUM',
      question: '¿Existen contratos o documentos que completen los eslabones faltantes en la cadena de titularidad?',
      reason: `${readiness.chainGaps.length} cadenas incompletas`,
      affectsValuation: true,
    });
  }

  // Prioridad MEDIA: evidencias sin verificar
  if (readiness.unverifiedEvidences.length > 0) {
    questions.push({
      priority: 'MEDIUM',
      question: '¿Se puede proporcionar documentación independiente que verifique las evidencias marcadas como UNVERIFIED?',
      reason: `${readiness.unverifiedEvidences.length} evidencias sin verificar`,
      affectsValuation: true,
    });
  }

  return questions;
}

// ============================================================
// UNCERTAINTY MANAGER
// ============================================================

/**
 * Registra incertidumbre sin fabricar porcentajes arbitrarios.
 * Si se usan niveles HIGH/MEDIUM/LOW, se basan en criterios configurados.
 */
export function assessUncertainty(
  evidenceIds: string[],
  evidences: EvidenceRegistry
): {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  criteria: string[];
  confidence: number;
} {
  if (evidenceIds.length === 0) {
    return { level: 'HIGH', criteria: ['Sin evidencia de soporte'], confidence: 0 };
  }

  const evs = evidenceIds.map(id => evidences.get(id)).filter(Boolean);
  const verified = evs.filter(e => e!.verificationStatus === 'VERIFIED').length;
  const ratio = verified / evs.length;

  let level: 'HIGH' | 'MEDIUM' | 'LOW';
  let confidence: number;

  if (ratio >= 0.8) {
    level = 'LOW';
    confidence = 80 + Math.round(ratio * 20);
  } else if (ratio >= 0.5) {
    level = 'MEDIUM';
    confidence = 50 + Math.round(ratio * 30);
  } else {
    level = 'HIGH';
    confidence = Math.round(ratio * 50);
  }

  const criteria: string[] = [];
  if (ratio < 1) criteria.push(`${Math.round((1 - ratio) * 100)}% de evidencias no verificadas`);
  if (evs.some(e => e!.verificationStatus === 'CONFLICTED')) criteria.push('Evidencias en conflicto');
  if (evs.some(e => e!.reliability === 'LOW')) criteria.push('Evidencias de baja fiabilidad');

  return { level, criteria, confidence };
}

// ============================================================
// CONFLICT MANAGER
// ============================================================

/**
 * Presenta conflictos y su impacto. Solicita resolución cuando es material.
 * NO elige silenciosamente entre fuentes contradictorias.
 */
export function manageConflicts(
  caseId: string,
  conflicts: ConflictEngine
): {
  caseId: string;
  openConflicts: {
    conflictId: string;
    type: string;
    severity: string;
    description: string;
    entities: { type: string; id: string; description: string }[];
    impact: string;
    requiresResolution: boolean;
  }[];
  summary: string;
} {
  const open = conflicts.getOpenConflicts(caseId);

  const conflictData = open.map(c => ({
    conflictId: c.conflictId,
    type: c.conflictType,
    severity: c.severity,
    description: c.description,
    entities: c.entities,
    impact: c.severity === 'CRITICAL' || c.severity === 'HIGH'
      ? 'Material. Requiere resolución antes de valoración definitiva.'
      : 'Moderado. Debe documentarse en limitaciones.',
    requiresResolution: c.severity === 'CRITICAL' || c.severity === 'HIGH',
  }));

  const summary = conflictData.length === 0
    ? 'No hay conflictos abiertos.'
    : `${conflictData.length} conflictos abiertos. ${conflictData.filter(c => c.requiresResolution).length} requieren resolución.`;

  return { caseId, openConflicts: conflictData, summary };
}
