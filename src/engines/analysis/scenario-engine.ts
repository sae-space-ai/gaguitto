/**
 * PERITO IP — Capa 2.10: Motor de Escenarios (SCENARIO_ENGINE)
 * 
 * Soporta: CONSERVATIVE, BASE, EXPANSIVE
 * Cada escenario conserva: inputs, assumptions, sources, calculation, result, confidence, limitations.
 * No describe un escenario como predicción cierta.
 */

import Decimal from 'decimal.js';
import {
  ScenarioType,
  ScenarioVariable,
  ScenarioResult,
  Currency,
  CalculationTrace,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface ScenarioEngineInput {
  scenarios: {
    type: ScenarioType;
    variables: ScenarioVariable[];
    calculationFn: (variables: Record<string, Decimal>) => Decimal;
    assumptions: string[];
    limitations: string[];
  }[];
  currency: Currency;
  valuationDate: string;
  description: string;
}

export interface ScenarioComparisonResult {
  scenarios: ScenarioResult[];
  comparison: {
    conservative: Decimal | null;
    base: Decimal | null;
    expansive: Decimal | null;
    spread: Decimal | null; // expansive - conservative
    spreadPercentage: Decimal | null;
  };
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR DE ESCENARIOS
// ============================================================

/**
 * Calcula múltiples escenarios y los compara.
 * Cada escenario es independiente y modifica variables.
 */
export function scenarioEngine(input: ScenarioEngineInput): ScenarioComparisonResult {
  const warnings: string[] = [];
  const results: ScenarioResult[] = [];

  for (const scenario of input.scenarios) {
    // Construir mapa de variables
    const varMap: Record<string, Decimal> = {};
    for (const v of scenario.variables) {
      varMap[v.name] = toDecimal(v.value);
    }

    // Ejecutar función de cálculo
    const value = scenario.calculationFn(varMap);

    // Calcular confianza
    const documentedVars = scenario.variables.filter(v => v.source === 'documented').length;
    const hypothesisVars = scenario.variables.filter(v => v.source === 'hypothesis').length;
    const totalVars = scenario.variables.length;
    const confidenceLevel = totalVars > 0
      ? Math.round(((documentedVars / totalVars) * 80) + 20 - (hypothesisVars * 5))
      : 50;

    const trace: CalculationTrace = {
      calculationId: generateCalculationId(`SCEN_${scenario.type}`),
      engine: 'analysis.scenarioEngine',
      formula: 'Scenario-specific calculation function',
      valuationDate: input.valuationDate,
      currency: input.currency,
      calculationVersion: '1.0.0',
      createdAt: new Date().toISOString(),
      inputs: Object.fromEntries(
        scenario.variables.map(v => [v.name, {
          value: toDecimal(v.value).toString(),
          source: v.source,
          sourceId: v.sourceId,
          evidenceId: v.evidenceId,
          assumptionId: v.assumptionId,
          justification: v.justification,
        }])
      ),
      intermediateSteps: [],
      warnings: [],
      confidenceLevel: Math.max(5, Math.min(100, confidenceLevel)),
      limitations: scenario.limitations,
    };

    results.push({
      type: scenario.type,
      value: roundFinancial(value),
      currency: input.currency,
      inputs: scenario.variables,
      assumptions: scenario.assumptions,
      limitations: scenario.limitations,
      confidenceLevel: Math.max(5, Math.min(100, confidenceLevel)),
      trace,
    });
  }

  // Comparación
  const conservative = results.find(r => r.type === 'conservative');
  const base = results.find(r => r.type === 'base');
  const expansive = results.find(r => r.type === 'expansive');

  let spread: Decimal | null = null;
  let spreadPercentage: Decimal | null = null;

  if (conservative && expansive) {
    spread = expansive.value.minus(conservative.value);
    if (conservative.value.gt(0)) {
      spreadPercentage = spread.div(conservative.value).times(100);
    }
  }

  if (results.length < 3) {
    warnings.push(`Solo ${results.length} de 3 escenarios definidos. Se recomienda definir los tres.`);
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('SCEN_CMP'),
    engine: 'analysis.scenarioEngine.comparison',
    formula: 'Comparison of scenario results',
    valuationDate: input.valuationDate,
    currency: input.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      numberOfScenarios: { value: results.length.toString(), source: 'documented', justification: 'Escenarios calculados' },
    },
    intermediateSteps: results.map((r, i) => ({
      stepNumber: i + 1,
      description: `Escenario ${r.type}: ${r.value.toString()} (confianza: ${r.confidenceLevel}%)`,
      formula: 'Scenario calculation',
      inputs: { type: r.type },
      result: r.value.toString(),
    })),
    warnings,
    confidenceLevel: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.confidenceLevel, 0) / results.length) : 0,
    limitations: [
      'Los escenarios NO son predicciones ciertas.',
      'Representan rangos de posibilidades basados en hipótesis variables.',
    ],
  };

  return {
    scenarios: results,
    comparison: {
      conservative: conservative?.value || null,
      base: base?.value || null,
      expansive: expansive?.value || null,
      spread: spread ? roundFinancial(spread) : null,
      spreadPercentage: spreadPercentage ? roundFinancial(spreadPercentage) : null,
    },
    calculationTrace: trace,
    warnings,
  };
}
