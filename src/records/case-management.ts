/**
 * PERITO IP — Fase 3: Case Management + Case Health + Phase 2 Bridge
 * 
 * Capa 3.2: Expediente pericial
 * Capa 3.23: Conexión con Fase 2
 * Capa 3.39: Panel de salud del expediente
 */

import {
  Case,
  CaseStatus,
  CaseHealth,
  DataLineageEntry,
  generateId,
  nowISO,
} from './types';
import type { DocumentRegistry } from './document-registry';
import type { EvidenceRegistry } from './evidence-source-registry';
import type { SourceRegistry } from './evidence-source-registry';
import type { ContractRegistry, RightsRegistry, PartyRegistry } from './contracts-rights-parties';
import type { ChainOfTitleEngine, AssumptionRegistry, ConflictEngine, AuditLog, DataLineageTracker } from './chain-audit-conflicts-gate';

// ============================================================
// CASE MANAGEMENT (Capa 3.2)
// ============================================================

export interface CaseInput {
  caseName: string;
  caseType: string;
  description: string;
  valuationDate: string;
  informationCutoffDate?: string;
  jurisdiction?: string;
  currency: string;
  createdBy: string;
}

export class CaseManagement {
  private cases: Map<string, Case> = new Map();

  create(input: CaseInput): Case {
    const now = nowISO();
    const caseObj: Case = {
      caseId: generateId('CASE'),
      caseName: input.caseName,
      caseType: input.caseType,
      description: input.description,
      createdAt: now,
      updatedAt: now,
      valuationDate: input.valuationDate,
      informationCutoffDate: input.informationCutoffDate,
      jurisdiction: input.jurisdiction,
      currency: input.currency,
      status: 'DRAFT',
      createdBy: input.createdBy,
      version: 1,
    };

    this.cases.set(caseObj.caseId, caseObj);
    return caseObj;
  }

  get(caseId: string): Case | undefined {
    return this.cases.get(caseId);
  }

  updateStatus(caseId: string, status: CaseStatus): Case {
    const c = this.cases.get(caseId);
    if (!c) throw new Error(`Expediente no encontrado: ${caseId}`);

    const updated: Case = { ...c, status, updatedAt: nowISO(), version: c.version + 1 };
    this.cases.set(caseId, updated);
    return updated;
  }

  getAll(): Case[] {
    return Array.from(this.cases.values());
  }

  count(): number {
    return this.cases.size;
  }
}

// ============================================================
// CASE HEALTH (Capa 3.39)
// ============================================================

/**
 * Panel de salud del expediente.
 * Muestra hechos y estados, no un score arbitrario.
 */
export function computeCaseHealth(
  caseId: string,
  documents: DocumentRegistry,
  evidences: EvidenceRegistry,
  sources: SourceRegistry,
  contracts: ContractRegistry,
  rights: RightsRegistry,
  chains: ChainOfTitleEngine,
  conflicts: ConflictEngine,
  assumptions: AssumptionRegistry
): CaseHealth {
  const docs = documents.getByCase(caseId);
  const evs = evidences.getByCase(caseId);
  const srcs = sources.getByCase(caseId);
  const ctrs = contracts.getByCase(caseId);
  const rts = rights.getByCase(caseId);
  const cfls = conflicts.getByCase(caseId);
  const asms = assumptions.getByCase(caseId);
  const allChains = chains.getAll().filter(c => rts.some(r => r.rightId === c.rightId));

  return {
    caseId,
    documents: { total: docs.length },
    evidence: {
      verified: evs.filter(e => e.verificationStatus === 'VERIFIED').length,
      partiallyVerified: evs.filter(e => e.verificationStatus === 'PARTIALLY_VERIFIED').length,
      unverified: evs.filter(e => e.verificationStatus === 'UNVERIFIED').length,
      conflicted: evs.filter(e => e.verificationStatus === 'CONFLICTED').length,
      rejected: evs.filter(e => e.verificationStatus === 'REJECTED').length,
    },
    conflicts: {
      open: cfls.filter(c => c.status === 'OPEN').length,
      resolved: cfls.filter(c => c.status === 'RESOLVED').length,
    },
    rights: {
      identified: rts.filter(r => r.status === 'IDENTIFIED').length,
      verified: rts.filter(r => r.status === 'VERIFIED').length,
      conflicted: rts.filter(r => r.status === 'DISPUTED').length,
    },
    contracts: {
      analyzed: ctrs.filter(c => c.verificationAspects.TERMS_EXTRACTED !== 'UNVERIFIED').length,
      pending: ctrs.filter(c => c.verificationAspects.TERMS_EXTRACTED === 'UNVERIFIED').length,
    },
    chainGaps: allChains.filter(c => c.overallStatus !== 'COMPLETE').length,
    sources: {
      verified: srcs.filter(s => s.verificationStatus === 'VERIFIED').length,
      unverified: srcs.filter(s => s.verificationStatus === 'UNVERIFIED').length,
    },
    assumptions: {
      active: asms.filter(a => a.status === 'ACTIVE').length,
      rejected: asms.filter(a => a.status === 'REJECTED').length,
    },
    staleCalculations: 0, // Se actualizará con Phase 2 bridge
  };
}

// ============================================================
// PHASE 2 BRIDGE (Capa 3.23)
// ============================================================

/**
 * Conecta la capa documental con el motor cuantitativo de Fase 2.
 * Cada input económico puede enlazar con source, evidence, contract, right, assumption.
 * 
 * Ejemplo:
 * ROYALTY_RATE = 10%
 *   SOURCE = contrato X
 *   CONTRACT_ID = X
 *   EVIDENCE_ID = Y
 *   RIGHT_ID = Z
 *   CLAUSE_REFERENCE = página/sección
 *   VERIFICATION = VERIFIED
 */
export interface Phase2BridgeInput {
  fieldName: string; // ej: "royalty_rate"
  value: string;
  caseId: string;
  sourceId?: string;
  documentId?: string;
  evidenceId?: string;
  contractId?: string;
  rightId?: string;
  assumptionId?: string;
  calculationId?: string;
  clauseReference?: string;
  verificationStatus?: string;
}

export class Phase2Bridge {
  private lineage: DataLineageTracker;

  constructor(lineage: DataLineageTracker) {
    this.lineage = lineage;
  }

  /**
   * Registra la conexión entre un input de Fase 2 y su linaje documental.
   */
  linkInput(input: Phase2BridgeInput): DataLineageEntry {
    const chain: string[] = [];
    if (input.documentId) chain.push('DOCUMENT');
    if (input.evidenceId) chain.push('EVIDENCE');
    if (input.contractId) chain.push('CONTRACT');
    if (input.rightId) chain.push('RIGHT');
    chain.push('INPUT');
    if (input.calculationId) chain.push('CALCULATION');
    chain.push('RESULT');

    return this.lineage.track({
      caseId: input.caseId,
      targetField: input.fieldName,
      targetValue: input.value,
      sourceId: input.sourceId,
      documentId: input.documentId,
      evidenceId: input.evidenceId,
      contractId: input.contractId,
      rightId: input.rightId,
      assumptionId: input.assumptionId,
      calculationId: input.calculationId,
      clauseReference: input.clauseReference,
      chain,
    });
  }

  /**
   * Reconstruye el linaje completo de un cálculo de Fase 2.
   */
  traceCalculation(calculationId: string): {
    inputs: DataLineageEntry[];
    chain: string;
  } {
    const entries = this.lineage.traceBackward(calculationId);
    const chain = entries.length > 0 ? entries[0].chain.join(' → ') : 'NO LINAGE';
    return { inputs: entries, chain };
  }

  /**
   * Reconstruye el linaje desde un documento hasta los resultados.
   */
  traceFromDocument(documentId: string): DataLineageEntry[] {
    return this.lineage.traceForward(documentId);
  }
}
