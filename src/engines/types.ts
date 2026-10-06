/**
 * PERITO IP — Tipos compartidos para todos los motores cuantitativos
 * 
 * Estos tipos garantizan la trazabilidad matemática de cada cálculo.
 * Ningún motor puede producir un resultado sin linaje completo.
 */

import Decimal from 'decimal.js';

// ============================================================
// TIPOS BASE
// ============================================================

export type Currency = 'EUR' | 'USD' | 'GBP' | 'MXN' | 'ARS' | 'COP' | 'CLP' | 'BRL';

export type ReliabilityLevel =
  | 'verified_official'
  | 'documented'
  | 'user_provided'
  | 'external_source'
  | 'estimate'
  | 'hypothesis'
  | 'unverified';

export type DataBasis =
  | 'documented'      // Acreditado por evidencia
  | 'comparable'      // Basado en comparable verificado
  | 'estimate'        // Estimación razonada
  | 'hypothesis'      // Suposición explícita
  | 'unverified';     // No verificado

// ============================================================
// TRAZABILIDAD
// ============================================================

export interface CalculationTrace {
  calculationId: string;
  engine: string;
  formula: string;
  valuationDate: string; // ISO date
  currency: Currency;
  calculationVersion: string;
  createdAt: string; // ISO datetime
  inputs: Record<string, TraceInput>;
  intermediateSteps: IntermediateStep[];
  warnings: string[];
  confidenceLevel: number; // 0-100
  limitations: string[];
}

export interface TraceInput {
  value: string; // Decimal como string para precisión
  source: DataBasis;
  sourceId?: string;
  evidenceId?: string;
  assumptionId?: string;
  justification: string;
}

export interface IntermediateStep {
  stepNumber: number;
  description: string;
  formula: string;
  inputs: Record<string, string>;
  result: string; // Decimal como string
}

// ============================================================
// FLUJOS DE CAJA
// ============================================================

export interface CashFlow {
  period: number; // Año o período (1, 2, 3...)
  amount: Decimal;
  currency: Currency;
  description?: string;
  sourceId?: string;
  evidenceId?: string;
  assumptionId?: string;
  basis: DataBasis;
}

export interface DiscountedCashFlow extends CashFlow {
  discountRate: Decimal;
  discountFactor: Decimal;
  presentValue: Decimal;
}

// ============================================================
// RESULTADOS DE VALORACIÓN
// ============================================================

export interface ValuationResult {
  value: Decimal;
  currency: Currency;
  valuationDate: string;
  method: ValuationMethod;
  trace: CalculationTrace;
  confidenceLevel: number;
  warnings: string[];
  limitations: string[];
}

export type ValuationMethod =
  | 'cost_historical'
  | 'cost_reproduction'
  | 'cost_replacement'
  | 'market_comparables'
  | 'income_dcf'
  | 'income_royalty'
  | 'relief_from_royalty'
  | 'adaptation_rights'
  | 'lost_profits'
  | 'hypothetical_license'
  | 'triangulation'
  | 'probabilistic';

// ============================================================
// ROYALTIES
// ============================================================

export type RoyaltyBase =
  | 'PVP'
  | 'NET_RECEIPTS'
  | 'WHOLESALE'
  | 'GROSS_REVENUE'
  | 'NET_REVENUE'
  | 'FIXED_PAYMENT'
  | 'OTHER';

export interface RoyaltyTier {
  fromUnits: number; // Desde (inclusive)
  toUnits: number | null; // Hasta (null = infinito)
  rate: Decimal; // Porcentaje como decimal (0.10 = 10%)
}

export interface RoyaltyCalculation {
  base: RoyaltyBase;
  baseAmount: Decimal;
  rate: Decimal;
  royaltyAmount: Decimal;
  currency: Currency;
  tier?: RoyaltyTier;
  period?: number;
  territory?: string;
  format?: string;
  language?: string;
  trace: CalculationTrace;
}

// ============================================================
// COSTES
// ============================================================

export type CostCategory =
  | 'writing'
  | 'research'
  | 'development'
  | 'production'
  | 'filming'
  | 'editing'
  | 'postproduction'
  | 'design'
  | 'illustration'
  | 'translation'
  | 'publishing'
  | 'professionals'
  | 'personnel'
  | 'software'
  | 'equipment'
  | 'promotion'
  | 'ip_protection'
  | 'administrative'
  | 'other';

export type CostMethod = 'historical' | 'reproduction' | 'replacement';

export interface CostComponent {
  id: string;
  category: CostCategory;
  description: string;
  amount: Decimal;
  currency: Currency;
  date: string;
  basis: DataBasis;
  sourceId?: string;
  evidenceId?: string;
  verifiedStatus: 'verified' | 'unverified' | 'pending';
  adjustment?: Decimal;
  adjustmentReason?: string;
}

// ============================================================
// COMPARABLES
// ============================================================

export type AssetType =
  | 'original_work'
  | 'manuscript'
  | 'published_book'
  | 'screenplay'
  | 'treatment'
  | 'format'
  | 'feature_film'
  | 'short_film'
  | 'documentary'
  | 'series'
  | 'episode'
  | 'character'
  | 'narrative_universe'
  | 'translation'
  | 'adaptation'
  | 'remake'
  | 'sequel'
  | 'prequel';

export interface ComparableData {
  id: string;
  assetType: AssetType;
  genre?: string;
  format?: string;
  territory?: string;
  language?: string;
  transactionDate: string;
  developmentStage?: string;
  rightsBundle?: string[];
  exclusivity?: boolean;
  term?: number; // años
  transactionType: string;
  upfrontPayment?: Decimal;
  royaltyRate?: Decimal;
  minimumGuarantee?: Decimal;
  reportedValue: Decimal;
  currency: Currency;
  sourceId: string;
  reliability: ReliabilityLevel;
  notes?: string;
}

export interface ComparableScore {
  comparableId: string;
  dimensionScores: Record<string, number>; // dimensión -> score 0-100
  weightedDistance: number; // D_i
  similarityScore: number; // 0-100
  differences: string[];
  adjustedValue?: Decimal;
}

// ============================================================
// ESCENARIOS
// ============================================================

export type ScenarioType = 'conservative' | 'base' | 'expansive';

export interface ScenarioVariable {
  name: string;
  value: Decimal;
  distribution?: ProbabilityDistribution;
  source: DataBasis;
  justification: string;
  sourceId?: string;
  evidenceId?: string;
  assumptionId?: string;
}

export interface ProbabilityDistribution {
  type: 'normal' | 'uniform' | 'triangular' | 'lognormal' | 'beta' | 'fixed';
  params: Record<string, number>;
}

export interface ScenarioResult {
  type: ScenarioType;
  value: Decimal;
  currency: Currency;
  inputs: ScenarioVariable[];
  assumptions: string[];
  limitations: string[];
  confidenceLevel: number;
  trace: CalculationTrace;
}

// ============================================================
// MONTE CARLO
// ============================================================

export interface MonteCarloInput {
  variableName: string;
  distribution: ProbabilityDistribution;
  source: DataBasis;
  justification: string;
}

export interface MonteCarloResult {
  seed: number;
  iterations: number;
  modelVersion: string;
  percentiles: {
    p5: Decimal;
    p10: Decimal;
    p25: Decimal;
    p50: Decimal;
    p75: Decimal;
    p90: Decimal;
    p95: Decimal;
  };
  mean: Decimal;
  stdDev: Decimal;
  min: Decimal;
  max: Decimal;
  histogram: { binStart: number; binEnd: number; count: number }[];
  convergenceReached: boolean;
  valuationDate: string;
  currency: Currency;
  trace: CalculationTrace;
}

// ============================================================
// LUCRO CESANTE
// ============================================================

export interface LostProfitsPeriod {
  period: number;
  butForCashFlow: Decimal;
  actualCashFlow: Decimal;
  lostProfit: Decimal;
  butForVariables: Record<string, TraceInput>;
  actualVariables: Record<string, TraceInput>;
  differences: string[];
}

export interface LostProfitsResult {
  totalLostProfits: Decimal;
  currency: Currency;
  valuationDate: string;
  periods: LostProfitsPeriod[];
  discountRate: Decimal;
  trace: CalculationTrace;
}

// ============================================================
// LICENCIA HIPOTÉTICA
// ============================================================

export interface HypotheticalLicenseResult {
  value: Decimal;
  currency: Currency;
  royaltyRate: Decimal;
  royaltyBase: RoyaltyBase;
  revenueBase: Decimal;
  periods: { period: number; revenue: Decimal; royaltySaving: Decimal; presentValue: Decimal }[];
  taxRate: Decimal;
  discountRate: Decimal;
  trace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// TRIANGULACIÓN
// ============================================================

export interface TriangulationInput {
  method: ValuationMethod;
  value: Decimal;
  weight: Decimal; // 0-1
  confidenceLevel: number;
  evidenceQuality: string;
  limitations: string[];
}

export interface TriangulationResult {
  inputs: TriangulationInput[];
  lowerBound: Decimal;
  centralValue: Decimal;
  upperBound: Decimal;
  confidenceLevel: number;
  keyDrivers: string[];
  keyRisks: string[];
  methodologyNotes: string;
  trace: CalculationTrace;
}

// ============================================================
// DOBLE CONTABILIZACIÓN
// ============================================================

export interface DoubleCountingCheck {
  componentA: { id: string; description: string; right?: string; territory?: string; period?: string };
  componentB: { id: string; description: string; right?: string; territory?: string; period?: string };
  overlapType: 'same_right' | 'same_flow' | 'same_territory' | 'same_period' | 'same_contract' | 'same_revenue' | 'same_asset' | 'overlapping_derivatives';
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  recommendation: 'allow' | 'review' | 'block';
}

// ============================================================
// SENSIBILIDAD
// ============================================================

export interface SensitivityResult {
  variableName: string;
  baseValue: Decimal;
  impactPlus10: Decimal; // Valor si variable +10%
  impactMinus10: Decimal; // Valor si variable -10%
  elasticity: Decimal; // % cambio resultado / % cambio variable
  rank: number; // 1 = más impactante
}

// ============================================================
// CONFIGURACIÓN GLOBAL
// ============================================================

export interface ValuationConfig {
  valuationDate: string;
  informationCutoffDate?: string;
  currency: Currency;
  calculationVersion: string;
  locale?: string;
}

// ============================================================
// UTILIDADES
// ============================================================

export function generateCalculationId(engine: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${engine}-${timestamp}-${random}`;
}

export function toDecimal(value: number | string | Decimal): Decimal {
  if (value instanceof Decimal) return value;
  return new Decimal(value);
}
