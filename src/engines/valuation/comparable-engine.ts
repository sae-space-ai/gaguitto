/**
 * PERITO IP — Capa 2.5: Motor de Comparables (MARKET_COMPARABLE_ENGINE)
 * 
 * Implementa un sistema configurable de similitud.
 * D_i = Σ(w_j × d_ij)
 * Similarity_i = f(D_i)
 * 
 * El scoring ayuda a analizar comparables.
 * NO transforma automáticamente similitud en valoración definitiva.
 */

import Decimal from 'decimal.js';
import {
  ComparableData,
  ComparableScore,
  Currency,
  CalculationTrace,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface ComparableEngineInput {
  target: {
    assetType: string;
    genre?: string;
    format?: string;
    territory?: string;
    language?: string;
    developmentStage?: string;
    rightsBundle?: string[];
    exclusivity?: boolean;
    term?: number;
    transactionType?: string;
  };
  comparables: ComparableData[];
  weights?: Record<string, number>; // Pesos configurables por dimensión
  currency: Currency;
  valuationDate: string;
  minimumScore?: number; // Score mínimo para considerar un comparable (default: 50)
}

export interface ComparableEngineResult {
  scoredComparables: (ComparableData & { score: ComparableScore })[];
  validComparables: number;
  weightedAverageValue: Decimal | null;
  lowerBound: Decimal | null;
  upperBound: Decimal | null;
  confidenceLevel: number;
  calculationTrace: CalculationTrace;
  warnings: string[];
  insufficientDataMessage: string | null;
}

// ============================================================
// PESOS POR DEFECTO
// ============================================================

const DEFAULT_WEIGHTS: Record<string, number> = {
  assetType: 0.20,
  genre: 0.12,
  format: 0.10,
  territory: 0.15,
  language: 0.05,
  transactionDate: 0.10,
  developmentStage: 0.08,
  rightsBundle: 0.08,
  exclusivity: 0.04,
  term: 0.04,
  transactionType: 0.04,
};

// ============================================================
// MOTOR DE COMPARABLES
// ============================================================

/**
 * Evalúa comparables contra el activo objetivo y calcula similitud.
 * 
 * NO produce una valoración definitiva automáticamente.
 * Solo calcula puntuaciones de comparabilidad y un rango indicativo.
 */
export function marketComparableEngine(input: ComparableEngineInput): ComparableEngineResult {
  const warnings: string[] = [];
  const weights = input.weights || DEFAULT_WEIGHTS;
  const minScore = input.minimumScore ?? 50;

  if (input.comparables.length === 0) {
    return {
      scoredComparables: [],
      validComparables: 0,
      weightedAverageValue: null,
      lowerBound: null,
      upperBound: null,
      confidenceLevel: 0,
      calculationTrace: createEmptyTrace(input),
      warnings: ['No hay comparables disponibles para análisis.'],
      insufficientDataMessage: 'DATOS INSUFICIENTES PARA UNA CONCLUSIÓN PERICIAL ROBUSTA. No existen comparables registrados.',
    };
  }

  // 1. Puntuar cada comparable
  const scored = input.comparables.map(comp => ({
    ...comp,
    score: calculateSimilarity(input.target, comp, weights),
  }));

  // 2. Filtrar por score mínimo
  const valid = scored.filter(s => s.score.similarityScore >= minScore);

  if (valid.length === 0) {
    return {
      scoredComparables: scored,
      validComparables: 0,
      weightedAverageValue: null,
      lowerBound: null,
      upperBound: null,
      confidenceLevel: 0,
      calculationTrace: createEmptyTrace(input),
      warnings: [
        'Ningún comparable alcanza el score mínimo de comparabilidad.',
        `Scores obtenidos: ${scored.map(s => `${s.id}=${s.score.similarityScore}`).join(', ')}`,
      ],
      insufficientDataMessage: 'NO EXISTEN COMPARABLES SUFICIENTEMENTE FIABLES para una valoración por mercado.',
    };
  }

  // 3. Calcular valor ponderado
  const totalWeight = valid.reduce((sum, v) => sum + v.score.similarityScore, 0);
  let weightedSum = new Decimal(0);
  
  for (const v of valid) {
    weightedSum = weightedSum.plus(v.reportedValue.times(v.score.similarityScore));
  }
  
  const weightedAverage = totalWeight > 0 ? weightedSum.div(totalWeight) : new Decimal(0);

  // 4. Rango (percentil 25-75 de valores)
  const sortedValues = valid.map(v => v.reportedValue).sort((a, b) => a.minus(b).toNumber());
  const lowerIdx = Math.floor(sortedValues.length * 0.25);
  const upperIdx = Math.min(sortedValues.length - 1, Math.floor(sortedValues.length * 0.75));
  const lowerBound = sortedValues[lowerIdx] || sortedValues[0];
  const upperBound = sortedValues[upperIdx] || sortedValues[sortedValues.length - 1];

  // 5. Confianza
  const avgScore = valid.reduce((s, v) => s + v.score.similarityScore, 0) / valid.length;
  const confidenceLevel = Math.min(100, Math.round(
    (valid.length * 8) + // Más comparables = más confianza (máx ~80 con 10+)
    (avgScore * 0.2)     // Calidad de comparables (máx ~20)
  ));

  if (valid.length < 3) {
    warnings.push(`Solo ${valid.length} comparables válidos. Se recomiendan al menos 3 para un análisis robusto.`);
  }

  // 6. Trazabilidad
  const trace: CalculationTrace = {
    calculationId: generateCalculationId('COMP'),
    engine: 'valuation.marketComparableEngine',
    formula: 'Similarity = f(Σ(w_j × d_ij)); Value = Σ(value_i × similarity_i) / Σ(similarity_i)',
    valuationDate: input.valuationDate,
    currency: input.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      numberOfComparables: { value: input.comparables.length.toString(), source: 'documented', justification: 'Comparables analizados' },
      minimumScore: { value: minScore.toString(), source: 'documented', justification: 'Score mínimo de comparabilidad' },
      weights: { value: JSON.stringify(weights), source: 'estimate', justification: 'Pesos por dimensión de similitud' },
    },
    intermediateSteps: valid.map((v, i) => ({
      stepNumber: i + 1,
      description: `Comparable ${v.id}: score=${v.score.similarityScore}, value=${v.reportedValue.toString()}`,
      formula: `D = ${v.score.weightedDistance.toFixed(2)}, Similarity = ${v.score.similarityScore}`,
      inputs: { dimensions: JSON.stringify(v.score.dimensionScores) },
      result: v.reportedValue.toString(),
    })),
    warnings,
    confidenceLevel,
    limitations: [
      'Los comparables son referencias, no determinaciones de valor.',
      'Cada comparable tiene diferencias con el activo analizado (ver campo differences).',
      'El valor ponderado es indicativo y debe contrastarse con otros métodos.',
    ],
  };

  return {
    scoredComparables: scored,
    validComparables: valid.length,
    weightedAverageValue: roundFinancial(weightedAverage),
    lowerBound: roundFinancial(lowerBound),
    upperBound: roundFinancial(upperBound),
    confidenceLevel,
    calculationTrace: trace,
    warnings,
    insufficientDataMessage: null,
  };
}

// ============================================================
// CÁLCULO DE SIMILITUD
// ============================================================

function calculateSimilarity(
  target: ComparableEngineInput['target'],
  comparable: ComparableData,
  weights: Record<string, number>
): ComparableScore {
  const dimensionScores: Record<string, number> = {};
  const differences: string[] = [];
  let weightedDistance = 0;
  let totalWeight = 0;

  // Asset Type
  const typeScore = target.assetType === comparable.assetType ? 100 : 20;
  dimensionScores.assetType = typeScore;
  if (typeScore < 100) differences.push(`Tipo diferente: ${target.assetType} vs ${comparable.assetType}`);
  weightedDistance += (100 - typeScore) * (weights.assetType || 0);
  totalWeight += weights.assetType || 0;

  // Genre
  if (target.genre && comparable.genre) {
    const genreScore = target.genre.toLowerCase() === comparable.genre.toLowerCase() ? 100 : 40;
    dimensionScores.genre = genreScore;
    if (genreScore < 100) differences.push(`Género diferente: ${target.genre} vs ${comparable.genre}`);
    weightedDistance += (100 - genreScore) * (weights.genre || 0);
    totalWeight += weights.genre || 0;
  }

  // Format
  if (target.format && comparable.format) {
    const formatScore = target.format.toLowerCase() === comparable.format.toLowerCase() ? 100 : 30;
    dimensionScores.format = formatScore;
    if (formatScore < 100) differences.push(`Formato diferente: ${target.format} vs ${comparable.format}`);
    weightedDistance += (100 - formatScore) * (weights.format || 0);
    totalWeight += weights.format || 0;
  }

  // Territory
  if (target.territory && comparable.territory) {
    const terrScore = target.territory.toLowerCase() === comparable.territory.toLowerCase() ? 100 : 30;
    dimensionScores.territory = terrScore;
    if (terrScore < 100) differences.push(`Territorio diferente: ${target.territory} vs ${comparable.territory}`);
    weightedDistance += (100 - terrScore) * (weights.territory || 0);
    totalWeight += weights.territory || 0;
  }

  // Language
  if (target.language && comparable.language) {
    const langScore = target.language.toLowerCase() === comparable.language.toLowerCase() ? 100 : 50;
    dimensionScores.language = langScore;
    weightedDistance += (100 - langScore) * (weights.language || 0);
    totalWeight += weights.language || 0;
  }

  // Transaction Date (penalización por antigüedad)
  const targetYear = new Date(input_valuationDate()).getFullYear();
  const compYear = new Date(comparable.transactionDate).getFullYear();
  const yearDiff = Math.abs(targetYear - compYear);
  const dateScore = Math.max(0, 100 - yearDiff * 10);
  dimensionScores.transactionDate = dateScore;
  if (yearDiff > 2) differences.push(`Diferencia temporal: ${yearDiff} años`);
  weightedDistance += (100 - dateScore) * (weights.transactionDate || 0);
  totalWeight += weights.transactionDate || 0;

  // Development Stage
  if (target.developmentStage && comparable.developmentStage) {
    const stageScore = target.developmentStage === comparable.developmentStage ? 100 : 50;
    dimensionScores.developmentStage = stageScore;
    weightedDistance += (100 - stageScore) * (weights.developmentStage || 0);
    totalWeight += weights.developmentStage || 0;
  }

  // Exclusivity
  if (target.exclusivity !== undefined && comparable.exclusivity !== undefined) {
    const exclScore = target.exclusivity === comparable.exclusivity ? 100 : 40;
    dimensionScores.exclusivity = exclScore;
    weightedDistance += (100 - exclScore) * (weights.exclusivity || 0);
    totalWeight += weights.exclusivity || 0;
  }

  // Similarity = 100 - weighted_distance (normalizado)
  const similarityScore = totalWeight > 0
    ? Math.max(0, Math.round(100 - (weightedDistance / totalWeight)))
    : 50; // Si no hay dimensiones comparables, score neutral

  return {
    comparableId: comparable.id,
    dimensionScores,
    weightedDistance,
    similarityScore,
    differences,
  };
}

function input_valuationDate(): string {
  return new Date().toISOString();
}

function createEmptyTrace(input: ComparableEngineInput): CalculationTrace {
  return {
    calculationId: generateCalculationId('COMP'),
    engine: 'valuation.marketComparableEngine',
    formula: 'N/A — Sin comparables suficientes',
    valuationDate: input.valuationDate,
    currency: input.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {},
    intermediateSteps: [],
    warnings: ['Sin datos suficientes para cálculo.'],
    confidenceLevel: 0,
    limitations: ['No hay comparables disponibles.'],
  };
}
