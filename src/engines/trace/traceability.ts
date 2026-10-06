/**
 * PERITO IP — Capa 2.18: Trazabilidad Matemática
 * 
 * Todo resultado monetario conserva:
 * value, currency, valuation_date, source_id, evidence_id, assumption_id,
 * formula, input_dependencies, confidence, created_at, calculation_version
 * 
 * Permite seleccionar cualquier resultado y reconstruir:
 * INPUTS, FORMULA, INTERMEDIATE CALCULATIONS, OUTPUT, SOURCES, EVIDENCE, ASSUMPTIONS, VERSION
 */

import { CalculationTrace, TraceInput } from '../types';

// ============================================================
// TIPOS
// ============================================================

export interface TraceabilityReport {
  calculationId: string;
  engine: string;
  formula: string;
  valuationDate: string;
  currency: string;
  calculationVersion: string;
  createdAt: string;
  
  // Reconstrucción completa
  reconstruction: {
    inputs: TraceInput[];
    formula: string;
    intermediateCalculations: {
      step: number;
      description: string;
      formula: string;
      inputs: Record<string, string>;
      output: string;
    }[];
    finalOutput: string;
    sources: { id?: string; description: string }[];
    evidence: { id?: string; description: string }[];
    assumptions: { id?: string; description: string; basis: string }[];
    version: string;
  };
  
  // Calidad de la trazabilidad
  completeness: {
    hasInputs: boolean;
    hasFormula: boolean;
    hasIntermediateSteps: boolean;
    hasSources: boolean;
    hasEvidence: boolean;
    hasAssumptions: boolean;
    score: number; // 0-100
  };
}

// ============================================================
// GENERADOR DE REPORTE DE TRAZABILIDAD
// ============================================================

/**
 * Genera un reporte completo de trazabilidad para cualquier cálculo.
 * Permite reconstruir íntegramente el cálculo desde sus inputs.
 */
export function generateTraceabilityReport(trace: CalculationTrace): TraceabilityReport {
  // Extraer inputs
  const inputs = Object.entries(trace.inputs).map(([name, input]) => ({
    ...input,
    justification: `${name}: ${input.justification}`,
  }));

  // Extraer intermediate calculations
  const intermediateCalculations = trace.intermediateSteps.map(step => ({
    step: step.stepNumber,
    description: step.description,
    formula: step.formula,
    inputs: step.inputs,
    output: step.result,
  }));

  // Extraer fuentes
  const sources: { id?: string; description: string }[] = [];
  for (const input of inputs) {
    if (input.sourceId) {
      sources.push({ id: input.sourceId, description: input.justification });
    }
  }

  // Extraer evidencias
  const evidence: { id?: string; description: string }[] = [];
  for (const input of inputs) {
    if (input.evidenceId) {
      evidence.push({ id: input.evidenceId, description: input.justification });
    }
  }

  // Extraer suposiciones
  const assumptions: { id?: string; description: string; basis: string }[] = [];
  for (const input of inputs) {
    if (input.assumptionId || input.source === 'hypothesis' || input.source === 'estimate') {
      assumptions.push({
        id: input.assumptionId,
        description: input.justification,
        basis: input.source,
      });
    }
  }

  // Output final
  const finalOutput = intermediateCalculations.length > 0
    ? intermediateCalculations[intermediateCalculations.length - 1].output
    : 'N/A';

  // Calcular completitud
  const completeness = {
    hasInputs: inputs.length > 0,
    hasFormula: !!trace.formula,
    hasIntermediateSteps: intermediateCalculations.length > 0,
    hasSources: sources.length > 0,
    hasEvidence: evidence.length > 0,
    hasAssumptions: assumptions.length > 0,
    score: calculateCompletenessScore(trace),
  };

  return {
    calculationId: trace.calculationId,
    engine: trace.engine,
    formula: trace.formula,
    valuationDate: trace.valuationDate,
    currency: trace.currency,
    calculationVersion: trace.calculationVersion,
    createdAt: trace.createdAt,
    reconstruction: {
      inputs,
      formula: trace.formula,
      intermediateCalculations,
      finalOutput,
      sources,
      evidence,
      assumptions,
      version: trace.calculationVersion,
    },
    completeness,
  };
}

/**
 * Verifica que un resultado tenga trazabilidad completa.
 */
export function verifyTraceability(trace: CalculationTrace): {
  isValid: boolean;
  missing: string[];
  score: number;
} {
  const missing: string[] = [];

  if (!trace.calculationId) missing.push('calculationId');
  if (!trace.formula) missing.push('formula');
  if (!trace.valuationDate) missing.push('valuationDate');
  if (!trace.currency) missing.push('currency');
  if (!trace.calculationVersion) missing.push('calculationVersion');
  if (!trace.createdAt) missing.push('createdAt');
  if (Object.keys(trace.inputs).length === 0) missing.push('inputs (vacío)');
  if (trace.intermediateSteps.length === 0) missing.push('intermediateSteps (vacío)');

  // Verificar que cada input tenga justificación
  for (const [name, input] of Object.entries(trace.inputs)) {
    if (!input.justification) missing.push(`input.${name}.justification`);
    if (!input.source) missing.push(`input.${name}.source`);
  }

  const score = calculateCompletenessScore(trace);

  return {
    isValid: missing.length === 0,
    missing,
    score,
  };
}

// ============================================================
// UTILIDADES
// ============================================================

function calculateCompletenessScore(trace: CalculationTrace): number {
  let score = 0;
  const maxScore = 100;

  // Inputs (25 puntos)
  const inputCount = Object.keys(trace.inputs).length;
  score += Math.min(25, inputCount * 5);

  // Fórmula (15 puntos)
  if (trace.formula) score += 15;

  // Intermediate steps (20 puntos)
  score += Math.min(20, trace.intermediateSteps.length * 4);

  // Sources (15 puntos)
  const hasSources = Object.values(trace.inputs).some(i => i.sourceId);
  if (hasSources) score += 15;

  // Evidence (15 puntos)
  const hasEvidence = Object.values(trace.inputs).some(i => i.evidenceId);
  if (hasEvidence) score += 15;

  // Assumptions documented (10 puntos)
  const hasAssumptions = Object.values(trace.inputs).some(
    i => i.source === 'hypothesis' || i.source === 'estimate' || i.assumptionId
  );
  if (hasAssumptions) score += 10;

  return Math.min(maxScore, score);
}
