/**
 * PERITO IP — Capa 2.6: Motor Editorial (BOOK_VALUATION_ENGINE)
 * 
 * Separa modalidades: PRINT, EBOOK, AUDIOBOOK, TRANSLATIONS,
 * TERRITORIES, LICENSES, ADAPTATION_RIGHTS, OTHER_DERIVATIVE_RIGHTS
 * 
 * Modelo: ROYALTY_t = ROYALTY_BASE_t × ROYALTY_RATE_t
 * CF_t = ROYALTY_t + OTHER_INCOME_t - ATTRIBUTABLE_COSTS_t
 * V_EDITORIAL = Σ(CF_t / (1 + k)^t)
 * 
 * Cada modalidad se calcula independientemente.
 * NO se suman derechos que no pertenezcan al titular.
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

export type EditorialModality =
  | 'PRINT'
  | 'EBOOK'
  | 'AUDIOBOOK'
  | 'TRANSLATIONS'
  | 'TERRITORIES'
  | 'LICENSES'
  | 'ADAPTATION_RIGHTS'
  | 'OTHER_DERIVATIVE_RIGHTS';

export interface EditorialStream {
  modality: EditorialModality;
  territory?: string;
  language?: string;
  format?: string;
  projections: {
    period: number;
    royaltyBase: Decimal | number | string;
    royaltyRate: Decimal | number | string;
    otherIncome?: Decimal | number | string;
    attributableCosts?: Decimal | number | string;
    basis: DataBasis;
    sourceId?: string;
    evidenceId?: string;
  }[];
  rightsHolder: string; // Quién posee estos derechos
  contractRef?: string;
}

export interface BookValuationInput {
  streams: EditorialStream[];
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  // Derechos que PERTENECEN al titular que se valora
  rightsOwned: EditorialModality[];
  territoriesOwned?: string[];
  languagesOwned?: string[];
  assumptions: { id: string; description: string; basis: DataBasis }[];
}

export interface BookValuationResult {
  modalities: {
    modality: EditorialModality;
    cashFlows: { period: number; royalty: Decimal; otherIncome: Decimal; costs: Decimal; netCF: Decimal; pv: Decimal }[];
    totalPV: Decimal;
    included: boolean;
    reason?: string;
  }[];
  totalValue: Decimal;
  currency: Currency;
  valuationDate: string;
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR EDITORIAL
// ============================================================

/**
 * Valora derechos editoriales calculando cada modalidad independientemente.
 * Solo incluye derechos que pertenezcan al titular según rightsOwned.
 */
export function bookValuationEngine(input: BookValuationInput): BookValuationResult {
  const warnings: string[] = [];
  const k = toDecimal(input.discountRate);
  const currency = input.currency;
  const modalities: BookValuationResult['modalities'] = [];
  let totalValue = new Decimal(0);
  const steps: { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] = [];
  let stepNum = 1;

  // Procesar cada stream
  for (const stream of input.streams) {
    // Verificar si el titular posee estos derechos
    const isIncluded = input.rightsOwned.includes(stream.modality);
    
    // Verificar territorio
    const territoryOk = !stream.territory || !input.territoriesOwned || input.territoriesOwned.includes(stream.territory);
    // Verificar idioma
    const languageOk = !stream.language || !input.languagesOwned || input.languagesOwned.includes(stream.language);

    if (!isIncluded || !territoryOk || !languageOk) {
      modalities.push({
        modality: stream.modality,
        cashFlows: [],
        totalPV: new Decimal(0),
        included: false,
        reason: !isIncluded
          ? `Derechos de ${stream.modality} no pertenecen al titular valorado.`
          : !territoryOk
          ? `Territorio ${stream.territory} no incluido en los derechos del titular.`
          : `Idioma ${stream.language} no incluido en los derechos del titular.`,
      });
      warnings.push(`EXCLUIDO: Stream ${stream.modality}${stream.territory ? ` (${stream.territory})` : ''} — no pertenece al titular.`);
      continue;
    }

    // Calcular flujos para esta modalidad
    const cashFlows: BookValuationResult['modalities'][0]['cashFlows'] = [];
    let modalityPV = new Decimal(0);

    for (const proj of stream.projections) {
      const royaltyBase = toDecimal(proj.royaltyBase);
      const royaltyRate = toDecimal(proj.royaltyRate);
      const otherIncome = proj.otherIncome ? toDecimal(proj.otherIncome) : new Decimal(0);
      const costs = proj.attributableCosts ? toDecimal(proj.attributableCosts) : new Decimal(0);

      // ROYALTY = BASE × RATE
      const royalty = royaltyBase.times(royaltyRate);
      
      // CF = ROYALTY + OTHER_INCOME - COSTS
      const netCF = royalty.plus(otherIncome).minus(costs);

      // PV del flujo
      const pvResult = presentValue({
        cashFlow: netCF,
        period: proj.period,
        discountRate: k,
        currency,
        valuationDate: input.valuationDate,
        description: `${stream.modality} período ${proj.period}`,
        sourceId: proj.sourceId,
        evidenceId: proj.evidenceId,
        basis: proj.basis,
      });

      cashFlows.push({
        period: proj.period,
        royalty: roundFinancial(royalty),
        otherIncome: roundFinancial(otherIncome),
        costs: roundFinancial(costs),
        netCF: roundFinancial(netCF),
        pv: roundFinancial(pvResult.presentValue),
      });

      modalityPV = modalityPV.plus(pvResult.presentValue);

      steps.push({
        stepNumber: stepNum++,
        description: `${stream.modality} período ${proj.period}: Royalty = ${royaltyBase.toString()} × ${royaltyRate.toString()}`,
        formula: `CF = ${royalty.toString()} + ${otherIncome.toString()} - ${costs.toString()}; PV = CF / (1+k)^${proj.period}`,
        inputs: { base: royaltyBase.toString(), rate: royaltyRate.toString(), period: proj.period.toString() },
        result: pvResult.presentValue.toString(),
      });
    }

    modalities.push({
      modality: stream.modality,
      cashFlows,
      totalPV: roundFinancial(modalityPV),
      included: true,
    });

    totalValue = totalValue.plus(modalityPV);
  }

  // Trazabilidad
  const trace: CalculationTrace = {
    calculationId: generateCalculationId('BOOK'),
    engine: 'valuation.bookValuationEngine',
    formula: 'V = Σ_modalidades [Σ_t (Royalty_t + OtherIncome_t - Costs_t) / (1+k)^t]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      discountRate: { value: k.toString(), source: 'estimate', justification: 'Tasa de descuento' },
      modalitiesIncluded: { value: input.rightsOwned.join(', '), source: 'documented', justification: 'Derechos que pertenecen al titular' },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel: calculateConfidence(input),
    limitations: [
      'Solo se incluyen derechos que pertenecen al titular según rightsOwned.',
      'No se incluyen derechos audiovisuales, de adaptación u otros no editoriales.',
    ],
  };

  return {
    modalities,
    totalValue: roundFinancial(totalValue),
    currency,
    valuationDate: input.valuationDate,
    calculationTrace: trace,
    warnings,
  };
}

function calculateConfidence(input: BookValuationInput): number {
  const totalProjections = input.streams.reduce((s, st) => s + st.projections.length, 0);
  const documented = input.streams.reduce(
    (s, st) => s + st.projections.filter(p => p.basis === 'documented').length, 0
  );
  const ratio = totalProjections > 0 ? documented / totalProjections : 0;
  return Math.round(40 + ratio * 60);
}
