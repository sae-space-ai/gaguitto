/**
 * PERITO IP — Capa 2.17: Motor de Sensibilidad (SENSITIVITY_ENGINE)
 * 
 * Identifica qué variables afectan más al resultado.
 * Responde:
 * - ¿Qué ocurre si esta variable aumenta/disminuye un 10%?
 * - ¿Cuáles son las cinco variables que más afectan?
 */

import Decimal from 'decimal.js';
import {
  SensitivityResult,
  Currency,
  CalculationTrace,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface SensitivityEngineInput {
  baseVariables: Record<string, Decimal | number | string>;
  calculationFn: (variables: Record<string, Decimal>) => Decimal;
  variablesToTest: string[];
  percentageChange?: number; // Default: 10%
  currency: Currency;
  valuationDate: string;
}

export interface SensitivityEngineResult {
  baseValue: Decimal;
  results: SensitivityResult[];
  topFive: SensitivityResult[];
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR DE SENSIBILIDAD
// ============================================================

/**
 * Analiza la sensibilidad del resultado a cambios en las variables.
 */
export function sensitivityEngine(input: SensitivityEngineInput): SensitivityEngineResult {
  const warnings: string[] = [];
  const pctChange = input.percentageChange ?? 10;
  const results: SensitivityResult[] = [];

  // Calcular valor base
  const baseVars: Record<string, Decimal> = {};
  for (const [key, val] of Object.entries(input.baseVariables)) {
    baseVars[key] = toDecimal(val);
  }
  const baseValue = input.calculationFn(baseVars);

  if (baseValue.isZero()) {
    warnings.push('ADVERTENCIA: El valor base es cero. La elasticidad no puede calcularse.');
  }

  // Probar cada variable
  for (const varName of input.variablesToTest) {
    const baseVarValue = baseVars[varName];
    if (!baseVarValue) {
      warnings.push(`Variable "${varName}" no encontrada en las variables base.`);
      continue;
    }

    // +10%
    const plusFactor = new Decimal(1).plus(new Decimal(pctChange).div(100));
    const varsPlus = { ...baseVars, [varName]: baseVarValue.times(plusFactor) };
    const valuePlus = input.calculationFn(varsPlus);

    // -10%
    const minusFactor = new Decimal(1).minus(new Decimal(pctChange).div(100));
    const varsMinus = { ...baseVars, [varName]: baseVarValue.times(minusFactor) };
    const valueMinus = input.calculationFn(varsMinus);

    // Elasticidad: (% cambio resultado) / (% cambio variable)
    let elasticity: Decimal;
    if (!baseValue.isZero()) {
      const pctChangeResult = valuePlus.minus(baseValue).div(baseValue).times(100);
      elasticity = pctChangeResult.div(pctChange);
    } else {
      elasticity = new Decimal(0);
    }

    results.push({
      variableName: varName,
      baseValue: roundFinancial(baseVarValue),
      impactPlus10: roundFinancial(valuePlus),
      impactMinus10: roundFinancial(valueMinus),
      elasticity: roundFinancial(elasticity),
      rank: 0, // Se asigna después
    });
  }

  // Ordenar por impacto absoluto (elasticidad)
  results.sort((a, b) => Math.abs(b.elasticity.toNumber()) - Math.abs(a.elasticity.toNumber()));

  // Asignar rank
  results.forEach((r, i) => { r.rank = i + 1; });

  const topFive = results.slice(0, 5);

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('SENS'),
    engine: 'analysis.sensitivityEngine',
    formula: `Elasticity = (%ΔResult) / (%ΔVariable) con Δ=${pctChange}%`,
    valuationDate: input.valuationDate,
    currency: input.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      baseValue: { value: baseValue.toString(), source: 'documented', justification: 'Valor base con variables originales' },
      percentageChange: { value: pctChange.toString(), source: 'documented', justification: 'Porcentaje de cambio para análisis' },
      variablesTested: { value: input.variablesToTest.join(', '), source: 'documented', justification: 'Variables analizadas' },
    },
    intermediateSteps: results.map((r, i) => ({
      stepNumber: i + 1,
      description: `${r.variableName}: base=${r.baseValue.toString()}, +${pctChange}%→${r.impactPlus10.toString()}, -${pctChange}%→${r.impactMinus10.toString()}`,
      formula: `Elasticity = ${r.elasticity.toString()}`,
      inputs: { variable: r.variableName, baseValue: r.baseValue.toString() },
      result: r.elasticity.toString(),
    })),
    warnings,
    confidenceLevel: 85,
    limitations: [
      'La sensibilidad es local (±10%). No captura efectos no lineales grandes.',
      'Las variables se modifican individualmente (no se analizan interacciones).',
    ],
  };

  return {
    baseValue: roundFinancial(baseValue),
    results,
    topFive,
    calculationTrace: trace,
    warnings,
  };
}
