/**
 * PERITO IP — Capa 2.1: Núcleo Matemático
 * 
 * Operaciones financieras fundamentales centralizadas.
 * Todas las operaciones utilizan Decimal.js para precisión monetaria.
 * 
 * Fórmulas:
 *   PV(CF_t) = CF_t / (1 + k)^t
 *   NPV = Σ PV(CF_t)
 *   FV(PV, t) = PV × (1 + k)^t
 */

import Decimal from 'decimal.js';
import {
  CashFlow,
  DiscountedCashFlow,
  Currency,
  CalculationTrace,
  IntermediateStep,
  generateCalculationId,
  toDecimal,
  ValuationConfig,
} from '../types';

// ============================================================
// CONFIGURACIÓN DE PRECISIÓN
// ============================================================

Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

// ============================================================
// PRESENT VALUE
// ============================================================

export interface PVInput {
  cashFlow: Decimal | number | string;
  period: number;
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  description?: string;
  sourceId?: string;
  evidenceId?: string;
  assumptionId?: string;
  basis?: 'documented' | 'comparable' | 'estimate' | 'hypothesis' | 'unverified';
}

export interface PVResult {
  presentValue: Decimal;
  cashFlow: Decimal;
  period: number;
  discountRate: Decimal;
  discountFactor: Decimal;
  currency: Currency;
  formula: string;
  trace: CalculationTrace;
}

/**
 * Calcula el valor presente de un flujo de caja futuro.
 * 
 * Fórmula: PV = CF_t / (1 + k)^t
 * 
 * @param input - Datos del flujo y parámetros de descuento
 * @returns Valor presente con trazabilidad completa
 */
export function presentValue(input: PVInput): PVResult {
  const cf = toDecimal(input.cashFlow);
  const k = toDecimal(input.discountRate);
  const t = input.period;
  const currency = input.currency;

  // Validaciones
  if (t < 0) {
    throw new Error(`PERITO_IP_ERROR: El período no puede ser negativo. Recibido: ${t}`);
  }
  if (k.lt(-1)) {
    throw new Error(`PERITO_IP_ERROR: La tasa de descuento no puede ser menor que -100%. Recibido: ${k.toString()}`);
  }

  // (1 + k)^t
  const onePlusK = new Decimal(1).plus(k);
  const discountFactor = onePlusK.pow(t);
  
  // PV = CF / (1+k)^t
  const pv = cf.div(discountFactor);

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('PV'),
    engine: 'core.presentValue',
    formula: 'PV = CF_t / (1 + k)^t',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      cashFlow: {
        value: cf.toString(),
        source: input.basis || 'documented',
        sourceId: input.sourceId,
        evidenceId: input.evidenceId,
        assumptionId: input.assumptionId,
        justification: input.description || 'Flujo de caja del período',
      },
      discountRate: {
        value: k.toString(),
        source: input.basis || 'documented',
        justification: 'Tasa de descuento aplicada',
      },
      period: {
        value: t.toString(),
        source: 'documented',
        justification: `Período ${t}`,
      },
    },
    intermediateSteps: [
      {
        stepNumber: 1,
        description: 'Calcular (1 + k)',
        formula: '1 + k',
        inputs: { k: k.toString() },
        result: onePlusK.toString(),
      },
      {
        stepNumber: 2,
        description: 'Calcular factor de descuento (1 + k)^t',
        formula: '(1 + k)^t',
        inputs: { onePlusK: onePlusK.toString(), t: t.toString() },
        result: discountFactor.toString(),
      },
      {
        stepNumber: 3,
        description: 'Calcular valor presente',
        formula: 'CF_t / (1 + k)^t',
        inputs: { cf: cf.toString(), discountFactor: discountFactor.toString() },
        result: pv.toString(),
      },
    ],
    warnings: [],
    confidenceLevel: input.basis === 'documented' ? 95 : input.basis === 'hypothesis' ? 40 : 70,
    limitations: [],
  };

  return {
    presentValue: pv,
    cashFlow: cf,
    period: t,
    discountRate: k,
    discountFactor,
    currency,
    formula: 'PV = CF_t / (1 + k)^t',
    trace,
  };
}

// ============================================================
// NET PRESENT VALUE
// ============================================================

export interface NPVInput {
  cashFlows: CashFlow[];
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
  description?: string;
  sourceId?: string;
  evidenceId?: string;
  assumptionId?: string;
}

export interface NPVResult {
  npv: Decimal;
  discountedFlows: DiscountedCashFlow[];
  discountRate: Decimal;
  currency: Currency;
  formula: string;
  trace: CalculationTrace;
}

/**
 * Calcula el Valor Presente Neto de una serie de flujos de caja.
 * 
 * Fórmula: NPV = Σ [CF_t / (1 + k)^t] para t = 0..n
 * 
 * @param input - Serie de flujos y tasa de descuento
 * @returns NPV con trazabilidad de cada flujo descontado
 */
export function netPresentValue(input: NPVInput): NPVResult {
  const k = toDecimal(input.discountRate);
  const currency = input.currency;

  const discountedFlows: DiscountedCashFlow[] = [];
  let npv = new Decimal(0);
  const steps: IntermediateStep[] = [];

  for (const cf of input.cashFlows) {
    const pvResult = presentValue({
      cashFlow: cf.amount,
      period: cf.period,
      discountRate: k,
      currency,
      valuationDate: input.valuationDate,
      description: cf.description,
      sourceId: cf.sourceId,
      evidenceId: cf.evidenceId,
      assumptionId: cf.assumptionId,
      basis: cf.basis,
    });

    discountedFlows.push({
      ...cf,
      discountRate: k,
      discountFactor: pvResult.discountFactor,
      presentValue: pvResult.presentValue,
    });

    npv = npv.plus(pvResult.presentValue);

    steps.push({
      stepNumber: cf.period,
      description: `PV del período ${cf.period}`,
      formula: `${cf.amount.toString()} / (1 + ${k.toString()})^${cf.period}`,
      inputs: { cf: cf.amount.toString(), k: k.toString(), t: cf.period.toString() },
      result: pvResult.presentValue.toString(),
    });
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('NPV'),
    engine: 'core.netPresentValue',
    formula: 'NPV = Σ [CF_t / (1 + k)^t]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      discountRate: {
        value: k.toString(),
        source: 'documented',
        justification: 'Tasa de descuento aplicada a todos los flujos',
      },
      numberOfFlows: {
        value: input.cashFlows.length.toString(),
        source: 'documented',
        justification: 'Número de flujos de caja',
      },
    },
    intermediateSteps: steps,
    warnings: [],
    confidenceLevel: calculateNPVConfidence(input.cashFlows),
    limitations: [],
  };

  return {
    npv,
    discountedFlows,
    discountRate: k,
    currency,
    formula: 'NPV = Σ [CF_t / (1 + k)^t]',
    trace,
  };
}

// ============================================================
// FUTURE VALUE
// ============================================================

export interface FVInput {
  presentValue: Decimal | number | string;
  periods: number;
  discountRate: Decimal | number | string;
  currency: Currency;
  valuationDate: string;
}

export interface FVResult {
  futureValue: Decimal;
  presentValue: Decimal;
  periods: number;
  discountRate: Decimal;
  currency: Currency;
  trace: CalculationTrace;
}

/**
 * Calcula el valor futuro de un valor presente.
 * 
 * Fórmula: FV = PV × (1 + k)^t
 */
export function futureValue(input: FVInput): FVResult {
  const pv = toDecimal(input.presentValue);
  const k = toDecimal(input.discountRate);
  const t = input.periods;
  const currency = input.currency;

  const factor = new Decimal(1).plus(k).pow(t);
  const fv = pv.times(factor);

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('FV'),
    engine: 'core.futureValue',
    formula: 'FV = PV × (1 + k)^t',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      presentValue: { value: pv.toString(), source: 'documented', justification: 'Valor presente' },
      discountRate: { value: k.toString(), source: 'documented', justification: 'Tasa de crecimiento/descuento' },
      periods: { value: t.toString(), source: 'documented', justification: 'Número de períodos' },
    },
    intermediateSteps: [
      {
        stepNumber: 1,
        description: 'Factor de capitalización',
        formula: '(1 + k)^t',
        inputs: { k: k.toString(), t: t.toString() },
        result: factor.toString(),
      },
      {
        stepNumber: 2,
        description: 'Valor futuro',
        formula: 'PV × factor',
        inputs: { pv: pv.toString(), factor: factor.toString() },
        result: fv.toString(),
      },
    ],
    warnings: [],
    confidenceLevel: 90,
    limitations: [],
  };

  return { futureValue: fv, presentValue: pv, periods: t, discountRate: k, currency, trace };
}

// ============================================================
// CONVERSIONES MONETARIAS
// ============================================================

export interface ConversionRate {
  from: Currency;
  to: Currency;
  rate: Decimal;
  source: string;
  date: string;
}

/**
 * Convierte un valor entre monedas usando un tipo de cambio documentado.
 * La tasa DEBE proceder de una fuente verificada (BCE, mercado oficial).
 * Nunca se inventa una tasa de cambio.
 */
export function convertCurrency(
  amount: Decimal | number | string,
  from: Currency,
  to: Currency,
  rate: ConversionRate
): { convertedAmount: Decimal; trace: CalculationTrace } {
  if (rate.from !== from || rate.to !== to) {
    throw new Error(
      `PERITO_IP_ERROR: La tasa de conversión proporcionada (${rate.from}->${rate.to}) ` +
      `no coincide con la conversión solicitada (${from}->${to}).`
    );
  }

  const amt = toDecimal(amount);
  const converted = amt.times(rate.rate);

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('FX'),
    engine: 'core.convertCurrency',
    formula: `Amount_${from} × rate(${from}/${to}) = Amount_${to}`,
    valuationDate: rate.date,
    currency: to,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      amount: { value: amt.toString(), source: 'documented', justification: `Importe en ${from}` },
      rate: { value: rate.rate.toString(), source: 'documented', sourceId: rate.source, justification: `Tipo de cambio ${from}/${to} con fecha ${rate.date}` },
    },
    intermediateSteps: [
      {
        stepNumber: 1,
        description: 'Conversión monetaria',
        formula: `${amt.toString()} × ${rate.rate.toString()}`,
        inputs: { amount: amt.toString(), rate: rate.rate.toString() },
        result: converted.toString(),
      },
    ],
    warnings: [],
    confidenceLevel: 95,
    limitations: [`Tipo de cambio con fecha ${rate.date}. Puede no reflejar el valor en la fecha de valoración si difiere.`],
  };

  return { convertedAmount: converted, trace };
}

// ============================================================
// PORCENTAJES Y MÁRGENES
// ============================================================

/**
 * Calcula un porcentaje de una base.
 * Ejemplo: royalty = base × rate
 */
export function calculatePercentage(
  base: Decimal | number | string,
  ratePercent: Decimal | number | string,
  context: { description: string; valuationDate: string; currency: Currency }
): { result: Decimal; trace: CalculationTrace } {
  const b = toDecimal(base);
  const r = toDecimal(ratePercent);
  const result = b.times(r);

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('PCT'),
    engine: 'core.calculatePercentage',
    formula: 'Result = Base × Rate',
    valuationDate: context.valuationDate,
    currency: context.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      base: { value: b.toString(), source: 'documented', justification: 'Base de cálculo' },
      rate: { value: r.toString(), source: 'documented', justification: 'Tasa porcentual (decimal)' },
    },
    intermediateSteps: [
      {
        stepNumber: 1,
        description: context.description,
        formula: `${b.toString()} × ${r.toString()}`,
        inputs: { base: b.toString(), rate: r.toString() },
        result: result.toString(),
      },
    ],
    warnings: [],
    confidenceLevel: 90,
    limitations: [],
  };

  return { result, trace };
}

/**
 * Calcula un margen: (Ingresos - Costes) / Ingresos
 */
export function calculateMargin(
  revenue: Decimal | number | string,
  costs: Decimal | number | string
): Decimal {
  const rev = toDecimal(revenue);
  const cost = toDecimal(costs);
  if (rev.isZero()) {
    throw new Error('PERITO_IP_ERROR: No se puede calcular margen con ingresos cero.');
  }
  return rev.minus(cost).div(rev);
}

// ============================================================
// UTILIDADES
// ============================================================

function calculateNPVConfidence(cashFlows: CashFlow[]): number {
  if (cashFlows.length === 0) return 0;
  
  const documented = cashFlows.filter(cf => cf.basis === 'documented').length;
  const ratio = documented / cashFlows.length;
  
  // Base: 50% + proporción documentada × 50%
  return Math.round(50 + ratio * 50);
}

/**
 * Redondeo financiero controlado a 2 decimales.
 * Utiliza ROUND_HALF_UP (estándar financiero).
 */
export function roundFinancial(value: Decimal | number | string): Decimal {
  return toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/**
 * Formatea un valor decimal como string monetario.
 */
export function formatCurrency(value: Decimal | number | string, currency: Currency): string {
  const v = toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const symbols: Record<Currency, string> = {
    EUR: '€', USD: '$', GBP: '£', MXN: 'MX$', ARS: 'AR$', COP: 'COP$', CLP: 'CLP$', BRL: 'R$',
  };
  return `${symbols[currency]}${v.toFixed(2)}`;
}
