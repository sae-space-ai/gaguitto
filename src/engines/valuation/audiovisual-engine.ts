/**
 * PERITO IP — Capa 2.7: Motor Audiovisual (AUDIOVISUAL_VALUATION_ENGINE)
 * 
 * Ventanas: THEATRICAL, TELEVISION, SVOD, TVOD, AVOD, INTERNATIONAL,
 * OTHER_MEDIA, REMAKE, SEQUEL, PREQUEL, MERCHANDISING, OTHER_DERIVATIVE_RIGHTS
 * 
 * Para modelos de unidades:
 *   GROSS_REVENUE_t = UNITS_t × AVERAGE_PRICE_t
 * 
 * Para licencias:
 *   GROSS_REVENUE_t = MINIMUM_GUARANTEE_t + ROYALTIES_t
 * 
 * Ingreso del titular:
 *   OWNER_REVENUE_t = GROSS - COMMISSIONS - DISTRIBUTION - EXPLOITATION - THIRD_PARTY
 * 
 * Valor de ventana:
 *   V_WINDOW = Σ(OWNER_REVENUE_t / (1+k)^t)
 * 
 * Cada ventana se analiza independientemente.
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

export type AudiovisualWindow =
  | 'THEATRICAL'
  | 'TELEVISION'
  | 'SVOD'
  | 'TVOD'
  | 'AVOD'
  | 'INTERNATIONAL'
  | 'OTHER_MEDIA'
  | 'REMAKE'
  | 'SEQUEL'
  | 'PREQUEL'
  | 'MERCHANDISING'
  | 'OTHER_DERIVATIVE_RIGHTS';

export type RevenueModel = 'units' | 'license' | 'participation';

export interface WindowProjection {
  period: number;
  revenueModel: RevenueModel;
  // Para modelo units:
  units?: number;
  averagePrice?: Decimal | number | string;
  // Para modelo license:
  minimumGuarantee?: Decimal | number | string;
  royalties?: Decimal | number | string;
  // Para modelo participation:
  grossRevenue?: Decimal | number | string;
  participationRate?: Decimal | number | string;
  // Deducciones:
  commissions?: Decimal | number | string;
  distributionExpenses?: Decimal | number | string;
  exploitationCosts?: Decimal | number | string;
  thirdPartyParticipations?: Decimal | number | string;
  // Metadata:
  basis: DataBasis;
  sourceId?: string;
  evidenceId?: string;
}

export interface AudiovisualStream {
  window: AudiovisualWindow;
  territory: string;
  period: string; // ej: "2024-2029"
  rightsHolder: string;
  projections: WindowProjection[];
  contractRef?: string;
}

export interface AudiovisualValuationInput {
  streams: AudiovisualStream[];
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  // Ventanas que pertenecen al titular
  windowsOwned: AudiovisualWindow[];
  territoriesOwned?: string[];
  assumptions: { id: string; description: string; basis: DataBasis }[];
}

export interface WindowResult {
  window: AudiovisualWindow;
  territory: string;
  cashFlows: {
    period: number;
    grossRevenue: Decimal;
    commissions: Decimal;
    distributionExpenses: Decimal;
    exploitationCosts: Decimal;
    thirdPartyParticipations: Decimal;
    ownerRevenue: Decimal;
    presentValue: Decimal;
  }[];
  totalPV: Decimal;
  included: boolean;
  reason?: string;
}

export interface AudiovisualValuationResult {
  windows: WindowResult[];
  totalValue: Decimal;
  currency: Currency;
  valuationDate: string;
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR AUDIOVISUAL
// ============================================================

/**
 * Valora derechos audiovisuales calculando cada ventana independientemente.
 * Solo incluye ventanas que pertenezcan al titular.
 */
export function audiovisualValuationEngine(input: AudiovisualValuationInput): AudiovisualValuationResult {
  const warnings: string[] = [];
  const k = toDecimal(input.discountRate);
  const currency = input.currency;
  const windowResults: WindowResult[] = [];
  let totalValue = new Decimal(0);
  const steps: { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] = [];
  let stepNum = 1;

  for (const stream of input.streams) {
    const isIncluded = input.windowsOwned.includes(stream.window);
    const territoryOk = !input.territoriesOwned || input.territoriesOwned.includes(stream.territory);

    if (!isIncluded || !territoryOk) {
      windowResults.push({
        window: stream.window,
        territory: stream.territory,
        cashFlows: [],
        totalPV: new Decimal(0),
        included: false,
        reason: !isIncluded
          ? `Ventana ${stream.window} no pertenece al titular.`
          : `Territorio ${stream.territory} no incluido.`,
      });
      warnings.push(`EXCLUIDO: ${stream.window} (${stream.territory}) — no pertenece al titular.`);
      continue;
    }

    const cashFlows: WindowResult['cashFlows'] = [];
    let windowPV = new Decimal(0);

    for (const proj of stream.projections) {
      // Calcular GROSS_REVENUE según modelo
      let grossRevenue: Decimal;

      switch (proj.revenueModel) {
        case 'units':
          if (proj.units === undefined || !proj.averagePrice) {
            throw new Error(`PERITO_IP_ERROR: Modelo 'units' requiere units y averagePrice en período ${proj.period}.`);
          }
          grossRevenue = new Decimal(proj.units).times(toDecimal(proj.averagePrice));
          break;
        case 'license':
          const mg = proj.minimumGuarantee ? toDecimal(proj.minimumGuarantee) : new Decimal(0);
          const roy = proj.royalties ? toDecimal(proj.royalties) : new Decimal(0);
          grossRevenue = mg.plus(roy);
          break;
        case 'participation':
          if (!proj.grossRevenue || !proj.participationRate) {
            throw new Error(`PERITO_IP_ERROR: Modelo 'participation' requiere grossRevenue y participationRate.`);
          }
          grossRevenue = toDecimal(proj.grossRevenue).times(toDecimal(proj.participationRate));
          break;
        default:
          throw new Error(`PERITO_IP_ERROR: Modelo de ingresos desconocido: ${proj.revenueModel}`);
      }

      // Deducciones
      const commissions = proj.commissions ? toDecimal(proj.commissions) : new Decimal(0);
      const distExpenses = proj.distributionExpenses ? toDecimal(proj.distributionExpenses) : new Decimal(0);
      const exploitCosts = proj.exploitationCosts ? toDecimal(proj.exploitationCosts) : new Decimal(0);
      const thirdParty = proj.thirdPartyParticipations ? toDecimal(proj.thirdPartyParticipations) : new Decimal(0);

      // OWNER_REVENUE = GROSS - COMMISSIONS - DISTRIBUTION - EXPLOITATION - THIRD_PARTY
      const ownerRevenue = grossRevenue.minus(commissions).minus(distExpenses).minus(exploitCosts).minus(thirdParty);

      // PV
      const pvResult = presentValue({
        cashFlow: ownerRevenue,
        period: proj.period,
        discountRate: k,
        currency,
        valuationDate: input.valuationDate,
        description: `${stream.window} (${stream.territory}) período ${proj.period}`,
        sourceId: proj.sourceId,
        evidenceId: proj.evidenceId,
        basis: proj.basis,
      });

      cashFlows.push({
        period: proj.period,
        grossRevenue: roundFinancial(grossRevenue),
        commissions: roundFinancial(commissions),
        distributionExpenses: roundFinancial(distExpenses),
        exploitationCosts: roundFinancial(exploitCosts),
        thirdPartyParticipations: roundFinancial(thirdParty),
        ownerRevenue: roundFinancial(ownerRevenue),
        presentValue: roundFinancial(pvResult.presentValue),
      });

      windowPV = windowPV.plus(pvResult.presentValue);

      steps.push({
        stepNumber: stepNum++,
        description: `${stream.window}/${stream.territory} P${proj.period}: Gross=${grossRevenue.toString()}, Owner=${ownerRevenue.toString()}`,
        formula: `Owner = Gross - Commissions - Distribution - Exploitation - ThirdParty`,
        inputs: { gross: grossRevenue.toString(), commissions: commissions.toString(), dist: distExpenses.toString() },
        result: pvResult.presentValue.toString(),
      });
    }

    windowResults.push({
      window: stream.window,
      territory: stream.territory,
      cashFlows,
      totalPV: roundFinancial(windowPV),
      included: true,
    });

    totalValue = totalValue.plus(windowPV);
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('AV'),
    engine: 'valuation.audiovisualValuationEngine',
    formula: 'V = Σ_ventanas [Σ_t (OwnerRevenue_t / (1+k)^t)]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      discountRate: { value: k.toString(), source: 'estimate', justification: 'Tasa de descuento' },
      windowsOwned: { value: input.windowsOwned.join(', '), source: 'documented', justification: 'Ventanas que pertenecen al titular' },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel: calculateConfidence(input),
    limitations: [
      'Solo se incluyen ventanas que pertenecen al titular.',
      'Cada ventana se valora independientemente.',
      'Los modelos de revenue deben ser consistentes con los contratos.',
    ],
  };

  return {
    windows: windowResults,
    totalValue: roundFinancial(totalValue),
    currency,
    valuationDate: input.valuationDate,
    calculationTrace: trace,
    warnings,
  };
}

function calculateConfidence(input: AudiovisualValuationInput): number {
  const totalProjs = input.streams.reduce((s, st) => s + st.projections.length, 0);
  const documented = input.streams.reduce(
    (s, st) => s + st.projections.filter(p => p.basis === 'documented').length, 0
  );
  const ratio = totalProjs > 0 ? documented / totalProjs : 0;
  return Math.round(30 + ratio * 70);
}
