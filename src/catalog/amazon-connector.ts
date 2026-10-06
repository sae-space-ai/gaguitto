/**
 * PERITO IP — Fase 6: Amazon Catalog Connector (MOCK)
 * 
 * Conector simulado para demostrar la arquitectura de integración con Amazon.
 * NO realiza llamadas reales a Amazon (ToS, anti-bot, etc.).
 * 
 * En producción, este conector debería:
 * - Usar Product Advertising API si está disponible
 * - Respetar rate limits y ToS
 * - No hacer scraping agresivo
 * - Solo obtener metadatos públicos
 * 
 * Este mock genera datos ficticios claramente marcados para testing.
 */

import {
  SourceConnector,
  ImportRun,
  MasterWork,
  WorkEdition,
  generateCatalogId,
} from './types';
import { MasterWorkCatalog } from './work-catalog';
import { CreatorIdentityRegistry } from './identity-registry';

export interface AmazonConnectorConfig {
  authorPageUrl?: string;
  externalCreatorId?: string;
  marketplace?: string;
}

export class AmazonCatalogConnector {
  private connector: SourceConnector;
  private catalog: MasterWorkCatalog;
  private identityRegistry: CreatorIdentityRegistry;
  private config: AmazonConnectorConfig;

  constructor(
    catalog: MasterWorkCatalog,
    identityRegistry: CreatorIdentityRegistry,
    config: AmazonConnectorConfig = {}
  ) {
    this.catalog = catalog;
    this.identityRegistry = identityRegistry;
    this.config = config;

    this.connector = {
      connectorId: generateCatalogId('CONN'),
      sourceType: 'AMAZON',
      sourceName: 'Amazon Catalog',
      status: 'ACTIVE',
      externalCreatorId: config.externalCreatorId,
      itemsDiscovered: 0,
      itemsVerified: 0,
      itemsPending: 0,
      itemsQuarantined: 0,
      errors: [],
      config,
    };
  }

  /**
   * Simula descubrimiento de obras en Amazon.
   * En producción: llamaría a Product Advertising API o similar.
   */
  async discoverWorks(dryRun: boolean = false): Promise<ImportRun> {
    const importRun: ImportRun = {
      importRunId: generateCatalogId('IMPORT'),
      connectorId: this.connector.connectorId,
      sourceType: 'AMAZON',
      startedAt: new Date().toISOString(),
      recordsSeen: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      duplicates: 0,
      quarantined: 0,
      errors: 0,
      softwareVersion: '1.0.0',
      dryRun,
    };

    this.connector.status = 'SYNCING';

    try {
      // MOCK: Generar datos ficticios para demostración
      const mockBooks = this.generateMockBooks();
      importRun.recordsSeen = mockBooks.length;

      for (const book of mockBooks) {
        // Verificar si ya existe por ISBN
        const existingEdition = book.isbn13
          ? this.catalog.findEditionByISBN(book.isbn13)
          : null;

        if (existingEdition) {
          importRun.duplicates++;
          continue;
        }

        if (dryRun) {
          // En dry run solo contar, no crear
          importRun.recordsCreated++;
          continue;
        }

        // Buscar o crear identidad del autor
        let creatorId: string | null = null;
        const existingIdentity = this.identityRegistry.findByIdentityName(book.author);
        
        if (existingIdentity) {
          creatorId = existingIdentity.creatorId;
        } else {
          const newIdentity = this.identityRegistry.createIdentity({
            primaryAlias: book.author,
            aliasType: 'AUTHOR_NAME',
          });
          creatorId = newIdentity.creatorId;
        }

        // Crear obra
        const work = this.catalog.createWork({
          canonicalTitle: book.title,
          workType: book.workType,
          creatorIds: [creatorId],
          contentAvailability: 'METADATA_ONLY',
        });

        // Añadir edición
        this.catalog.addEdition(work.workId, {
          format: book.format,
          isbn10: book.isbn10,
          isbn13: book.isbn13,
          asin: book.asin,
          publisher: book.publisher,
          publicationDate: book.publicationDate,
          language: book.language,
          pageCount: book.pageCount,
          price: book.price,
          currency: book.currency,
          externalUrl: book.url,
          sourceId: this.connector.connectorId,
        });

        // Registrar evidencia de publicación
        this.catalog.addPublicationEvidence({
          workId: work.workId,
          evidenceType: 'PLATFORM_LISTING',
          sourceId: this.connector.connectorId,
          sourceUrl: book.url,
          metadata: {
            title: book.title,
            author: book.author,
            asin: book.asin,
            marketplace: this.config.marketplace || 'amazon.es',
          },
        });

        importRun.recordsCreated++;
      }

      this.connector.itemsDiscovered = importRun.recordsSeen;
      this.connector.itemsVerified = importRun.recordsCreated;
      this.connector.lastSync = new Date().toISOString();
      this.connector.status = 'ACTIVE';

    } catch (error) {
      this.connector.status = 'ERROR';
      this.connector.errors.push(error instanceof Error ? error.message : 'Unknown error');
      importRun.errors++;
    }

    importRun.completedAt = new Date().toISOString();
    return importRun;
  }

  /**
   * Genera datos ficticios de libros para demostración.
   * IMPORTANTE: Estos datos son MOCK, no representan obras reales.
   */
  private generateMockBooks(): Array<{
    title: string;
    author: string;
    workType: 'BOOK' | 'NOVEL' | 'ESSAY' | 'LEGAL_WORK' | 'EDUCATIONAL_WORK';
    format: string;
    isbn10?: string;
    isbn13?: string;
    asin: string;
    publisher?: string;
    publicationDate?: string;
    language: string;
    pageCount?: number;
    price?: number;
    currency: string;
    url: string;
  }> {
    // Datos ficticios claramente marcados como MOCK
    return [
      {
        title: 'MOCK: Introducción al Derecho Digital',
        author: 'Prof. Manuel Gago Fernández',
        workType: 'LEGAL_WORK',
        format: 'Tapa blanda',
        isbn13: '9788400000011',
        asin: 'B00MOCK001',
        publisher: 'Editorial Mock',
        publicationDate: '2023-01-15',
        language: 'es',
        pageCount: 320,
        price: 24.99,
        currency: 'EUR',
        url: 'https://www.amazon.es/dp/B00MOCK001',
      },
      {
        title: 'MOCK: Propiedad Intelectual en la Era Digital',
        author: 'Manuel Gago Fernández',
        workType: 'BOOK',
        format: 'Kindle',
        asin: 'B00MOCK002',
        publisher: 'Editorial Mock',
        publicationDate: '2023-06-20',
        language: 'es',
        pageCount: 280,
        price: 9.99,
        currency: 'EUR',
        url: 'https://www.amazon.es/dp/B00MOCK002',
      },
      {
        title: 'MOCK: Guía Práctica de Derecho de Autor',
        author: 'Marqués de Montemolín',
        workType: 'LEGAL_WORK',
        format: 'Tapa dura',
        isbn13: '9788400000035',
        asin: 'B00MOCK003',
        publisher: 'Editorial Mock',
        publicationDate: '2024-03-10',
        language: 'es',
        pageCount: 450,
        price: 35.00,
        currency: 'EUR',
        url: 'https://www.amazon.es/dp/B00MOCK003',
      },
    ];
  }

  /**
   * Obtiene el estado del conector.
   */
  getConnectorStatus(): SourceConnector {
    return this.connector;
  }

  /**
   * Obtiene el historial de importaciones.
   */
  getImportHistory(): ImportRun[] {
    // En producción: persistir y recuperar de base de datos
    return [];
  }
}
