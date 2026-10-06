/**
 * PERITO IP — Tests automatizados para el Motor Cuantitativo Pericial
 * 
 * Cada test define previamente el resultado matemático esperado.
 * Se utilizan expedientes ficticios — no información privada real.
 * 
 * Ejecutar: npx vitest run src/engines/__tests__/engines.test.ts
 */

import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  presentValue,
  netPresentValue,
  futureValue,
  roundFinancial,
  dcfEngine,
  royaltyEngine,
  costValuationEngine,
  marketComparableEngine,
  bookValuationEngine,
  audiovisualValuationEngine,
  adaptationRightsEngine,
  reliefFromRoyaltyEngine,
  scenarioEngine,
  monteCarloEngine,
  lostProfitsEngine,
  hypotheticalLicenseEngine,
  checkValuationDateCutoff,
  doubleCountingDetector,
  valuationTriangulationEngine,
  sensitivityEngine,
  generateTraceabilityReport,
  verifyTraceability,
} from '../index';

// ============================================================
// CAPA 2.1 — NÚCLEO MATEMÁTICO
// ============================================================

describe('2.1 — Present Value', () => {
  it('PV de 1000€ en período 1 con tasa 10% = 909.09€', () => {
    const result = presentValue({
      cashFlow: 1000,
      period: 1,
      discountRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.presentValue.toDecimalPlaces(2).toNumber()).toBeCloseTo(909.09, 1);
  });

  it('PV de 1000€ en período 0 = 1000€ (sin descuento)', () => {
    const result = presentValue({
      cashFlow: 1000,
      period: 0,
      discountRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.presentValue.toNumber()).toBe(1000);
  });

  it('PV conserva trazabilidad completa', () => {
    const result = presentValue({
      cashFlow: 500,
      period: 2,
      discountRate: 0.08,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      basis: 'documented',
    });
    expect(result.trace.formula).toBe('PV = CF_t / (1 + k)^t');
    expect(result.trace.inputs.cashFlow.value).toBe('500');
    expect(result.trace.intermediateSteps.length).toBeGreaterThan(0);
  });
});

describe('2.1 — NPV', () => {
  it('NPV de flujos constantes 100€ durante 3 años al 10%', () => {
    const result = netPresentValue({
      cashFlows: [
        { period: 1, amount: new Decimal(100), currency: 'EUR', basis: 'documented' },
        { period: 2, amount: new Decimal(100), currency: 'EUR', basis: 'documented' },
        { period: 3, amount: new Decimal(100), currency: 'EUR', basis: 'documented' },
      ],
      discountRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    // NPV = 100/1.1 + 100/1.21 + 100/1.331 = 90.91 + 82.64 + 75.13 = 248.68
    expect(result.npv.toDecimalPlaces(2).toNumber()).toBeCloseTo(248.69, 0);
  });
});

describe('2.1 — Future Value', () => {
  it('FV de 1000€ a 2 períodos con tasa 5% = 1102.50€', () => {
    const result = futureValue({
      presentValue: 1000,
      periods: 2,
      discountRate: 0.05,
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.futureValue.toDecimalPlaces(2).toNumber()).toBeCloseTo(1102.50, 1);
  });
});

// ============================================================
// CAPA 2.2 — MOTOR DCF
// ============================================================

describe('2.2 — DCF Engine', () => {
  it('DCF básico con 3 flujos y sin valor terminal', () => {
    const result = dcfEngine({
      valuationDate: '2024-01-01',
      cashFlows: [
        { period: 1, amount: new Decimal(1000), currency: 'EUR', basis: 'documented' },
        { period: 2, amount: new Decimal(1200), currency: 'EUR', basis: 'documented' },
        { period: 3, amount: new Decimal(1400), currency: 'EUR', basis: 'documented' },
      ],
      discountRate: 0.10,
      currency: 'EUR',
      assumptions: [],
      sources: [],
    });
    // PV1 = 1000/1.1 = 909.09
    // PV2 = 1200/1.21 = 991.74
    // PV3 = 1400/1.331 = 1051.84
    // Total = 2952.67
    expect(result.totalValue.toDecimalPlaces(0).toNumber()).toBeCloseTo(2953, -1);
    expect(result.terminalValue).toBeUndefined();
  });

  it('DCF con valor terminal Gordon', () => {
    const result = dcfEngine({
      valuationDate: '2024-01-01',
      cashFlows: [
        { period: 1, amount: new Decimal(1000), currency: 'EUR', basis: 'documented' },
        { period: 2, amount: new Decimal(1100), currency: 'EUR', basis: 'documented' },
        { period: 3, amount: new Decimal(1200), currency: 'EUR', basis: 'documented' },
      ],
      discountRate: 0.10,
      currency: 'EUR',
      terminalValue: { method: 'gordon', growthRate: 0.02 },
      assumptions: [],
      sources: [],
    });
    // TV = 1200 × 1.02 / (0.10 - 0.02) = 1224 / 0.08 = 15300
    // PV_TV = 15300 / 1.331 = 11495.12
    expect(result.terminalValue!.toDecimalPlaces(0).toNumber()).toBe(15300);
    expect(result.totalValue.gt(result.totalPresentValue)).toBe(true);
  });

  it('DCF rechaza tasa de crecimiento >= tasa de descuento en Gordon', () => {
    expect(() => dcfEngine({
      valuationDate: '2024-01-01',
      cashFlows: [{ period: 1, amount: new Decimal(1000), currency: 'EUR', basis: 'documented' }],
      discountRate: 0.10,
      currency: 'EUR',
      terminalValue: { method: 'gordon', growthRate: 0.10 },
      assumptions: [],
      sources: [],
    })).toThrow();
  });
});

// ============================================================
// CAPA 2.3 — MOTOR DE ROYALTIES
// ============================================================

describe('2.3 — Royalty Engine', () => {
  it('Royalty básico: 10000€ base PVP × 10% = 1000€', () => {
    const result = royaltyEngine({
      royaltyBase: 'PVP',
      baseAmount: 10000,
      royaltyRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      basis: 'documented',
    });
    expect(result.grossRoyalty.toNumber()).toBe(1000);
  });

  it('Royalty con mínimo garantizado mayor al calculado', () => {
    const result = royaltyEngine({
      royaltyBase: 'NET_RECEIPTS',
      baseAmount: 5000,
      royaltyRate: 0.10, // 500€
      minimumGuarantee: 800, // MG mayor
      currency: 'EUR',
      valuationDate: '2024-01-01',
      basis: 'documented',
    });
    expect(result.effectiveRoyalty.toNumber()).toBe(800);
  });

  it('Royalty con anticipo recuperable', () => {
    const result = royaltyEngine({
      royaltyBase: 'PVP',
      baseAmount: 20000,
      royaltyRate: 0.10, // 2000€
      advance: 500,
      recoverable: true,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      basis: 'documented',
    });
    expect(result.netRoyalty.toNumber()).toBe(1500); // 2000 - 500
  });

  it('Rechaza royalty sin base explícita', () => {
    expect(() => royaltyEngine({
      royaltyBase: '' as any,
      baseAmount: 10000,
      royaltyRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      basis: 'documented',
    })).toThrow();
  });
});

// ============================================================
// CAPA 2.4 — MOTOR DE COSTE
// ============================================================

describe('2.4 — Cost Valuation Engine', () => {
  it('Coste histórico suma componentes verificados', () => {
    const result = costValuationEngine({
      method: 'historical',
      components: [
        { id: '1', category: 'writing', description: 'Escritura', amount: new Decimal(10000), currency: 'EUR', date: '2023-01-01', basis: 'documented', verifiedStatus: 'verified' },
        { id: '2', category: 'editing', description: 'Edición', amount: new Decimal(5000), currency: 'EUR', date: '2023-06-01', basis: 'documented', verifiedStatus: 'verified' },
      ],
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.totalCost.toNumber()).toBe(15000);
    expect(result.percentageVerified).toBe(100);
    expect(result.disclaimer).toContain('COSTE HISTÓRICO');
  });

  it('Coste de reproducción aplica índice de precios', () => {
    const result = costValuationEngine({
      method: 'reproduction',
      components: [
        { id: '1', category: 'writing', description: 'Escritura', amount: new Decimal(10000), currency: 'EUR', date: '2020-01-01', basis: 'documented', verifiedStatus: 'verified' },
      ],
      priceIndex: 1.20,
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.totalCost.toNumber()).toBe(12000);
  });
});

// ============================================================
// CAPA 2.5 — MOTOR DE COMPARABLES
// ============================================================

describe('2.5 — Market Comparable Engine', () => {
  it('Retorna mensaje de datos insuficientes sin comparables', () => {
    const result = marketComparableEngine({
      target: { assetType: 'published_book' },
      comparables: [],
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.validComparables).toBe(0);
    expect(result.insufficientDataMessage).not.toBeNull();
  });

  it('Puntúa comparables y calcula valor ponderado', () => {
    const result = marketComparableEngine({
      target: { assetType: 'published_book', genre: 'thriller', territory: 'ES' },
      comparables: [
        {
          id: 'c1', assetType: 'published_book', genre: 'thriller', territory: 'ES',
          transactionDate: '2023-01-01', transactionType: 'license',
          reportedValue: new Decimal(50000), currency: 'EUR', sourceId: 's1', reliability: 'documented',
        },
        {
          id: 'c2', assetType: 'published_book', genre: 'thriller', territory: 'ES',
          transactionDate: '2023-06-01', transactionType: 'sale',
          reportedValue: new Decimal(60000), currency: 'EUR', sourceId: 's2', reliability: 'documented',
        },
      ],
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.validComparables).toBeGreaterThan(0);
    expect(result.weightedAverageValue).not.toBeNull();
  });
});

// ============================================================
// CAPA 2.10 — ESCENARIOS
// ============================================================

describe('2.10 — Scenario Engine', () => {
  it('Calcula tres escenarios y los compara', () => {
    const result = scenarioEngine({
      scenarios: [
        {
          type: 'conservative',
          variables: [{ name: 'sales', value: new Decimal(1000), source: 'estimate', justification: 'Bajo' }],
          calculationFn: (vars) => vars.sales.times(10),
          assumptions: ['Ventas bajas'],
          limitations: [],
        },
        {
          type: 'base',
          variables: [{ name: 'sales', value: new Decimal(2000), source: 'estimate', justification: 'Medio' }],
          calculationFn: (vars) => vars.sales.times(10),
          assumptions: ['Ventas medias'],
          limitations: [],
        },
        {
          type: 'expansive',
          variables: [{ name: 'sales', value: new Decimal(3000), source: 'estimate', justification: 'Alto' }],
          calculationFn: (vars) => vars.sales.times(10),
          assumptions: ['Ventas altas'],
          limitations: [],
        },
      ],
      currency: 'EUR',
      valuationDate: '2024-01-01',
      description: 'Test',
    });
    expect(result.comparison.conservative!.toNumber()).toBe(10000);
    expect(result.comparison.base!.toNumber()).toBe(20000);
    expect(result.comparison.expansive!.toNumber()).toBe(30000);
    expect(result.comparison.spread!.toNumber()).toBe(20000);
  });
});

// ============================================================
// CAPA 2.11 — MONTE CARLO
// ============================================================

describe('2.11 — Monte Carlo Engine', () => {
  it('Es reproducible con mismo seed', () => {
    const fn = (vars: Record<string, Decimal>) => vars.sales.times(vars.price);
    
    const result1 = monteCarloEngine({
      variables: [
        { variableName: 'sales', distribution: { type: 'uniform', params: { min: 100, max: 200 } }, source: 'estimate', justification: 'test' },
        { variableName: 'price', distribution: { type: 'fixed', params: { value: 10 } }, source: 'documented', justification: 'test' },
      ],
      calculationFn: fn,
      iterations: 1000,
      seed: 42,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      modelVersion: '1.0.0',
    });

    const result2 = monteCarloEngine({
      variables: [
        { variableName: 'sales', distribution: { type: 'uniform', params: { min: 100, max: 200 } }, source: 'estimate', justification: 'test' },
        { variableName: 'price', distribution: { type: 'fixed', params: { value: 10 } }, source: 'documented', justification: 'test' },
      ],
      calculationFn: fn,
      iterations: 1000,
      seed: 42,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      modelVersion: '1.0.0',
    });

    expect(result1.percentiles.p50.toNumber()).toBe(result2.percentiles.p50.toNumber());
    expect(result1.mean.toNumber()).toBe(result2.mean.toNumber());
  });

  it('Muestra percentiles requeridos', () => {
    const result = monteCarloEngine({
      variables: [
        { variableName: 'x', distribution: { type: 'normal', params: { mean: 100, stdDev: 10 } }, source: 'estimate', justification: 'test' },
      ],
      calculationFn: (vars) => vars.x,
      iterations: 5000,
      seed: 123,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      modelVersion: '1.0.0',
    });
    expect(result.percentiles.p10).toBeDefined();
    expect(result.percentiles.p25).toBeDefined();
    expect(result.percentiles.p50).toBeDefined();
    expect(result.percentiles.p75).toBeDefined();
    expect(result.percentiles.p90).toBeDefined();
  });
});

// ============================================================
// CAPA 2.14 — FECHA DE VALORACIÓN
// ============================================================

describe('2.14 — Valuation Date Cutoff', () => {
  it('Detecta información posterior a la fecha de valoración', () => {
    const result = checkValuationDateCutoff(
      { valuationDate: '2023-01-01', currency: 'EUR', calculationVersion: '1.0.0' },
      '2023-06-01'
    );
    expect(result.isPostValuation).toBe(true);
    expect(result.classification).toBe('post_valuation');
    expect(result.warning).not.toBeNull();
  });

  it('Información anterior es disponible en la valoración', () => {
    const result = checkValuationDateCutoff(
      { valuationDate: '2023-06-01', currency: 'EUR', calculationVersion: '1.0.0' },
      '2023-01-01'
    );
    expect(result.isPostValuation).toBe(false);
    expect(result.classification).toBe('available_at_valuation');
  });
});

// ============================================================
// CAPA 2.15 — DOBLE CONTABILIZACIÓN
// ============================================================

describe('2.15 — Double Counting Detector', () => {
  it('Detecta mismo derecho en mismo territorio', () => {
    const result = doubleCountingDetector([
      { id: 'a', description: 'Derechos editoriales España', right: 'editorial', territory: 'ES' },
      { id: 'b', description: 'Derechos editoriales España (2)', right: 'editorial', territory: 'ES' },
    ]);
    expect(result.potentialDoubleCounting).toBe(true);
    expect(result.blockValuation).toBe(true);
  });

  it('Permite mismo activo por métodos diferentes', () => {
    const result = doubleCountingDetector([
      { id: 'a', description: 'Coste', assetId: 'book1', method: 'cost' },
      { id: 'b', description: 'Ingresos', assetId: 'book1', method: 'income' },
    ]);
    expect(result.blockValuation).toBe(false);
  });
});

// ============================================================
// CAPA 2.17 — SENSIBILIDAD
// ============================================================

describe('2.17 — Sensitivity Engine', () => {
  it('Identifica la variable más impactante', () => {
    const result = sensitivityEngine({
      baseVariables: { sales: 1000, price: 10, cost: 5 },
      calculationFn: (vars) => vars.sales.times(vars.price).minus(vars.cost.times(vars.sales)),
      variablesToTest: ['sales', 'price', 'cost'],
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    expect(result.baseValue.toNumber()).toBe(5000); // 1000*10 - 5*1000
    expect(result.topFive.length).toBeLessThanOrEqual(3);
    expect(result.results[0].rank).toBe(1);
  });
});

// ============================================================
// CAPA 2.18 — TRAZABILIDAD
// ============================================================

describe('2.18 — Traceability', () => {
  it('Genera reporte de trazabilidad completo', () => {
    const pvResult = presentValue({
      cashFlow: 1000,
      period: 1,
      discountRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
      basis: 'documented',
      sourceId: 'src-1',
    });
    
    const report = generateTraceabilityReport(pvResult.trace);
    expect(report.reconstruction.inputs.length).toBeGreaterThan(0);
    expect(report.reconstruction.formula).toBeDefined();
    expect(report.completeness.score).toBeGreaterThan(0);
  });

  it('Verifica trazabilidad', () => {
    const pvResult = presentValue({
      cashFlow: 1000,
      period: 1,
      discountRate: 0.10,
      currency: 'EUR',
      valuationDate: '2024-01-01',
    });
    
    const verification = verifyTraceability(pvResult.trace);
    expect(verification.score).toBeGreaterThan(50);
  });
});

// ============================================================
// PRECISIÓN DECIMAL
// ============================================================

describe('Precisión Decimal', () => {
  it('0.1 + 0.2 = 0.3 (no 0.30000000000000004)', () => {
    const result = new Decimal(0.1).plus(0.2);
    expect(result.toNumber()).toBe(0.3);
  });

  it('roundFinancial redondea a 2 decimales', () => {
    expect(roundFinancial(100.555).toNumber()).toBe(100.56);
    expect(roundFinancial(100.554).toNumber()).toBe(100.55);
  });
});
