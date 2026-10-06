/**
 * PERITO IP — Fase 6: Master Work Catalog
 * 
 * Catálogo maestro que unifica obras literarias, musicales, sonoras y audiovisuales.
 * Gestiona obras, ediciones, relaciones y evidencia de publicación.
 * 
 * PRINCIPIO: NO fusionar automáticamente obras por título parecido.
 * Una edición NO es una obra independiente.
 */

import {
  MasterWork,
  WorkEdition,
  WorkRelationship,
  PublicationEvidence,
  WorkType,
  WorkVerificationStatus,
  WorkRelationshipType,
  ContentAvailability,
  generateCatalogId,
  normalizeISBN,
  validateISBN13,
} from './types';

export class MasterWorkCatalog {
  private works: Map<string, MasterWork> = new Map();
  private editions: Map<string, WorkEdition> = new Map();
  private relationships: Map<string, WorkRelationship> = new Map();
  private publicationEvidence: Map<string, PublicationEvidence> = new Map();

  /**
   * Crea una nueva obra en el catálogo.
   */
  createWork(params: {
    canonicalTitle: string;
    workType: WorkType;
    creatorIds: string[];
    contentAvailability?: ContentAvailability;
  }): MasterWork {
    const workId = generateCatalogId('WORK');
    const now = new Date().toISOString();

    const work: MasterWork = {
      workId,
      canonicalTitle: params.canonicalTitle,
      workType: params.workType,
      creatorIds: params.creatorIds,
      aliases: [],
      publicationDates: [],
      externalIds: {},
      editions: [],
      sourceIds: [],
      evidenceIds: [],
      rightsIds: [],
      contractIds: [],
      relatedWorkIds: [],
      verificationStatus: 'CANDIDATE',
      valuationStatus: 'NOT_READY',
      contentAvailability: params.contentAvailability || 'METADATA_ONLY',
      createdAt: now,
      updatedAt: now,
    };

    this.works.set(workId, work);
    return work;
  }

  /**
   * Añade una edición a una obra existente.
   */
  addEdition(
    workId: string,
    params: {
      format: string;
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
    }
  ): WorkEdition | null {
    const work = this.works.get(workId);
    if (!work) return null;

    // Validar ISBN-13 si se proporciona
    if (params.isbn13 && !validateISBN13(params.isbn13)) {
      throw new Error(`ISBN-13 inválido: ${params.isbn13}`);
    }

    const edition: WorkEdition = {
      editionId: generateCatalogId('EDITION'),
      workId,
      format: params.format,
      isbn10: params.isbn10 ? normalizeISBN(params.isbn10) : undefined,
      isbn13: params.isbn13 ? normalizeISBN(params.isbn13) : undefined,
      asin: params.asin,
      publisher: params.publisher,
      publicationDate: params.publicationDate,
      language: params.language,
      pageCount: params.pageCount,
      price: params.price,
      currency: params.currency,
      externalUrl: params.externalUrl,
      sourceId: params.sourceId,
      retrievalDate: new Date().toISOString(),
      verificationStatus: 'CANDIDATE',
    };

    work.editions.push(edition);
    work.updatedAt = new Date().toISOString();
    this.editions.set(edition.editionId, edition);

    // Actualizar externalIds de la obra
    if (edition.isbn10 && !work.externalIds.isbn10?.includes(edition.isbn10)) {
      work.externalIds.isbn10 = work.externalIds.isbn10 || [];
      work.externalIds.isbn10.push(edition.isbn10);
    }
    if (edition.isbn13 && !work.externalIds.isbn13?.includes(edition.isbn13)) {
      work.externalIds.isbn13 = work.externalIds.isbn13 || [];
      work.externalIds.isbn13.push(edition.isbn13);
    }
    if (edition.asin && !work.externalIds.asin?.includes(edition.asin)) {
      work.externalIds.asin = work.externalIds.asin || [];
      work.externalIds.asin.push(edition.asin);
    }

    return edition;
  }

  /**
   * Crea una relación entre dos obras.
   */
  createRelationship(params: {
    sourceWorkId: string;
    targetWorkId: string;
    relationshipType: WorkRelationshipType;
    evidenceId?: string;
    sourceId?: string;
    confidence: number;
  }): WorkRelationship | null {
    const sourceWork = this.works.get(params.sourceWorkId);
    const targetWork = this.works.get(params.targetWorkId);

    if (!sourceWork || !targetWork) return null;

    const relationship: WorkRelationship = {
      relationshipId: generateCatalogId('REL'),
      sourceWorkId: params.sourceWorkId,
      targetWorkId: params.targetWorkId,
      relationshipType: params.relationshipType,
      evidenceId: params.evidenceId,
      sourceId: params.sourceId,
      confidence: params.confidence,
      verificationStatus: 'CANDIDATE',
      createdAt: new Date().toISOString(),
    };

    this.relationships.set(relationship.relationshipId, relationship);

    // Actualizar relatedWorkIds
    if (!sourceWork.relatedWorkIds.includes(params.targetWorkId)) {
      sourceWork.relatedWorkIds.push(params.targetWorkId);
      sourceWork.updatedAt = new Date().toISOString();
    }

    return relationship;
  }

  /**
   * Registra evidencia de publicación.
   */
  addPublicationEvidence(params: {
    workId: string;
    evidenceType: 'PLATFORM_LISTING' | 'ISBN_REGISTRY' | 'PUBLISHER_CATALOG' | 'USER_PROVIDED_FILE' | 'OFFICIAL_REGISTRY' | 'OTHER';
    sourceId: string;
    sourceUrl?: string;
    metadata: Record<string, any>;
  }): PublicationEvidence | null {
    const work = this.works.get(params.workId);
    if (!work) return null;

    const evidence: PublicationEvidence = {
      evidenceId: generateCatalogId('PUBEV'),
      workId: params.workId,
      evidenceType: params.evidenceType,
      sourceId: params.sourceId,
      sourceUrl: params.sourceUrl,
      retrievalDate: new Date().toISOString(),
      metadata: params.metadata,
      verificationStatus: 'CANDIDATE',
      createdAt: new Date().toISOString(),
    };

    this.publicationEvidence.set(evidence.evidenceId, evidence);
    work.evidenceIds.push(evidence.evidenceId);
    work.updatedAt = new Date().toISOString();

    return evidence;
  }

  /**
   * Busca obra por ID.
   */
  getWork(workId: string): MasterWork | null {
    return this.works.get(workId) || null;
  }

  /**
   * Busca edición por ID.
   */
  getEdition(editionId: string): WorkEdition | null {
    return this.editions.get(editionId) || null;
  }

  /**
   * Busca obras por tipo.
   */
  getWorksByType(workType: WorkType): MasterWork[] {
    return Array.from(this.works.values()).filter(w => w.workType === workType);
  }

  /**
   * Busca obras por creador.
   */
  getWorksByCreator(creatorId: string): MasterWork[] {
    return Array.from(this.works.values()).filter(w => w.creatorIds.includes(creatorId));
  }

  /**
   * Busca obras por estado de verificación.
   */
  getWorksByStatus(status: WorkVerificationStatus): MasterWork[] {
    return Array.from(this.works.values()).filter(w => w.verificationStatus === status);
  }

  /**
   * Busca edición por ISBN.
   */
  findEditionByISBN(isbn: string): WorkEdition | null {
    const normalized = normalizeISBN(isbn);
    return Array.from(this.editions.values()).find(
      e => e.isbn10 === normalized || e.isbn13 === normalized
    ) || null;
  }

  /**
   * Busca edición por ASIN.
   */
  findEditionByASIN(asin: string): WorkEdition | null {
    return Array.from(this.editions.values()).find(e => e.asin === asin) || null;
  }

  /**
   * Obtiene todas las obras.
   */
  getAllWorks(): MasterWork[] {
    return Array.from(this.works.values());
  }

  /**
   * Obtiene todas las ediciones.
   */
  getAllEditions(): WorkEdition[] {
    return Array.from(this.editions.values());
  }

  /**
   * Obtiene todas las relaciones.
   */
  getAllRelationships(): WorkRelationship[] {
    return Array.from(this.relationships.values());
  }

  /**
   * Obtiene relaciones de una obra.
   */
  getWorkRelationships(workId: string): WorkRelationship[] {
    return Array.from(this.relationships.values()).filter(
      r => r.sourceWorkId === workId || r.targetWorkId === workId
    );
  }

  /**
   * Cuenta obras por tipo.
   */
  countByType(): Record<WorkType, number> {
    const counts: Record<WorkType, number> = {
      BOOK: 0,
      NOVEL: 0,
      ESSAY: 0,
      LEGAL_WORK: 0,
      EDUCATIONAL_WORK: 0,
      MUSICAL_COMPOSITION: 0,
      SOUND_RECORDING: 0,
      PODCAST: 0,
      AUDIOBOOK: 0,
      AUDIOVISUAL_WORK: 0,
      OTHER: 0,
    };

    for (const work of this.works.values()) {
      counts[work.workType]++;
    }

    return counts;
  }

  /**
   * Cuenta obras por estado.
   */
  countByStatus(): Record<WorkVerificationStatus, number> {
    const counts: Record<WorkVerificationStatus, number> = {
      VERIFIED: 0,
      CANDIDATE: 0,
      AMBIGUOUS: 0,
      QUARANTINE: 0,
      REVIEW_REQUIRED: 0,
      EXCLUDED: 0,
    };

    for (const work of this.works.values()) {
      counts[work.verificationStatus]++;
    }

    return counts;
  }

  /**
   * Detecta posibles duplicados basándose en ISBN/ASIN/título.
   */
  detectPossibleDuplicates(): Array<{ work1: MasterWork; work2: MasterWork; reason: string }> {
    const duplicates: Array<{ work1: MasterWork; work2: MasterWork; reason: string }> = [];
    const works = Array.from(this.works.values());

    for (let i = 0; i < works.length; i++) {
      for (let j = i + 1; j < works.length; j++) {
        const work1 = works[i];
        const work2 = works[j];

        // Verificar ISBN duplicado
        const commonISBN = work1.externalIds.isbn13?.find(isbn =>
          work2.externalIds.isbn13?.includes(isbn)
        );
        if (commonISBN) {
          duplicates.push({
            work1,
            work2,
            reason: `ISBN-13 duplicado: ${commonISBN}`,
          });
          continue;
        }

        // Verificar ASIN duplicado
        const commonASIN = work1.externalIds.asin?.find(asin =>
          work2.externalIds.asin?.includes(asin)
        );
        if (commonASIN) {
          duplicates.push({
            work1,
            work2,
            reason: `ASIN duplicado: ${commonASIN}`,
          });
          continue;
        }

        // Verificar título similar (muy básico, podría mejorarse)
        if (work1.canonicalTitle.toLowerCase() === work2.canonicalTitle.toLowerCase() &&
            work1.workType === work2.workType) {
          duplicates.push({
            work1,
            work2,
            reason: 'Título idéntico y mismo tipo de obra',
          });
        }
      }
    }

    return duplicates;
  }
}
