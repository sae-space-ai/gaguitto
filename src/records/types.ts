/**
 * PERITO IP — Fase 3: Tipos de la Capa Probatoria y Documental
 * 
 * Define todas las entidades de la capa probatoria:
 * expedientes, documentos, evidencias, fuentes, contratos, derechos,
 * titulares, hipótesis, conflictos, cadena de titularidad, linaje de datos.
 * 
 * PRINCIPIO: EVIDENCIA ANTES QUE AFIRMACIÓN.
 */

// ============================================================
// ESTADOS DE VERIFICACIÓN (Capa 3.6)
// ============================================================

export type VerificationStatus =
  | 'VERIFIED'           // Soporte suficiente
  | 'PARTIALLY_VERIFIED' // Soporte incompleto
  | 'UNVERIFIED'         // Sin verificación suficiente
  | 'CONFLICTED'         // Evidencias incompatibles
  | 'REJECTED'           // Descartada con motivo documentado
  | 'NOT_APPLICABLE';    // No procede verificar

// ============================================================
// TIPOS DE HECHO (Capa 3.7)
// ============================================================

export type StatementType =
  | 'FACT'        // Requiere soporte documental o fuente
  | 'INFERENCE'   // Debe indicar qué hechos la sustentan
  | 'ASSUMPTION'  // Declarada expresamente
  | 'ALLEGATION'  // Afirmación de parte no acreditada
  | 'CALCULATION' // Enlaza con motor matemático
  | 'OPINION';    // Valoración analítica/pericial

// ============================================================
// TIPOS DE EVIDENCIA (Capa 3.5)
// ============================================================

export type EvidenceType =
  | 'USER_PROVIDED'
  | 'CONTRACTUAL'
  | 'OFFICIAL'
  | 'INDEPENDENT'
  | 'MARKET'
  | 'ACCOUNTING'
  | 'TECHNICAL'
  | 'DERIVED'
  | 'ASSUMPTION';

export type ReliabilityLevel =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'UNKNOWN';

// ============================================================
// TIPOS DE DOCUMENTO (Capa 3.3)
// ============================================================

export type DocumentType =
  | 'MANUSCRIPT'
  | 'BOOK'
  | 'SCREENPLAY'
  | 'TREATMENT'
  | 'BIBLE'
  | 'CONTRACT'
  | 'ANNEX'
  | 'INVOICE'
  | 'BUDGET'
  | 'CERTIFICATE'
  | 'REGISTRATION'
  | 'LICENSE'
  | 'ASSIGNMENT'
  | 'CORRESPONDENCE'
  | 'ACCOUNTING'
  | 'REPORT'
  | 'DISTRIBUTION'
  | 'EDITORIAL'
  | 'PRODUCTION'
  | 'OTHER';

export type ConfidentialityLevel =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'STRICTLY_CONFIDENTIAL';

// ============================================================
// TIPOS DE FUENTE (Capa 3.8)
// ============================================================

export type SourceType =
  | 'OFFICIAL_LEGISLATION'
  | 'OFFICIAL_COURT_SOURCE'
  | 'PUBLIC_REGISTRY'
  | 'WIPO'
  | 'EU_OFFICIAL'
  | 'GOVERNMENT'
  | 'CONTRACT'
  | 'ACCOUNTING_DOCUMENT'
  | 'PROFESSIONAL_DATABASE'
  | 'MARKET_DATABASE'
  | 'INDUSTRY_SOURCE'
  | 'PUBLICATION'
  | 'OTHER';

export type SourceReliabilityTier = 1 | 2 | 3 | 4 | 5;
// 1 = Fuente oficial primaria
// 2 = Registro oficial
// 3 = Documento contractual original
// 4 = Fuente sectorial identificada
// 5 = Afirmación no verificada

// ============================================================
// TIPOS DE CONTRATO (Capa 3.13)
// ============================================================

export type ContractType =
  | 'EDITORIAL'
  | 'AUDIOVISUAL'
  | 'OPTION'
  | 'ASSIGNMENT'
  | 'LICENSE'
  | 'DISTRIBUTION'
  | 'PRODUCTION'
  | 'COPRODUCTION'
  | 'TRANSLATION'
  | 'ADAPTATION'
  | 'REPRESENTATION'
  | 'AGENCY'
  | 'MUSIC'
  | 'PERFORMERS'
  | 'ARCHIVE'
  | 'IMAGE'
  | 'OTHER';

export type ContractVerificationAspect =
  | 'DOCUMENT_EXISTS'
  | 'SIGNATURE_VERIFIED'
  | 'TERMS_EXTRACTED'
  | 'LEGAL_VALIDITY_ASSESSED';

// ============================================================
// TIPOS DE DERECHO (Capa 3.16)
// ============================================================

export type RightType =
  | 'PRINT'
  | 'EBOOK'
  | 'AUDIOBOOK'
  | 'TRANSLATION'
  | 'AUDIOVISUAL_ADAPTATION'
  | 'THEATRICAL'
  | 'TELEVISION'
  | 'SVOD'
  | 'TVOD'
  | 'AVOD'
  | 'REMAKE'
  | 'SEQUEL'
  | 'PREQUEL'
  | 'MERCHANDISING'
  | 'DISTRIBUTION'
  | 'PUBLIC_COMMUNICATION'
  | 'REPRODUCTION'
  | 'TRANSFORMATION'
  | 'OTHER';

export type RightEconomicStatus =
  | 'OWNED'
  | 'LICENSED'
  | 'ASSIGNED'
  | 'EXPIRED'
  | 'DISPUTED'
  | 'UNKNOWN';

// ============================================================
// TIPOS DE TITULAR (Capa 3.18)
// ============================================================

export type PartyType =
  | 'PERSON'
  | 'COMPANY'
  | 'PUBLISHER'
  | 'PRODUCER'
  | 'DISTRIBUTOR'
  | 'AGENT'
  | 'LICENSEE'
  | 'LICENSOR'
  | 'OTHER';

// ============================================================
// TIPOS DE ESTADO DE EXPEDIENTE
// ============================================================

export type CaseStatus =
  | 'DRAFT'
  | 'EVIDENCE_GATHERING'
  | 'ANALYSIS'
  | 'VALUATION_IN_PROGRESS'
  | 'REVIEW'
  | 'FINALIZED'
  | 'ARCHIVED';

// ============================================================
// ROLES / PERMISOS (Capa 3.36)
// ============================================================

export type UserRole =
  | 'OWNER'
  | 'ADMIN'
  | 'ANALYST'
  | 'REVIEWER'
  | 'READ_ONLY';

// ============================================================
// ENTIDADES PRINCIPALES
// ============================================================

export interface Case {
  caseId: string;
  caseName: string;
  caseType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  valuationDate: string;
  informationCutoffDate?: string;
  jurisdiction?: string;
  currency: string;
  status: CaseStatus;
  createdBy: string;
  version: number;
}

export interface Document {
  documentId: string;
  caseId: string;
  filename: string;
  originalFilename: string;
  documentType: DocumentType;
  mimeType: string;
  fileSize: number;
  uploadDate: string;
  documentDate?: string;
  sourceType: string;
  providedBy: string;
  description: string;
  storageReference: string;
  hash: string;
  hashAlgorithm: 'SHA-256' | 'SHA-512' | 'MD5';
  verificationStatus: VerificationStatus;
  confidentialityLevel: ConfidentialityLevel;
  notes?: string;
  createdAt: string;
  version: number;
}

export interface Evidence {
  evidenceId: string;
  caseId: string;
  documentId?: string;
  sourceId?: string;
  evidenceType: EvidenceType;
  statementType: StatementType;
  factAsserted: string;
  factSupported: string;
  relevantRightId?: string;
  relevantContractId?: string;
  effectiveDate?: string;
  verificationStatus: VerificationStatus;
  reliability: ReliabilityLevel;
  limitations: string;
  supportingEvidenceIds: string[];
  notes?: string;
  createdAt: string;
  createdBy: string;
  version: number;
}

export interface Source {
  sourceId: string;
  caseId: string;
  title: string;
  publisher?: string;
  sourceType: SourceType;
  url?: string;
  publicationDate?: string;
  accessDate: string;
  jurisdiction?: string;
  author?: string;
  documentReference?: string;
  reliabilityTier: SourceReliabilityTier;
  verificationStatus: VerificationStatus;
  archivedReference?: string;
  notes?: string;
  createdAt: string;
  version: number;
}

export interface Contract {
  contractId: string;
  caseId: string;
  contractType: ContractType;
  title: string;
  parties: { partyId: string; role: string }[];
  executionDate?: string;
  effectiveDate?: string;
  expirationDate?: string;
  territory?: string;
  language?: string;
  exclusivity?: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING' | 'DISPUTED';
  documentId?: string;
  verificationAspects: Record<ContractVerificationAspect, VerificationStatus>;
  clauses: ContractClause[];
  notes?: string;
  createdAt: string;
  version: number;
}

export interface ContractClause {
  clauseId: string;
  contractId: string;
  clauseType: string;
  extractedText?: string;
  structuredInterpretation: string;
  pageOrSection?: string;
  confidence: number; // 0-100
  humanReviewStatus: 'PENDING' | 'REVIEWED' | 'CORRECTED' | 'REJECTED';
  documentId?: string;
}

export interface Right {
  rightId: string;
  caseId: string;
  workId?: string;
  rightType: RightType;
  ownerId: string;
  territory?: string;
  language?: string;
  exclusivity: boolean;
  startDate?: string;
  endDate?: string;
  contractId?: string;
  evidenceId?: string;
  status: 'IDENTIFIED' | 'VERIFIED' | 'DISPUTED' | 'EXPIRED' | 'UNKNOWN';
  verificationStatus: VerificationStatus;
  economicStatus: RightEconomicStatus;
  notes?: string;
  createdAt: string;
  version: number;
}

export interface Party {
  partyId: string;
  displayName: string;
  partyType: PartyType;
  jurisdiction?: string;
  role?: string;
  verificationStatus: VerificationStatus;
  source?: string;
  notes?: string;
  createdAt: string;
}

export interface Assumption {
  assumptionId: string;
  caseId: string;
  description: string;
  value?: string;
  unit?: string;
  reason: string;
  sourceSupport?: string;
  createdBy: string;
  createdAt: string;
  confidence: number; // 0-100
  sensitivityRequired: boolean;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REJECTED';
  version: number;
}

// ============================================================
// RIGHTS GRAPH (Capa 3.17)
// ============================================================

export type GraphNodeType =
  | 'WORK'
  | 'RIGHT'
  | 'OWNER'
  | 'CONTRACT'
  | 'EVIDENCE'
  | 'TERRITORY'
  | 'LANGUAGE'
  | 'TERM'
  | 'EXPLOITATION'
  | 'VALUATION';

export interface GraphNode {
  nodeId: string;
  nodeType: GraphNodeType;
  entityId: string; // ID de la entidad referenciada
  label: string;
  properties: Record<string, string>;
}

export interface GraphEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: string;
  evidenceId?: string;
  properties: Record<string, string>;
}

export interface RightsGraph {
  caseId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  updatedAt: string;
}

// ============================================================
// CHAIN OF TITLE (Capa 3.19)
// ============================================================

export type ChainLinkStatus = 'VERIFIED' | 'UNVERIFIED' | 'GAP' | 'CONFLICT';

export interface ChainLink {
  linkId: string;
  rightId: string;
  fromPartyId: string;
  toPartyId: string;
  contractId?: string;
  evidenceId?: string;
  territory?: string;
  language?: string;
  startDate?: string;
  endDate?: string;
  status: ChainLinkStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface ChainOfTitle {
  chainId: string;
  rightId: string;
  links: ChainLink[];
  overallStatus: 'COMPLETE' | 'PARTIAL_CHAIN' | 'CHAIN_GAP' | 'CHAIN_CONFLICT';
  gaps: string[]; // IDs de eslabones faltantes
  conflicts: string[]; // IDs de conflictos
}

// ============================================================
// CONFLICTOS (Capa 3.30)
// ============================================================

export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConflictType =
  | 'INCOMPATIBLE_DATES'
  | 'INCOMPATIBLE_OWNERS'
  | 'EXCLUSIVE_OVERLAP'
  | 'CONTRADICTORY_ROYALTIES'
  | 'CONTRADICTORY_TERRITORIES'
  | 'CONTRADICTORY_DATES'
  | 'INCOMPATIBLE_DATA'
  | 'CHAIN_CONFLICT'
  | 'CONTRACT_CONFLICT';

export type ConflictStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface Conflict {
  conflictId: string;
  caseId: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  description: string;
  entities: { type: string; id: string; description: string }[];
  status: ConflictStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ============================================================
// AUDIT LOG (Capa 3.26)
// ============================================================

export type AuditAction =
  | 'document_added'
  | 'document_removed'
  | 'evidence_created'
  | 'evidence_status_changed'
  | 'source_added'
  | 'contract_added'
  | 'contract_modified'
  | 'right_created'
  | 'right_modified'
  | 'ownership_changed'
  | 'assumption_created'
  | 'verification_changed'
  | 'calculation_executed'
  | 'report_generated'
  | 'case_created'
  | 'case_modified';

export interface AuditEntry {
  eventId: string;
  timestamp: string;
  userOrAgent: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  caseId: string;
  chainHash: string;
}

// ============================================================
// DATA LINEAGE (Capa 3.25)
// ============================================================

export interface DataLineageEntry {
  lineageId: string;
  caseId: string;
  targetField: string; // ej: "royalty_rate", "sales_projection"
  targetValue: string;
  sourceId?: string;
  documentId?: string;
  evidenceId?: string;
  contractId?: string;
  rightId?: string;
  assumptionId?: string;
  calculationId?: string;
  clauseReference?: string;
  chain: string[]; // DOCUMENT → EVIDENCE → RIGHT → INPUT → CALCULATION → RESULT
  createdAt: string;
}

// ============================================================
// EVIDENCE GATE (Capa 3.40)
// ============================================================

export interface EvidenceGateResult {
  caseId: string;
  canFinalize: boolean;
  status: 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
  checks: {
    rightsVerified: { count: number; total: number; issues: string[] };
    ownershipVerified: { count: number; total: number; issues: string[] };
    contractsAnalyzed: { count: number; total: number; issues: string[] };
    economicInputsSourced: { count: number; total: number; issues: string[] };
    conflictsResolved: { count: number; total: number; issues: string[] };
    cutoffDateRespected: { compliant: boolean; issues: string[] };
    doubleCountingChecked: { passed: boolean; issues: string[] };
  };
  warnings: string[];
  blockingIssues: string[];
}

// ============================================================
// CASE HEALTH (Capa 3.39)
// ============================================================

export interface CaseHealth {
  caseId: string;
  documents: { total: number };
  evidence: {
    verified: number;
    partiallyVerified: number;
    unverified: number;
    conflicted: number;
    rejected: number;
  };
  conflicts: { open: number; resolved: number };
  rights: {
    identified: number;
    verified: number;
    conflicted: number;
  };
  contracts: { analyzed: number; pending: number };
  chainGaps: number;
  sources: { verified: number; unverified: number };
  assumptions: { active: number; rejected: number };
  staleCalculations: number;
}

// ============================================================
// UTILIDADES
// ============================================================

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${ts}-${rnd}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
