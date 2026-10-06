/**
 * PERITO IP — Schemas de Validación con Zod
 * 
 * Validación runtime para todas las fronteras críticas:
 * - Inputs de motores financieros
 * - Datos de fuentes externas
 * - Observaciones de explotación
 * - Respuestas de APIs
 * 
 * PRINCIPIO: Todo input externo se considera NO CONFIABLE hasta validarse.
 */

import { z } from 'zod';

// ============================================================
// SCHEMAS BASE
// ============================================================

export const CurrencySchema = z.enum(['EUR', 'USD', 'GBP', 'MXN', 'ARS', 'COP', 'CLP', 'BRL']);

export const DateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
  'Formato de fecha inválido. Esperado: YYYY-MM-DD o ISO 8601'
);

export const PositiveDecimalSchema = z.string().regex(
  /^\d+(\.\d+)?$/,
  'Debe ser un número decimal positivo'
).transform(val => parseFloat(val));

export const PercentageSchema = z.number()
  .min(0, 'El porcentaje no puede ser negativo')
  .max(100, 'El porcentaje no puede exceder 100');

export const UUIDSchema = z.string().uuid('ID debe ser un UUID válido');

// ============================================================
// SCHEMAS DE MOTORES FINANCIEROS
// ============================================================

export const CashFlowSchema = z.object({
  period: z.number().int().positive('El período debe ser un entero positivo'),
  amount: z.any().refine(
    (val) => val && typeof val.toNumber === 'function',
    'amount debe ser una instancia de Decimal'
  ),
  currency: CurrencySchema,
  description: z.string().optional(),
  basis: z.enum(['documented', 'comparable', 'estimate', 'hypothesis', 'unverified']),
  sourceId: z.string().optional(),
  evidenceId: z.string().optional(),
  assumptionId: z.string().optional(),
});

export const DCFInputSchema = z.object({
  valuationDate: DateStringSchema,
  cashFlows: z.array(CashFlowSchema).min(1, 'Debe haber al menos un flujo de caja'),
  discountRate: z.number()
    .min(0, 'La tasa de descuento no puede ser negativa')
    .max(1, 'La tasa de descuento no puede exceder 100%'),
  currency: CurrencySchema,
  terminalValue: z.object({
    method: z.enum(['gordon', 'exit_multiple']),
    growthRate: z.number().optional(),
    exitMultiple: z.number().optional(),
  }).optional().refine(
    (val) => {
      if (!val) return true;
      if (val.method === 'gordon' && val.growthRate === undefined) return false;
      if (val.method === 'exit_multiple' && val.exitMultiple === undefined) return false;
      return true;
    },
    'growthRate requerido para método gordon, exitMultiple requerido para exit_multiple'
  ),
  assumptions: z.array(z.object({
    id: z.string(),
    description: z.string(),
    basis: z.enum(['documented', 'comparable', 'estimate', 'hypothesis']),
    sourceId: z.string().optional(),
    evidenceId: z.string().optional(),
  })),
  sources: z.array(z.object({
    id: z.string(),
    description: z.string(),
    reliability: z.number().int().min(1).max(5),
  })),
  description: z.string().optional(),
});

export const RoyaltyInputSchema = z.object({
  royaltyBase: z.enum(['PVP', 'NET_RECEIPTS', 'WHOLESALE', 'GROSS_REVENUE', 'NET_REVENUE', 'FIXED_PAYMENT', 'OTHER']),
  baseAmount: z.number().nonnegative('El monto base no puede ser negativo'),
  royaltyRate: z.number()
    .min(0, 'La tasa de royalty no puede ser negativa')
    .max(1, 'La tasa de royalty no puede exceder 100%'),
  tiers: z.array(z.object({
    fromUnits: z.number().int().nonnegative(),
    toUnits: z.number().int().positive().nullable(),
    rate: z.number().min(0).max(1),
  })).optional(),
  minimumGuarantee: z.number().nonnegative().optional(),
  advance: z.number().nonnegative().optional(),
  recoverable: z.boolean().optional(),
  unitsSold: z.number().int().nonnegative().optional(),
  currency: CurrencySchema,
  valuationDate: DateStringSchema,
  territory: z.string().optional(),
  format: z.string().optional(),
  language: z.string().optional(),
  period: z.number().int().positive().optional(),
  basis: z.enum(['documented', 'comparable', 'estimate', 'hypothesis', 'unverified']),
  sourceId: z.string().optional(),
  evidenceId: z.string().optional(),
  contractDescription: z.string().optional(),
});

export const CostComponentSchema = z.object({
  id: z.string(),
  category: z.enum([
    'writing', 'research', 'development', 'production', 'filming',
    'editing', 'postproduction', 'design', 'illustration', 'translation',
    'publishing', 'professionals', 'personnel', 'software', 'equipment',
    'promotion', 'ip_protection', 'administrative', 'other'
  ]),
  description: z.string().min(1, 'La descripción no puede estar vacía'),
  amount: z.number().nonnegative('El monto no puede ser negativo'),
  currency: CurrencySchema,
  date: DateStringSchema,
  basis: z.enum(['documented', 'comparable', 'estimate', 'hypothesis']),
  sourceId: z.string().optional(),
  evidenceId: z.string().optional(),
  verifiedStatus: z.enum(['verified', 'unverified', 'pending']),
  adjustment: z.number().optional(),
  adjustmentReason: z.string().optional(),
});

export const CostValuationInputSchema = z.object({
  method: z.enum(['historical', 'reproduction', 'replacement']),
  components: z.array(CostComponentSchema).min(1, 'Debe haber al menos un componente de coste'),
  currency: CurrencySchema,
  valuationDate: DateStringSchema,
  priceIndex: z.number().positive().optional(),
  description: z.string().optional(),
  replacementComponents: z.array(CostComponentSchema).optional(),
});

// ============================================================
// SCHEMAS DE FUENTES EXTERNAS
// ============================================================

export const AudiusTrackSchema = z.object({
  position: z.number().int().positive(),
  title: z.string().min(1, 'El título no puede estar vacío'),
  artist: z.string().min(1, 'El artista no puede estar vacío'),
  permalink: z.string().url('El permalink debe ser una URL válida'),
  duration: z.string().regex(/^\d+:\d+$/, 'Formato de duración inválido. Esperado: MM:SS'),
  reposts: z.number().int().nonnegative(),
  favorites: z.number().int().nonnegative(),
  plays: z.number().int().nonnegative(),
  isArtistPick: z.boolean().optional(),
  retrievedAt: DateStringSchema,
});

export const AmazonBookSchema = z.object({
  title: z.string().min(1, 'El título no puede estar vacío'),
  subtitle: z.string().nullable(),
  asin: z.string().regex(/^[A-Z0-9]{10}$/, 'ASIN debe tener 10 caracteres alfanuméricos'),
  format: z.string(),
  price: z.number().nonnegative('El precio no puede ser negativo'),
  currency: CurrencySchema,
  rating: z.number().min(0).max(5).nullable(),
  reviewsCount: z.number().int().nonnegative().nullable(),
  seriesInfo: z.string().nullable(),
  productUrl: z.string().url('La URL del producto debe ser válida'),
  retrievedAt: DateStringSchema,
});

// ============================================================
// SCHEMAS DE OBSERVACIONES DE EXPLOTACIÓN
// ============================================================

export const ExploitationObservationSchema = z.object({
  observationId: z.string(),
  workId: z.string(),
  editionOrReleaseId: z.string().optional(),
  rightId: z.string().optional(),
  
  eventType: z.enum([
    'PUBLICATION', 'AVAILABILITY', 'SALE', 'DOWNLOAD', 'STREAM',
    'PLAY', 'VIEW', 'READ', 'RENTAL', 'LICENSE', 'ROYALTY_PAYMENT',
    'DISTRIBUTION', 'TERRITORIAL_EXPLOITATION', 'PERFORMANCE',
    'BROADCAST', 'SYNCHRONIZATION', 'SUBSCRIPTION_CONSUMPTION',
    'OTHER', 'UNKNOWN'
  ]),
  metricType: z.enum([
    'UNITS_SOLD', 'DOWNLOADS', 'STREAMS', 'PLAYS', 'VIEWS', 'READS',
    'MINUTES_CONSUMED', 'LICENSE_COUNT', 'GROSS_REVENUE', 'NET_RECEIPTS',
    'ROYALTY_AMOUNT', 'PUBLIC_COUNTER_VALUE', 'RANKING', 'RATING',
    'REVIEWS_COUNT', 'AVAILABILITY_STATUS', 'OTHER'
  ]),
  value: z.number(),
  unit: z.string().min(1, 'La unidad no puede estar vacía'),
  currency: CurrencySchema.optional(),
  
  territory: z.string().optional(),
  territoryGranularity: z.enum(['COUNTRY', 'REGION', 'MARKETPLACE', 'PLATFORM_TERRITORY', 'UNKNOWN']),
  territoryRaw: z.string().optional(),
  
  timeGranularity: z.enum([
    'EXACT_TIMESTAMP', 'DAY', 'MONTH', 'QUARTER', 'YEAR',
    'INTERVAL', 'CUMULATIVE_AS_OF', 'UNKNOWN'
  ]),
  observedPeriodStart: DateStringSchema.optional(),
  observedPeriodEnd: DateStringSchema.optional(),
  cumulativeAsOf: DateStringSchema.optional(),
  observedAt: DateStringSchema,
  
  channel: z.enum([
    'AMAZON_KINDLE', 'AMAZON_PRINT', 'AMAZON_AUDIOBOOK', 'AUDIUS',
    'EDITORIAL_DISTRIBUTOR', 'STREAMING_PLATFORM', 'BOOKSTORE',
    'DIRECT_LICENSE', 'BROADCASTER', 'FESTIVAL', 'CINEMA', 'TV',
    'SVOD', 'TVOD', 'AVOD', 'LIBRARY', 'OTHER', 'UNKNOWN'
  ]),
  platformOrChannel: z.string().min(1),
  
  sourceId: z.string(),
  sourceType: z.string(),
  sourceReference: z.string().optional(),
  evidenceId: z.string().optional(),
  importRunId: z.string(),
  
  dataOrigin: z.enum(['MOCK', 'FIXTURE', 'PUBLIC_SOURCE', 'OFFICIAL_API', 'USER_PROVIDED', 'MANUAL_VERIFIED', 'DERIVED']),
  evidenceClass: z.enum([
    'DIRECT_TRANSACTION', 'PLATFORM_REPORTED_USAGE', 'ACCOUNTING_STATEMENT',
    'DISTRIBUTOR_STATEMENT', 'PUBLIC_COUNTER', 'CONTRACTUAL_EXPLOITATION',
    'USER_PROVIDED_RECORD', 'MODEL_ESTIMATE', 'UNKNOWN'
  ]),
  verificationStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'CONFLICTED']),
  methodology: z.string().optional(),
  limitations: z.string().optional(),
  rawReference: z.string().optional(),
  
  qualityFlags: z.array(z.enum([
    'DUPLICATE_OBSERVATION', 'OVERLAPPING_PERIOD', 'CONFLICTING_STATEMENT',
    'UNKNOWN_CURRENCY', 'UNKNOWN_TERRITORY', 'COUNTER_ANOMALY',
    'SOURCE_GAP', 'RIGHTS_LINK_UNVERIFIED', 'ESTIMATED_VALUE',
    'POST_CUTOFF_DATA', 'DERIVED_COUNTER_DELTA'
  ])),
  notes: z.string().optional(),
  createdAt: DateStringSchema,
  updatedAt: DateStringSchema,
});

// ============================================================
// SCHEMAS DE IMPORT RUN
// ============================================================

export const ImportRunSchema = z.object({
  importRunId: z.string(),
  source: z.string().min(1),
  connectorVersion: z.string(),
  parserVersion: z.string(),
  startedAt: DateStringSchema,
  completedAt: DateStringSchema.optional(),
  status: z.enum(['RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL']),
  recordsSeen: z.number().int().nonnegative(),
  recordsCreated: z.number().int().nonnegative(),
  recordsUpdated: z.number().int().nonnegative(),
  recordsUnchanged: z.number().int().nonnegative(),
  recordsQuarantined: z.number().int().nonnegative(),
  duplicatesPrevented: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  checkpoint: z.string().optional(),
  errorMessage: z.string().optional(),
});

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.issues.map((err: any) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
    return { success: false, errors };
  }
}

export function validateDCFInput(data: unknown) {
  return validateWithSchema(DCFInputSchema, data);
}

export function validateRoyaltyInput(data: unknown) {
  return validateWithSchema(RoyaltyInputSchema, data);
}

export function validateCostValuationInput(data: unknown) {
  return validateWithSchema(CostValuationInputSchema, data);
}

export function validateAudiusTrack(data: unknown) {
  return validateWithSchema(AudiusTrackSchema, data);
}

export function validateAmazonBook(data: unknown) {
  return validateWithSchema(AmazonBookSchema, data);
}

export function validateExploitationObservation(data: unknown) {
  return validateWithSchema(ExploitationObservationSchema, data);
}

export function validateImportRun(data: unknown) {
  return validateWithSchema(ImportRunSchema, data);
}
