/**
 * PERITO IP — Capa 2.9: Relief from Royalty Engine
 * 
 * ROYALTY_SAVING_t = REVENUE_t × ROYALTY_RATE
 * AFTER_TAX_ROYALTY_SAVING_t = ROYALTY_SAVING_t × (1 - TAX_RATE)
 * RFR_VALUE = Σ(AFTER_TAX_ROYALTY_SAVING_t / (1 + k)^t)
 * 
 * Toda tasa de royalty debe estar vinculada a:
 * - contrato, licencia comparable, base de datos, evidencia de mercado, o hipótesis explícita
 * 
 * NUNCA permite que el LLM invente una tasa y la presente como dato de mercado.
 */

import Decimal from 'decimal.js';
import {
  Currency,
  CalculationTrace,
  DataBasis,
  RoyaltyBase,
  generateCalculationId,
  toDecimal,
} from '../types';
import { presentValue, roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface ReliefFromRoyaltyInput {
  revenueProjections: {
    period: number;
    revenue: Decimal | number | string;
    basis: DataBasis;
    sourceId?: string;
    evidenceId?: string;
  }[];
  royaltyRate: Decimal | number | string;
  royaltyRateBasis: DataBasis;
  royaltyRateSource: string; // Contrato, comparable, base de datos, hipótesis
  royaltyRateEvidence?: string;
  royaltyRateAssumption?: string;
  royaltyBase: RoyaltyBase;
  taxRate: Decimal | number | string;
  taxRateBasis: DataBasis;
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
}

export interface ReliefFromRoyaltyResult {
  periods: {
    period: number;
    revenue: Decimal;
    royaltySaving: Decimal;
    afterTaxSaving: Decimal;
    presentValue: Decimal;
  }[];
  totalValue: Decimal;
  royaltyRate: Decimal;
  taxRate: Decimal;
  discountRate: Decimal;
  currency: Currency;
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR RELIEF FROM ROYALTY
// ============================================================

/**
 * Calcula el valor de Relief from Royalty (ahorro de royalties).
 * 
 * Representa el valor de poseer un activo IP en vez de tener que licenciarlo.
 */
export function reliefFromRoyaltyEngine(input: ReliefFromRoyaltyInput): ReliefFromRoyaltyResult {
  const warnings: string[] = [];
  const royaltyRate = toDecimal(input.royaltyRate);
  const taxRate = toDecimal(input.taxRate);
  const k = toDecimal(input.discountRate);
  const currency = input.currency;

  // Validación crítica: la tasa de royalty DEBE tener fundamento
  if (!input.royaltyRateSource) {
    throw new Error(
      'PERITO_IP_ERROR: La tasa de royalty DEBE estar vinculada a una fuente: ' +
      'contrato, licencia comparable, base de datos, evidencia de mercado o hipótesis explícita. ' +
      'NUNCA se inventa una tasa de royalty.'
    );
  }

  if (input.royaltyRateBasis === 'hypothesis' && !input.royaltyRateAssumption) {
    throw new Error(
      'PERITO_IP_ERROR: Si la tasa de royalty es una hipótesis, debe tener una justificación explícita.'
    );
  }

  // Validar tasas
  if (royaltyRate.lt(0) || royaltyRate.gt(1)) {
    warnings.push(`ADVERTENCIA: Tasa de royalty ${royaltyRate.toString()} fuera del rango habitual (0-100%).`);
  }

  if (taxRate.lt(0) || taxRate.gt(1)) {
    throw new Error(`PERITO_IP_ERROR: La tasa impositiva debe estar entre 0 y 1. Recibido: ${taxRate.toString()}`);
  }

  // Calcular por período
  const periods: ReliefFromRoyaltyResult['periods'] = [];
  let totalValue = new Decimal(0);
  const steps: { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] = [];
  let stepNum = 1;

  for (const proj of input.revenueProjections) {
    const revenue = toDecimal(proj.revenue);

    // ROYALTY_SAVING = REVENUE × ROYALTY_RATE
    const royaltySaving = revenue.times(royaltyRate);

    // AFTER_TAX = SAVING × (1 - TAX_RATE)
    const afterTaxSaving = royaltySaving.times(new Decimal(1).minus(taxRate));

    // PV
    const pvResult = presentValue({
      cashFlow: afterTaxSaving,
      period: proj.period,
      discountRate: k,
      currency,
      valuationDate: input.valuationDate,
      description: `RFR período ${proj.period}`,
      sourceId: proj.sourceId,
      evidenceId: proj.evidenceId,
      basis: proj.basis,
    });

    periods.push({
      period: proj.period,
      revenue: roundFinancial(revenue),
      royaltySaving: roundFinancial(royaltySaving),
      afterTaxSaving: roundFinancial(afterTaxSaving),
      presentValue: roundFinancial(pvResult.presentValue),
    });

    totalValue = totalValue.plus(pvResult.presentValue);

    steps.push({
      stepNumber: stepNum++,
      description: `P${proj.period}: Revenue=${revenue.toString()}, Saving=${royaltySaving.toString()}, AfterTax=${afterTaxSaving.toString()}`,
      formula: `PV = ${afterTaxSaving.toString()} / (1+${k.toString()})^${proj.period}`,
      inputs: { revenue: revenue.toString(), rate: royaltyRate.toString(), tax: taxRate.toString() },
      result: pvResult.presentValue.toString(),
    });
  }

  if (input.royaltyRateBasis === 'hypothesis') {
    warnings.push('La tasa de royalty utilizada es una HIPÓTESIS. El resultado debe interpretarse con cautela.');
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('RFR'),
    engine: 'valuation.reliefFromRoyaltyEngine',
    formula: 'RFR = Σ [Revenue_t × RoyaltyRate × (1-TaxRate) / (1+k)^t]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      royaltyRate: {
        value: royaltyRate.toString(),
        source: input.royaltyRateBasis,
        sourceId: input.royaltyRateEvidence,
        assumptionId: input.royaltyRateAssumption,
        justification: `Tasa de royalty. Fuente: ${input.royaltyRateSource}`,
      },
      taxRate: {
        value: taxRate.toString(),
        source: input.taxRateBasis,
        justification: 'Tasa impositiva aplicable',
      },
      discountRate: {
        value: k.toString(),
        source: 'estimate',
        justification: 'Tasa de descuento',
      },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel: input.royaltyRateBasis === 'documented' ? 85 : input.royaltyRateBasis === 'comparable' ? 70 : 40,
    limitations: [
      `Tasa de royalty basada en: ${input.royaltyRateSource} (${input.royaltyRateBasis}).`,
      'El RFR es un método alternativo. No combinar con Lost Profits para el mismo derecho.',
    ],
  };

  return {
    periods,
    totalValue: roundFinancial(totalValue),
    royaltyRate,
    taxRate,
    discountRate: k,
    currency,
    calculationTrace: trace,
    warnings,
  };
}
