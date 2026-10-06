import React from 'react';
import { SectionWrapper, Card, CodeBlock, InfoBox, Table, Badge } from '../shared';

export default function MathEnginesSection() {
  return (
    <SectionWrapper number="Sección 6" title="Motores Matemáticos" subtitle="Implementación determinista con tests automatizados — Nunca delegados al LLM">
      
      <Card title="🧮 Motor 3: Valoración por Coste">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-bold text-blue-800">A. COSTE HISTÓRICO ACREDITADO</p>
            <CodeBlock language="typescript">{`
function calculateHistoricalCost(components: CostComponent[]): Decimal {
  // Suma de todos los costes documentados con evidencia
  return components
    .filter(c => c.basis === 'documented' || c.basis === 'invoice')
    .reduce((sum, c) => sum.plus(convertToBaseCurrency(c.amount, c.currency)), new Decimal(0));
}
// Fórmula: CH = Σ(costes_documentados_i)
// Requisito: Cada coste debe tener evidencia que lo acredite`}</CodeBlock>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs font-bold text-indigo-800">B. COSTE DE REPRODUCCIÓN</p>
            <CodeBlock language="typescript">{`
function calculateReproductionCost(components: CostComponent[], priceIndex: Decimal): Decimal {
  // Coste actual de reproducir la obra con precios corrientes
  return components
    .reduce((sum, c) => sum.plus(convertToBaseCurrency(c.amount, c.currency).times(priceIndex)), new Decimal(0));
}
// Fórmula: CR = Σ(costes_i × índice_precios_actual)
// El índice de precios debe tener fuente documentada`}</CodeBlock>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-bold text-purple-800">C. COSTE DE REEMPLAZO</p>
            <CodeBlock language="typescript">{`
function calculateReplacementCost(equivalentComponents: CostComponent[]): Decimal {
  // Coste de crear una obra equivalente con métodos y materiales actuales
  return equivalentComponents
    .reduce((sum, c) => sum.plus(convertToBaseCurrency(c.amount, c.currency)), new Decimal(0));
}
// Fórmula: CS = Σ(costes_equivalentes_i)
// Puede diferir del coste de reproducción si la tecnología ha cambiado`}</CodeBlock>
          </div>
          <InfoBox type="warning">
            <strong>Importante:</strong> El coste NO se presenta automáticamente como valor de mercado. 
            Es un método de valoración que indica el suelo mínimo en determinadas circunstancias.
          </InfoBox>
        </div>
      </Card>

      <Card title="📈 Motor 4: Comparables de Mercado">
        <CodeBlock language="typescript">{`
// Sistema de puntuación de comparabilidad
function calculateComparabilityScore(comparable: ComparableData, target: AssetData): number {
  let score = 100;
  
  // Penalizaciones por diferencias
  if (comparable.territory !== target.territory) score -= 15;
  if (comparable.genre !== target.genre) score -= 20;
  if (comparable.format !== target.format) score -= 15;
  if (comparable.developmentPhase !== target.developmentPhase) score -= 10;
  
  // Diferencia temporal (años)
  const yearDiff = Math.abs(currentYear - comparable.transactionYear);
  score -= Math.min(yearDiff * 3, 20);
  
  // Diferencia de audiencia/alcance
  if (comparable.audience && target.audience) {
    const ratio = comparable.audience / target.audience;
    if (ratio < 0.5 || ratio > 2) score -= 10;
  }
  
  // Derechos incluidos vs. derechos valorados
  const rightsOverlap = calculateRightsOverlap(comparable.rightsIncluded, target.rights);
  score -= (1 - rightsOverlap) * 15;
  
  return Math.max(0, score);
}

// Valoración por comparables ajustados
function marketValuation(comparables: ScoredComparable[]): {
  weightedAverage: Decimal;
  range: { lower: Decimal; upper: Decimal };
  confidenceLevel: number;
} {
  // Solo comparables con score >= 50
  const valid = comparables.filter(c => c.score >= 50);
  
  if (valid.length === 0) {
    return { weightedAverage: new Decimal(0), range: { lower: new Decimal(0), upper: new Decimal(0) }, confidenceLevel: 0 };
  }
  
  // Media ponderada por puntuación de comparabilidad
  const totalWeight = valid.reduce((s, c) => s + c.score, 0);
  const weighted = valid.reduce((s, c) => s.plus(c.adjustedAmount.times(c.score)), new Decimal(0));
  const weightedAverage = weighted.div(totalWeight);
  
  // Rango: percentil 25 - percentil 75 de comparables ajustados
  const sorted = valid.map(c => c.adjustedAmount).sort((a, b) => a.minus(b).toNumber());
  const lower = sorted[Math.floor(sorted.length * 0.25)];
  const upper = sorted[Math.floor(sorted.length * 0.75)];
  
  // Confianza basada en número y calidad de comparables
  const confidenceLevel = Math.min(100, valid.length * 15 + (valid.reduce((s, c) => s + c.score, 0) / valid.length));
  
  return { weightedAverage, range: { lower, upper }, confidenceLevel };
}`}</CodeBlock>
      </Card>

      <Card title="💹 Motor 5: Ingresos / DCF">
        <CodeBlock language="typescript">{`
// Cálculo de Flujo de Caja Descontado (DCF)
function calculateDCF(
  incomeStreams: IncomeProjection[],
  costStreams: CostProjection[],
  discountRate: Decimal,
  terminalGrowthRate: Decimal,
  projectionYears: number
): DCFResult {
  
  const flows: AnnualFlow[] = [];
  let npv = new Decimal(0);
  
  for (let year = 1; year <= projectionYears; year++) {
    // Ingresos del año
    const yearIncome = incomeStreams.reduce((sum, s) => {
      const projection = s.projections.find(p => p.year === year);
      return sum.plus(projection ? projection.amount : new Decimal(0));
    }, new Decimal(0));
    
    // Costes del año
    const yearCosts = costStreams.reduce((sum, c) => {
      const projection = c.projections.find(p => p.year === year);
      return sum.plus(projection ? projection.amount : new Decimal(0));
    }, new Decimal(0));
    
    // Flujo neto
    const netFlow = yearIncome.minus(yearCosts);
    
    // Factor de descuento
    const discountFactor = new Decimal(1).div(
      new Decimal(1).plus(discountRate).pow(year)
    );
    
    // Valor presente del flujo
    const presentValue = netFlow.times(discountFactor);
    
    flows.push({ year, income: yearIncome, costs: yearCosts, netFlow, discountFactor, presentValue });
    npv = npv.plus(presentValue);
  }
  
  // Valor terminal (si aplica)
  const lastFlow = flows[flows.length - 1];
  const terminalValue = lastFlow.netFlow
    .times(new Decimal(1).plus(terminalGrowthRate))
    .div(discountRate.minus(terminalGrowthRate));
  
  const terminalPV = terminalValue.div(
    new Decimal(1).plus(discountRate).pow(projectionYears)
  );
  
  return {
    annualFlows: flows,
    npv: npv.plus(terminalPV),
    terminalValue,
    terminalPV,
    discountRate,
    projectionYears
  };
}

// Fórmula DCF:
// NPV = Σ[FCF_t / (1+r)^t] + TV / (1+r)^n
// donde TV = FCF_n × (1+g) / (r-g)
// FCF = Flujo de caja libre del año t
// r = tasa de descuento
// g = tasa de crecimiento terminal
// n = años de proyección`}</CodeBlock>
      </Card>

      <Card title="🎲 Motor 6: Monte Carlo">
        <CodeBlock language="typescript">{`
// Simulación Monte Carlo
function runMonteCarlo(
  variables: ProbabilisticVariable[],
  calculationFn: (values: Record<string, number>) => Decimal,
  iterations: number = 10000
): MonteCarloResult {
  
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Muestrear cada variable según su distribución
    const sampledValues: Record<string, number> = {};
    for (const variable of variables) {
      sampledValues[variable.name] = sampleFromDistribution(variable.distribution);
    }
    
    // Calcular resultado con valores muestreados
    const result = calculationFn(sampledValues);
    results.push(result.toNumber());
  }
  
  // Calcular estadísticos
  results.sort((a, b) => a - b);
  
  return {
    iterations,
    percentiles: {
      p5: results[Math.floor(iterations * 0.05)],
      p10: results[Math.floor(iterations * 0.10)],
      p25: results[Math.floor(iterations * 0.25)],
      p50: results[Math.floor(iterations * 0.50)], // Mediana, NO media
      p75: results[Math.floor(iterations * 0.75)],
      p90: results[Math.floor(iterations * 0.90)],
      p95: results[Math.floor(iterations * 0.95)],
    },
    mean: results.reduce((s, v) => s + v, 0) / iterations,
    stdDev: calculateStdDev(results),
    min: results[0],
    max: results[iterations - 1],
    distribution: buildHistogram(results, 50), // 50 bins
    convergenceReached: checkConvergence(results)
  };
}

// Distribuciones soportadas
function sampleFromDistribution(dist: ProbabilityDistribution): number {
  switch (dist.type) {
    case 'normal': return normalRandom(dist.params.mean, dist.params.stdDev);
    case 'uniform': return uniformRandom(dist.params.min, dist.params.max);
    case 'triangular': return triangularRandom(dist.params.min, dist.params.mode, dist.params.max);
    case 'lognormal': return lognormalRandom(dist.params.mean, dist.params.stdDev);
    case 'beta': return betaRandom(dist.params.alpha, dist.params.beta, dist.params.min, dist.params.max);
    default: throw new Error(\`Distribución no soportada: \${dist.type}\`);
  }
}`}</CodeBlock>
      </Card>

      <Card title="⚖️ Motor 8: Triangulación">
        <CodeBlock language="typescript">{`
// Triangulación de métodos — NUNCA una media aritmética automática
function triangulate(
  costResult: ValuationResult,
  marketResult: ValuationResult | null,
  incomeResult: ValuationResult | null,
  monteCarloResult: MonteCarloResult | null,
  evidenceQuality: EvidenceQualityAssessment
): TriangulationResult {
  
  // Determinar pesos según calidad de evidencia disponible
  const weights = determineWeights(evidenceQuality);
  // weights = { cost: 0.0-1.0, market: 0.0-1.0, income: 0.0-1.0, probabilistic: 0.0-1.0 }
  // La suma de pesos activos = 1.0
  
  // Calcular valor central ponderado
  let centralValue = new Decimal(0);
  if (costResult.value && weights.cost > 0) {
    centralValue = centralValue.plus(costResult.value.times(weights.cost));
  }
  if (marketResult?.value && weights.market > 0) {
    centralValue = centralValue.plus(marketResult.value.times(weights.market));
  }
  if (incomeResult?.value && weights.income > 0) {
    centralValue = centralValue.plus(incomeResult.value.times(weights.income));
  }
  if (monteCarloResult && weights.probabilistic > 0) {
    // Usar mediana de Monte Carlo, NO la media
    centralValue = centralValue.plus(new Decimal(monteCarloResult.percentiles.p50).times(weights.probabilistic));
  }
  
  // Rango defendible
  const lowerBound = calculateLowerBound(costResult, marketResult, incomeResult, monteCarloResult);
  const upperBound = calculateUpperBound(costResult, marketResult, incomeResult, monteCarloResult);
  
  // Nivel de confianza global
  const confidenceLevel = calculateOverallConfidence(evidenceQuality, weights);
  
  return {
    centralValue,
    lowerBound,
    upperBound,
    weights,
    confidenceLevel,
    methodologyNotes: generateMethodologyNotes(weights, evidenceQuality),
    modifyingFactors: identifyModifyingFactors(evidenceQuality)
  };
}`}</CodeBlock>
      </Card>

      <Card title="🧪 Tests Automatizados Requeridos">
        <Table
          headers={['Motor', 'Test', 'Caso']}
          rows={[
            ['DCF', 'NPV con flujos constantes', 'Verificar contra fórmula manual'],
            ['DCF', 'Tasa de descuento = 0', 'NPV = suma de flujos'],
            ['DCF', 'Un solo período', 'Verificar factor de descuento'],
            ['Monte Carlo', 'Distribución uniforme', 'Verificar que resultados están en [min, max]'],
            ['Monte Carlo', 'Convergencia', 'Verificar que más iteraciones no cambia percentiles >1%'],
            ['Comparables', 'Score máximo', 'Activo idéntico = score 100'],
            ['Comparables', 'Sin comparables', 'Retorna confidenceLevel = 0'],
            ['Coste', 'Sin evidencias', 'Retorna 0 con flag "datos insuficientes"'],
            ['Triangulación', 'Un solo método', 'Peso = 1.0 para ese método'],
            ['Moneda', 'Conversión EUR/USD', 'Verificar contra tipo BCE del día'],
            ['Decimal', 'Precisión', '0.1 + 0.2 = 0.3 (no 0.30000000000000004)'],
          ]}
        />
      </Card>

      <InfoBox type="success">
        <strong>Principio rector:</strong> Cada función matemática tiene su fórmula documentada, sus tests automatizados, 
        y produce un resultado que incluye SIEMPRE: valor, fuente de cada variable, nivel de confianza y limitaciones.
      </InfoBox>
    </SectionWrapper>
  );
}
