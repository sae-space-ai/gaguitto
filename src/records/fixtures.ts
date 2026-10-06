/**
 * PERITO IP — Fase 3: Expedientes Ficticios de Prueba (Capa 3.42)
 * 
 * Todos los datos son CLARAMENTE FICTICIOS.
 * No se utiliza información privada real.
 * 
 * CASO A: Novela con derechos editoriales acreditados y audiovisuales no cedidos.
 * CASO B: Libro con contrato editorial donde algunos derechos están cedidos y otros reservados.
 * CASO C: Película con cadena de titularidad completa ficticia.
 * CASO D: Audiovisual con un eslabón documental faltante.
 * CASO E: Dos contratos ficticios con posible conflicto de exclusividad.
 * CASO F: Valoración histórica con información posterior a la fecha de corte.
 * CASO G: Royalty utilizado por Fase 2 vinculado a cláusula contractual ficticia.
 * CASO H: Dato económico sin evidencia que debe permanecer UNVERIFIED.
 */

import { CaseManagement } from './case-management';
import { DocumentRegistry } from './document-registry';
import { EvidenceRegistry, SourceRegistry } from './evidence-source-registry';
import { ContractRegistry, RightsRegistry, PartyRegistry } from './contracts-rights-parties';
import { ChainOfTitleEngine, AssumptionRegistry, AuditLog, ConflictEngine, DataLineageTracker } from './chain-audit-conflicts-gate';
import { Phase2Bridge } from './case-management';

export interface FictitiousCaseSet {
  caseManagement: CaseManagement;
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
  caseIds: Record<string, string>;
}

export function createFictitiousCases(): FictitiousCaseSet {
  const caseManagement = new CaseManagement();
  const documents = new DocumentRegistry();
  const evidences = new EvidenceRegistry();
  const sources = new SourceRegistry();
  const contracts = new ContractRegistry();
  const rights = new RightsRegistry();
  const parties = new PartyRegistry();
  const chains = new ChainOfTitleEngine();
  const assumptions = new AssumptionRegistry();
  const auditLog = new AuditLog();
  const conflicts = new ConflictEngine();
  const lineage = new DataLineageTracker();
  const bridge = new Phase2Bridge(lineage);

  // ============================================================
  // PARTES FICTICIAS
  // ============================================================
  const authorA = parties.register({ displayName: 'María Ficción García', partyType: 'PERSON', jurisdiction: 'ES', role: 'Autora' });
  const publisherA = parties.register({ displayName: 'Editorial Imaginaria S.L.', partyType: 'PUBLISHER', jurisdiction: 'ES', role: 'Editor' });
  const producerA = parties.register({ displayName: 'Producciones Ficticias AIE', partyType: 'PRODUCER', jurisdiction: 'ES', role: 'Productor' });
  const distributorA = parties.register({ displayName: 'Distribución Ficticia Internacional S.A.', partyType: 'DISTRIBUTOR', jurisdiction: 'ES', role: 'Distribuidor' });
  const agentA = parties.register({ displayName: 'Agencia Literaria Ficción', partyType: 'AGENT', jurisdiction: 'ES', role: 'Agente' });

  // ============================================================
  // CASO A: Novela con derechos editoriales acreditados y audiovisuales no cedidos
  // ============================================================
  const caseA = caseManagement.create({
    caseName: 'Novela "El Jardín de las Sombras" — Valoración derechos',
    caseType: 'literary_work',
    description: 'Valoración de derechos editoriales y audiovisuales de la novela ficticia "El Jardín de las Sombras" de María Ficción García.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const docA1 = documents.register({
    caseId: caseA.caseId,
    filename: 'contrato_editorial_ficcion.pdf',
    originalFilename: 'Contrato Editorial - El Jardín de las Sombras.pdf',
    documentType: 'CONTRACT',
    mimeType: 'application/pdf',
    fileSize: 245000,
    documentDate: '2022-03-15',
    sourceType: 'user_provided',
    providedBy: 'María Ficción García',
    description: 'Contrato editorial ficticio entre la autora y Editorial Imaginaria S.L.',
    content: 'CONTRATO EDITORIAL FICTICIO - El Jardín de las Sombras - María Ficción García - Editorial Imaginaria S.L. - 2022',
    confidentialityLevel: 'CONFIDENTIAL',
  });

  const srcA1 = sources.register({
    caseId: caseA.caseId,
    title: 'Registro de la Propiedad Intelectual de Madrid',
    publisher: 'Ministerio de Cultura de España',
    sourceType: 'PUBLIC_REGISTRY',
    jurisdiction: 'ES',
    notes: 'Registro ficticio de prueba.',
  });

  evidences.register({
    caseId: caseA.caseId,
    documentId: docA1.documentId,
    evidenceType: 'CONTRACTUAL',
    statementType: 'FACT',
    factAsserted: 'La autora cedió derechos de reproducción en formato impreso y ebook para territorio español.',
    factSupported: 'Contrato editorial firmado el 15/03/2022.',
    reliability: 'HIGH',
    limitations: 'Los derechos audiovisuales NO están cedidos en este contrato.',
    createdBy: 'perito_test',
  });

  evidences.register({
    caseId: caseA.caseId,
    sourceId: srcA1.sourceId,
    evidenceType: 'OFFICIAL',
    statementType: 'FACT',
    factAsserted: 'La obra está registrada en el Registro de la Propiedad Intelectual.',
    factSupported: 'Certificado de registro ficticio.',
    reliability: 'HIGH',
    limitations: 'El registro acredita autoría y fecha, no contenido completo.',
    createdBy: 'perito_test',
  });

  // Derechos: editoriales cedidos, audiovisuales NO cedidos
  rights.register({
    caseId: caseA.caseId, rightType: 'PRINT', ownerId: publisherA.partyId,
    territory: 'ES', exclusivity: true, startDate: '2022-03-15', endDate: '2032-03-15',
    contractId: undefined, evidenceId: undefined, economicStatus: 'LICENSED',
  });
  rights.register({
    caseId: caseA.caseId, rightType: 'EBOOK', ownerId: publisherA.partyId,
    territory: 'ES', exclusivity: true, startDate: '2022-03-15', endDate: '2032-03-15',
    economicStatus: 'LICENSED',
  });
  rights.register({
    caseId: caseA.caseId, rightType: 'AUDIOVISUAL_ADAPTATION', ownerId: authorA.partyId,
    exclusivity: true, economicStatus: 'OWNED',
    notes: 'Derechos audiovisuales NO cedidos. Pertenecen a la autora.',
  });

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseA.caseId, caseId: caseA.caseId, reason: 'Creación caso ficticio A' });

  // ============================================================
  // CASO B: Libro con contrato editorial — derechos parcialmente cedidos
  // ============================================================
  const caseB = caseManagement.create({
    caseName: 'Libro "Crónicas del Viento" — Derechos parcialmente cedidos',
    caseType: 'literary_work',
    description: 'Libro ficticio con contrato editorial donde algunos derechos están cedidos y otros reservados por el autor.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const ctrB = contracts.register({
    caseId: caseB.caseId,
    contractType: 'EDITORIAL',
    title: 'Contrato Editorial Ficticio - Crónicas del Viento',
    parties: [{ partyId: authorA.partyId, role: 'Autor' }, { partyId: publisherA.partyId, role: 'Editor' }],
    executionDate: '2021-06-01',
    effectiveDate: '2021-06-01',
    expirationDate: '2031-06-01',
    territory: 'ES',
    language: 'es',
    exclusivity: true,
    documentId: undefined,
  });

  contracts.addClause(ctrB.contractId, {
    clauseType: 'rights_granted',
    extractedText: 'El autor cede los derechos de reproducción en formato impreso y ebook para territorio español e hispanoamericano.',
    structuredInterpretation: 'Derechos cedidos: PRINT + EBOOK. Territorio: ES + LATAM. Audiovisuales: reservados.',
    pageOrSection: 'Cláusula 3.1',
    confidence: 90,
    humanReviewStatus: 'PENDING',
  });

  contracts.addClause(ctrB.contractId, {
    clauseType: 'rights_reserved',
    extractedText: 'Los derechos de adaptación audiovisual, traducción y merchandising quedan reservados al autor.',
    structuredInterpretation: 'Derechos reservados: AUDIOVISUAL_ADAPTATION, TRANSLATION, MERCHANDISING.',
    pageOrSection: 'Cláusula 3.4',
    confidence: 95,
    humanReviewStatus: 'PENDING',
  });

  rights.register({
    caseId: caseB.caseId, rightType: 'PRINT', ownerId: publisherA.partyId,
    territory: 'ES', language: 'es', exclusivity: true,
    startDate: '2021-06-01', endDate: '2031-06-01',
    contractId: ctrB.contractId, economicStatus: 'LICENSED',
  });
  rights.register({
    caseId: caseB.caseId, rightType: 'TRANSLATION', ownerId: authorA.partyId,
    exclusivity: true, economicStatus: 'OWNED',
    notes: 'Reservado al autor según cláusula 3.4.',
  });

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseB.caseId, caseId: caseB.caseId, reason: 'Creación caso ficticio B' });

  // ============================================================
  // CASO C: Película con cadena de titularidad completa ficticia
  // ============================================================
  const caseC = caseManagement.create({
    caseName: 'Película "La Última Frontera" — Cadena completa',
    caseType: 'audiovisual_work',
    description: 'Película ficticia con cadena de titularidad completa desde el guion hasta la distribución.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const ctrC1 = contracts.register({
    caseId: caseC.caseId, contractType: 'ASSIGNMENT', title: 'Cesión de derechos de guion',
    parties: [{ partyId: authorA.partyId, role: 'Guionista' }, { partyId: producerA.partyId, role: 'Productor' }],
    executionDate: '2020-01-15', territory: 'WORLDWIDE', exclusivity: true,
  });
  const ctrC2 = contracts.register({
    caseId: caseC.caseId, contractType: 'DISTRIBUTION', title: 'Contrato de distribución mundial',
    parties: [{ partyId: producerA.partyId, role: 'Productor' }, { partyId: distributorA.partyId, role: 'Distribuidor' }],
    executionDate: '2022-06-01', territory: 'WORLDWIDE', exclusivity: true,
  });

  const rightC1 = rights.register({
    caseId: caseC.caseId, rightType: 'THEATRICAL', ownerId: producerA.partyId,
    territory: 'WORLDWIDE', exclusivity: true, contractId: ctrC1.contractId,
    economicStatus: 'ASSIGNED',
  });

  chains.buildChain(rightC1.rightId, [
    {
      rightId: rightC1.rightId, fromPartyId: authorA.partyId, toPartyId: producerA.partyId,
      contractId: ctrC1.contractId, status: 'VERIFIED', verificationStatus: 'VERIFIED',
      startDate: '2020-01-15',
    },
    {
      rightId: rightC1.rightId, fromPartyId: producerA.partyId, toPartyId: distributorA.partyId,
      contractId: ctrC2.contractId, status: 'VERIFIED', verificationStatus: 'VERIFIED',
      startDate: '2022-06-01',
    },
  ]);

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseC.caseId, caseId: caseC.caseId, reason: 'Creación caso ficticio C' });

  // ============================================================
  // CASO D: Audiovisual con eslabón documental faltante
  // ============================================================
  const caseD = caseManagement.create({
    caseName: 'Serie "Ecos del Pasado" — Cadena incompleta',
    caseType: 'audiovisual_work',
    description: 'Serie ficticia con un eslabón faltante en la cadena de titularidad de la música original.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const rightD = rights.register({
    caseId: caseD.caseId, rightType: 'TELEVISION', ownerId: producerA.partyId,
    territory: 'ES', exclusivity: true, economicStatus: 'DISPUTED',
    notes: 'Falta documentación de cesión de derechos musicales.',
  });

  chains.buildChain(rightD.rightId, [
    {
      rightId: rightD.rightId, fromPartyId: authorA.partyId, toPartyId: producerA.partyId,
      status: 'VERIFIED', verificationStatus: 'VERIFIED', startDate: '2019-01-01',
    },
    {
      rightId: rightD.rightId, fromPartyId: 'PARTY_DESCONOCIDO', toPartyId: distributorA.partyId,
      status: 'GAP', verificationStatus: 'UNVERIFIED',
      notes: 'Eslabón faltante: no se ha localizado contrato de cesión del compositor.',
    },
  ]);

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseD.caseId, caseId: caseD.caseId, reason: 'Creación caso ficticio D' });

  // ============================================================
  // CASO E: Dos contratos con posible conflicto de exclusividad
  // ============================================================
  const caseE = caseManagement.create({
    caseName: 'Conflicto de exclusividad — "Memorias de Cristal"',
    caseType: 'contract_conflict',
    description: 'Dos contratos ficticios que podrían generar conflicto de exclusividad territorial.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const ctrE1 = contracts.register({
    caseId: caseE.caseId, contractType: 'LICENSE', title: 'Licencia exclusiva territorio ES',
    parties: [{ partyId: authorA.partyId, role: 'Licenciante' }, { partyId: publisherA.partyId, role: 'Licenciataria' }],
    executionDate: '2020-01-01', territory: 'ES', exclusivity: true,
  });
  const ctrE2 = contracts.register({
    caseId: caseE.caseId, contractType: 'LICENSE', title: 'Licencia exclusiva territorio ES (segunda)',
    parties: [{ partyId: authorA.partyId, role: 'Licenciante' }, { partyId: agentA.partyId, role: 'Licenciataria' }],
    executionDate: '2023-05-01', territory: 'ES', exclusivity: true,
  });

  conflicts.registerConflict({
    caseId: caseE.caseId,
    conflictType: 'EXCLUSIVE_OVERLAP',
    severity: 'HIGH',
    description: 'Dos licencias exclusivas para el mismo territorio (ES) y mismo derecho. Posible incompatibilidad.',
    entities: [
      { type: 'contract', id: ctrE1.contractId, description: 'Licencia a Editorial Imaginaria (2020)' },
      { type: 'contract', id: ctrE2.contractId, description: 'Licencia a Agencia Ficción (2023)' },
    ],
  });

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseE.caseId, caseId: caseE.caseId, reason: 'Creación caso ficticio E' });

  // ============================================================
  // CASO F: Valoración histórica con información posterior
  // ============================================================
  const caseF = caseManagement.create({
    caseName: 'Valoración histórica — "Cuentos del Amanecer" (fecha: 2022-01-01)',
    caseType: 'historical_valuation',
    description: 'Valoración con fecha de referencia 2022-01-01. Existe información posterior que NO debe usarse automáticamente.',
    valuationDate: '2022-01-01',
    informationCutoffDate: '2022-01-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  evidences.register({
    caseId: caseF.caseId,
    evidenceType: 'MARKET',
    statementType: 'FACT',
    factAsserted: 'Ventas 2021: 15.000 ejemplares.',
    factSupported: 'Dato anterior a la fecha de valoración.',
    effectiveDate: '2021-12-31',
    reliability: 'HIGH',
    limitations: 'Ninguna. Información disponible en la fecha de valoración.',
    createdBy: 'perito_test',
  });

  evidences.register({
    caseId: caseF.caseId,
    evidenceType: 'MARKET',
    statementType: 'FACT',
    factAsserted: 'Ventas 2023: 50.000 ejemplares.',
    factSupported: 'Dato POSTERIOR a la fecha de valoración.',
    effectiveDate: '2023-12-31',
    reliability: 'HIGH',
    limitations: 'POST_VALUATION_INFORMATION. No debe usarse automáticamente en la valoración histórica.',
    createdBy: 'perito_test',
  });

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseF.caseId, caseId: caseF.caseId, reason: 'Creación caso ficticio F' });

  // ============================================================
  // CASO G: Royalty vinculado a cláusula contractual ficticia
  // ============================================================
  const caseG = caseManagement.create({
    caseName: 'Royalty contractual — "El Secreto del Faro"',
    caseType: 'royalty_valuation',
    description: 'Royalty del 10% sobre PVP vinculado a cláusula contractual ficticia.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const ctrG = contracts.register({
    caseId: caseG.caseId, contractType: 'EDITORIAL', title: 'Contrato El Secreto del Faro',
    parties: [{ partyId: authorA.partyId, role: 'Autor' }, { partyId: publisherA.partyId, role: 'Editor' }],
    executionDate: '2023-01-01', territory: 'ES', exclusivity: true,
  });

  contracts.addClause(ctrG.contractId, {
    clauseType: 'royalty_rate',
    extractedText: 'El autor percibirá un royalty del 10% sobre el PVP de cada ejemplar vendido.',
    structuredInterpretation: 'Royalty = 10% sobre PVP.',
    pageOrSection: 'Cláusula 5.1',
    confidence: 95,
    humanReviewStatus: 'REVIEWED',
  });

  const evG = evidences.register({
    caseId: caseG.caseId,
    documentId: undefined,
    evidenceType: 'CONTRACTUAL',
    statementType: 'FACT',
    factAsserted: 'Royalty del 10% sobre PVP.',
    factSupported: 'Cláusula 5.1 del contrato editorial.',
    relevantContractId: ctrG.contractId,
    reliability: 'HIGH',
    limitations: 'Ninguna. Cláusula revisada.',
    createdBy: 'perito_test',
  });

  // Conexión con Fase 2: el royalty rate está vinculado
  bridge.linkInput({
    fieldName: 'royalty_rate',
    value: '0.10',
    caseId: caseG.caseId,
    sourceId: undefined,
    evidenceId: evG.evidenceId,
    contractId: ctrG.contractId,
    clauseReference: 'Cláusula 5.1',
    calculationId: 'calc-fase2-g',
  });

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseG.caseId, caseId: caseG.caseId, reason: 'Creación caso ficticio G' });

  // ============================================================
  // CASO H: Dato económico sin evidencia — debe permanecer UNVERIFIED
  // ============================================================
  const caseH = caseManagement.create({
    caseName: 'Dato sin evidencia — "Aventura en Marte"',
    caseType: 'unverified_data',
    description: 'Caso con un dato económico declarado por el usuario sin evidencia documental.',
    valuationDate: '2024-06-01',
    jurisdiction: 'ES',
    currency: 'EUR',
    createdBy: 'perito_test',
  });

  const evH = evidences.register({
    caseId: caseH.caseId,
    evidenceType: 'USER_PROVIDED',
    statementType: 'ALLEGATION',
    factAsserted: 'El usuario declara ventas de 100.000 ejemplares.',
    factSupported: 'Sin soporte documental. Declaración del usuario.',
    reliability: 'LOW',
    limitations: 'NO VERIFICADO. Sin documento, factura, ni fuente independiente que lo acredite.',
    createdBy: 'usuario_test',
  });

  // Verificar que permanece UNVERIFIED
  const evHCheck = evidences.get(evH.evidenceId);
  if (evHCheck?.verificationStatus !== 'UNVERIFIED') {
    throw new Error('ERROR: Evidencia USER_PROVIDED no debería estar VERIFIED sin verificación independiente.');
  }

  // Intentar que el LLM la verifique — debe fallar
  try {
    evidences.changeVerificationStatus(evH.evidenceId, 'VERIFIED', 'LLM', 'Verificación automática');
    throw new Error('ERROR: El LLM no debería poder convertir UNVERIFIED en VERIFIED.');
  } catch (e: any) {
    if (!e.message.includes('LLM no puede convertir')) {
      throw e;
    }
    // Comportamiento esperado
  }

  auditLog.record({ userOrAgent: 'perito_test', action: 'case_created', entityType: 'case', entityId: caseH.caseId, caseId: caseH.caseId, reason: 'Creación caso ficticio H' });

  // ============================================================
  // HIPÓTESIS REGISTRADAS
  // ============================================================
  assumptions.register({
    caseId: caseA.caseId,
    description: 'Tasa de descuento del 8% basada en WACC sector editorial español.',
    value: '0.08',
    unit: 'decimal',
    reason: 'Estimación basada en datos sectoriales.',
    confidence: 60,
    sensitivityRequired: true,
    status: 'ACTIVE',
    createdBy: 'perito_test',
  });

  // ============================================================
  // RETURN
  // ============================================================
  return {
    caseManagement,
    documents,
    evidences,
    sources,
    contracts,
    rights,
    parties,
    chains,
    assumptions,
    auditLog,
    conflicts,
    lineage,
    bridge,
    caseIds: {
      A: caseA.caseId,
      B: caseB.caseId,
      C: caseC.caseId,
      D: caseD.caseId,
      E: caseE.caseId,
      F: caseF.caseId,
      G: caseG.caseId,
      H: caseH.caseId,
    },
  };
}
