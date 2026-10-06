/**
 * PERITO IP — Fase 6: Tipos del Catálogo Maestro e Identidad Creativa
 * 
 * Define la estructura para:
 * - Master Work Catalog (obras literarias, musicales, audiovisuales)
 * - Creator Identity Registry (alias y variantes de nombre)
 * - Source Connectors (Amazon, Audius)
 * - Work Relationships (ediciones, traducciones, adaptaciones)
 * 
 * PRINCIPIO: NO inventar datos. Solo metadatos públicamente verificables.
 * La existencia pública NO equivale a titularidad jurídica.
 */

// ============================================================
// TIPOS DE OBRA
// ============================================================

export type WorkType =
  | 'BOOK'
  | 'NOVEL'
  | 'ESSAY'
  | 'LEGAL_WORK'
  | 'EDUCATIONAL_WORK'
  | 'MUSICAL_COMPOSITION'
  | 'SOUND_RECORDING'
  | 'PODCAST'
  | 'AUDIOBOOK'
  | 'AUDIOVISUAL_WORK'
  | 'OTHER';

export type WorkVerificationStatus =
  | 'VERIFIED'
  | 'CANDIDATE'
  | 'AMBIGUOUS'
  | 'QUARANTINE'
  | 'REVIEW_REQUIRED'
  | 'EXCLUDED';

export type WorkValuationStatus =
  | 'NOT_READY'
  | 'PARTIALLY_READY'
  | 'READY_FOR_FORENSIC_VALUATION'
  | 'VALUATION_IN_PROGRESS'
  | 'VALUED';

// ============================================================
// TIPOS DE ALIAS / IDENTIDAD
// ============================================================

export type AliasType =
  | 'LEGAL_NAME'
  | 'AUTHOR_NAME'
  | 'CREATIVE_ALIAS'
  | 'PLATFORM_DISPLAY_NAME'
  | 'CREDIT_NAME'
  | 'UNKNOWN_ALIAS'
  | 'POSSIBLE_NAME_VARIANT';

export type IdentityResolutionStatus =
  | 'MATCH_CONFIRMED'
  | 'MATCH_PROBABLE_REQUIRES_REVIEW'
  | 'AMBIGUOUS'
  | 'NOT_MATCH'
  | 'UNKNOWN';

// ============================================================
// TIPOS DE RELACIÓN ENTRE OBRAS
// ============================================================

export type WorkRelationshipType =
  | 'IS_EDITION_OF'
  | 'IS_TRANSLATION_OF'
  | 'IS_ADAPTATION_OF'
  | 'IS_AUDIOBOOK_OF'
  | 'IS_RECORDING_OF'
  | 'IS_VERSION_OF'
  | 'IS_REMASTER_OF'
  | 'IS_DERIVED_FROM'
  | 'IS_PART_OF_SERIES'
  | 'RELATED_TO'
  | 'UNKNOWN_RELATIONSHIP';

// ============================================================
// TIPOS DE EVIDENCIA DE PUBLICACIÓN
// ============================================================

export type PublicationEvidenceType =
  | 'PLATFORM_LISTING'
  | 'ISBN_REGISTRY'
  | 'PUBLISHER_CATALOG'
  | 'USER_PROVIDED_FILE'
  | 'OFFICIAL_REGISTRY'
  | 'OTHER';

export type ContentAvailability =
  | 'FULL_TEXT_AVAILABLE'
  | 'METADATA_ONLY'
  | 'PUBLIC_DESCRIPTION_ONLY'
  | 'USER_PROVIDED_MASTER'
  | 'PLATFORM_STREAM_REFERENCE'
  | 'NOT_AVAILABLE';

// ============================================================
// ENTIDADES PRINCIPALES
// ============================================================

export interface CreatorAlias {
  aliasId: string;
  creatorId: string;
  displayedName: string;
  normalizedName: string;
  aliasType: AliasType;
  sourceId?: string;
  firstSeen: string;
  lastSeen: string;
  usageContext: string;
  verificationStatus: IdentityResolutionStatus;
  relationshipStatus: 'CONFIRMED' | 'PROBABLE' | 'AMBIGUOUS' | 'REJECTED';
  notes?: string;
}

export interface CreatorIdentity {
  creatorId: string;
  legalName?: string;
  primaryAlias: string;
  aliases: CreatorAlias[];
  externalIds: {
    amazonAuthorPage?: string;
    audiusProfile?: string;
    orcid?: string;
    other?: Record<string, string>;
  };
  verificationStatus: IdentityResolutionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkEdition {
  editionId: string;
  workId: string;
  format: string; // 'Kindle', 'Tapa blanda', 'MP3', etc.
  isbn10?: string;
  isbn13?: string;
  asin?: string;
  publisher?: string;
  publicationDate?: string;
  language?: string;
  pageCount?: number;
  price?: number;
  currency?: string;
  externalUrl?: string;
  sourceId: string;
  retrievalDate: string;
  verificationStatus: WorkVerificationStatus;
}

export interface MasterWork {
  workId: string;
  canonicalTitle: string;
  workType: WorkType;
  creatorIds: string[];
  aliases: string[];
  creationDate?: string;
  publicationDates: string[];
  externalIds: {
    isbn10?: string[];
    isbn13?: string[];
    asin?: string[];
    platformIds?: Record<string, string>;
  };
  editions: WorkEdition[];
  sourceIds: string[];
  evidenceIds: string[];
  rightsIds: string[];
  contractIds: string[];
  relatedWorkIds: string[];
  verificationStatus: WorkVerificationStatus;
  valuationStatus: WorkValuationStatus;
  contentAvailability: ContentAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface WorkRelationship {
  relationshipId: string;
  sourceWorkId: string;
  targetWorkId: string;
  relationshipType: WorkRelationshipType;
  evidenceId?: string;
  sourceId?: string;
  confidence: number; // 0-100
  verificationStatus: WorkVerificationStatus;
  notes?: string;
  createdAt: string;
}

export interface PublicationEvidence {
  evidenceId: string;
  workId: string;
  evidenceType: PublicationEvidenceType;
  sourceId: string;
  sourceUrl?: string;
  sourceSnapshot?: string;
  retrievalDate: string;
  metadata: Record<string, any>;
  verificationStatus: WorkVerificationStatus;
  createdAt: string;
}

// ============================================================
// CONECTORES DE FUENTES
// ============================================================

export type SourceConnectorStatus =
  | 'ACTIVE'
  | 'SYNCING'
  | 'ERROR'
  | 'RATE_LIMITED'
  | 'DISABLED';

export interface SourceConnector {
  connectorId: string;
  sourceType: 'AMAZON' | 'AUDIUS' | 'OTHER';
  sourceName: string;
  status: SourceConnectorStatus;
  externalCreatorId?: string;
  lastSync?: string;
  itemsDiscovered: number;
  itemsVerified: number;
  itemsPending: number;
  itemsQuarantined: number;
  errors: string[];
  config: Record<string, any>;
}

export interface ImportRun {
  importRunId: string;
  connectorId: string;
  sourceType: string;
  startedAt: string;
  completedAt?: string;
  recordsSeen: number;
  recordsCreated: number;
  recordsUpdated: number;
  duplicates: number;
  quarantined: number;
  errors: number;
  softwareVersion: string;
  dryRun: boolean;
}

// ============================================================
// MÉTRICAS OBSERVADAS
// ============================================================

export interface TimeSeriesObservation {
  observationId: string;
  entityId: string;
  entityType: 'WORK' | 'EDITION' | 'TRACK';
  metricType: string; // 'plays', 'followers', 'price', 'ranking', etc.
  value: number;
  observedAt: string;
  sourceId: string;
  notes?: string;
}

// ============================================================
// COLA DE REVISIÓN
// ============================================================

export type ReviewQueueItemType =
  | 'AMBIGUOUS_ALIAS'
  | 'POSSIBLE_DUPLICATE'
  | 'ISBN_DISCREPANCY'
  | 'RELATIONSHIP_DOUBTFUL'
  | 'RIGHTS_NOT_ACCREDITED'
  | 'SOURCE_CONFLICT';

export interface ReviewQueueItem {
  itemId: string;
  itemType: ReviewQueueItemType;
  entityId: string;
  entityType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

// ============================================================
// UTILIDADES
// ============================================================

export function generateCatalogId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${ts}-${rnd}`;
}

export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos para matching
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}

export function validateISBN13(isbn: string): boolean {
  const clean = normalizeISBN(isbn);
  if (clean.length !== 13) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(clean[i]);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(clean[12]);
}
