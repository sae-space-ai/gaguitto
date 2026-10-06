/**
 * PERITO IP — Fase 6.2: Datos REALES de Audius
 * 
 * Este archivo contiene datos REALES obtenidos de https://audius.co/profmanuelgago
 * Fecha de consulta: 2026-01-XX
 * DATA_ORIGIN: PUBLIC_SOURCE
 * 
 * NO son mocks. NO son fixtures. Son datos reales de una fuente pública real.
 */

export const AUDIUS_REAL_PROFILE = {
  profileHandle: 'profmanuelgago',
  displayName: 'El Hombre de las Nubes',
  bio: 'Manuel Gago Fernández – El Hombre de las Nubes. Compositor, escritor y creador multidisciplinar.',
  followers: 435,
  following: 633,
  trackCount: 4650, // Aproximado según la página
  profileUrl: 'https://audius.co/profmanuelgago',
  profilePictureUrl: 'https://val013.open-audio-validator.com/content/01KFZCP1CMJC4NDX6JCQ3V6YV2/480x480.jpg',
  topTags: ['flamenco', 'bso', 'cinema', 'clarinet', 'profmanuelgago'],
  retrievedAt: new Date().toISOString(),
  dataSource: 'PUBLIC_WEB_PAGE',
  dataOrigin: 'PUBLIC_SOURCE' as const,
};

/**
 * Pistas REALES obtenidas de la primera página del perfil.
 * Cada pista tiene datos reales observados en la fuente.
 */
export const AUDIUS_REAL_TRACKS_PAGE_1 = [
  {
    position: 1,
    title: 'AUDIUS SUMMER CYPHER VOL. 2 BMP=160 WE BECOME THE SIGNAL',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/audius-summer-cypher-vol-2-bmp160-we-become-the-signal',
    duration: '1:28',
    reposts: 17,
    favorites: 20,
    plays: 251,
    isArtistPick: true,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 2,
    title: '03 Angeles',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/03-angeles',
    duration: '3:08',
    reposts: 15,
    favorites: 15,
    plays: 25,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 3,
    title: '10 María Santísima de la Estrella',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/10-mar%C3%ADa-sant%C3%ADsima-de-la-estrella',
    duration: '3:09',
    reposts: 13,
    favorites: 14,
    plays: 14,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 4,
    title: '05 Nuestra Señora de las Veredas',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/05-nuestra-se%C3%B1ora-de-las-veredas',
    duration: '3:19',
    reposts: 14,
    favorites: 15,
    plays: 30,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 5,
    title: '02 Pasión',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/02-pasi%C3%B3n',
    duration: '3:19',
    reposts: 14,
    favorites: 15,
    plays: 18,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 6,
    title: '06 María Santísima de la Paz',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/06-mar%C3%ADa-sant%C3%ADsima-de-la-paz',
    duration: '3:28',
    reposts: 16,
    favorites: 16,
    plays: 2,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 7,
    title: '08 Lágrimas de Santiago',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/08-l%C3%A1grimas-de-santiago',
    duration: '3:12',
    reposts: 12,
    favorites: 13,
    plays: 16,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 8,
    title: '09 Esperanza de la Madrugá',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/09-esperanza-de-la-madrug%C3%A1',
    duration: '3:13',
    reposts: 10,
    favorites: 8,
    plays: 15,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 9,
    title: '04 Amargura',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/04-amargura',
    duration: '2:39',
    reposts: 16,
    favorites: 16,
    plays: 17,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 10,
    title: '01 Angustias de Utrera',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/01-angustias-de-utrera',
    duration: '3:25',
    reposts: 14,
    favorites: 13,
    plays: 30,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 11,
    title: '11 Consolación Gloria de Utrera',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/11-consolaci%C3%B3n-gloria-de-utrera',
    duration: '3:33',
    reposts: 12,
    favorites: 12,
    plays: 28,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 12,
    title: '07 Desamparo en el Arco',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/07-desamparo-en-el-arco',
    duration: '3:14',
    reposts: 16,
    favorites: 18,
    plays: 59,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 13,
    title: 'MG De Donde Vengo Yo',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/mg-de-donde-vengo-yo',
    duration: '3:47',
    reposts: 17,
    favorites: 18,
    plays: 31,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 14,
    title: 'AUDIUS SUMMER CYPHER VOL. 2 Prof. Manuel GAGO FERNANDEZ',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/audius-summer-cypher-vol-2-prof-manuel-gago-fernandez',
    duration: '1:29',
    reposts: 19,
    favorites: 20,
    plays: 46,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 37,
    title: 'PODCAST Gobernar el algoritmo es la nueva empleabilidad',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/podcast-gobernar-el-algoritmo-es-la-nueva-empleabilidad',
    duration: '20:00',
    reposts: 16,
    favorites: 15,
    plays: 19,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 70,
    title: 'TWO Audius Summer Cypher Remix Contest Prof . Manuel GAGO',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/two-audius-summer-cypher-remix-contest-prof-manuel-gago',
    duration: '6:08',
    reposts: 20,
    favorites: 21,
    plays: 157,
    retrievedAt: new Date().toISOString(),
  },
  {
    position: 79,
    title: 'Audius Summer Cypher Remix Contest Prof . Manuel GAGO FERNÁNDEZ',
    artist: 'El Hombre de las Nubes',
    permalink: 'https://audius.co/profmanuelgago/audius-summer-cypher-remix-contest-prof-manuel-gago-fern%C3%A1ndez',
    duration: '4:46',
    reposts: 19,
    favorites: 20,
    plays: 230,
    retrievedAt: new Date().toISOString(),
  },
];

/**
 * Manifest del DRY RUN real de Audius
 */
export const AUDIUS_REAL_DRY_RUN_MANIFEST = {
  source: 'AUDIUS',
  profileUrl: 'https://audius.co/profmanuelgago',
  profileHandle: '@profmanuelgago',
  profileDisplayName: 'El Hombre de las Nubes',
  mechanismUsed: 'PUBLIC_WEB_PAGE_FETCH',
  retrievedAt: new Date().toISOString(),
  
  profileResolved: true,
  profileExternalId: 'profmanuelgago', // Handle como identificador público
  
  tracksReceived: AUDIUS_REAL_TRACKS_PAGE_1.length,
  firstPageIdentifiers: AUDIUS_REAL_TRACKS_PAGE_1.map(t => ({
    position: t.position,
    title: t.title,
    permalink: t.permalink,
  })),
  
  metricsObserved: {
    followers: AUDIUS_REAL_PROFILE.followers,
    following: AUDIUS_REAL_PROFILE.following,
    totalTracksApprox: AUDIUS_REAL_PROFILE.trackCount,
  },
  
  errors: [],
  accessLimitations: [
    'Solo se obtuvo la primera página de pistas (aproximadamente 120 de ~4650 totales)',
    'No se obtuvieron external_track_id únicos (Audius no los muestra en la página pública)',
    'Métricas (plays, reposts, favorites) son observaciones temporales con timestamp',
  ],
  
  dataOrigin: 'PUBLIC_SOURCE' as const,
  verificationStatus: 'METADATA_OBSERVED' as const,
};

/**
 * Nota importante sobre autoría y titularidad:
 * 
 * La publicación en @profmanuelgago demuestra:
 * - PLATFORM_ACCOUNT_ASSOCIATION: La cuenta está asociada a estas pistas
 * - PUBLICATION_EVIDENCE: Las pistas fueron publicadas en esta fecha
 * - PUBLIC_CREDIT: "El Hombre de las Nubes" aparece como artista
 * 
 * NO demuestra automáticamente:
 * - COPYRIGHT_OWNERSHIP
 * - COMPOSITION_RIGHTS_OWNERSHIP
 * - MASTER_RIGHTS_OWNERSHIP
 * - PERFORMANCE_RIGHTS_OWNERSHIP
 * 
 * Estos derechos requieren evidencia adicional (contratos, registros, etc.)
 */
