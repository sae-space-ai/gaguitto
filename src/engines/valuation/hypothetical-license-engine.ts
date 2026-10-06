/**
 * PERITO IP — Capa 2.13: Motor de Licencia Hipotética (HYPOTHETICAL_LICENSE_ENGINE)
 * 
 * Separado de LOST_PROFITS_ENGINE.
 * Las tasas deben estar fundamentadas mediante: contratos, licencias comparables,
 * operaciones de mercado, fuentes verificables o hipótesis expresamente identificadas.
 * 
 * NO combinar automáticamente LOST PROFITS + HYPOTHETICAL LICENSE.
 * El sistema advierte cuando dos metodologías pueden causar doble contabilización.
 */

import Decimal from 'decimal.js';
import {
  Currency,
  CalculationTrace,
  DataBasis,
  RoyaltyBase,
  HypotheticalLicenseResult,
  generateCalculationId,
  toDecimal,
} from '../types';
import { presentValue, roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface HypotheticalLicenseInput {
  revenueProjections: {
    period: number;
    revenue: Decimal | number | string;
    basis: DataBasis;
    sourceId?: string;
    evidenceId?: string;
  }[];
  royaltyRate: Decimal | number | string;
  royaltyRateBasis: DataBasis;
  royaltyRateSource: string; // CONTRATO, COMPARABLE, MARKET_DATA, HYPOTHESIS
  royaltyRateEvidence?: string;
  royaltyRateAssumption?: string;
  royaltyRateRationale: string;
  royaltyBase: RoyaltyBase;
  taxRate: Decimal | number | string;
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  // Para detección de doble contabilización:
  relatedLostProfitsCalculationId?: string;
}

// ============================================================
// MOTOR LICENCIA HIPOTÉTICA
// ============================================================

/**
 * Calcula el valor de una licencia hipotética.
 * Alternativa metodológica a Lost Profits — NO se combinan automáticamente.
 */
export function hypotheticalLicenseEngine(input: HypotheticalLicenseInput): HypotheticalLicenseResult {
  const warnings: string[] = [];
  const royaltyRate = toDecimal(input.royaltyRate);
  const taxRate = toDecimal(input.taxRate);
  const k = toDecimal(input.discountRate);
  const currency = input.currency;

  // Validación crítica: la tasa DEBE tener fundamento
  if (!input.royaltyRateRationale) {
    throw new Error(
      'PERITO_IP_ERROR: La tasa de royalty hipotética DEBE tener una justificación explícita. ' +
      'NUNCA se inventa una tasa de licencia hipotética.'
    );
  }

  if (input.royaltyRateBasis === 'hypothesis' && !input.royaltyRateAssumption) {
    throw new Error(
      'PERITO_IP_ERROR: Si la tasa es hipótesis, debe tener justificación explícita.'
    );
  }

  // Advertencia de doble contabilización
  if (input.relatedLostProfitsCalculationId) {
    warnings.push(
      'ADVERTENCIA: Existe un cálculo de Lost Profits relacionado (' +
      `${input.relatedLostProfitsCalculationId}). ` +
      'NO combinar Lost Profits + Hypothetical License para el mismo derecho, ' +
      'ya que representan metodologías alternativas y pueden causar DOBLE CONTABILIZACIÓN.'
    );
  }

  // Calcular por período
  const periods: HypotheticalLicenseResult['periods'] = [];
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
      description: `Licencia hipotética período ${proj.period}`,
      sourceId: proj.sourceId,
      evidenceId: proj.evidenceId,
      basis: proj.basis,
    });

    periods.push({
      period: proj.period,
      revenue: roundFinancial(revenue),
      royaltySaving: roundFinancial(royaltySaving),
      presentValue: roundFinancial(pvResult.presentValue),
    });

    totalValue = totalValue.plus(pvResult.presentValue);

    steps.push({
      stepNumber: stepNum++,
      description: `P${proj.period}: Revenue=${revenue.toString()}, Royalty=${royaltySaving.toString()}, AfterTax=${afterTaxSaving.toString()}`,
      formula: `PV = ${afterTaxSaving.toString()} / (1+${k.toString()})^${proj.period}`,
      inputs: { revenue: revenue.toString(), rate: royaltyRate.toString() },
      result: pvResult.presentValue.toString(),
    });
  }

  if (input.royaltyRateBasis === 'hypothesis') {
    warnings.push('La tasa de royalty es una HIPÓTESIS. Resultado con menor fiabilidad.');
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('HLIC'),
    engine: 'valuation.hypotheticalLicenseEngine',
    formula: 'HL = Σ [Revenue_t × RoyaltyRate × (1-TaxRate) / (1+k)^t]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      royaltyRate: {
        value: royaltyRate.toString(),
        source: input.royaltyRateBasis,
        evidenceId: input.royaltyRateEvidence,
        assumptionId: input.royaltyRateAssumption,
        justification: `${input.royaltyRateRationale} (Fuente: ${input.royaltyRateSource})`,
      },
      taxRate: { value: taxRate.toString(), source: 'documented', justification: 'Tasa impositiva' },
      discountRate: { value: k.toString(), source: 'estimate', justification: 'Tasa de descuento' },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel: input.royaltyRateBasis === 'documented' ? 85 : input.royaltyRateBasis === 'comparable' ? 70 : 40,
    limitations: [
      `Tasa basada en: ${input.royaltyRateSource} (${input.royaltyRateBasis}).`,
      'Metodología alternativa a Lost Profits. No combinar para el mismo derecho.',
      'Es una licencia hipotética — no un contrato real.',
    ],
  };

  return {
    value: roundFinancial(totalValue),
    currency,
    royaltyRate,
    royaltyBase: input.royaltyBase,
    revenueBase: roundFinancial(input.revenueProjections.reduce((s, p) => s.plus(toDecimal(p.revenue)), new Decimal(0))),
    periods,
    taxRate,
    discountRate: k,
    trace,
    warnings,
  };
}
