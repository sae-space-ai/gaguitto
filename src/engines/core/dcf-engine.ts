/**
 * PERITO IP — Capa 2.2: Motor DCF (Discounted Cash Flow)
 * 
 * Motor específico para valoración por flujos de caja descontados.
 * Incluye valor terminal cuando procede.
 * Toda tasa de descuento debe proceder de input, fuente o hipótesis explícita.
 */

import Decimal from 'decimal.js';
import {
  CashFlow,
  Currency,
  CalculationTrace,
  IntermediateStep,
  DataBasis,
  generateCalculationId,
  toDecimal,
} from '../types';
import { presentValue, roundFinancial } from './math-core';

// ============================================================
// TIPOS DEL MOTOR DCF
// ============================================================

export interface DCFInput {
  valuationDate: string;
  cashFlows: CashFlow[];
  discountRate: Decimal | number | string;
  currency: Currency;
  terminalValue?: {
    method: 'gordon' | 'exit_multiple';
    // Gordon: TV = CF_n × (1 + g) / (k - g)
    growthRate?: Decimal | number | string;
    // Exit multiple: TV = CF_n × multiple
    exitMultiple?: Decimal | number | string;
  };
  assumptions: {
    id: string;
    description: string;
    basis: DataBasis;
    sourceId?: string;
    evidenceId?: string;
  }[];
  sources: {
    id: string;
    description: string;
    reliability: number; // 1-5
  }[];
  description?: string;
}

export interface DCFPeriodResult {
  period: number;
  cashFlow: Decimal;
  discountFactor: Decimal;
  presentValue: Decimal;
  basis: DataBasis;
  description?: string;
}

export interface DCFResult {
  presentValueByPeriod: DCFPeriodResult[];
  totalPresentValue: Decimal;
  terminalValue?: Decimal;
  terminalValuePresentValue?: Decimal;
  totalValue: Decimal; // PV flujos + PV terminal
  discountRate: Decimal;
  currency: Currency;
  valuationDate: string;
  calculationTrace: CalculationTrace;
  warnings: string[];
  confidenceInformation: {
    level: number;
    factors: string[];
  };
}

// ============================================================
// MOTOR DCF
// ============================================================

/**
 * Ejecuta el motor DCF con todos los controles de trazabilidad.
 * 
 * Fórmula base:
 *   V = Σ [CF_t / (1 + k)^t] + TV / (1 + k)^n
 * 
 * Valor terminal (Gordon):
 *   TV = CF_n × (1 + g) / (k - g)
 * 
 * Valor terminal (Múltiplo de salida):
 *   TV = CF_n × multiple
 */
export function dcfEngine(input: DCFInput): DCFResult {
  const warnings: string[] = [];
  const k = toDecimal(input.discountRate);
  const currency = input.currency;
  const steps: IntermediateStep[] = [];

  // Validaciones
  if (input.cashFlows.length === 0) {
    throw new Error('PERITO_IP_ERROR: DCF requiere al menos un flujo de caja.');
  }

  if (k.lte(0)) {
    warnings.push('ADVERTENCIA: Tasa de descuento ≤ 0. Esto es inusual en valoraciones financieras.');
  }

  if (k.lt(-0.5)) {
    throw new Error('PERITO_IP_ERROR: Tasa de descuento extremadamente negativa. Revise el input.');
  }

  // 1. Descontar cada flujo
  const pvByPeriod: DCFPeriodResult[] = [];
  let totalPV = new Decimal(0);

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

    pvByPeriod.push({
      period: cf.period,
      cashFlow: cf.amount,
      discountFactor: pvResult.discountFactor,
      presentValue: pvResult.presentValue,
      basis: cf.basis,
      description: cf.description,
    });

    totalPV = totalPV.plus(pvResult.presentValue);

    steps.push({
      stepNumber: cf.period,
      description: `Flujo período ${cf.period}: ${cf.description || 'sin descripción'}`,
      formula: `${cf.amount.toString()} / (1 + ${k.toString()})^${cf.period}`,
      inputs: { cf: cf.amount.toString(), k: k.toString(), t: cf.period.toString() },
      result: pvResult.presentValue.toString(),
    });
  }

  // 2. Valor terminal (si aplica)
  let terminalValue: Decimal | undefined;
  let terminalPV: Decimal | undefined;
  const lastPeriod = Math.max(...input.cashFlows.map(cf => cf.period));
  const lastCF = input.cashFlows.find(cf => cf.period === lastPeriod);

  if (input.terminalValue && lastCF) {
    if (input.terminalValue.method === 'gordon') {
      if (input.terminalValue.growthRate === undefined) {
        throw new Error('PERITO_IP_ERROR: Método Gordon requiere growthRate.');
      }
      const g = toDecimal(input.terminalValue.growthRate);
      
      if (g.gte(k)) {
        throw new Error(
          `PERITO_IP_ERROR: En el modelo de Gordon, la tasa de crecimiento (g=${g.toString()}) ` +
          `debe ser menor que la tasa de descuento (k=${k.toString()}).`
        );
      }
      if (g.lt(0)) {
        warnings.push('ADVERTENCIA: Tasa de crecimiento negativa en valor terminal.');
      }

      // TV = CF_n × (1 + g) / (k - g)
      const numerator = lastCF.amount.times(new Decimal(1).plus(g));
      const denominator = k.minus(g);
      terminalValue = numerator.div(denominator);

      steps.push({
        stepNumber: 100,
        description: 'Valor terminal (modelo Gordon)',
        formula: `CF_${lastPeriod} × (1 + g) / (k - g)`,
        inputs: {
          cf_n: lastCF.amount.toString(),
          g: g.toString(),
          k: k.toString(),
        },
        result: terminalValue.toString(),
      });

    } else if (input.terminalValue.method === 'exit_multiple') {
      if (input.terminalValue.exitMultiple === undefined) {
        throw new Error('PERITO_IP_ERROR: Método exit_multiple requiere exitMultiple.');
      }
      const multiple = toDecimal(input.terminalValue.exitMultiple);
      
      if (multiple.lte(0)) {
        throw new Error('PERITO_IP_ERROR: El múltiplo de salida debe ser positivo.');
      }

      // TV = CF_n × multiple
      terminalValue = lastCF.amount.times(multiple);

      steps.push({
        stepNumber: 100,
        description: 'Valor terminal (múltiplo de salida)',
        formula: `CF_${lastPeriod} × multiple`,
        inputs: { cf_n: lastCF.amount.toString(), multiple: multiple.toString() },
        result: terminalValue.toString(),
      });
    }

    // Descontar valor terminal
    if (terminalValue) {
      const tvPV = presentValue({
        cashFlow: terminalValue,
        period: lastPeriod,
        discountRate: k,
        currency,
        valuationDate: input.valuationDate,
        description: 'Valor terminal descontado',
        basis: 'estimate',
      });
      terminalPV = tvPV.presentValue;

      steps.push({
        stepNumber: 101,
        description: 'Valor presente del valor terminal',
        formula: `TV / (1 + k)^${lastPeriod}`,
        inputs: { tv: terminalValue.toString(), k: k.toString(), t: lastPeriod.toString() },
        result: terminalPV.toString(),
      });
    }
  }

  // 3. Valor total
  const totalValue = terminalPV ? totalPV.plus(terminalPV) : totalPV;

  // 4. Calcular confianza
  const documentedFlows = input.cashFlows.filter(cf => cf.basis === 'documented').length;
  const totalFlows = input.cashFlows.length;
  const flowConfidence = totalFlows > 0 ? (documentedFlows / totalFlows) * 60 : 0;
  
  const avgSourceReliability = input.sources.length > 0
    ? input.sources.reduce((s, src) => s + src.reliability, 0) / input.sources.length
    : 3;
  const sourceConfidence = (avgSourceReliability / 5) * 25;
  
  const hypothesisCount = input.assumptions.filter(a => a.basis === 'hypothesis').length;
  const hypothesisPenalty = Math.min(15, hypothesisCount * 5);
  
  const confidenceLevel = Math.max(0, Math.min(100, Math.round(flowConfidence + sourceConfidence + 15 - hypothesisPenalty)));

  // 5. Construir trazabilidad
  const trace: CalculationTrace = {
    calculationId: generateCalculationId('DCF'),
    engine: 'valuation.dcfEngine',
    formula: terminalPV
      ? 'V = Σ [CF_t / (1+k)^t] + TV / (1+k)^n'
      : 'V = Σ [CF_t / (1+k)^t]',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      discountRate: {
        value: k.toString(),
        source: input.assumptions.find(a => a.description.toLowerCase().includes('descuento'))?.basis || 'estimate',
        assumptionId: input.assumptions.find(a => a.description.toLowerCase().includes('descuento'))?.id,
        justification: 'Tasa de descuento aplicada. Debe tener fuente o hipótesis documentada.',
      },
      numberOfPeriods: {
        value: totalFlows.toString(),
        source: 'documented',
        justification: 'Número de períodos de proyección',
      },
      terminalValueMethod: {
        value: input.terminalValue?.method || 'none',
        source: input.terminalValue ? 'estimate' : 'documented',
        justification: input.terminalValue ? `Método: ${input.terminalValue.method}` : 'Sin valor terminal',
      },
    },
    intermediateSteps: steps,
    warnings,
    confidenceLevel,
    limitations: generateLimitations(input, confidenceLevel),
  };

  return {
    presentValueByPeriod: pvByPeriod,
    totalPresentValue: roundFinancial(totalPV),
    terminalValue: terminalValue ? roundFinancial(terminalValue) : undefined,
    terminalValuePresentValue: terminalPV ? roundFinancial(terminalPV) : undefined,
    totalValue: roundFinancial(totalValue),
    discountRate: k,
    currency,
    valuationDate: input.valuationDate,
    calculationTrace: trace,
    warnings,
    confidenceInformation: {
      level: confidenceLevel,
      factors: [
        `${documentedFlows}/${totalFlows} flujos documentados`,
        `${input.sources.length} fuentes utilizadas`,
        `${hypothesisCount} hipótesis explícitas`,
        terminalValue ? 'Valor terminal incluido (mayor incertidumbre)' : 'Sin valor terminal',
      ],
    },
  };
}

// ============================================================
// UTILIDADES
// ============================================================

function generateLimitations(input: DCFInput, confidenceLevel: number): string[] {
  const limitations: string[] = [];

  if (confidenceLevel < 50) {
    limitations.push('Nivel de confianza bajo. La valoración depende significativamente de hipótesis.');
  }

  const hypothesisCount = input.assumptions.filter(a => a.basis === 'hypothesis').length;
  if (hypothesisCount > 0) {
    limitations.push(`${hypothesisCount} hipótesis explícitas afectan el resultado.`);
  }

  if (input.terminalValue) {
    limitations.push('El valor terminal representa una proporción significativa del valor total y es inherentemente incierto.');
  }

  const unverifiedFlows = input.cashFlows.filter(cf => cf.basis === 'unverified' || cf.basis === 'hypothesis');
  if (unverifiedFlows.length > 0) {
    limitations.push(`${unverifiedFlows.length} flujos no verificados o basados en hipótesis.`);
  }

  if (input.sources.length === 0) {
    limitations.push('No se han registrado fuentes externas para esta valoración.');
  }

  return limitations;
}
