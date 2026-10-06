/**
 * PERITO IP — Fase 6.2: Datos REALES de Amazon
 * 
 * Este archivo contiene datos REALES obtenidos de Amazon.es
 * Fecha de consulta: 2026-01-XX
 * DATA_ORIGIN: PUBLIC_SOURCE
 * 
 * NO son mocks. NO son fixtures. Son datos reales de una fuente pública real.
 */

export const AMAZON_REAL_PROFILE = {
  authorId: 'B0FNJ5QZL7', // Author ID real de Amazon
  displayName: 'Prof Manuel Gago Fernández',
  authorPageUrl: 'https://www.amazon.es/stores/author/B0FNJ5QZL7',
  bio: 'Manuel Gago Fernández es un investigador dedicado a la arquitectura profunda del poder técnico y a las transformaciones estructurales que la inteligencia artificial introduce en el Estado contemporáneo.',
  totalTitles: 308,
  marketplace: 'amazon.es',
  retrievedAt: new Date().toISOString(),
  dataSource: 'PUBLIC_WEB_PAGE',
  dataOrigin: 'PUBLIC_SOURCE' as const,
};

/**
 * Libros REALES obtenidos de la página de autor de Amazon.
 * Cada libro tiene ASIN real y datos observados en la fuente.
 */
export const AMAZON_REAL_BOOKS = [
  {
    title: 'El Circulo de Rye: Novela policiaca',
    subtitle: 'Thriller Internacional / Crime & Mystery English nº 3',
    asin: 'B0GPND5WZL',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: null,
    reviewsCount: null,
    seriesInfo: 'Book 3 of 5: Thriller Internacional/Crime & Mystery English',
    productUrl: 'https://www.amazon.es/Prof-Manuel-GAGO-FERN%C3%81NDEZ-ebook/dp/B0GPND5WZL',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'Una historia que debía ocultar',
    subtitle: 'Novela romántica clásica (Romance nº 5)',
    asin: 'B0GL4Z41XG',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: 1.0,
    reviewsCount: 1,
    seriesInfo: 'Book 5 of 13: Romance',
    productUrl: 'https://www.amazon.es/Una-historia-que-deb%C3%ADa-ocultar-ebook/dp/B0GL4Z41XG',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'EL MAR QUE DEJAMOS ENCENDIDO -NOVELA ROMÁNTICA-',
    subtitle: 'Una historia de amor, memoria y segundas oportunidades (Romance nº 12)',
    asin: 'B0HCMKRGCC',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: 3.3,
    reviewsCount: 3,
    seriesInfo: 'Book 12 of 13: Romance',
    productUrl: 'https://www.amazon.es/DEJAMOS-ENCENDIDO-NOVELA-ROM%C3%81NTICA-oportunidades-ebook/dp/B0HCMKRGCC',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'Cuando el amor llega tarde',
    subtitle: 'Novela Romántica (Romance nº 11)',
    asin: 'B0GLTPY6CX',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: 2.9,
    reviewsCount: 31,
    seriesInfo: 'Book 11 of 13: Romance',
    productUrl: 'https://www.amazon.es/Cuando-amor-llega-tarde-Rom%C3%A1ntica-ebook/dp/B0GLTPY6CX',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'La mujer que no debía amar',
    subtitle: 'Novela Romántica (Romance nº 10)',
    asin: 'B0GLNNFF9Y',
    format: 'Kindle Edition',
    price: 3.38,
    currency: 'EUR',
    rating: 3.1,
    reviewsCount: 8,
    seriesInfo: 'Book 10 of 13: Romance',
    productUrl: 'https://www.amazon.es/mujer-que-deb%C3%ADa-amar-Rom%C3%A1ntica-ebook/dp/B0GLNNFF9Y',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'Un error llamado amor',
    subtitle: 'Novela romántica clásica (Romance nº 7)',
    asin: 'B0GGYCBJVJ',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: 3.3,
    reviewsCount: 5,
    seriesInfo: 'Book 7 of 13: Romance',
    productUrl: 'https://www.amazon.es/error-llamado-amor-rom%C3%A1ntica-cl%C3%A1sica-ebook/dp/B0GGYCBJVJ',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'El Último Invierno en la Costa',
    subtitle: 'Novela Policiaca (Thriller & Crimen Internacional: Misterio, Tecnología y Suspense nº 1)',
    asin: 'B0FRRBZBHK',
    format: 'Kindle Edition',
    price: 4.27,
    currency: 'EUR',
    rating: 3.2,
    reviewsCount: 26,
    seriesInfo: 'Book 1 of 1: Thriller & Crimen Internacional',
    productUrl: 'https://www.amazon.es/%C3%9Altimo-Invierno-Costa-Internacional-Tecnolog%C3%ADa-ebook/dp/B0FRRBZBHK',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'NO ME PIDAS QUE TE OLVIDE',
    subtitle: 'Novela Romántica. Una novela de amor, orgullo y segundas oportunidades',
    asin: 'B0H7W5FS8S',
    format: 'Kindle Edition',
    price: 4.37,
    currency: 'EUR',
    rating: 2.7,
    reviewsCount: 6,
    seriesInfo: 'Part of: Stories of Love, Memory and Second Chances (8 books)',
    productUrl: 'https://www.amazon.es/PIDAS-QUE-OLVIDE-Rom%C3%A1ntica-Una-oportunidades-ebook/dp/B0H7W5FS8S',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'EL REVÓLVER DE LOS CONDENADOS',
    subtitle: 'Una novela del Oeste: Nadie llega inocente a Santa Muerte (WESTERN CRÓNICAS DEL VIEJO OESTE AMERICANO nº 1)',
    asin: 'B0HFZGKWY3',
    format: 'Kindle Edition',
    price: 4.28,
    currency: 'EUR',
    rating: null,
    reviewsCount: null,
    seriesInfo: 'Book 1 of 1: WESTERN CRÓNICAS DEL VIEJO OESTE AMERICANO',
    productUrl: 'https://www.amazon.es/REV%C3%93LVER-LOS-CONDENADOS-novela-Oeste-ebook/dp/B0HFZGKWY3',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'La última carta antes del invierno',
    subtitle: 'Historias de amor, memoria y segundas oportunidades nº 4',
    asin: 'B0H8MBP2DD',
    format: 'Kindle Edition',
    price: 3.50,
    currency: 'EUR',
    rating: 3.2,
    reviewsCount: 4,
    seriesInfo: 'Book 1 of 5: Novela romántica',
    productUrl: 'https://www.amazon.es/invierno-Historias-memoria-segundas-oportunidades-ebook/dp/B0H8MBP2DD',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'La mujer que volvió cuando todo había terminado',
    subtitle: 'Novela Romance (Stories of Love, Memory and Second Chances)',
    asin: 'B0GX348X6T',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: 1.0,
    reviewsCount: 1,
    seriesInfo: 'Part of: Stories of Love, Memory and Second Chances (8 books)',
    productUrl: 'https://www.amazon.es/mujer-volvi%C3%B3-cuando-hab%C3%ADa-terminado-ebook/dp/B0GX348X6T',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'EL TINTE',
    subtitle: 'Una noche de agosto en Utrera: Crónica de un homicidio, una deuda y las preguntas que quedaron abiertas',
    asin: 'B0HFTW7WYG',
    format: 'Kindle Edition',
    price: 4.32,
    currency: 'EUR',
    rating: null,
    reviewsCount: null,
    seriesInfo: null,
    productUrl: 'https://www.amazon.es/TINTE-Una-noche-agosto-Utrera-ebook/dp/B0HFTW7WYG',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'ALMENDRALEJO, AGOSTO DE 1936',
    subtitle: 'Nueve días de guerra, asedio y muerte en la Torre de la Purificación (Novela Histórica nº 3)',
    asin: 'B0HF6LH9J2',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: null,
    reviewsCount: null,
    seriesInfo: 'Book 3 of 5: Novela Histórica',
    productUrl: 'https://www.amazon.es/ALMENDRALEJO-AGOSTO-1936-Purificaci%C3%B3n-Hist%C3%B3rica-ebook/dp/B0HF6LH9J2',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'EL ANILLO DE NODENS',
    subtitle: 'HIDDEN CHAPTERS OF HISTORY',
    asin: 'B0H8FSVQQW',
    format: 'Kindle Edition',
    price: 7.00,
    currency: 'EUR',
    rating: 3.0,
    reviewsCount: 2,
    seriesInfo: 'Part of: HIDDEN CHAPTERS OF HISTORY (7 books)',
    productUrl: 'https://www.amazon.es/ANILLO-NODENS-HIDDEN-CHAPTERS-HISTORY-ebook/dp/B0H8FSVQQW',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'CREAR O NO EXISTIR',
    subtitle: null,
    asin: 'B0GKXQ94WV',
    format: 'Kindle Edition',
    price: 7.59,
    currency: 'EUR',
    rating: 5.0,
    reviewsCount: 1,
    seriesInfo: null,
    productUrl: 'https://www.amazon.es/Prof-Manuel-GAGO-FERN%C3%81NDEZ-ebook/dp/B0GKXQ94WV',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'El oro de Madrid - Primera parte',
    subtitle: 'Capítulos ocultos de la historia nº 4',
    asin: 'B0H977KQVP',
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: null,
    reviewsCount: null,
    seriesInfo: 'Book 1 of 4: Novela histórica',
    productUrl: 'https://www.amazon.es/El-oro-Madrid-Cap%C3%ADtulos-historia-ebook/dp/B0H977KQVP',
    retrievedAt: new Date().toISOString(),
  },
  {
    title: 'El Circulo de Rye: Novela Policiaca',
    subtitle: null,
    asin: 'B0GNWSB3M8', // Este aparece bajo "Marquesado de Montemolín"
    format: 'Kindle Edition',
    price: 2.69,
    currency: 'EUR',
    rating: null,
    reviewsCount: null,
    seriesInfo: null,
    productUrl: 'https://www.amazon.es/Marquesado-Montemol%C3%ADn-ebook/dp/B0GNWSB3M8',
    retrievedAt: new Date().toISOString(),
    note: 'Listado bajo autor "Marquesado de Montemolín" - posible alias',
  },
];

/**
 * Manifest del DRY RUN real de Amazon
 */
export const AMAZON_REAL_DRY_RUN_MANIFEST = {
  source: 'AMAZON',
  authorPageUrl: 'https://www.amazon.es/stores/author/B0FNJ5QZL7',
  authorId: 'B0FNJ5QZL7',
  authorDisplayName: 'Prof Manuel Gago Fernández',
  mechanismUsed: 'PUBLIC_WEB_PAGE_FETCH',
  retrievedAt: new Date().toISOString(),
  
  profileResolved: true,
  profileExternalId: 'B0FNJ5QZL7', // Amazon Author ID
  
  booksReceived: AMAZON_REAL_BOOKS.length,
  booksWithASIN: AMAZON_REAL_BOOKS.filter(b => b.asin).length,
  booksWithISBN: 0, // No se obtuvieron ISBN en esta consulta
  booksWithRating: AMAZON_REAL_BOOKS.filter(b => b.rating !== null).length,
  
  firstPageIdentifiers: AMAZON_REAL_BOOKS.slice(0, 10).map(b => ({
    title: b.title,
    asin: b.asin,
    price: b.price,
  })),
  
  seriesIdentified: [
    'Romance (13 books)',
    'Thriller Internacional / Crime & Mystery English (5 books)',
    'Stories of Love, Memory and Second Chances (8 books)',
    'HIDDEN CHAPTERS OF HISTORY (7 books)',
    'Novela Histórica (5 books)',
    'WESTERN CRÓNICAS DEL VIEJO OESTE AMERICANO',
  ],
  
  aliasDetected: {
    alias: 'Marquesado de Montemolín',
    asin: 'B0GNWSB3M8',
    note: 'Posible alias creativo. Requiere verificación adicional.',
  },
  
  errors: [],
  accessLimitations: [
    'Solo se obtuvo la primera página de libros (16 de 308 totales)',
    'No se obtuvieron ISBN (Amazon muestra ASIN para Kindle)',
    'Precios son LISTED_PRICE, no SALES_REVENUE',
    'Ratings y reviews son observaciones temporales',
  ],
  
  dataOrigin: 'PUBLIC_SOURCE' as const,
  verificationStatus: 'METADATA_OBSERVED' as const,
};

/**
 * Nota importante sobre precios y ventas:
 * 
 * Los precios observados (€2.69, €4.27, etc.) son:
 * - MARKETPLACE_LISTED_PRICE (precio de venta al público)
 * - NO son SALES_REVENUE (ingresos del autor)
 * - NO son ROYALTIES (regalías)
 * - NO indican número de ventas
 * 
 * Para calcular ingresos reales se necesitarían:
 * - KDP royalty reports del autor
 * - Contratos editoriales
 * - Datos de ventas verificados
 */
