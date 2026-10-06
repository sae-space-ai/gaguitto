/**
 * PERITO IP — Fase 6: Audius Catalog Connector (MOCK)
 * 
 * Conector simulado para demostrar la arquitectura de integración con Audius.
 * NO realiza llamadas reales a la API de Audius.
 * 
 * En producción, este conector debería:
 * - Usar Audius REST API (https://api.audius.co)
 * - Implementar paginación para catálogos grandes
 * - Soportar incremental sync
 * - Respetar rate limits
 * 
 * Este mock genera datos ficticios claramente marcados para testing.
 */

import {
  SourceConnector,
  ImportRun,
  MasterWork,
  generateCatalogId,
} from './types';
import { MasterWorkCatalog } from './work-catalog';
import { CreatorIdentityRegistry } from './identity-registry';

export interface AudiusTrack {
  trackId: string;
  title: string;
  artist: string;
  duration: number; // en segundos
  genre?: string;
  tags?: string[];
  releaseDate?: string;
  permalink: string;
  artworkUrl?: string;
  playCount?: number;
  favoriteCount?: number;
  repostCount?: number;
}

export interface AudiusConnectorConfig {
  profileHandle?: string; // ej: 'profmanuelgago'
  apiBaseUrl?: string;
}

export class AudiusCatalogConnector {
  private connector: SourceConnector;
  private catalog: MasterWorkCatalog;
  private identityRegistry: CreatorIdentityRegistry;
  private config: AudiusConnectorConfig;
  private lastSyncTimestamp?: string;

  constructor(
    catalog: MasterWorkCatalog,
    identityRegistry: CreatorIdentityRegistry,
    config: AudiusConnectorConfig = {}
  ) {
    this.catalog = catalog;
    this.identityRegistry = identityRegistry;
    this.config = config;

    this.connector = {
      connectorId: generateCatalogId('CONN'),
      sourceType: 'AUDIUS',
      sourceName: 'Audius Catalog',
      status: 'ACTIVE',
      externalCreatorId: config.profileHandle,
      itemsDiscovered: 0,
      itemsVerified: 0,
      itemsPending: 0,
      itemsQuarantined: 0,
      errors: [],
      config,
    };
  }

  /**
   * Simula descubrimiento de pistas en Audius.
   * En producción: llamaría a Audius API con paginación.
   */
  async discoverTracks(dryRun: boolean = false): Promise<ImportRun> {
    const importRun: ImportRun = {
      importRunId: generateCatalogId('IMPORT'),
      connectorId: this.connector.connectorId,
      sourceType: 'AUDIUS',
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
      const mockTracks = this.generateMockTracks();
      importRun.recordsSeen = mockTracks.length;

      for (const track of mockTracks) {
        // Verificar si ya existe por trackId
        const existingWork = this.findWorkByAudiusId(track.trackId);

        if (existingWork) {
          importRun.duplicates++;
          continue;
        }

        if (dryRun) {
          importRun.recordsCreated++;
          continue;
        }

        // Buscar o crear identidad del artista
        let creatorId: string | null = null;
        const existingIdentity = this.identityRegistry.findByIdentityName(track.artist);
        
        if (existingIdentity) {
          creatorId = existingIdentity.creatorId;
        } else {
          const newIdentity = this.identityRegistry.createIdentity({
            primaryAlias: track.artist,
            aliasType: 'PLATFORM_DISPLAY_NAME',
          });
          creatorId = newIdentity.creatorId;
        }

        // Crear obra (composición musical)
        const compositionWork = this.catalog.createWork({
          canonicalTitle: track.title,
          workType: 'MUSICAL_COMPOSITION',
          creatorIds: [creatorId],
          contentAvailability: 'PLATFORM_STREAM_REFERENCE',
        });

        // Añadir metadata de la pista como "edición"
        this.catalog.addEdition(compositionWork.workId, {
          format: 'Digital Audio',
          publisher: 'Audius',
          publicationDate: track.releaseDate,
          language: 'es',
          externalUrl: track.permalink,
          sourceId: this.connector.connectorId,
        });

        // Crear obra de grabación (sound recording) - distinta de la composición
        const recordingWork = this.catalog.createWork({
          canonicalTitle: `${track.title} (Recording)`,
          workType: 'SOUND_RECORDING',
          creatorIds: [creatorId],
          contentAvailability: 'PLATFORM_STREAM_REFERENCE',
        });

        // Relacionar composición y grabación
        this.catalog.createRelationship({
          sourceWorkId: recordingWork.workId,
          targetWorkId: compositionWork.workId,
          relationshipType: 'IS_RECORDING_OF',
          sourceId: this.connector.connectorId,
          confidence: 90,
        });

        // Registrar evidencia de publicación
        this.catalog.addPublicationEvidence({
          workId: compositionWork.workId,
          evidenceType: 'PLATFORM_LISTING',
          sourceId: this.connector.connectorId,
          sourceUrl: track.permalink,
          metadata: {
            trackId: track.trackId,
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            genre: track.genre,
            tags: track.tags,
            playCount: track.playCount,
            favoriteCount: track.favoriteCount,
            repostCount: track.repostCount,
            platform: 'audius',
            profileHandle: this.config.profileHandle,
          },
        });

        importRun.recordsCreated++;
      }

      this.connector.itemsDiscovered = importRun.recordsSeen;
      this.connector.itemsVerified = importRun.recordsCreated;
      this.connector.lastSync = new Date().toISOString();
      this.connector.status = 'ACTIVE';
      this.lastSyncTimestamp = this.connector.lastSync;

    } catch (error) {
      this.connector.status = 'ERROR';
      this.connector.errors.push(error instanceof Error ? error.message : 'Unknown error');
      importRun.errors++;
    }

    importRun.completedAt = new Date().toISOString();
    return importRun;
  }

  /**
   * Busca obra por ID de Audius en metadata.
   */
  private findWorkByAudiusId(trackId: string): MasterWork | null {
    const allWorks = this.catalog.getAllWorks();
    
    for (const work of allWorks) {
      const evidence = this.catalog.getWorkRelationships(work.workId);
      // En producción: buscar en metadata de evidencia el trackId
      // Por ahora: verificar si el título coincide (muy básico)
    }
    
    return null;
  }

  /**
   * Genera datos ficticios de pistas para demostración.
   * IMPORTANTE: Estos datos son MOCK, no representan pistas reales.
   */
  private generateMockTracks(): AudiusTrack[] {
    return [
      {
        trackId: 'MOCK_TRACK_001',
        title: 'MOCK: Reflexiones Digitales',
        artist: 'Prof. Manuel Gago',
        duration: 245,
        genre: 'Podcast',
        tags: ['derecho', 'tecnología', 'educación'],
        releaseDate: '2024-01-10',
        permalink: 'https://audius.co/profmanuelgago/reflexiones-digitales',
        playCount: 1250,
        favoriteCount: 45,
        repostCount: 12,
      },
      {
        trackId: 'MOCK_TRACK_002',
        title: 'MOCK: Propiedad Intelectual y IA',
        artist: 'Prof Manuel Gago Fernández',
        duration: 1820,
        genre: 'Educational',
        tags: ['IA', 'copyright', 'conferencia'],
        releaseDate: '2024-02-15',
        permalink: 'https://audius.co/profmanuelgago/pi-y-ia',
        playCount: 890,
        favoriteCount: 32,
        repostCount: 8,
      },
      {
        trackId: 'MOCK_TRACK_003',
        title: 'MOCK: El Futuro del Derecho de Autor',
        artist: 'Marqués de Montemolín',
        duration: 3600,
        genre: 'Podcast',
        tags: ['derecho de autor', 'futuro', 'legislación'],
        releaseDate: '2024-03-20',
        permalink: 'https://audius.co/profmanuelgago/futuro-derecho-autor',
        playCount: 2100,
        favoriteCount: 78,
        repostCount: 25,
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
   * Obtiene el timestamp de la última sincronización.
   */
  getLastSyncTimestamp(): string | undefined {
    return this.lastSyncTimestamp;
  }
}
