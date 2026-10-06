/**
 * PERITO IP — Fase 6: Fixtures del Catálogo
 * 
 * Datos ficticios para demostración de la Biblioteca.
 * Todos los datos están claramente marcados como MOCK.
 */

import { MasterWorkCatalog } from './work-catalog';
import { CreatorIdentityRegistry } from './identity-registry';
import { AmazonCatalogConnector } from './amazon-connector';
import { AudiusCatalogConnector } from './audius-connector';

export interface CatalogFixtures {
  identityRegistry: CreatorIdentityRegistry;
  workCatalog: MasterWorkCatalog;
  amazonConnector: AmazonCatalogConnector;
  audiusConnector: AudiusCatalogConnector;
  creatorIds: {
    manuelGago: string;
    marquesMontemoslin: string;
  };
  stats: {
    totalWorks: number;
    totalEditions: number;
    booksCount: number;
    tracksCount: number;
    verifiedCount: number;
    candidateCount: number;
  };
}

/**
 * Crea fixtures del catálogo con datos ficticios.
 * En producción: los conectores descubrirían datos reales.
 */
export async function createCatalogFixtures(): Promise<CatalogFixtures> {
  const identityRegistry = new CreatorIdentityRegistry();
  const workCatalog = new MasterWorkCatalog();

  // Crear identidades
  const manuelGago = identityRegistry.createIdentity({
    legalName: 'Manuel Gago Fernández',
    primaryAlias: 'Prof. Manuel Gago Fernández',
    aliasType: 'AUTHOR_NAME',
  });

  const marquesMontemoslin = identityRegistry.createIdentity({
    primaryAlias: 'Marqués de Montemolín',
    aliasType: 'CREATIVE_ALIAS',
  });

  // Añadir alias a Manuel Gago
  identityRegistry.addAlias(manuelGago.creatorId, {
    displayedName: 'Manuel Gago Fernández',
    aliasType: 'LEGAL_NAME',
    usageContext: 'Legal name',
  });

  identityRegistry.addAlias(manuelGago.creatorId, {
    displayedName: 'Prof Manuel Gago Fernández',
    aliasType: 'PLATFORM_DISPLAY_NAME',
    usageContext: 'Audius profile @profmanuelgago',
  });

  identityRegistry.addAlias(manuelGago.creatorId, {
    displayedName: 'Manuel Gago',
    aliasType: 'CREDIT_NAME',
    usageContext: 'Short form credit',
  });

  // Crear conectores
  const amazonConnector = new AmazonCatalogConnector(workCatalog, identityRegistry, {
    marketplace: 'amazon.es',
    externalCreatorId: 'AUTHOR_MOCK_001',
  });

  const audiusConnector = new AudiusCatalogConnector(workCatalog, identityRegistry, {
    profileHandle: 'profmanuelgago',
  });

  // Ejecutar descubrimiento (mock)
  await amazonConnector.discoverWorks(false);
  await audiusConnector.discoverTracks(false);

  // Calcular estadísticas
  const allWorks = workCatalog.getAllWorks();
  const allEditions = workCatalog.getAllEditions();
  const booksCount = workCatalog.getWorksByType('BOOK').length + 
                     workCatalog.getWorksByType('NOVEL').length +
                     workCatalog.getWorksByType('LEGAL_WORK').length;
  const tracksCount = workCatalog.getWorksByType('MUSICAL_COMPOSITION').length +
                      workCatalog.getWorksByType('SOUND_RECORDING').length;
  const verifiedCount = workCatalog.getWorksByStatus('VERIFIED').length;
  const candidateCount = workCatalog.getWorksByStatus('CANDIDATE').length;

  return {
    identityRegistry,
    workCatalog,
    amazonConnector,
    audiusConnector,
    creatorIds: {
      manuelGago: manuelGago.creatorId,
      marquesMontemoslin: marquesMontemoslin.creatorId,
    },
    stats: {
      totalWorks: allWorks.length,
      totalEditions: allEditions.length,
      booksCount,
      tracksCount,
      verifiedCount,
      candidateCount,
    },
  };
}
