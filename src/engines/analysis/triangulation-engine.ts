/**
 * PERITO IP — Capa 2.16: Motor de Triangulación (VALUATION_TRIANGULATION_ENGINE)
 * 
 * Compara: COST_VALUE, MARKET_VALUE, INCOME_VALUE, RFR_VALUE, PROBABILISTIC_RESULTS
 * NO utiliza automáticamente una media aritmética.
 * Genera: LOWER_DEFENSIBLE_RANGE, CENTRAL_REASONED_VALUE, UPPER_DEFENSIBLE_RANGE,
 * CONFIDENCE_LEVEL, KEY_VALUE_DRIVERS, KEY_RISKS
 */

import Decimal from 'decimal.js';
import {
  TriangulationInput,
  TriangulationResult,
  Currency,
  CalculationTrace,
  ValuationMethod,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface TriangulationEngineInput {
  valuations: TriangulationInput[];
  currency: Currency;
  valuationDate: string;
  evidenceQualityAssessment: {
    cost: string;
    market: string;
    income: string;
    probabilistic: string;
  };
}

// ============================================================
// MOTOR DE TRIANGULACIÓN
// ============================================================

/**
 * Triangula resultados de múltiples métodos de valoración.
 * NO es una media aritmética automática.
 * Pondera según calidad de evidencia disponible.
 */
export function valuationTriangulationEngine(input: TriangulationEngineInput): TriangulationResult {
  if (input.valuations.length === 0) {
    throw new Error('PERITO_IP_ERROR: Se requiere al menos un método de valoración para triangular.');
  }

  // 1. Determinar pesos según calidad de evidencia
  const weights = determineWeights(input.valuations, input.evidenceQualityAssessment);

  // 2. Normalizar pesos (suma = 1)
  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
  const normalizedWeights: Record<string, Decimal> = {};
  for (const [method, weight] of Object.entries(weights)) {
    normalizedWeights[method] = totalWeight > 0 ? new Decimal(weight).div(totalWeight) : new Decimal(0);
  }

  // 3. Calcular valor central ponderado
  let centralValue = new Decimal(0);
  for (const v of input.valuations) {
    const weight = normalizedWeights[v.method] || new Decimal(0);
    centralValue = centralValue.plus(v.value.times(weight));
  }

  // 4. Rango defendible
  const values = input.valuations.map(v => v.value).sort((a, b) => a.minus(b).toNumber());
  
  // Lower bound: mínimo de los métodos con peso significativo, o valor más conservador
  const significantMethods = input.valuations.filter(v => {
    const w = normalizedWeights[v.method] || new Decimal(0);
    return w.gt(0.1); // Métodos con peso > 10%
  });
  
  const lowerBound = significantMethods.length > 0
    ? Decimal.min(...significantMethods.map(v => v.value))
    : values[0];

  const upperBound = significantMethods.length > 0
    ? Decimal.max(...significantMethods.map(v => v.value))
    : values[values.length - 1];

  // 5. Nivel de confianza global
  const avgConfidence = input.valuations.reduce((s, v) => s + v.confidenceLevel, 0) / input.valuations.length;
  const methodDiversity = input.valuations.length >= 3 ? 10 : input.valuations.length >= 2 ? 5 : 0;
  const confidenceLevel = Math.min(100, Math.round(avgConfidence + methodDiversity));

  // 6. Key drivers y risks
  const keyDrivers = identifyKeyDrivers(input.valuations, normalizedWeights);
  const keyRisks = identifyKeyRisks(input.valuations);

  // 7. Metodología
  const methodologyNotes = generateMethodologyNotes(input.valuations, normalizedWeights, input.evidenceQualityAssessment);

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('TRI'),
    engine: 'analysis.valuationTriangulationEngine',
    formula: 'Central = Σ(value_i × weight_i); Range = [min_significant, max_significant]',
    valuationDate: input.valuationDate,
    currency: input.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      methods: {
        value: input.valuations.map(v => `${v.method}:${v.value.toString()}`).join('; '),
        source: 'documented',
        justification: 'Resultados de métodos de valoración',
      },
      weights: {
        value: JSON.stringify(Object.fromEntries(
          Object.entries(normalizedWeights).map(([k, v]) => [k, v.toString()])
        )),
        source: 'estimate',
        justification: 'Pesos determinados por calidad de evidencia',
      },
    },
    intermediateSteps: input.valuations.map((v, i) => ({
      stepNumber: i + 1,
      description: `${v.method}: value=${v.value.toString()}, weight=${(normalizedWeights[v.method] || new Decimal(0)).toString()}`,
      formula: `${v.value.toString()} × ${(normalizedWeights[v.method] || new Decimal(0)).toString()}`,
      inputs: { value: v.value.toString(), weight: (normalizedWeights[v.method] || new Decimal(0)).toString() },
      result: v.value.times(normalizedWeights[v.method] || new Decimal(0)).toString(),
    })),
    warnings: input.valuations.length < 2 ? ['Solo un método disponible. La triangulación requiere al menos 2 métodos.'] : [],
    confidenceLevel,
    limitations: [
      'La triangulación no es una media aritmética automática.',
      'Los pesos reflejan la calidad de evidencia de cada método.',
      'El rango defendible no es un intervalo de confianza estadístico.',
    ],
  };

  return {
    inputs: input.valuations.map(v => ({
      ...v,
      weight: normalizedWeights[v.method] || new Decimal(0),
    })),
    lowerBound: roundFinancial(lowerBound),
    centralValue: roundFinancial(centralValue),
    upperBound: roundFinancial(upperBound),
    confidenceLevel,
    keyDrivers,
    keyRisks,
    methodologyNotes,
    trace,
  };
}

// ============================================================
// UTILIDADES
// ============================================================

function determineWeights(
  valuations: TriangulationInput[],
  quality: TriangulationEngineInput['evidenceQualityAssessment']
): Record<string, number> {
  const weights: Record<string, number> = {};

  for (const v of valuations) {
    let weight = 0;

    // Peso base por método según evidencia disponible
    switch (v.method) {
      case 'cost_historical':
      case 'cost_reproduction':
      case 'cost_replacement':
        weight = quality.cost === 'strong' ? 0.3 : quality.cost === 'moderate' ? 0.2 : 0.1;
        break;
      case 'market_comparables':
        weight = quality.market === 'strong' ? 0.35 : quality.market === 'moderate' ? 0.2 : 0.05;
        break;
      case 'income_dcf':
      case 'income_royalty':
        weight = quality.income === 'strong' ? 0.35 : quality.income === 'moderate' ? 0.25 : 0.1;
        break;
      case 'relief_from_royalty':
        weight = quality.income === 'strong' ? 0.25 : 0.15;
        break;
      case 'probabilistic':
        weight = quality.probabilistic === 'strong' ? 0.2 : 0.1;
        break;
      default:
        weight = 0.1;
    }

    // Ajustar por confianza del método
    weight *= (v.confidenceLevel / 100);

    weights[v.method] = weight;
  }

  return weights;
}

function identifyKeyDrivers(valuations: TriangulationInput[], weights: Record<string, Decimal>): string[] {
  const drivers: string[] = [];
  
  // El método con mayor peso es el driver principal
  const sortedMethods = Object.entries(weights)
    .sort(([, a], [, b]) => b.minus(a).toNumber());
  
  if (sortedMethods.length > 0) {
    drivers.push(`Método principal: ${sortedMethods[0][0]} (peso: ${sortedMethods[0][1].times(100).toFixed(0)}%)`);
  }

  // Agregar limitaciones de evidencia
  for (const v of valuations) {
    if (v.evidenceQuality === 'weak') {
      drivers.push(`Evidencia débil en ${v.method}: ${v.limitations.join(', ')}`);
    }
  }

  return drivers.slice(0, 5);
}

function identifyKeyRisks(valuations: TriangulationInput[]): string[] {
  const risks: string[] = [];
  
  for (const v of valuations) {
    for (const lim of v.limitations) {
      risks.push(`${v.method}: ${lim}`);
    }
  }

  // Dispersión entre métodos
  const values = valuations.map(v => v.value);
  if (values.length >= 2) {
    const max = Decimal.max(...values);
    const min = Decimal.min(...values);
    const spread = max.minus(min);
    if (min.gt(0)) {
      const spreadPct = spread.div(min).times(100);
      if (spreadPct.gt(50)) {
        risks.push(`Alta dispersión entre métodos: ${spreadPct.toFixed(0)}% de diferencia entre el valor más alto y el más bajo.`);
      }
    }
  }

  return risks.slice(0, 5);
}

function generateMethodologyNotes(
  valuations: TriangulationInput[],
  weights: Record<string, Decimal>,
  quality: TriangulationEngineInput['evidenceQualityAssessment']
): string {
  const notes: string[] = [];
  
  notes.push(`Se han utilizado ${valuations.length} métodos de valoración.`);
  
  const sortedMethods = Object.entries(weights).sort(([, a], [, b]) => b.minus(a).toNumber());
  for (const [method, weight] of sortedMethods) {
    if (weight.gt(0)) {
      notes.push(`${method}: peso ${weight.times(100).toFixed(0)}% (evidencia: ${quality[method as keyof typeof quality] || 'no evaluada'}).`);
    }
  }

  notes.push('El valor central es ponderado por la calidad de evidencia de cada método, no una media simple.');
  notes.push('El rango defendible se basa en los valores de métodos con peso significativo (>10%).');

  return notes.join(' ');
}
