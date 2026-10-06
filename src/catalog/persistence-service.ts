/**
 * PERITO IP — Fase 6.3: Servicio de Persistencia con IndexedDB
 * 
 * Implementa persistencia REAL usando IndexedDB (API nativa del navegador).
 * Los datos sobreviven al reinicio de la aplicación.
 * 
 * NO es mock. NO es fixture. Es persistencia real en el navegador.
 */

import { ExploitationObservation, ImportRun } from './exploitation-types';

// ============================================================
// CONFIGURACIÓN DE INDEXEDDB
// ============================================================

const DB_NAME = 'perito_ip_catalog';
const DB_VERSION = 1;

const STORES = {
  WORKS: 'works',
  OBSERVATIONS: 'observations',
  IMPORT_RUNS: 'import_runs',
  SOURCES: 'sources',
} as const;

// ============================================================
// SERVICIO DE PERSISTENCIA
// ============================================================

export class PersistenceService {
  private db: IDBDatabase | null = null;

  /**
   * Inicializa la base de datos IndexedDB.
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear stores si no existen
        if (!db.objectStoreNames.contains(STORES.WORKS)) {
          const workStore = db.createObjectStore(STORES.WORKS, { keyPath: 'workId' });
          workStore.createIndex('by_external_asin', 'externalIds.asin', { unique: false });
          workStore.createIndex('by_external_audius', 'externalIds.audiusTrackId', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.OBSERVATIONS)) {
          const obsStore = db.createObjectStore(STORES.OBSERVATIONS, { keyPath: 'observationId' });
          obsStore.createIndex('by_work', 'workId', { unique: false });
          obsStore.createIndex('by_source', 'sourceId', { unique: false });
          obsStore.createIndex('by_import', 'importRunId', { unique: false });
          
          // Índice compuesto para idempotencia
          obsStore.createIndex('by_source_and_work', ['sourceId', 'workId', 'metricType', 'observedAt'], { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.IMPORT_RUNS)) {
          const importStore = db.createObjectStore(STORES.IMPORT_RUNS, { keyPath: 'importRunId' });
          importStore.createIndex('by_source', 'source', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SOURCES)) {
          db.createObjectStore(STORES.SOURCES, { keyPath: 'sourceId' });
        }
      };
    });
  }

  /**
   * Cierra la conexión a la base de datos.
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // ============================================================
  // OPERACIONES DE OBRAS
  // ============================================================

  async saveWork(work: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.WORKS], 'readwrite');
      const store = transaction.objectStore(STORES.WORKS);
      const request = store.put(work);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save work'));
    });
  }

  async getWork(workId: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.WORKS], 'readonly');
      const store = transaction.objectStore(STORES.WORKS);
      const request = store.get(workId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get work'));
    });
  }

  async getAllWorks(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.WORKS], 'readonly');
      const store = transaction.objectStore(STORES.WORKS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all works'));
    });
  }

  async getWorkByASIN(asin: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.WORKS], 'readonly');
      const store = transaction.objectStore(STORES.WORKS);
      const index = store.index('by_external_asin');
      const request = index.get(asin);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get work by ASIN'));
    });
  }

  // ============================================================
  // OPERACIONES DE OBSERVACIONES
  // ============================================================

  async saveObservation(observation: ExploitationObservation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OBSERVATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.OBSERVATIONS);
      const request = store.put(observation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save observation'));
    });
  }

  async getObservation(observationId: string): Promise<ExploitationObservation | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OBSERVATIONS], 'readonly');
      const store = transaction.objectStore(STORES.OBSERVATIONS);
      const request = store.get(observationId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get observation'));
    });
  }

  async getObservationsByWork(workId: string): Promise<ExploitationObservation[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OBSERVATIONS], 'readonly');
      const store = transaction.objectStore(STORES.OBSERVATIONS);
      const index = store.index('by_work');
      const request = index.getAll(workId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get observations by work'));
    });
  }

  async getAllObservations(): Promise<ExploitationObservation[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OBSERVATIONS], 'readonly');
      const store = transaction.objectStore(STORES.OBSERVATIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all observations'));
    });
  }

  /**
   * Verifica si una observación ya existe (para idempotencia).
   */
  async observationExists(
    sourceId: string,
    workId: string,
    metricType: string,
    observedAt: string
  ): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.OBSERVATIONS], 'readonly');
      const store = transaction.objectStore(STORES.OBSERVATIONS);
      const index = store.index('by_source_and_work');
      const request = index.getAll([sourceId, workId, metricType, observedAt]);

      request.onsuccess = () => resolve(request.result.length > 0);
      request.onerror = () => reject(new Error('Failed to check observation existence'));
    });
  }

  // ============================================================
  // OPERACIONES DE IMPORT RUNS
  // ============================================================

  async saveImportRun(importRun: ImportRun): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.IMPORT_RUNS], 'readwrite');
      const store = transaction.objectStore(STORES.IMPORT_RUNS);
      const request = store.put(importRun);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save import run'));
    });
  }

  async getImportRun(importRunId: string): Promise<ImportRun | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.IMPORT_RUNS], 'readonly');
      const store = transaction.objectStore(STORES.IMPORT_RUNS);
      const request = store.get(importRunId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get import run'));
    });
  }

  async getAllImportRuns(): Promise<ImportRun[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.IMPORT_RUNS], 'readonly');
      const store = transaction.objectStore(STORES.IMPORT_RUNS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all import runs'));
    });
  }

  // ============================================================
  // OPERACIONES DE FUENTES
  // ============================================================

  async saveSource(source: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SOURCES], 'readwrite');
      const store = transaction.objectStore(STORES.SOURCES);
      const request = store.put(source);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save source'));
    });
  }

  async getSource(sourceId: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SOURCES], 'readonly');
      const store = transaction.objectStore(STORES.SOURCES);
      const request = store.get(sourceId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to get source'));
    });
  }

  async getAllSources(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SOURCES], 'readonly');
      const store = transaction.objectStore(STORES.SOURCES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all sources'));
    });
  }

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  async getStats(): Promise<{
    totalWorks: number;
    totalObservations: number;
    totalImportRuns: number;
    totalSources: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const works = await this.getAllWorks();
    const observations = await this.getAllObservations();
    const importRuns = await this.getAllImportRuns();
    const sources = await this.getAllSources();

    return {
      totalWorks: works.length,
      totalObservations: observations.length,
      totalImportRuns: importRuns.length,
      totalSources: sources.length,
    };
  }

  /**
   * Limpia toda la base de datos (solo para tests).
   */
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = [STORES.WORKS, STORES.OBSERVATIONS, STORES.IMPORT_RUNS, STORES.SOURCES];

    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
      });
    }
  }
}

// Instancia singleton
export const persistenceService = new PersistenceService();
