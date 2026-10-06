/**
 * PERITO IP — Capa 2.3: Motor de Royalties
 * 
 * Soporta múltiples bases contractuales, porcentajes escalonados,
 * mínimos garantizados, anticipos y recuperación de anticipos.
 * 
 * Modelo básico: ROYALTY = ROYALTY_BASE × ROYALTY_RATE
 * La base SIEMPRE debe ser explícita. Nunca se asume PVP por defecto.
 */

import Decimal from 'decimal.js';
import {
  RoyaltyBase,
  RoyaltyTier,
  Currency,
  CalculationTrace,
  DataBasis,
  generateCalculationId,
  toDecimal,
} from '../types';
import { roundFinancial } from '../core/math-core';

// ============================================================
// TIPOS
// ============================================================

export interface RoyaltyEngineInput {
  royaltyBase: RoyaltyBase;
  baseAmount: Decimal | number | string; // Monto total de la base (ej: ventas netas)
  royaltyRate: Decimal | number | string; // Tasa como decimal (0.10 = 10%)
  tiers?: RoyaltyTier[]; // Si hay escalonamiento
  minimumGuarantee?: Decimal | number | string;
  advance?: Decimal | number | string;
  recoverable?: boolean; // Si el anticipo es recuperable de royalties
  unitsSold?: number; // Para escalonamiento por unidades
  currency: Currency;
  valuationDate: string;
  territory?: string;
  format?: string;
  language?: string;
  period?: number;
  basis: DataBasis;
  sourceId?: string;
  evidenceId?: string;
  contractDescription?: string;
}

export interface RoyaltyEngineResult {
  royaltyBase: RoyaltyBase;
  baseAmount: Decimal;
  applicableRate: Decimal;
  grossRoyalty: Decimal;
  minimumGuarantee?: Decimal;
  advance?: Decimal;
  recoverableAdvance: boolean;
  netRoyalty: Decimal; // Después de recuperar anticipo si aplica
  effectiveRoyalty: Decimal; // Lo que realmente recibe el titular
  currency: Currency;
  tierApplied?: RoyaltyTier;
  calculationTrace: CalculationTrace;
  warnings: string[];
}

// ============================================================
// MOTOR DE ROYALTIES
// ============================================================

/**
 * Calcula royalties según la base contractual explícita.
 * 
 * Reglas:
 * 1. La base SIEMPRE debe ser declarada (PVP, NET_RECEIPTS, etc.)
 * 2. Si hay tiers, se aplica el tramo correspondiente a las unidades
 * 3. Si hay mínimo garantizado, se paga el mayor entre MG y royalty calculado
 * 4. Si hay anticipo recuperable, se descuenta del royalty hasta agotarlo
 */
export function royaltyEngine(input: RoyaltyEngineInput): RoyaltyEngineResult {
  const warnings: string[] = [];
  const baseAmount = toDecimal(input.baseAmount);
  const baseRate = toDecimal(input.royaltyRate);
  const currency = input.currency;

  // Validación: la base debe ser explícita
  if (!input.royaltyBase) {
    throw new Error('PERITO_IP_ERROR: La base del royalty DEBE ser explícita. Nunca se asume PVP por defecto.');
  }

  // 1. Determinar tasa aplicable (con escalonamiento si existe)
  let applicableRate = baseRate;
  let tierApplied: RoyaltyTier | undefined;

  if (input.tiers && input.tiers.length > 0 && input.unitsSold !== undefined) {
    const tier = findApplicableTier(input.tiers, input.unitsSold);
    if (tier) {
      applicableRate = tier.rate;
      tierApplied = tier;
    } else {
      warnings.push('ADVERTENCIA: No se encontró tramo aplicable para las unidades indicadas. Se usa tasa base.');
    }
  }

  // 2. Calcular royalty bruto
  let grossRoyalty: Decimal;

  if (input.royaltyBase === 'FIXED_PAYMENT') {
    // Pago fijo: el baseAmount es directamente el royalty
    grossRoyalty = baseAmount;
  } else {
    // Base × Tasa
    grossRoyalty = baseAmount.times(applicableRate);
  }

  // 3. Aplicar mínimo garantizado
  const mg = input.minimumGuarantee ? toDecimal(input.minimumGuarantee) : undefined;
  let effectiveRoyalty = grossRoyalty;

  if (mg && mg.gt(grossRoyalty)) {
    effectiveRoyalty = mg;
    warnings.push(`Mínimo garantizado (${mg.toString()}) supera al royalty calculado (${grossRoyalty.toString()}). Se aplica el MG.`);
  }

  // 4. Recuperación de anticipo
  const advance = input.advance ? toDecimal(input.advance) : undefined;
  const recoverable = input.recoverable ?? false;
  let netRoyalty = effectiveRoyalty;

  if (advance && recoverable) {
    // El anticipo se recupera del royalty
    if (effectiveRoyalty.gte(advance)) {
      netRoyalty = effectiveRoyalty.minus(advance);
    } else {
      // El anticipo no se ha recuperado completamente
      netRoyalty = new Decimal(0);
      warnings.push(`Anticipo (${advance.toString()}) no completamente recuperado. Royalty restante por recuperar: ${advance.minus(effectiveRoyalty).toString()}`);
    }
  } else if (advance && !recoverable) {
    // Anticipo no recuperable: se suma al royalty (ya lo recibió)
    netRoyalty = effectiveRoyalty;
  }

  // 5. Construir trazabilidad
  const trace: CalculationTrace = {
    calculationId: generateCalculationId('ROY'),
    engine: 'valuation.royaltyEngine',
    formula: input.royaltyBase === 'FIXED_PAYMENT'
      ? 'Royalty = Fixed Payment'
      : 'Royalty = Base × Rate',
    valuationDate: input.valuationDate,
    currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      royaltyBase: {
        value: input.royaltyBase,
        source: input.basis,
        evidenceId: input.evidenceId,
        justification: `Base contractual: ${input.royaltyBase}. ${input.contractDescription || ''}`,
      },
      baseAmount: {
        value: baseAmount.toString(),
        source: input.basis,
        evidenceId: input.evidenceId,
        justification: `Importe de la base (${input.royaltyBase})`,
      },
      royaltyRate: {
        value: applicableRate.toString(),
        source: input.basis,
        evidenceId: input.evidenceId,
        justification: tierApplied
          ? `Tasa del tramo ${tierApplied.fromUnits}-${tierApplied.toUnits || '∞'}`
          : 'Tasa contractual',
      },
    },
    intermediateSteps: buildRoyaltySteps(input, baseAmount, applicableRate, grossRoyalty, effectiveRoyalty, netRoyalty, mg, advance),
    warnings,
    confidenceLevel: input.basis === 'documented' ? 95 : input.basis === 'hypothesis' ? 35 : 70,
    limitations: [
      input.basis === 'hypothesis' ? 'Baseado en hipótesis. Requiere verificación contractual.' : '',
      !input.evidenceId ? 'Sin evidencia documental asociada.' : '',
    ].filter(Boolean),
  };

  return {
    royaltyBase: input.royaltyBase,
    baseAmount,
    applicableRate,
    grossRoyalty: roundFinancial(grossRoyalty),
    minimumGuarantee: mg ? roundFinancial(mg) : undefined,
    advance: advance ? roundFinancial(advance) : undefined,
    recoverableAdvance: recoverable,
    netRoyalty: roundFinancial(netRoyalty),
    effectiveRoyalty: roundFinancial(effectiveRoyalty),
    currency,
    tierApplied,
    calculationTrace: trace,
    warnings,
  };
}

// ============================================================
// ROYALTIES ESCALONADOS
// ============================================================

export interface TieredRoyaltyInput {
  royaltyBase: RoyaltyBase;
  tiers: RoyaltyTier[];
  unitsPerPeriod: { period: number; units: number; baseAmountPerUnit: Decimal | number | string }[];
  currency: Currency;
  valuationDate: string;
  basis: DataBasis;
  sourceId?: string;
  evidenceId?: string;
}

export interface TieredRoyaltyResult {
  periods: {
    period: number;
    units: number;
    baseAmount: Decimal;
    tierApplied: RoyaltyTier;
    royalty: Decimal;
  }[];
  totalRoyalty: Decimal;
  currency: Currency;
  trace: CalculationTrace;
}

/**
 * Calcula royalties escalonados por períodos.
 * Cada período puede tener diferentes unidades y aplicar diferentes tramos.
 */
export function tieredRoyaltyEngine(input: TieredRoyaltyInput): TieredRoyaltyResult {
  const periods: TieredRoyaltyResult['periods'] = [];
  let totalRoyalty = new Decimal(0);

  for (const p of input.unitsPerPeriod) {
    const baseAmountPerUnit = toDecimal(p.baseAmountPerUnit);
    const totalBase = baseAmountPerUnit.times(p.units);
    const tier = findApplicableTier(input.tiers, p.units);

    if (!tier) {
      throw new Error(`PERITO_IP_ERROR: No se encontró tramo aplicable para ${p.units} unidades en período ${p.period}.`);
    }

    const royalty = totalBase.times(tier.rate);
    totalRoyalty = totalRoyalty.plus(royalty);

    periods.push({
      period: p.period,
      units: p.units,
      baseAmount: roundFinancial(totalBase),
      tierApplied: tier,
      royalty: roundFinancial(royalty),
    });
  }

  const trace: CalculationTrace = {
    calculationId: generateCalculationId('TROY'),
    engine: 'valuation.tieredRoyaltyEngine',
    formula: 'Royalty_t = Base_t × Rate(tier_t)',
    valuationDate: input.valuationDate,
    currency: input.currency,
    calculationVersion: '1.0.0',
    createdAt: new Date().toISOString(),
    inputs: {
      royaltyBase: { value: input.royaltyBase, source: input.basis, justification: 'Base contractual' },
      numberOfTiers: { value: input.tiers.length.toString(), source: input.basis, justification: 'Tramos escalonados' },
    },
    intermediateSteps: periods.map((p, i) => ({
      stepNumber: i + 1,
      description: `Período ${p.period}: ${p.units} unidades, tramo ${p.tierApplied.fromUnits}-${p.tierApplied.toUnits || '∞'}`,
      formula: `${p.baseAmount.toString()} × ${p.tierApplied.rate.toString()}`,
      inputs: { base: p.baseAmount.toString(), rate: p.tierApplied.rate.toString() },
      result: p.royalty.toString(),
    })),
    warnings: [],
    confidenceLevel: input.basis === 'documented' ? 95 : 70,
    limitations: [],
  };

  return {
    periods,
    totalRoyalty: roundFinancial(totalRoyalty),
    currency: input.currency,
    trace,
  };
}

// ============================================================
// UTILIDADES
// ============================================================

function findApplicableTier(tiers: RoyaltyTier[], units: number): RoyaltyTier | undefined {
  return tiers.find(tier => {
    const fromOk = units >= tier.fromUnits;
    const toOk = tier.toUnits === null || units <= tier.toUnits;
    return fromOk && toOk;
  });
}

function buildRoyaltySteps(
  input: RoyaltyEngineInput,
  baseAmount: Decimal,
  applicableRate: Decimal,
  grossRoyalty: Decimal,
  effectiveRoyalty: Decimal,
  netRoyalty: Decimal,
  mg: Decimal | undefined,
  advance: Decimal | undefined,
): { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] {
  const steps: { stepNumber: number; description: string; formula: string; inputs: Record<string, string>; result: string }[] = [];
  let stepNum = 1;

  if (input.royaltyBase !== 'FIXED_PAYMENT') {
    steps.push({
      stepNumber: stepNum++,
      description: 'Calcular royalty bruto',
      formula: `Base × Rate = ${input.royaltyBase} × ${applicableRate.toString()}`,
      inputs: { base: baseAmount.toString(), rate: applicableRate.toString() },
      result: grossRoyalty.toString(),
    });
  }

  if (mg && mg.gt(grossRoyalty)) {
    steps.push({
      stepNumber: stepNum++,
      description: 'Aplicar mínimo garantizado',
      formula: `MAX(royalty, MG) = MAX(${grossRoyalty.toString()}, ${mg.toString()})`,
      inputs: { royalty: grossRoyalty.toString(), mg: mg.toString() },
      result: effectiveRoyalty.toString(),
    });
  }

  if (advance && input.recoverable) {
    steps.push({
      stepNumber: stepNum++,
      description: 'Recuperar anticipo',
      formula: `MAX(0, royalty - advance) = MAX(0, ${effectiveRoyalty.toString()} - ${advance.toString()})`,
      inputs: { royalty: effectiveRoyalty.toString(), advance: advance.toString() },
      result: netRoyalty.toString(),
    });
  }

  return steps;
}
