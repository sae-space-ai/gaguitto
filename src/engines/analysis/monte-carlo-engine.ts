/**
 * PERITO IP — Capa 2.11: Motor Monte Carlo (MONTE_CARLO_ENGINE)
 * 
 * Reproducible mediante seed configurable.
 * Muestra P10, P25, P50, MEAN, P75, P90 como mínimo.
 * NO describe resultados como certezas.
 */

import Decimal from 'decimal.js';
import {
  MonteCarloInput,
  MonteCarloResult,
  ProbabilityDistribution,
  Currency,
  CalculationTrace,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface MonteCarloEngineInput {
  variables: MonteCarloInput[];
  calculationFn: (sampledValues: Record<string, Decimal>) => Decimal;
  iterations: number;
  seed: number;
  currency: Currency;
  valuationDate: string;
  modelVersion: string;
}

// ============================================================
// GENERADOR PSEUDOALEATORIO (Mulberry32 - reproducible con seed)
// ============================================================

function createRNG(seed: number): () => number {
  let state = seed | 0;
  return function() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// MUESTREO DE DISTRIBUCIONES
// ============================================================

function sampleFromDistribution(dist: ProbabilityDistribution, rng: () => number): number {
  switch (dist.type) {
    case 'fixed':
      return dist.params.value;

    case 'uniform': {
      const min = dist.params.min;
      const max = dist.params.max;
      return min + rng() * (max - min);
    }

    case 'triangular': {
      const min = dist.params.min;
      const mode = dist.params.mode;
      const max = dist.params.max;
      const u = rng();
      const fc = (mode - min) / (max - min);
      if (u < fc) {
        return min + Math.sqrt(u * (max - min) * (mode - min));
      } else {
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
      }
    }

    case 'normal': {
      // Box-Muller transform
      const mean = dist.params.mean;
      const stdDev = dist.params.stdDev;
      const u1 = rng();
      const u2 = rng();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return mean + z * stdDev;
    }

    case 'lognormal': {
      const mean = dist.params.mean;
      const stdDev = dist.params.stdDev;
      const u1 = rng();
      const u2 = rng();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.exp(mean + z * stdDev);
    }

    case 'beta': {
      // Simplified beta sampling using normal approximation for large alpha/beta
      const alpha = dist.params.alpha;
      const beta = dist.params.beta;
      const min = dist.params.min || 0;
      const max = dist.params.max || 1;
      const mean = alpha / (alpha + beta);
      const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
      const stdDev = Math.sqrt(variance);
      const u1 = rng();
      const u2 = rng();
      const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
      const sample = mean + z * stdDev;
      return min + Math.max(0, Math.min(1, sample)) * (max - min);
    }

    default:
      throw new Error(`PERITO_IP_ERROR: Distribución no soportada: ${dist.type}`);
  }
}

// ============================================================
// MOTOR MONTE CARLO
// ============================================================

/**
 * Ejecuta simulación Monte Carlo reproducible.
 * Mismo seed + mismas distribuciones = mismos resultados.
 */
export function monteCarloEngine(input: MonteCarloEngineInput): MonteCarloResult {
  const { variables, calculationFn, iterations, seed, currency, valuationDate, modelVersion } = input;
  const rng = createRNG(seed);
  const results: number[] = [];

  // Validaciones
  if (iterations < 100) {
    throw new Error('PERITO_IP_ERROR: Monte Carlo requiere al menos 100 iteraciones.');
  }

  if (variables.length === 0) {
    throw new Error('PERITO_IP_ERROR: Monte Carlo requiere al menos una variable.');
  }

  // Ejecutar simulación
  for (let i = 0; i < iterations; i++) {
    const sampledValues: Record<string, Decimal> = {};
    
    for (const variable of variables) {
      const sampled = sampleFromDistribution(variable.distribution, rng);
      sampledValues[variable.variableName] = new Decimal(sampled);
    }

    const result = calculationFn(sampledValues);
    results.push(result.toNumber());
  }

  // Ordenar para percentiles
  results.sort((a, b) => a - b);

  // Calcular percentiles
  const percentile = (p: number): Decimal => {
    const idx = Math.floor(results.length * p);
    return new Decimal(results[Math.min(idx, results.length - 1)]);
  };

  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const variance = results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length;
  const stdDev = Math.sqrt(variance);

  // Histograma (20 bins)
  const min = results[0];
  const max = results[results.length - 1];
  const binWidth = (max - min) / 20 || 1;
  const histogram: { binStart: number; binEnd: number; count: number }[] = [];
  
  for (let i = 0; i < 20; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = results.filter(r => r >= binStart && (i === 19 ? r <= binEnd : r < binEnd)).length;
    histogram.push({ binStart, binEnd, count });
  }

  // Verificar convergencia (comparar últimos 10% con media total)
  const last10Percent = results.slice(Math.floor(results.length * 0.9));
  const last10Mean = last10Percent.reduce((s, v) => s + v, 0) / last10Percent.length;
  const convergenceReached = Math.abs(last10Mean - mean) / Math.abs(mean || 1) < 0.05;

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('MC'),
    engine: 'analysis.monteCarloEngine',
    formula: 'Monte Carlo simulation with configurable distributions',
    valuationDate,
    currency,
    calculationVersion: modelVersion,
    createdAt: new Date().toISOString(),
    inputs: {
      seed: { value: seed.toString(), source: 'documented', justification: 'Seed para reproducibilidad' },
      iterations: { value: iterations.toString(), source: 'documented', justification: 'Número de iteraciones' },
      variables: {
        value: variables.map(v => `${v.variableName}:${v.distribution.type}`).join(', '),
        source: 'documented',
        justification: 'Variables probabilísticas',
      },
    },
    intermediateSteps: [],
    warnings: convergenceReached ? [] : ['ADVERTENCIA: La simulación puede no haber convergido. Considere aumentar iteraciones.'],
    confidenceLevel: convergenceReached ? 80 : 60,
    limitations: [
      'Los resultados son probabilísticos, NO certezas.',
      'La mediana (P50) es más robusta que la media ante distribuciones asimétricas.',
      'La calidad depende de las distribuciones de input.',
    ],
  };

  return {
    seed,
    iterations,
    modelVersion,
    percentiles: {
      p5: percentile(0.05),
      p10: percentile(0.10),
      p25: percentile(0.25),
      p50: percentile(0.50),
      p75: percentile(0.75),
      p90: percentile(0.90),
      p95: percentile(0.95),
    },
    mean: roundFinancial(new Decimal(mean)),
    stdDev: roundFinancial(new Decimal(stdDev)),
    min: roundFinancial(new Decimal(min)),
    max: roundFinancial(new Decimal(max)),
    histogram,
    convergenceReached,
    valuationDate,
    currency,
    trace,
  };
}
