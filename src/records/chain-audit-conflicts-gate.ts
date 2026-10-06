/**
 * PERITO IP — Fase 3: Chain of Title + Assumptions + Audit + Conflicts + Gate + Lineage
 * 
 * Capa 3.19: Chain of Title
 * Capa 3.24: Assumption Registry
 * Capa 3.25: Data Lineage
 * Capa 3.26: Audit Log
 * Capa 3.30: Conflict Engine
 * Capa 3.40: Evidence Gate
 */

import {
  ChainOfTitle,
  ChainLink,
  ChainLinkStatus,
  Assumption,
  AuditEntry,
  AuditAction,
  Conflict,
  ConflictType,
  ConflictSeverity,
  EvidenceGateResult,
  DataLineageEntry,
  generateId,
  nowISO,
} from './types';
import type { EvidenceRegistry } from './evidence-source-registry';
import type { RightsRegistry } from './contracts-rights-parties';
import type { ContractRegistry } from './contracts-rights-parties';
import type { SourceRegistry } from './evidence-source-registry';

// ============================================================
// CHAIN OF TITLE (Capa 3.19)
// ============================================================

export class ChainOfTitleEngine {
  private chains: Map<string, ChainOfTitle> = new Map();

  /**
   * Construye la cadena de titularidad para un derecho.
   * No rellena eslabones inexistentes.
   */
  buildChain(rightId: string, links: Omit<ChainLink, 'linkId'>[]): ChainOfTitle {
    const chainLinks: ChainLink[] = links.map((l, i) => ({
      ...l,
      linkId: `${rightId}-link-${i}`,
    }));

    // Detectar gaps
    const gaps: string[] = [];
    const conflicts: string[] = [];
    let overallStatus: ChainOfTitle['overallStatus'] = 'COMPLETE';

    for (let i = 0; i < chainLinks.length - 1; i++) {
      const current = chainLinks[i];
      const next = chainLinks[i + 1];
      
      // Si el destino del actual no es el origen del siguiente, hay gap
      if (current.toPartyId !== next.fromPartyId) {
        gaps.push(`Gap entre eslabón ${i} (${current.toPartyId}) y eslabón ${i+1} (${next.fromPartyId})`);
        overallStatus = 'CHAIN_GAP';
      }
    }

    // Detectar conflictos (mismo derecho con titulares incompatibles)
    const owners = new Set(chainLinks.map(l => l.toPartyId));
    if (chainLinks.some(l => l.status === 'CONFLICT')) {
      conflicts.push('Eslabones con status CONFLICT detectados');
      overallStatus = 'CHAIN_CONFLICT';
    }

    if (chainLinks.length === 0) {
      overallStatus = 'CHAIN_GAP';
      gaps.push('Cadena vacía — no hay eslabones documentales');
    }

    const chain: ChainOfTitle = {
      chainId: generateId('CHN'),
      rightId,
      links: chainLinks,
      overallStatus,
      gaps,
      conflicts,
    };

    this.chains.set(rightId, chain);
    return chain;
  }

  getChain(rightId: string): ChainOfTitle | undefined {
    return this.chains.get(rightId);
  }

  getIncompleteChains(): ChainOfTitle[] {
    return Array.from(this.chains.values()).filter(
      c => c.overallStatus !== 'COMPLETE'
    );
  }

  getAll(): ChainOfTitle[] {
    return Array.from(this.chains.values());
  }
}

// ============================================================
// ASSUMPTION REGISTRY (Capa 3.24)
// ============================================================

export class AssumptionRegistry {
  private assumptions: Map<string, Assumption> = new Map();

  register(input: Omit<Assumption, 'assumptionId' | 'createdAt' | 'version'>): Assumption {
    const assumption: Assumption = {
      ...input,
      assumptionId: generateId('ASM'),
      createdAt: nowISO(),
      version: 1,
    };

    this.assumptions.set(assumption.assumptionId, assumption);
    return assumption;
  }

  get(assumptionId: string): Assumption | undefined {
    return this.assumptions.get(assumptionId);
  }

  getByCase(caseId: string): Assumption[] {
    return Array.from(this.assumptions.values()).filter(a => a.caseId === caseId);
  }

  getActive(caseId: string): Assumption[] {
    return this.getByCase(caseId).filter(a => a.status === 'ACTIVE');
  }

  supersede(assumptionId: string, newAssumption: Omit<Assumption, 'assumptionId' | 'createdAt' | 'version'>): Assumption {
    const old = this.assumptions.get(assumptionId);
    if (!old) throw new Error(`Hipótesis no encontrada: ${assumptionId}`);

    // Marcar la anterior como SUPERSEDED
    this.assumptions.set(assumptionId, { ...old, status: 'SUPERSEDED', version: old.version + 1 });

    // Crear la nueva
    return this.register(newAssumption);
  }

  getAll(): Assumption[] {
    return Array.from(this.assumptions.values());
  }

  count(): number {
    return this.assumptions.size;
  }
}

// ============================================================
// AUDIT LOG (Capa 3.26)
// ============================================================

export class AuditLog {
  private entries: AuditEntry[] = [];
  private lastHash: string = 'GENESIS';

  /**
   * Registra una acción en el log inmutable.
   * Append-only: no se permiten UPDATE ni DELETE.
   */
  record(params: {
    userOrAgent: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
    caseId: string;
  }): AuditEntry {
    const hashInput = JSON.stringify({
      ...params,
      previousHash: this.lastHash,
      timestamp: nowISO(),
    });
    
    // Hash encadenado simplificado
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
      hash = hash & hash;
    }
    const chainHash = Math.abs(hash).toString(16).padStart(8, '0').repeat(8).substring(0, 64);

    const entry: AuditEntry = {
      eventId: generateId('AUD'),
      timestamp: nowISO(),
      userOrAgent: params.userOrAgent,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      reason: params.reason,
      caseId: params.caseId,
      chainHash,
    };

    this.entries.push(entry);
    this.lastHash = chainHash;
    return entry;
  }

  getByCase(caseId: string): AuditEntry[] {
    return this.entries.filter(e => e.caseId === caseId);
  }

  /**
   * Verifica la integridad de la cadena.
   */
  verifyChain(caseId: string): { valid: boolean; brokenAt?: number } {
    const caseEntries = this.getByCase(caseId);
    let previousHash = 'GENESIS';

    for (let i = 0; i < caseEntries.length; i++) {
      const entry = caseEntries[i];
      const hashInput = JSON.stringify({
        userOrAgent: entry.userOrAgent,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        reason: entry.reason,
        caseId: entry.caseId,
        previousHash,
        timestamp: entry.timestamp,
      });

      let hash = 0;
      for (let j = 0; j < hashInput.length; j++) {
        hash = ((hash << 5) - hash) + hashInput.charCodeAt(j);
        hash = hash & hash;
      }
      const expectedHash = Math.abs(hash).toString(16).padStart(8, '0').repeat(8).substring(0, 64);

      if (expectedHash !== entry.chainHash) {
        return { valid: false, brokenAt: i };
      }
      previousHash = entry.chainHash;
    }

    return { valid: true };
  }

  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  count(): number {
    return this.entries.length;
  }
}

// ============================================================
// CONFLICT ENGINE (Capa 3.30)
// ============================================================

export class ConflictEngine {
  private conflicts: Map<string, Conflict> = new Map();

  /**
   * Registra un conflicto detectado.
   * No decide arbitrariamente cuál es verdadero.
   */
  registerConflict(params: {
    caseId: string;
    conflictType: ConflictType;
    severity: ConflictSeverity;
    description: string;
    entities: { type: string; id: string; description: string }[];
  }): Conflict {
    const conflict: Conflict = {
      conflictId: generateId('CFL'),
      caseId: params.caseId,
      conflictType: params.conflictType,
      severity: params.severity,
      description: params.description,
      entities: params.entities,
      status: 'OPEN',
      createdAt: nowISO(),
    };

    this.conflicts.set(conflict.conflictId, conflict);
    return conflict;
  }

  resolve(conflictId: string, resolution: string, resolvedBy: string): Conflict {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) throw new Error(`Conflicto no encontrado: ${conflictId}`);

    const resolved: Conflict = {
      ...conflict,
      status: 'RESOLVED',
      resolution,
      resolvedBy,
      resolvedAt: nowISO(),
    };

    this.conflicts.set(conflictId, resolved);
    return resolved;
  }

  getOpenConflicts(caseId: string): Conflict[] {
    return Array.from(this.conflicts.values()).filter(
      c => c.caseId === caseId && c.status === 'OPEN'
    );
  }

  getByCase(caseId: string): Conflict[] {
    return Array.from(this.conflicts.values()).filter(c => c.caseId === caseId);
  }

  getAll(): Conflict[] {
    return Array.from(this.conflicts.values());
  }

  count(): number {
    return this.conflicts.size;
  }
}

// ============================================================
// DATA LINEAGE (Capa 3.25)
// ============================================================

export class DataLineageTracker {
  private entries: Map<string, DataLineageEntry> = new Map();

  /**
   * Registra el linaje de un dato.
   * Permite reconstruir: DOCUMENTO → EVIDENCIA → DERECHO → INPUT → CÁLCULO → RESULTADO
   */
  track(input: Omit<DataLineageEntry, 'lineageId' | 'createdAt'>): DataLineageEntry {
    const entry: DataLineageEntry = {
      ...input,
      lineageId: generateId('LIN'),
      createdAt: nowISO(),
    };

    this.entries.set(entry.lineageId, entry);
    return entry;
  }

  /**
   * Reconstruye la cadena hacia atrás desde un resultado.
   */
  traceBackward(calculationId: string): DataLineageEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.calculationId === calculationId)
      .sort((a, b) => a.chain.length - b.chain.length);
  }

  /**
   * Reconstruye la cadena hacia adelante desde un documento.
   */
  traceForward(documentId: string): DataLineageEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.documentId === documentId);
  }

  getByCase(caseId: string): DataLineageEntry[] {
    return Array.from(this.entries.values()).filter(e => e.caseId === caseId);
  }

  getAll(): DataLineageEntry[] {
    return Array.from(this.entries.values());
  }
}

// ============================================================
// EVIDENCE GATE (Capa 3.40)
// ============================================================

/**
 * Gate de valoración: verifica que un expediente puede ser finalizado.
 * No bloquea cálculos exploratorios, pero impide presentarlos como definitivos.
 */
export function executeEvidenceGate(
  caseId: string,
  evidenceRegistry: EvidenceRegistry,
  rightsRegistry: RightsRegistry,
  contractRegistry: ContractRegistry,
  sourceRegistry: SourceRegistry,
  conflictEngine: ConflictEngine,
  assumptionRegistry: AssumptionRegistry
): EvidenceGateResult {
  const evidences = evidenceRegistry.getByCase(caseId);
  const rights = rightsRegistry.getByCase(caseId);
  const contracts = contractRegistry.getByCase(caseId);
  const sources = sourceRegistry.getByCase(caseId);
  const openConflicts = conflictEngine.getOpenConflicts(caseId);
  const assumptions = assumptionRegistry.getActive(caseId);

  const warnings: string[] = [];
  const blockingIssues: string[] = [];

  // 1. Derechos verificados
  const rightsVerified = rights.filter(r => r.verificationStatus === 'VERIFIED').length;
  const rightsIssues: string[] = [];
  if (rightsVerified < rights.length) {
    rightsIssues.push(`${rights.length - rightsVerified} derechos sin verificar.`);
    warnings.push('Existen derechos no verificados.');
  }

  // 2. Titularidad verificada
  const ownershipVerified = rights.filter(r => r.evidenceId && r.verificationStatus === 'VERIFIED').length;
  const ownershipIssues: string[] = [];
  if (ownershipVerified < rights.length) {
    ownershipIssues.push(`${rights.length - ownershipVerified} derechos sin evidencia de titularidad.`);
  }

  // 3. Contratos analizados
  const contractsAnalyzed = contracts.filter(c => c.verificationAspects.TERMS_EXTRACTED !== 'UNVERIFIED').length;
  const contractsIssues: string[] = [];
  if (contractsAnalyzed < contracts.length) {
    contractsIssues.push(`${contracts.length - contractsAnalyzed} contratos sin términos extraídos.`);
  }

  // 4. Inputs económicos con fuente
  const sourcedEvidences = evidences.filter(e => e.sourceId || e.documentId).length;
  const economicIssues: string[] = [];
  if (sourcedEvidences < evidences.length) {
    economicIssues.push(`${evidences.length - sourcedEvidences} evidencias sin fuente o documento.`);
  }

  // 5. Conflictos
  const conflictIssues: string[] = [];
  if (openConflicts.length > 0) {
    conflictIssues.push(`${openConflicts.length} conflictos abiertos.`);
    if (openConflicts.some(c => c.severity === 'CRITICAL' || c.severity === 'HIGH')) {
      blockingIssues.push('Conflictos de severidad ALTA o CRÍTICA sin resolver.');
    }
  }

  // 6. Fecha de corte
  const cutoffIssues: string[] = [];
  // (Se verificaría contra valuation-date-engine de Fase 2)

  // 7. Double counting
  const doubleCountingIssues: string[] = [];
  // (Se verificaría contra double-counting-detector de Fase 2)

  // Determinar status
  const canFinalize = blockingIssues.length === 0 &&
    rightsVerified === rights.length &&
    openConflicts.length === 0;

  const status: EvidenceGateResult['status'] = canFinalize
    ? 'READY'
    : blockingIssues.length > 0
    ? 'BLOCKED'
    : 'REVIEW_REQUIRED';

  if (!canFinalize && status !== 'BLOCKED') {
    warnings.push('El expediente requiere revisión antes de poder finalizar la valoración.');
  }

  if (assumptions.length > 0) {
    warnings.push(`${assumptions.length} hipótesis activas. Verificar que están documentadas.`);
  }

  return {
    caseId,
    canFinalize,
    status,
    checks: {
      rightsVerified: { count: rightsVerified, total: rights.length, issues: rightsIssues },
      ownershipVerified: { count: ownershipVerified, total: rights.length, issues: ownershipIssues },
      contractsAnalyzed: { count: contractsAnalyzed, total: contracts.length, issues: contractsIssues },
      economicInputsSourced: { count: sourcedEvidences, total: evidences.length, issues: economicIssues },
      conflictsResolved: { count: openConflicts.length === 0 ? 1 : 0, total: 1, issues: conflictIssues },
      cutoffDateRespected: { compliant: cutoffIssues.length === 0, issues: cutoffIssues },
      doubleCountingChecked: { passed: doubleCountingIssues.length === 0, issues: doubleCountingIssues },
    },
    warnings,
    blockingIssues,
  };
}
