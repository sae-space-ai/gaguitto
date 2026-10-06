/**
 * PERITO IP — Motor Cuantitativo Pericial
 * 
 * Barrel export para todos los motores.
 * Capa 2 del sistema PERITO IP.
 * 
 * REGLA FUNDAMENTAL: El LLM no realiza los cálculos finales.
 * Los cálculos económicos y financieros se ejecutan mediante funciones
 * deterministas, reproducibles, auditables y testeadas.
 */

// ============================================================
// TIPOS
// ============================================================
export * from './types';

// ============================================================
// CAPA 2.1 — NÚCLEO MATEMÁTICO
// ============================================================
export {
  presentValue,
  netPresentValue,
  futureValue,
  convertCurrency,
  calculatePercentage,
  calculateMargin,
  roundFinancial,
  formatCurrency,
} from './core/math-core';
export type { PVInput, PVResult, NPVInput, NPVResult, FVInput, FVResult, ConversionRate } from './core/math-core';

// ============================================================
// CAPA 2.2 — MOTOR DCF
// ============================================================
export { dcfEngine } from './core/dcf-engine';
export type { DCFInput, DCFResult, DCFPeriodResult } from './core/dcf-engine';

// ============================================================
// CAPA 2.3 — MOTOR DE ROYALTIES
// ============================================================
export { royaltyEngine, tieredRoyaltyEngine } from './valuation/royalty-engine';
export type { RoyaltyEngineInput, RoyaltyEngineResult, TieredRoyaltyInput, TieredRoyaltyResult } from './valuation/royalty-engine';

// ============================================================
// CAPA 2.4 — MOTOR DE COSTE
// ============================================================
export { costValuationEngine } from './valuation/cost-engine';
export type { CostValuationInput, CostValuationResult } from './valuation/cost-engine';

// ============================================================
// CAPA 2.5 — MOTOR DE COMPARABLES
// ============================================================
export { marketComparableEngine } from './valuation/comparable-engine';
export type { ComparableEngineInput, ComparableEngineResult } from './valuation/comparable-engine';

// ============================================================
// CAPA 2.6 — MOTOR EDITORIAL
// ============================================================
export { bookValuationEngine } from './valuation/book-engine';
export type { BookValuationInput, BookValuationResult, EditorialStream, EditorialModality } from './valuation/book-engine';

// ============================================================
// CAPA 2.7 — MOTOR AUDIOVISUAL
// ============================================================
export { audiovisualValuationEngine } from './valuation/audiovisual-engine';
export type { AudiovisualValuationInput, AudiovisualValuationResult, AudiovisualStream, AudiovisualWindow } from './valuation/audiovisual-engine';

// ============================================================
// CAPA 2.8 — DERECHOS DE ADAPTACIÓN
// ============================================================
export { adaptationRightsEngine } from './valuation/adaptation-engine';
export type { AdaptationRightsInput, AdaptationRightsResult, AdaptationScenario, AdaptationPhase } from './valuation/adaptation-engine';

// ============================================================
// CAPA 2.9 — RELIEF FROM ROYALTY
// ============================================================
export { reliefFromRoyaltyEngine } from './valuation/relief-from-royalty-engine';
export type { ReliefFromRoyaltyInput, ReliefFromRoyaltyResult } from './valuation/relief-from-royalty-engine';

// ============================================================
// CAPA 2.10 — ESCENARIOS
// ============================================================
export { scenarioEngine } from './analysis/scenario-engine';
export type { ScenarioEngineInput, ScenarioComparisonResult } from './analysis/scenario-engine';

// ============================================================
// CAPA 2.11 — MONTE CARLO
// ============================================================
export { monteCarloEngine } from './analysis/monte-carlo-engine';
export type { MonteCarloEngineInput } from './analysis/monte-carlo-engine';

// ============================================================
// CAPA 2.12 — LUCRO CESANTE
// ============================================================
export { lostProfitsEngine } from './valuation/lost-profits-engine';
export type { LostProfitsInput } from './valuation/lost-profits-engine';

// ============================================================
// CAPA 2.13 — LICENCIA HIPOTÉTICA
// ============================================================
export { hypotheticalLicenseEngine } from './valuation/hypothetical-license-engine';
export type { HypotheticalLicenseInput } from './valuation/hypothetical-license-engine';

// ============================================================
// CAPA 2.14 — FECHA HISTÓRICA DE VALORACIÓN
// ============================================================
export { checkValuationDateCutoff, filterByValuationDate } from './controls/valuation-date-engine';
export type { ValuationDateCheck } from './controls/valuation-date-engine';

// ============================================================
// CAPA 2.15 — DETECTOR DE DOBLE CONTABILIZACIÓN
// ============================================================
export { doubleCountingDetector } from './controls/double-counting-detector';
export type { ValuationComponent, DoubleCountingResult } from './controls/double-counting-detector';

// ============================================================
// CAPA 2.16 — TRIANGULACIÓN
// ============================================================
export { valuationTriangulationEngine } from './analysis/triangulation-engine';
export type { TriangulationEngineInput } from './analysis/triangulation-engine';

// ============================================================
// CAPA 2.17 — SENSIBILIDAD
// ============================================================
export { sensitivityEngine } from './analysis/sensitivity-engine';
export type { SensitivityEngineInput, SensitivityEngineResult } from './analysis/sensitivity-engine';

// ============================================================
// CAPA 2.18 — TRAZABILIDAD MATEMÁTICA
// ============================================================
export { generateTraceabilityReport, verifyTraceability } from './trace/traceability';
export type { TraceabilityReport } from './trace/traceability';
