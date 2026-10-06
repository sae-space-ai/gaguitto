/**
 * PERITO IP — Fase 6.3: Servicio de Migración de Datos Reales
 * 
 * Migra datos reales de archivos TypeScript a IndexedDB.
 * Implementa idempotencia: ejecutar dos veces no crea duplicados.
 */

import { persistenceService } from './persistence-service';
import { AUDIUS_REAL_PROFILE, AUDIUS_REAL_TRACKS_PAGE_1 } from './audius-real-data';
import { AMAZON_REAL_PROFILE, AMAZON_REAL_BOOKS } from './amazon-real-data';
import { ExploitationObservation, ImportRun } from './exploitation-types';

// ============================================================
// GENERADOR DE IDs
// ============================================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// MIGRADOR DE DATOS AUDIUS
// ============================================================

export async function migrateAudiusData(): Promise<ImportRun> {
  const importRunId = generateId('IMPORT');
  const now = new Date().toISOString();

  const importRun: ImportRun = {
    importRunId,
    source: 'AUDIUS',
    connectorVersion: '1.0.0',
    parserVersion: '1.0.0',
    startedAt: now,
    status: 'RUNNING',
    recordsSeen: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsUnchanged: 0,
    recordsQuarantined: 0,
    duplicatesPrevented: 0,
    errors: 0,
  };

  try {
    // Guardar fuente
    const sourceId = 'SOURCE_AUDIUS_PROFMANUELGAGO';
    await persistenceService.saveSource({
      sourceId,
      sourceType: 'AUDIUS',
      name: 'Audius - @profmanuelgago',
      url: AUDIUS_REAL_PROFILE.profileUrl,
      retrievedAt: AUDIUS_REAL_PROFILE.retrievedAt,
      dataOrigin: 'PUBLIC_SOURCE',
    });

    // Migrar cada pista
    for (const track of AUDIUS_REAL_TRACKS_PAGE_1) {
      importRun.recordsSeen++;

      // Crear work ID basado en permalink (idempotente)
      const workId = `WORK_AUDIUS_${track.permalink.split('/').pop()}`;

      // Verificar si ya existe (idempotencia)
      const existingWork = await persistenceService.getWork(workId);
      
      if (existingWork) {
        importRun.recordsUnchanged++;
        continue;
      }

      // Crear obra
      const work = {
        workId,
        canonicalTitle: track.title,
        workType: 'SOUND_RECORDING',
        creatorIdentityIds: ['CREATOR_MANUEL_GAGO'],
        externalIds: {
          audiusTrackId: track.permalink,
        },
        sourceIds: [sourceId],
        evidenceIds: [],
        rightsIds: [],
        contractIds: [],
        relatedWorks: [],
        verificationStatus: 'CANDIDATE',
        valuationStatus: 'NOT_VALUED',
        contentAvailability: 'PLATFORM_STREAM_REFERENCE',
        dataOrigin: 'PUBLIC_SOURCE',
        createdAt: now,
        updatedAt: now,
      };

      await persistenceService.saveWork(work);
      importRun.recordsCreated++;

      // Crear observaciones de métricas
      const metrics = [
        { type: 'PLAYS', value: track.plays, unit: 'plays' },
        { type: 'PUBLIC_COUNTER_VALUE', value: track.reposts, unit: 'reposts' },
        { type: 'PUBLIC_COUNTER_VALUE', value: track.favorites, unit: 'favorites' },
      ];

      for (const metric of metrics) {
        const observationId = generateId('OBS');
        
        // Verificar idempotencia
        const exists = await persistenceService.observationExists(
          sourceId,
          workId,
          metric.type,
          AUDIUS_REAL_PROFILE.retrievedAt
        );

        if (exists) {
          importRun.duplicatesPrevented++;
          continue;
        }

        const observation: ExploitationObservation = {
          observationId,
          workId,
          eventType: 'PLAY',
          metricType: metric.type as any,
          value: metric.value,
          unit: metric.unit,
          territoryGranularity: 'UNKNOWN',
          timeGranularity: 'CUMULATIVE_AS_OF',
          cumulativeAsOf: AUDIUS_REAL_PROFILE.retrievedAt,
          observedAt: AUDIUS_REAL_PROFILE.retrievedAt,
          channel: 'AUDIUS',
          platformOrChannel: 'Audius',
          sourceId,
          sourceType: 'AUDIUS',
          sourceReference: track.permalink,
          importRunId,
          dataOrigin: 'PUBLIC_SOURCE',
          evidenceClass: 'PUBLIC_COUNTER',
          verificationStatus: 'UNVERIFIED',
          methodology: 'Public web page observation',
          limitations: 'Cumulative counter, territory unknown',
          rawReference: track.permalink,
          qualityFlags: ['UNKNOWN_TERRITORY'],
          createdAt: now,
          updatedAt: now,
        };

        await persistenceService.saveObservation(observation);
      }
    }

    importRun.status = 'COMPLETED';
    importRun.completedAt = new Date().toISOString();

  } catch (error) {
    importRun.status = 'FAILED';
    importRun.completedAt = new Date().toISOString();
    importRun.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    importRun.errors++;
  }

  await persistenceService.saveImportRun(importRun);
  return importRun;
}

// ============================================================
// MIGRADOR DE DATOS AMAZON
// ============================================================

export async function migrateAmazonData(): Promise<ImportRun> {
  const importRunId = generateId('IMPORT');
  const now = new Date().toISOString();

  const importRun: ImportRun = {
    importRunId,
    source: 'AMAZON',
    connectorVersion: '1.0.0',
    parserVersion: '1.0.0',
    startedAt: now,
    status: 'RUNNING',
    recordsSeen: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsUnchanged: 0,
    recordsQuarantined: 0,
    duplicatesPrevented: 0,
    errors: 0,
  };

  try {
    // Guardar fuente
    const sourceId = 'SOURCE_AMAZON_B0FNJ5QZL7';
    await persistenceService.saveSource({
      sourceId,
      sourceType: 'AMAZON',
      name: 'Amazon - Prof Manuel Gago Fernández',
      url: AMAZON_REAL_PROFILE.authorPageUrl,
      retrievedAt: AMAZON_REAL_PROFILE.retrievedAt,
      dataOrigin: 'PUBLIC_SOURCE',
    });

    // Migrar cada libro
    for (const book of AMAZON_REAL_BOOKS) {
      importRun.recordsSeen++;

      // Crear work ID basado en ASIN (idempotente)
      const workId = `WORK_AMAZON_${book.asin}`;

      // Verificar si ya existe (idempotencia)
      const existingWork = await persistenceService.getWork(workId);
      
      if (existingWork) {
        importRun.recordsUnchanged++;
        continue;
      }

      // Crear obra
      const work = {
        workId,
        canonicalTitle: book.title,
        workType: 'BOOK',
        creatorIdentityIds: ['CREATOR_MANUEL_GAGO'],
        externalIds: {
          asin: book.asin,
        },
        sourceIds: [sourceId],
        evidenceIds: [],
        rightsIds: [],
        contractIds: [],
        relatedWorks: [],
        verificationStatus: 'CANDIDATE',
        valuationStatus: 'NOT_VALUED',
        contentAvailability: 'METADATA_ONLY',
        dataOrigin: 'PUBLIC_SOURCE',
        createdAt: now,
        updatedAt: now,
      };

      await persistenceService.saveWork(work);
      importRun.recordsCreated++;

      // Crear observaciones
      const observations: any[] = [
        {
          eventType: 'AVAILABILITY' as const,
          metricType: 'AVAILABILITY_STATUS' as const,
          value: 1,
          unit: 'available',
          channel: 'AMAZON_KINDLE' as const,
          evidenceClass: 'PUBLIC_COUNTER' as const,
        },
        {
          eventType: 'AVAILABILITY' as const,
          metricType: 'RANKING' as const,
          value: book.price,
          unit: 'EUR',
          channel: 'AMAZON_KINDLE' as const,
          evidenceClass: 'PUBLIC_COUNTER' as const,
        },
      ];

      if (book.rating !== null) {
        observations.push({
          eventType: 'AVAILABILITY' as const,
          metricType: 'RATING' as const,
          value: book.rating,
          unit: 'stars',
          channel: 'AMAZON_KINDLE' as const,
          evidenceClass: 'PUBLIC_COUNTER' as const,
        });
      }

      if (book.reviewsCount !== null) {
        observations.push({
          eventType: 'AVAILABILITY' as const,
          metricType: 'REVIEWS_COUNT' as const,
          value: book.reviewsCount,
          unit: 'reviews',
          channel: 'AMAZON_KINDLE' as const,
          evidenceClass: 'PUBLIC_COUNTER' as const,
        });
      }

      for (const obs of observations) {
        const observationId = generateId('OBS');
        
        // Verificar idempotencia
        const exists = await persistenceService.observationExists(
          sourceId,
          workId,
          obs.metricType,
          AMAZON_REAL_PROFILE.retrievedAt
        );

        if (exists) {
          importRun.duplicatesPrevented++;
          continue;
        }

        const observation: ExploitationObservation = {
          observationId,
          workId,
          eventType: obs.eventType,
          metricType: obs.metricType,
          value: obs.value,
          unit: obs.unit,
          currency: obs.unit === 'EUR' ? 'EUR' : undefined,
          territoryGranularity: 'MARKETPLACE',
          territory: 'amazon.es',
          territoryRaw: 'amazon.es',
          timeGranularity: 'CUMULATIVE_AS_OF',
          cumulativeAsOf: AMAZON_REAL_PROFILE.retrievedAt,
          observedAt: AMAZON_REAL_PROFILE.retrievedAt,
          channel: obs.channel,
          platformOrChannel: 'Amazon Kindle',
          sourceId,
          sourceType: 'AMAZON',
          sourceReference: book.productUrl,
          importRunId,
          dataOrigin: 'PUBLIC_SOURCE',
          evidenceClass: obs.evidenceClass,
          verificationStatus: 'UNVERIFIED',
          methodology: 'Public author page observation',
          limitations: 'Price is listed price, not sales revenue. Rating/reviews are observations.',
          rawReference: book.productUrl,
          qualityFlags: [],
          createdAt: now,
          updatedAt: now,
        };

        await persistenceService.saveObservation(observation);
      }
    }

    importRun.status = 'COMPLETED';
    importRun.completedAt = new Date().toISOString();

  } catch (error) {
    importRun.status = 'FAILED';
    importRun.completedAt = new Date().toISOString();
    importRun.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    importRun.errors++;
  }

  await persistenceService.saveImportRun(importRun);
  return importRun;
}

// ============================================================
// MIGRACIÓN COMPLETA
// ============================================================

export async function migrateAllRealData(): Promise<{
  audiusImport: ImportRun;
  amazonImport: ImportRun;
}> {
  await persistenceService.initialize();

  const audiusImport = await migrateAudiusData();
  const amazonImport = await migrateAmazonData();

  return { audiusImport, amazonImport };
}
