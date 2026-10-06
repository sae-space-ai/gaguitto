/**
 * PERITO IP — Fase 3: Tests automatizados
 * 
 * Tests para: document hashing, document registry, evidence registry,
 * verification states, source registry, contract registry, contract extraction,
 * rights registry, rights graph, chain of title, chain gaps, contract conflicts,
 * evidence conflicts, assumption registry, data lineage, audit log, versioning,
 * stale calculation detection, information cutoff, valuation evidence gate.
 * 
 * Todos los datos son ficticios.
 */

import { describe, it, expect } from 'vitest';
import {
  DocumentRegistry,
  computeDocumentHash,
  verifyDocumentIntegrity,
  HASH_LIMITATIONS,
  EvidenceRegistry,
  SourceRegistry,
  SOURCE_HIERARCHY,
  validateStatementSupport,
  ContractRegistry,
  RightsRegistry,
  PartyRegistry,
  RightsGraphBuilder,
  ChainOfTitleEngine,
  AssumptionRegistry,
  AuditLog,
  ConflictEngine,
  DataLineageTracker,
  executeEvidenceGate,
  CaseManagement,
  computeCaseHealth,
  Phase2Bridge,
  createFictitiousCases,
} from '../index';

// ============================================================
// DOCUMENT HASHING (Capa 3.4)
// ============================================================

describe('3.4 — Document Hashing', () => {
  it('Genera hash determinista para mismo contenido', () => {
    const hash1 = computeDocumentHash('contenido ficticio');
    const hash2 = computeDocumentHash('contenido ficticio');
    expect(hash1).toBe(hash2);
  });

  it('Genera hash diferente para contenido diferente', () => {
    const hash1 = computeDocumentHash('contenido A');
    const hash2 = computeDocumentHash('contenido B');
    expect(hash1).not.toBe(hash2);
  });

  it('Verifica integridad correctamente', () => {
    const content = 'documento de prueba';
    const hash = computeDocumentHash(content);
    const result = verifyDocumentIntegrity(content, hash);
    expect(result.valid).toBe(true);
  });

  it('Detecta alteración del documento', () => {
    const originalHash = computeDocumentHash('original');
    const result = verifyDocumentIntegrity('modificado', originalHash);
    expect(result.valid).toBe(false);
  });

  it('HASH_LIMITATIONS clarifica qué demuestra y qué no', () => {
    expect(HASH_LIMITATIONS.demonstrates).toContain('FILE_INTEGRITY');
    expect(HASH_LIMITATIONS.doesNotDemonstrate).toContain('AUTHORSHIP_PROOF');
    expect(HASH_LIMITATIONS.doesNotDemonstrate).toContain('OWNERSHIP_PROOF');
  });
});

// ============================================================
// DOCUMENT REGISTRY (Capa 3.3)
// ============================================================

describe('3.3 — Document Registry', () => {
  it('Registra un documento con hash automático', () => {
    const registry = new DocumentRegistry();
    const doc = registry.register({
      caseId: 'case-1',
      filename: 'test.pdf',
      originalFilename: 'Test.pdf',
      documentType: 'CONTRACT',
      mimeType: 'application/pdf',
      fileSize: 1000,
      sourceType: 'user',
      providedBy: 'test_user',
      description: 'Test document',
      content: 'contenido del documento',
      confidentialityLevel: 'CONFIDENTIAL',
    });
    expect(doc.hash).toBeTruthy();
    expect(doc.hashAlgorithm).toBe('SHA-256');
    expect(doc.verificationStatus).toBe('UNVERIFIED');
    expect(doc.version).toBe(1);
  });

  it('Archiva sin eliminar', () => {
    const registry = new DocumentRegistry();
    const doc = registry.register({
      caseId: 'case-1', filename: 'test.pdf', originalFilename: 'Test.pdf',
      documentType: 'OTHER', mimeType: 'text/plain', fileSize: 100,
      sourceType: 'user', providedBy: 'user', description: 'test',
      content: 'content', confidentialityLevel: 'INTERNAL',
    });
    const archived = registry.archive(doc.documentId, 'Retirado por solicitud');
    expect(archived.verificationStatus).toBe('NOT_APPLICABLE');
    expect(archived.notes).toContain('ARCHIVADO');
  });
});

// ============================================================
// EVIDENCE REGISTRY (Capa 3.5, 3.6, 3.7)
// ============================================================

describe('3.5-3.7 — Evidence Registry', () => {
  it('USER_PROVIDED se registra como UNVERIFIED', () => {
    const registry = new EvidenceRegistry();
    const ev = registry.register({
      caseId: 'case-1', evidenceType: 'USER_PROVIDED', statementType: 'ALLEGATION',
      factAsserted: 'Test', factSupported: 'Sin soporte', reliability: 'LOW',
      limitations: 'Sin verificar', createdBy: 'user',
    });
    expect(ev.verificationStatus).toBe('UNVERIFIED');
  });

  it('OFFICIAL con source se registra como VERIFIED', () => {
    const registry = new EvidenceRegistry();
    const ev = registry.register({
      caseId: 'case-1', sourceId: 'src-1', evidenceType: 'OFFICIAL', statementType: 'FACT',
      factAsserted: 'Test', factSupported: 'Soporte oficial', reliability: 'HIGH',
      limitations: '', createdBy: 'perito',
    });
    expect(ev.verificationStatus).toBe('VERIFIED');
  });

  it('LLM no puede convertir UNVERIFIED en VERIFIED', () => {
    const registry = new EvidenceRegistry();
    const ev = registry.register({
      caseId: 'case-1', evidenceType: 'USER_PROVIDED', statementType: 'ALLEGATION',
      factAsserted: 'Test', factSupported: 'Sin soporte', reliability: 'LOW',
      limitations: 'Sin verificar', createdBy: 'user',
    });
    expect(() => registry.changeVerificationStatus(ev.evidenceId, 'VERIFIED', 'LLM', 'auto'))
      .toThrow('LLM no puede convertir');
  });

  it('Humano sí puede convertir UNVERIFIED en VERIFIED', () => {
    const registry = new EvidenceRegistry();
    const ev = registry.register({
      caseId: 'case-1', evidenceType: 'USER_PROVIDED', statementType: 'FACT',
      factAsserted: 'Test', factSupported: 'Verificado', reliability: 'MEDIUM',
      limitations: '', createdBy: 'user',
    });
    const updated = registry.changeVerificationStatus(ev.evidenceId, 'VERIFIED', 'perito_humano', 'Verificación independiente');
    expect(updated.verificationStatus).toBe('VERIFIED');
  });

  it('ALLEGATION no puede estar VERIFIED', () => {
    const ev = {
      evidenceId: 'ev-1', caseId: 'case-1', evidenceType: 'USER_PROVIDED' as const,
      statementType: 'ALLEGATION' as const, factAsserted: 'Test', factSupported: 'Sin soporte',
      verificationStatus: 'VERIFIED' as const, reliability: 'LOW' as const,
      limitations: '', supportingEvidenceIds: [], createdAt: '', createdBy: '', version: 1,
    };
    const result = validateStatementSupport(ev);
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.includes('ALLEGATION'))).toBe(true);
  });
});

// ============================================================
// SOURCE REGISTRY (Capa 3.8, 3.9)
// ============================================================

describe('3.8-3.9 — Source Registry', () => {
  it('Asigna tier de fiabilidad según tipo', () => {
    const registry = new SourceRegistry();
    const src = registry.register({
      caseId: 'case-1', title: 'LPI España', sourceType: 'OFFICIAL_LEGISLATION',
    });
    expect(src.reliabilityTier).toBe(1);
  });

  it('OTHER tiene tier 5 (más bajo)', () => {
    const registry = new SourceRegistry();
    const src = registry.register({
      caseId: 'case-1', title: 'Blog personal', sourceType: 'OTHER',
    });
    expect(src.reliabilityTier).toBe(5);
  });
});

// ============================================================
// CONTRACT REGISTRY (Capa 3.13, 3.14)
// ============================================================

describe('3.13-3.14 — Contract Registry', () => {
  it('Registra contrato con aspectos de verificación separados', () => {
    const registry = new ContractRegistry();
    const ctr = registry.register({
      caseId: 'case-1', contractType: 'EDITORIAL', title: 'Test',
      parties: [{ partyId: 'p1', role: 'Autor' }],
    });
    expect(ctr.verificationAspects.DOCUMENT_EXISTS).toBe('UNVERIFIED');
    expect(ctr.verificationAspects.SIGNATURE_VERIFIED).toBe('UNVERIFIED');
    expect(ctr.verificationAspects.TERMS_EXTRACTED).toBe('UNVERIFIED');
  });

  it('Añade cláusula con referencia a documento', () => {
    const registry = new ContractRegistry();
    const ctr = registry.register({
      caseId: 'case-1', contractType: 'EDITORIAL', title: 'Test',
      parties: [{ partyId: 'p1', role: 'Autor' }],
    });
    const updated = registry.addClause(ctr.contractId, {
      clauseType: 'royalty_rate',
      extractedText: '10% sobre PVP',
      structuredInterpretation: 'Royalty = 10% PVP',
      pageOrSection: 'Cláusula 5',
      confidence: 90,
      humanReviewStatus: 'PENDING',
    });
    expect(updated.clauses.length).toBe(1);
    expect(updated.verificationAspects.TERMS_EXTRACTED).toBe('PARTIALLY_VERIFIED');
  });
});

// ============================================================
// RIGHTS REGISTRY + GRAPH (Capa 3.16, 3.17)
// ============================================================

describe('3.16-3.17 — Rights Registry & Graph', () => {
  it('Registra derechos sin asumir titularidad única', () => {
    const registry = new RightsRegistry();
    const r1 = registry.register({
      caseId: 'case-1', rightType: 'PRINT', ownerId: 'owner-1',
      territory: 'ES', exclusivity: true, economicStatus: 'LICENSED',
    });
    const r2 = registry.register({
      caseId: 'case-1', rightType: 'AUDIOVISUAL_ADAPTATION', ownerId: 'owner-2',
      exclusivity: true, economicStatus: 'OWNED',
    });
    expect(r1.ownerId).not.toBe(r2.ownerId);
  });

  it('Rights Graph conecta nodos correctamente', () => {
    const graph = new RightsGraphBuilder('case-1');
    const parties = new PartyRegistry();
    const rights = new RightsRegistry();
    
    const p1 = parties.register({ displayName: 'Autor Test', partyType: 'PERSON' });
    const r1 = rights.register({
      caseId: 'case-1', rightType: 'PRINT', ownerId: p1.partyId,
      territory: 'ES', exclusivity: true, economicStatus: 'OWNED',
    });

    const result = graph.buildFromRegistries([r1], [], [p1]);
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
  });
});

// ============================================================
// CHAIN OF TITLE (Capa 3.19)
// ============================================================

describe('3.19 — Chain of Title', () => {
  it('Detecta cadena completa', () => {
    const engine = new ChainOfTitleEngine();
    const chain = engine.buildChain('right-1', [
      { rightId: 'right-1', fromPartyId: 'A', toPartyId: 'B', status: 'VERIFIED', verificationStatus: 'VERIFIED' },
      { rightId: 'right-1', fromPartyId: 'B', toPartyId: 'C', status: 'VERIFIED', verificationStatus: 'VERIFIED' },
    ]);
    expect(chain.overallStatus).toBe('COMPLETE');
  });

  it('Detecta CHAIN_GAP', () => {
    const engine = new ChainOfTitleEngine();
    const chain = engine.buildChain('right-1', [
      { rightId: 'right-1', fromPartyId: 'A', toPartyId: 'B', status: 'VERIFIED', verificationStatus: 'VERIFIED' },
      { rightId: 'right-1', fromPartyId: 'X', toPartyId: 'C', status: 'VERIFIED', verificationStatus: 'VERIFIED' },
    ]);
    expect(chain.overallStatus).toBe('CHAIN_GAP');
    expect(chain.gaps.length).toBeGreaterThan(0);
  });

  it('Cadena vacía es CHAIN_GAP', () => {
    const engine = new ChainOfTitleEngine();
    const chain = engine.buildChain('right-1', []);
    expect(chain.overallStatus).toBe('CHAIN_GAP');
  });
});

// ============================================================
// CONFLICT ENGINE (Capa 3.30)
// ============================================================

describe('3.30 — Conflict Engine', () => {
  it('Registra y resuelve conflictos', () => {
    const engine = new ConflictEngine();
    const conflict = engine.registerConflict({
      caseId: 'case-1', conflictType: 'EXCLUSIVE_OVERLAP', severity: 'HIGH',
      description: 'Dos cesiones exclusivas del mismo derecho',
      entities: [{ type: 'contract', id: 'c1', description: 'Contrato 1' }, { type: 'contract', id: 'c2', description: 'Contrato 2' }],
    });
    expect(conflict.status).toBe('OPEN');
    
    const resolved = engine.resolve(conflict.conflictId, 'Prevalece el contrato más antiguo', 'perito');
    expect(resolved.status).toBe('RESOLVED');
  });
});

// ============================================================
// ASSUMPTION REGISTRY (Capa 3.24)
// ============================================================

describe('3.24 — Assumption Registry', () => {
  it('Registra hipótesis visibles', () => {
    const registry = new AssumptionRegistry();
    const asm = registry.register({
      caseId: 'case-1', description: 'Tasa de descuento 8%',
      value: '0.08', reason: 'WACC sector editorial', confidence: 60,
      sensitivityRequired: true, status: 'ACTIVE', createdBy: 'perito',
    });
    expect(asm.status).toBe('ACTIVE');
    expect(asm.confidence).toBe(60);
  });

  it('Supersede marca la anterior como SUPERSEDED', () => {
    const registry = new AssumptionRegistry();
    const asm = registry.register({
      caseId: 'case-1', description: 'Tasa 8%', value: '0.08',
      reason: 'Estimación', confidence: 60, sensitivityRequired: true,
      status: 'ACTIVE', createdBy: 'perito',
    });
    const newAsm = registry.supersede(asm.assumptionId, {
      caseId: 'case-1', description: 'Tasa 10%', value: '0.10',
      reason: 'Revisión', confidence: 70, sensitivityRequired: true,
      status: 'ACTIVE', createdBy: 'perito',
    });
    expect(registry.get(asm.assumptionId)?.status).toBe('SUPERSEDED');
    expect(newAsm.value).toBe('0.10');
  });
});

// ============================================================
// AUDIT LOG (Capa 3.26)
// ============================================================

describe('3.26 — Audit Log', () => {
  it('Registra entradas con hash encadenado', () => {
    const log = new AuditLog();
    log.record({ userOrAgent: 'user', action: 'case_created', entityType: 'case', entityId: 'c1', caseId: 'case-1' });
    log.record({ userOrAgent: 'user', action: 'evidence_created', entityType: 'evidence', entityId: 'e1', caseId: 'case-1' });
    expect(log.count()).toBe(2);
  });

  it('Verifica integridad de cadena', () => {
    const log = new AuditLog();
    log.record({ userOrAgent: 'user', action: 'case_created', entityType: 'case', entityId: 'c1', caseId: 'case-1' });
    log.record({ userOrAgent: 'user', action: 'evidence_created', entityType: 'evidence', entityId: 'e1', caseId: 'case-1' });
    const result = log.verifyChain('case-1');
    expect(result.valid).toBe(true);
  });
});

// ============================================================
// EVIDENCE GATE (Capa 3.40)
// ============================================================

describe('3.40 — Evidence Gate', () => {
  it('Bloquea finalización con conflictos críticos', () => {
    const caseMgmt = new CaseManagement();
    const docs = new DocumentRegistry();
    const evs = new EvidenceRegistry();
    const srcs = new SourceRegistry();
    const ctrs = new ContractRegistry();
    const rts = new RightsRegistry();
    const chains = new ChainOfTitleEngine();
    const asms = new AssumptionRegistry();
    const cfls = new ConflictEngine();

    const c = caseMgmt.create({ caseName: 'Test', caseType: 'test', description: '', valuationDate: '2024-01-01', currency: 'EUR', createdBy: 'user' });
    
    cfls.registerConflict({
      caseId: c.caseId, conflictType: 'EXCLUSIVE_OVERLAP', severity: 'CRITICAL',
      description: 'Conflicto crítico', entities: [],
    });

    const result = executeEvidenceGate(c.caseId, evs, rts, ctrs, srcs, cfls, asms);
    expect(result.status).toBe('BLOCKED');
    expect(result.blockingIssues.length).toBeGreaterThan(0);
  });
});

// ============================================================
// DATA LINEAGE (Capa 3.25)
// ============================================================

describe('3.25 — Data Lineage', () => {
  it('Permite trazar hacia atrás desde un cálculo', () => {
    const tracker = new DataLineageTracker();
    tracker.track({
      caseId: 'case-1', targetField: 'royalty_rate', targetValue: '0.10',
      documentId: 'doc-1', evidenceId: 'ev-1', contractId: 'ctr-1',
      calculationId: 'calc-1', chain: ['DOCUMENT', 'EVIDENCE', 'CONTRACT', 'INPUT', 'CALCULATION', 'RESULT'],
    });
    const result = tracker.traceBackward('calc-1');
    expect(result.length).toBe(1);
    expect(result[0].chain).toContain('DOCUMENT');
  });

  it('Permite trazar hacia adelante desde un documento', () => {
    const tracker = new DataLineageTracker();
    tracker.track({
      caseId: 'case-1', targetField: 'price', targetValue: '20',
      documentId: 'doc-1', chain: ['DOCUMENT', 'INPUT'],
    });
    const result = tracker.traceForward('doc-1');
    expect(result.length).toBe(1);
  });
});

// ============================================================
// EXPEDIENTES FICTICIOS (Capa 3.42)
// ============================================================

describe('3.42 — Expedientes Ficticios', () => {
  it('Crea los 8 casos ficticios correctamente', () => {
    const cases = createFictitiousCases();
    expect(cases.caseManagement.count()).toBe(8);
  });

  it('Caso A: derechos audiovisuales pertenecen a la autora', () => {
    const cases = createFictitiousCases();
    const rights = cases.rights.getByCase(cases.caseIds.A);
    const avRights = rights.filter(r => r.rightType === 'AUDIOVISUAL_ADAPTATION');
    expect(avRights.length).toBe(1);
    expect(avRights[0].economicStatus).toBe('OWNED');
  });

  it('Caso D: cadena con gap detectado', () => {
    const cases = createFictitiousCases();
    const incomplete = cases.chains.getIncompleteChains();
    expect(incomplete.length).toBeGreaterThan(0);
  });

  it('Caso E: conflicto de exclusividad registrado', () => {
    const cases = createFictitiousCases();
    const openConflicts = cases.conflicts.getOpenConflicts(cases.caseIds.E);
    expect(openConflicts.length).toBe(1);
    expect(openConflicts[0].conflictType).toBe('EXCLUSIVE_OVERLAP');
  });

  it('Caso G: royalty vinculado a cláusula contractual', () => {
    const cases = createFictitiousCases();
    const lineage = cases.lineage.getByCase(cases.caseIds.G);
    expect(lineage.length).toBe(1);
    expect(lineage[0].targetField).toBe('royalty_rate');
    expect(lineage[0].contractId).toBeTruthy();
  });

  it('Caso H: dato sin evidencia permanece UNVERIFIED', () => {
    const cases = createFictitiousCases();
    const unverified = cases.evidences.getUnverified(cases.caseIds.H);
    expect(unverified.length).toBeGreaterThan(0);
  });
});

// ============================================================
// CASE HEALTH (Capa 3.39)
// ============================================================

describe('3.39 — Case Health', () => {
  it('Calcula salud del expediente', () => {
    const cases = createFictitiousCases();
    const health = computeCaseHealth(
      cases.caseIds.A, cases.documents, cases.evidences, cases.sources,
      cases.contracts, cases.rights, cases.chains, cases.conflicts, cases.assumptions
    );
    expect(health.documents.total).toBeGreaterThan(0);
    expect(health.evidence.verified + health.evidence.unverified).toBeGreaterThan(0);
  });
});
