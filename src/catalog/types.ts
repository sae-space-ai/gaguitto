/**
 * PERITO IP — Fase 6: Tipos para Biblioteca Patrimonial
 * 
 * Define estructuras para catálogo real de obras, identidades creativas,
 * fuentes externas (Amazon, Audius) y relaciones entre obras/ediciones.
 */

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
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}

export function validateISBN10(isbn: string): boolean {
  const clean = normalizeISBN(isbn);
  if (clean.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  const check = clean[9] === 'X' ? 10 : parseInt(clean[9]);
  sum += check;
  return sum % 11 === 0;
}

export function validateISBN13(isbn: string): boolean {
  const clean = normalizeISBN(isbn);
  if (clean.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(clean[12]);
}

// ============================================================
// IDENTIDAD CREATIVA
// ============================================================

export type AliasType =
  | 'LEGAL_NAME'
  | 'AUTHOR_NAME'
  | 'CREATIVE_ALIAS'
  | 'PLATFORM_DISPLAY_NAME'
  | 'CREDIT_NAME'
  | 'UNKNOWN_ALIAS'
  | 'POSSIBLE_NAME_VARIANT';

export type IdentityMatchStatus =
  | 'CONFIRMED'
  | 'PROBABLE'
  | 'AMBIGUOUS'
  | 'REJECTED'
  | 'UNKNOWN';

export type IdentityResolutionStatus =
  | 'VERIFIED'
  | 'PARTIAL'
  | 'UNVERIFIED'
  | 'CONFLICTED';

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
  relationshipStatus: IdentityMatchStatus;
  notes?: string;
}

export interface CreatorIdentity {
  creatorId: string;
  canonicalName: string;
  primaryAlias: string;
  aliases: CreatorAlias[];
  externalIds: {
    amazonAuthorPageId?: string;
    audiusProfileId?: string;
    orcid?: string;
    isni?: string;
  };
  verificationStatus: IdentityResolutionStatus;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CATÁLOGO MAESTRO DE OBRAS
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
  | 'POSSIBLE_DUPLICATE'
  | 'QUARANTINE'
  | 'EXCLUDED'
  | 'REVIEW_REQUIRED'
  | 'AMBIGUOUS';

export type ContentAvailability =
  | 'FULL_TEXT_AVAILABLE'
  | 'METADATA_ONLY'
  | 'PUBLIC_DESCRIPTION_ONLY'
  | 'NOT_AVAILABLE'
  | 'PLATFORM_STREAM_REFERENCE';

export interface Edition {
  editionId: string;
  workId: string;
  format: string;
  title: string;
  subtitle?: string;
  publisher?: string;
  publicationDate?: string;
  language: string;
  isbn10?: string;
  isbn13?: string;
  asin?: string;
  pageCount?: number;
  dimensions?: string;
  categories: string[];
  description?: string;
  coverUrl?: string;
  productUrl?: string;
  marketplace?: string;
  authorPageUrl?: string;
  sourceId: string;
  retrievalDate: string;
  rawMetadata?: Record<string, any>;
  verificationStatus: WorkVerificationStatus;
}

export interface Work {
  workId: string;
  canonicalTitle: string;
  workType: WorkType;
  creatorIdentityIds: string[];
  creationDate?: string;
  publicationDates: string[];
  externalIds: {
    isbn10?: string;
    isbn13?: string;
    asin?: string;
    audiusTrackId?: string;
    isrc?: string;
    upc?: string;
  };
  editions: Edition[];
  sourceIds: string[];
  evidenceIds: string[];
  rightsIds: string[];
  contractIds: string[];
  relatedWorks: WorkRelationship[];
  verificationStatus: WorkVerificationStatus;
  valuationStatus: 'NOT_VALUED' | 'PARTIALLY_READY' | 'READY_FOR_VALUATION' | 'VALUED';
  contentAvailability: ContentAvailability;
  createdAt: string;
  updatedAt: string;
}

// Aliases para compatibilidad
export type MasterWork = Work;
export type WorkEdition = Edition;

// ============================================================
// RELACIONES ENTRE OBRAS
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

export interface WorkRelationship {
  relationshipId: string;
  sourceWorkId: string;
  targetWorkId: string;
  relationshipType: WorkRelationshipType;
  sourceId?: string;
  evidenceId?: string;
  confidence: number;
  notes?: string;
}

// ============================================================
// CONECTORES DE FUENTES
// ============================================================

export type ExternalSourceType = 'AMAZON' | 'AUDIUS' | 'MANUAL' | 'OTHER';

export interface SourceConnector {
  connectorId: string;
  sourceType: ExternalSourceType;
  sourceName: string;
  status: 'ACTIVE' | 'SYNCING' | 'ERROR' | 'DISABLED' | 'NEVER_SYNCED' | 'SYNCED' | 'RATE_LIMITED';
  externalCreatorId?: string;
  itemsDiscovered: number;
  itemsVerified: number;
  itemsPending: number;
  itemsQuarantined: number;
  errors: string[];
  config: Record<string, any>;
  lastSync?: string;
  baseUrl?: string;
  apiEndpoint?: string;
}

export interface ExternalSource {
  sourceId: string;
  sourceType: ExternalSourceType;
  name: string;
  baseUrl?: string;
  apiEndpoint?: string;
  lastSync?: string;
  syncStatus: 'NEVER_SYNCED' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'RATE_LIMITED';
  itemsDiscovered: number;
  itemsVerified: number;
  itemsPending: number;
  errors: string[];
}

// ============================================================
// IMPORTACIÓN Y PROVENANCIA
// ============================================================

export interface ImportRun {
  importRunId: string;
  connectorId: string;
  sourceType: ExternalSourceType;
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
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
}

export interface FieldProvenance {
  provenanceId: string;
  entityId: string;
  entityType: 'WORK' | 'EDITION' | 'IDENTITY' | 'ALIAS';
  fieldName: string;
  value: string;
  sourceId: string;
  observedAt: string;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'CONFLICTED';
  importRunId?: string;
}

// ============================================================
// EVIDENCIA DE PUBLICACIÓN
// ============================================================

export interface PublicationEvidence {
  evidenceId: string;
  workId?: string;
  editionId?: string;
  sourceId: string;
  sourceUrl: string;
  observedAt: string;
  metadataSnapshot: Record<string, any>;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'CONFLICTED';
  notes?: string;
}

// ============================================================
// MÉTRICAS OBSERVADAS
// ============================================================

export interface ObservedMetric {
  metricId: string;
  workId?: string;
  editionId?: string;
  metricType: 'PRICE' | 'RANKING' | 'RATING' | 'REVIEWS_COUNT' | 'PLAYS' | 'REPOSTS' | 'FAVORITES' | 'FOLLOWERS';
  value: number;
  observedAt: string;
  sourceId: string;
  currency?: string;
  marketplace?: string;
}

// ============================================================
// COLA DE REVISIÓN
// ============================================================

export type ReviewItemType =
  | 'ALIAS_AMBIGUOUS'
  | 'POSSIBLE_DUPLICATE'
  | 'PARTIAL_MATCH'
  | 'ISBN_DISCREPANCY'
  | 'RELATIONSHIP_DOUBTFUL'
  | 'RIGHTS_NOT_ACCREDITED'
  | 'SOURCE_CONFLICT';

export interface ReviewItem {
  reviewItemId: string;
  itemType: ReviewItemType;
  entityIds: string[];
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ============================================================
// ESTADO DE DERECHOS
// ============================================================

export interface RightsStatus {
  authorshipStatus: 'CLAIMED' | 'EVIDENCED' | 'UNVERIFIED' | 'DISPUTED';
  compositionRightsStatus: 'OWNED' | 'LICENSED' | 'UNVERIFIED' | 'UNKNOWN';
  masterRightsStatus: 'OWNED' | 'LICENSED' | 'UNVERIFIED' | 'UNKNOWN';
  performanceRightsStatus: 'OWNED' | 'LICENSED' | 'UNVERIFIED' | 'UNKNOWN';
  economicRightsStatus: 'OWNED' | 'LICENSED' | 'UNVERIFIED' | 'DISPUTED';
  platformAccountAssociation: 'CONFIRMED' | 'LIKELY' | 'UNVERIFIED';
  publicCredit: string;
}
