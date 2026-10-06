/**
 * PERITO IP — Capa 2.12: Motor de Lucro Cesante (LOST_PROFITS_ENGINE)
 * 
 * Dos escenarios: BUT_FOR (lo que habría ocurrido) vs ACTUAL (lo que ocurrió)
 * LOST_PROFIT_t = BUT_FOR_NET_CASH_FLOW_t - ACTUAL_NET_CASH_FLOW_t
 * 
 * El escenario BUT_FOR NO puede ser inventado silenciosamente.
 * Cada variable contrafactual debe contener source, evidence, assumption, rationale, confidence.
 */

import Decimal from 'decimal.js';
import {
  Currency,
  CalculationTrace,
  DataBasis,
  TraceInput,
  LostProfitsResult,
  LostProfitsPeriod,
  generateCalculationId,
  toDecimal,
} from '../types';
import { presentValue, roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface LostProfitsInput {
  periods: {
    period: number;
    butFor: {
      revenue: Decimal | number | string;
      costs: Decimal | number | string;
      variables: Record<string, TraceInput>;
      rationale: string;
    };
    actual: {
      revenue: Decimal | number | string;
      costs: Decimal | number | string;
      variables: Record<string, TraceInput>;
      rationale: string;
    };
  }[];
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  jurisdiction?: string;
  assumptions: { id: string; description: string; basis: DataBasis; rationale: string }[];
}

// ============================================================
// MOTOR LUCRO CESANTE
// ============================================================

/**
 * Calcula el lucro cesante comparando escenario BUT_FOR vs ACTUAL.
 * Cada variable del escenario contrafactual debe estar justificada.
 */
export function lostProfitsEngine(input: LostProfitsInput): LostProfitsResult {
  const k = toDecimal(input.discountRate);
  const currency = input.currency;
  const periodResults: LostProfitsPeriod[] = [];
  let totalLostProfits = new Decimal(0);
  const steps: { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] = [];
  const warnings: string[] = [];
  let stepNum = 1;

  // Validar que el escenario BUT_FOR esté justificado
  for (const period of input.periods) {
    if (!period.butFor.rationale) {
      throw new Error(
        `PERITO_IP_ERROR: El escenario BUT_FOR del período ${period.period} DEBE tener una justificación. ` +
        `NUNCA se inventa un escenario contrafactual silenciosamente.`
      );
    }

    const butForRevenue = toDecimal(period.butFor.revenue);
    const butForCosts = toDecimal(period.butFor.costs);
    const actualRevenue = toDecimal(period.actual.revenue);
    const actualCosts = toDecimal(period.actual.costs);

    // Net cash flows
    const butForNetCF = butForRevenue.minus(butForCosts);
    const actualNetCF = actualRevenue.minus(actualCosts);

    // Lost profit
    const lostProfit = butForNetCF.minus(actualNetCF);

    // PV del lucro cesante
    const pvResult = presentValue({
      cashFlow: lostProfit,
      period: period.period,
      discountRate: k,
      currency,
      valuationDate: input.valuationDate,
      description: `Lucro cesante período ${period.period}`,
      basis: 'hypothesis',
    });

    // Identificar diferencias
    const differences: string[] = [];
    if (!butForRevenue.equals(actualRevenue)) {
      differences.push(`Ingresos: BUT_FOR=${butForRevenue.toString()} vs ACTUAL=${actualRevenue.toString()}`);
    }
    if (!butForCosts.equals(actualCosts)) {
      differences.push(`Costes: BUT_FOR=${butForCosts.toString()} vs ACTUAL=${actualCosts.toString()}`);
    }

    periodResults.push({
      period: period.period,
      butForCashFlow: roundFinancial(butForNetCF),
      actualCashFlow: roundFinancial(actualNetCF),
      lostProfit: roundFinancial(lostProfit),
      butForVariables: period.butFor.variables,
      actualVariables: period.actual.variables,
      differences,
    });

    totalLostProfits = totalLostProfits.plus(pvResult.presentValue);

    steps.push({
      stepNumber: stepNum++,
      description: `P${period.period}: BUT_FOR=${butForNetCF.toString()}, ACTUAL=${actualNetCF.toString()}, Lost=${lostProfit.toString()}`,
      formula: `LP = ${butForNetCF.toString()} - ${actualNetCF.toString()} = ${lostProfit.toString()}`,
      inputs: { butFor: butForNetCF.toString(), actual: actualNetCF.toString() },
      result: pvResult.presentValue.toString(),
    });
  }

  if (periodResults.some(p => p.lostProfit.lt(0))) {
    warnings.push('ADVERTENCIA: Algunos períodos muestran lucro cesante negativo (el actual supera al contrafactual).');
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('LP'),
    engine: 'valuation.lostProfitsEngine',
    formula: 'LP = Σ [(BUT_FOR_CF_t - ACTUAL_CF_t) / (1+k)^t]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      discountRate: { value: k.toString(), source: 'estimate', justification: 'Tasa de descuento' },
      numberOfPeriods: { value: input.periods.length.toString(), source: 'documented', justification: 'Períodos analizados' },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel: calculateLPConfidence(input),
    limitations: [
      'El escenario BUT_FOR es contrafactual y contiene incertidumbre inherente.',
      'No combinar automáticamente con hypothetical_license para el mismo derecho.',
      'La existencia de infracción y la cuantificación son cuestiones distintas.',
    ],
  };

  return {
    totalLostProfits: roundFinancial(totalLostProfits),
    currency,
    valuationDate: input.valuationDate,
    periods: periodResults,
    discountRate: k,
    trace,
  };
}

function calculateLPConfidence(input: LostProfitsInput): number {
  // La confianza depende de la calidad de las variables BUT_FOR
  let documentedCount = 0;
  let totalCount = 0;

  for (const period of input.periods) {
    const vars = Object.values(period.butFor.variables);
    totalCount += vars.length;
    documentedCount += vars.filter(v => v.source === 'documented').length;
  }

  const ratio = totalCount > 0 ? documentedCount / totalCount : 0;
  return Math.max(10, Math.round(20 + ratio * 60)); // Base baja por ser contrafactual
}
