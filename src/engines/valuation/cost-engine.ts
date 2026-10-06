/**
 * PERITO IP — Capa 2.4: Motor de Coste (COST_VALUATION_ENGINE)
 * 
 * Soporta tres métodos:
 * - HISTORICAL_COST: suma de costes documentados
 * - REPRODUCTION_COST: coste actual de reproducir la obra
 * - REPLACEMENT_COST: coste de crear una obra equivalente
 * 
 * IMPORTANTE: El coste NO es valor de mercado. Se denomina explícitamente
 * "valor obtenido mediante método del coste".
 */

import Decimal from 'decimal.js';
import {
  CostComponent,
  CostMethod,
  Currency,
  CalculationTrace,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface CostValuationInput {
  method: CostMethod;
  components: CostComponent[];
  currency: Currency;
  valuationDate: string;
  priceIndex?: Decimal | number | string; // Para reproduction cost
  description?: string;
  // Para replacement cost: componentes equivalentes actuales
  replacementComponents?: CostComponent[];
}

export interface CostValuationResult {
  method: CostMethod;
  totalCost: Decimal;
  currency: Currency;
  valuationDate: string;
  breakdown: {
    category: string;
    amount: Decimal;
    components: number;
    verified: number;
    unverified: number;
  }[];
  verifiedTotal: Decimal;
  unverifiedTotal: Decimal;
  percentageVerified: number;
  calculationTrace: CalculationTrace;
  warnings: string[];
  disclaimer: string;
}

// ============================================================
// MOTOR DE COSTE
// ============================================================

/**
 * Calcula la valoración por método de coste.
 * 
 * HISTORICAL_COST: Σ(costes_documentados)
 * REPRODUCTION_COST: Σ(costes × índice_precios_actual)
 * REPLACEMENT_COST: Σ(costes_equivalentes_actuales)
 * 
 * ADVERTENCIA: El resultado NO es valor de mercado.
 */
export function costValuationEngine(input: CostValuationInput): CostValuationResult {
  const warnings: string[] = [];
  const currency = input.currency;

  if (input.components.length === 0) {
    throw new Error('PERITO_IP_ERROR: Se requiere al menos un componente de coste.');
  }

  let totalCost: Decimal;
  const componentsToUse = input.method === 'replacement' && input.replacementComponents
    ? input.replacementComponents
    : input.components;

  switch (input.method) {
    case 'historical':
      totalCost = calculateHistoricalCost(componentsToUse);
      break;
    case 'reproduction':
      if (!input.priceIndex) {
        throw new Error('PERITO_IP_ERROR: El coste de reproducción requiere un índice de precios (priceIndex).');
      }
      totalCost = calculateReproductionCost(componentsToUse, toDecimal(input.priceIndex));
      break;
    case 'replacement':
      totalCost = calculateReplacementCost(componentsToUse);
      break;
    default:
      throw new Error(`PERITO_IP_ERROR: Método de coste desconocido: ${input.method}`);
  }

  // Desglose por categoría
  const categoryMap = new Map<string, { amount: Decimal; count: number; verified: number; unverified: number }>();
  let verifiedTotal = new Decimal(0);
  let unverifiedTotal = new Decimal(0);

  for (const comp of componentsToUse) {
    const existing = categoryMap.get(comp.category) || { amount: new Decimal(0), count: 0, verified: 0, unverified: 0 };
    existing.amount = existing.amount.plus(comp.amount);
    existing.count += 1;
    if (comp.verifiedStatus === 'verified') {
      existing.verified += 1;
      verifiedTotal = verifiedTotal.plus(comp.amount);
    } else {
      existing.unverified += 1;
      unverifiedTotal = unverifiedTotal.plus(comp.amount);
    }
    categoryMap.set(comp.category, existing);
  }

  const breakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: roundFinancial(data.amount),
    components: data.count,
    verified: data.verified,
    unverified: data.unverified,
  }));

  const percentageVerified = totalCost.gt(0)
    ? Math.round(verifiedTotal.div(totalCost).times(100).toNumber())
    : 0;

  // Advertencias
  if (percentageVerified < 50) {
    warnings.push(`ADVERTENCIA: Solo el ${percentageVerified}% del coste está verificado. El resultado tiene baja fiabilidad.`);
  }

  const unverifiedCount = componentsToUse.filter(c => c.verifiedStatus !== 'verified').length;
  if (unverifiedCount > 0) {
    warnings.push(`${unverifiedCount} componentes de coste no verificados incluidos en el cálculo.`);
  }

  // Trazabilidad
  const trace: CalculationTrace = {
    calculationId: generateCalculationId('COST'),
    engine: 'valuation.costValuationEngine',
    formula: input.method === 'historical'
      ? 'Cost = Σ(componentes_documentados)'
      : input.method === 'reproduction'
      ? 'Cost = Σ(componentes × índice_precios)'
      : 'Cost = Σ(componentes_equivalentes_actuales)',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      method: { value: input.method, source: 'documented', justification: 'Método de valoración por coste' },
      numberOfComponents: { value: componentsToUse.length.toString(), source: 'documented', justification: 'Componentes de coste incluidos' },
      ...(input.priceIndex ? { priceIndex: { value: toDecimal(input.priceIndex).toString(), source: 'documented', justification: 'Índice de precios para reproducción' } } : {}),
    },
    intermediateSteps: componentsToUse.map((comp, i) => ({
      stepNumber: i + 1,
      description: `${comp.category}: ${comp.description}`,
      formula: input.method === 'reproduction'
        ? `${comp.amount.toString()} × ${input.priceIndex?.toString() || '1'}`
        : comp.amount.toString(),
      inputs: { amount: comp.amount.toString(), verified: comp.verifiedStatus },
      result: input.method === 'reproduction'
        ? comp.amount.times(toDecimal(input.priceIndex || 1)).toString()
        : comp.amount.toString(),
    })),
    warnings,
    confidenceLevel: Math.max(10, percentageVerified),
    limitations: [
      'El coste NO equivale al valor de mercado.',
      'El método de coste indica el suelo mínimo en determinadas circunstancias.',
      percentageVerified < 80 ? 'Porcentaje de verificación insuficiente para alta confianza.' : '',
    ].filter(Boolean),
  };

  const disclaimers: Record<CostMethod, string> = {
    historical: 'VALOR OBTENIDO MEDIANTE MÉTODO DEL COSTE HISTÓRICO. No constituye valor de mercado. Representa la inversión documentada acreditada.',
    reproduction: 'VALOR OBTENIDO MEDIANTE MÉTODO DEL COSTE DE REPRODUCCIÓN. No constituye valor de mercado. Representa el coste actual de reproducir la obra.',
    replacement: 'VALOR OBTENIDO MEDIANTE MÉTODO DEL COSTE DE REEMPLAZO. No constituye valor de mercado. Representa el coste de crear una obra equivalente.',
  };

  return {
    method: input.method,
    totalCost: roundFinancial(totalCost),
    currency,
    valuationDate: input.valuationDate,
    breakdown,
    verifiedTotal: roundFinancial(verifiedTotal),
    unverifiedTotal: roundFinancial(unverifiedTotal),
    percentageVerified,
    calculationTrace: trace,
    warnings,
    disclaimer: disclaimers[input.method],
  };
}

// ============================================================
// FUNCIONES INTERNAS
// ============================================================

function calculateHistoricalCost(components: CostComponent[]): Decimal {
  return components.reduce((sum, comp) => sum.plus(comp.amount), new Decimal(0));
}

function calculateReproductionCost(components: CostComponent[], priceIndex: Decimal): Decimal {
  return components.reduce(
    (sum, comp) => sum.plus(comp.amount.times(priceIndex)),
    new Decimal(0)
  );
}

function calculateReplacementCost(components: CostComponent[]): Decimal {
  return components.reduce((sum, comp) => sum.plus(comp.amount), new Decimal(0));
}
