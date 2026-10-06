/**
 * PERITO IP — Capa 2.8: Motor de Derechos de Adaptación
 * 
 * NO utiliza: VALOR DEL LIBRO + VALOR COMPLETO DE UNA PELÍCULA FUTURA
 * como cálculo automático.
 * 
 * Modela: NO_OPTION, OPTION, OPTION_RENEWAL, RIGHT_PURCHASE, PRODUCTION, EXPLOITATION
 * 
 * V_ADAPTATION = Σ(P_s × PV(CF_s))
 * Cada probabilidad procede de evidencia, datos históricos, modelo explícito o hipótesis.
 * NUNCA genera probabilidades silenciosamente mediante el LLM.
 */

import Decimal from 'decimal.js';
import {
  Currency,
  CalculationTrace,
  DataBasis,
  generateCalculationId,
  toDecimal,
} from '../types';
import { presentValue, roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export type AdaptationPhase =
  | 'NO_OPTION'
  | 'OPTION'
  | 'OPTION_RENEWAL'
  | 'RIGHT_PURCHASE'
  | 'PRODUCTION'
  | 'EXPLOITATION';

export interface AdaptationScenario {
  phase: AdaptationPhase;
  probability: Decimal | number | string;
  probabilityBasis: DataBasis;
  probabilitySource?: string;
  probabilityEvidence?: string;
  probabilityAssumption?: string;
  probabilityRationale: string;
  cashFlows: {
    period: number;
    amount: Decimal | number | string;
    description: string;
    basis: DataBasis;
    sourceId?: string;
    evidenceId?: string;
  }[];
}

export interface AdaptationRightsInput {
  scenarios: AdaptationScenario[];
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  description: string;
}

export interface AdaptationPhaseResult {
  phase: AdaptationPhase;
  probability: Decimal;
  probabilityBasis: DataBasis;
  probabilityRationale: string;
  expectedPV: Decimal;
  cashFlowPV: Decimal;
  cashFlows: { period: number; amount: Decimal; pv: Decimal }[];
}

export interface AdaptationRightsResult {
  phases: AdaptationPhaseResult[];
  totalValue: Decimal;
  currency: Currency;
  valuationDate: string;
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR DE ADAPTACIÓN
// ============================================================

/**
 * Calcula el valor de derechos de adaptación ponderando cada fase
 * por su probabilidad explícita.
 * 
 * V = Σ_fases [P(fase) × Σ_t (CF_t / (1+k)^t)]
 */
export function adaptationRightsEngine(input: AdaptationRightsInput): AdaptationRightsResult {
  const warnings: string[] = [];
  const k = toDecimal(input.discountRate);
  const currency = input.currency;
  const phases: AdaptationPhaseResult[] = [];
  let totalValue = new Decimal(0);
  const steps: { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] = [];
  let stepNum = 1;

  // Validar que las probabilidades sumen ≤ 1 (en fases mutuamente excluyentes)
  // Nota: no todas las fases son mutuamente excluyentes, pero verificamos coherencia
  const totalProb = input.scenarios.reduce(
    (s, sc) => s.plus(toDecimal(sc.probability)),
    new Decimal(0)
  );

  if (totalProb.gt(new Decimal(1.01))) { // Tolerancia mínima por redondeo
    warnings.push(`ADVERTENCIA: La suma de probabilidades (${totalProb.toString()}) excede 1. Revise si las fases son mutuamente excluyentes.`);
  }

  for (const scenario of input.scenarios) {
    const prob = toDecimal(scenario.probability);

    // Validar probabilidad
    if (prob.lt(0) || prob.gt(1)) {
      throw new Error(
        `PERITO_IP_ERROR: La probabilidad de la fase ${scenario.phase} debe estar entre 0 y 1. ` +
        `Recibido: ${prob.toString()}. NUNCA se generan probabilidades automáticamente.`
      );
    }

    // Validar que la probabilidad tenga justificación
    if (!scenario.probabilityRationale) {
      throw new Error(
        `PERITO_IP_ERROR: La probabilidad de ${scenario.phase} debe tener una justificación explícita. ` +
        `NUNCA se generan probabilidades silenciosamente.`
      );
    }

    // Calcular PV de los flujos de esta fase
    const cashFlowResults: { period: number; amount: Decimal; pv: Decimal }[] = [];
    let phasePV = new Decimal(0);

    for (const cf of scenario.cashFlows) {
      const amount = toDecimal(cf.amount);
      const pvResult = presentValue({
        cashFlow: amount,
        period: cf.period,
        discountRate: k,
        currency,
        valuationDate: input.valuationDate,
        description: `${scenario.phase} P${cf.period}: ${cf.description}`,
        sourceId: cf.sourceId,
        evidenceId: cf.evidenceId,
        basis: cf.basis,
      });

      cashFlowResults.push({
        period: cf.period,
        amount,
        pv: pvResult.presentValue,
      });

      phasePV = phasePV.plus(pvResult.presentValue);
    }

    // Valor esperado = Probabilidad × PV
    const expectedPV = prob.times(phasePV);

    phases.push({
      phase: scenario.phase,
      probability: prob,
      probabilityBasis: scenario.probabilityBasis,
      probabilityRationale: scenario.probabilityRationale,
      expectedPV: roundFinancial(expectedPV),
      cashFlowPV: roundFinancial(phasePV),
      cashFlows: cashFlowResults.map(cf => ({
        period: cf.period,
        amount: roundFinancial(cf.amount),
        pv: roundFinancial(cf.pv),
      })),
    });

    totalValue = totalValue.plus(expectedPV);

    steps.push({
      stepNumber: stepNum++,
      description: `Fase ${scenario.phase}: P=${prob.toString()}, PV_flujos=${phasePV.toString()}`,
      formula: `Expected = P × PV = ${prob.toString()} × ${phasePV.toString()}`,
      inputs: { probability: prob.toString(), phasePV: phasePV.toString() },
      result: expectedPV.toString(),
    });
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('ADAPT'),
    engine: 'valuation.adaptationRightsEngine',
    formula: 'V = Σ_fases [P(fase) × Σ_t (CF_t / (1+k)^t)]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      discountRate: { value: k.toString(), source: 'estimate', justification: 'Tasa de descuento' },
      numberOfPhases: { value: input.scenarios.length.toString(), source: 'documented', justification: 'Fases de adaptación modeladas' },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel: calculateAdaptationConfidence(input),
    limitations: [
      'Las probabilidades deben proceder de evidencia, datos históricos o hipótesis explícitas.',
      'No se suma automáticamente el valor del libro + valor de una película futura.',
      'Cada fase tiene su propia justificación de probabilidad.',
    ],
  };

  return {
    phases,
    totalValue: roundFinancial(totalValue),
    currency,
    valuationDate: input.valuationDate,
    calculationTrace: trace,
    warnings,
  };
}

function calculateAdaptationConfidence(input: AdaptationRightsInput): number {
  const documented = input.scenarios.filter(s => s.probabilityBasis === 'documented').length;
  const hypothesis = input.scenarios.filter(s => s.probabilityBasis === 'hypothesis').length;
  const total = input.scenarios.length;
  
  if (total === 0) return 0;
  
  const baseConfidence = (documented / total) * 80;
  const hypothesisPenalty = (hypothesis / total) * 30;
  
  return Math.max(5, Math.round(baseConfidence + 20 - hypothesisPenalty));
}
