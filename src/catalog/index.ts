/**
 * PERITO IP — Fase 6: Barrel Export del módulo Catalog
 * 
 * Exporta todos los tipos, registros y conectores del catálogo maestro.
 */

// Tipos
export * from './types';

// Registros
export { CreatorIdentityRegistry } from './identity-registry';
export { MasterWorkCatalog } from './work-catalog';

// Conectores
export { AmazonCatalogConnector } from './amazon-connector';
export type { AmazonConnectorConfig } from './amazon-connector';

export { AudiusCatalogConnector } from './audius-connector';
export type { AudiusConnectorConfig, AudiusTrack } from './audius-connector';

// Fixtures
export { createCatalogFixtures } from './fixtures';
export type { CatalogFixtures } from './fixtures';
