/**
 * PERITO IP — Capa 2.15: Detector de Doble Contabilización
 * 
 * Antes de agregar valores comprueba:
 * - mismo derecho, mismo flujo, mismo territorio, mismo período
 * - mismo contrato, mismo ingreso, mismo activo económico
 * - derechos derivados solapados
 * 
 * Si existe posible duplicación: POTENTIAL_DOUBLE_COUNTING
 * Si el riesgo es material: BLOCK_FINAL_VALUATION
 */

import { DoubleCountingCheck } from '../types';

// ============================================================
// TIPOS
// ============================================================

export interface ValuationComponent {
  id: string;
  description: string;
  right?: string;
  territory?: string;
  period?: string;
  contractRef?: string;
  revenueStream?: string;
  assetId?: string;
  derivativeOf?: string; // ID del activo del que deriva
  method?: string;
}

export interface DoubleCountingResult {
  checks: DoubleCountingCheck[];
  potentialDoubleCounting: boolean;
  blockValuation: boolean;
  summary: string;
  recommendations: string[];
}

// ============================================================
// DETECTOR
// ============================================================

/**
 * Analiza un conjunto de componentes de valoración buscando duplicaciones.
 */
export function doubleCountingDetector(components: ValuationComponent[]): DoubleCountingResult {
  const checks: DoubleCountingCheck[] = [];
  let hasPotentialDoubleCounting = false;
  let blockValuation = false;

  // Comparar cada par de componentes
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i];
      const b = components[j];
      const check = compareComponents(a, b);
      if (check.severity !== 'none') {
        checks.push(check);
        if (check.severity === 'high' || check.severity === 'critical') {
          hasPotentialDoubleCounting = true;
        }
        if (check.recommendation === 'block') {
          blockValuation = true;
        }
      }
    }
  }

  const recommendations: string[] = [];
  if (blockValuation) {
    recommendations.push('BLOQUEAR la valoración final. Existe riesgo material de doble contabilización.');
  }
  if (hasPotentialDoubleCounting) {
    recommendations.push('REVISAR los componentes marcados antes de agregar valores.');
  }
  if (checks.some(c => c.overlapType === 'overlapping_derivatives')) {
    recommendations.push('Verificar que los derechos derivados no estén solapados con el activo original.');
  }

  const summary = checks.length === 0
    ? 'No se detectaron riesgos de doble contabilización.'
    : `Se detectaron ${checks.length} posibles solapamientos. ` +
      `${checks.filter(c => c.severity === 'critical').length} críticos, ` +
      `${checks.filter(c => c.severity === 'high').length} altos.`;

  return {
    checks,
    potentialDoubleCounting: hasPotentialDoubleCounting,
    blockValuation,
    summary,
    recommendations,
  };
}

// ============================================================
// COMPARACIÓN DE COMPONENTES
// ============================================================

function compareComponents(a: ValuationComponent, b: ValuationComponent): DoubleCountingCheck {
  // Mismo derecho
  if (a.right && b.right && a.right === b.right && a.territory === b.territory) {
    return {
      componentA: { id: a.id, description: a.description, right: a.right, territory: a.territory },
      componentB: { id: b.id, description: b.description, right: b.right, territory: b.territory },
      overlapType: 'same_right',
      severity: 'critical',
      explanation: `Ambos componentes valoran el mismo derecho (${a.right}) en el mismo territorio (${a.territory}).`,
      recommendation: 'block',
    };
  }

  // Mismo flujo de ingresos
  if (a.revenueStream && b.revenueStream && a.revenueStream === b.revenueStream) {
    return {
      componentA: { id: a.id, description: a.description, right: a.revenueStream },
      componentB: { id: b.id, description: b.description, right: b.revenueStream },
      overlapType: 'same_flow',
      severity: 'critical',
      explanation: `Ambos componentes valoran el mismo flujo de ingresos (${a.revenueStream}).`,
      recommendation: 'block',
    };
  }

  // Mismo contrato
  if (a.contractRef && b.contractRef && a.contractRef === b.contractRef) {
    return {
      componentA: { id: a.id, description: a.description, territory: a.contractRef },
      componentB: { id: b.id, description: b.description, territory: b.contractRef },
      overlapType: 'same_contract',
      severity: 'high',
      explanation: `Ambos componentes se refieren al mismo contrato (${a.contractRef}).`,
      recommendation: 'review',
    };
  }

  // Mismo territorio y período
  if (a.territory && b.territory && a.territory === b.territory &&
      a.period && b.period && a.period === b.period && a.right && b.right) {
    return {
      componentA: { id: a.id, description: a.description, territory: a.territory, period: a.period },
      componentB: { id: b.id, description: b.description, territory: b.territory, period: b.period },
      overlapType: 'same_territory',
      severity: 'medium',
      explanation: `Posible solapamiento territorial (${a.territory}) y temporal (${a.period}).`,
      recommendation: 'review',
    };
  }

  // Derechos derivados solapados
  if (a.derivativeOf && a.derivativeOf === b.id) {
    return {
      componentA: { id: a.id, description: a.description },
      componentB: { id: b.id, description: b.description },
      overlapType: 'overlapping_derivatives',
      severity: 'high',
      explanation: `${a.description} es un derecho derivado de ${b.description}. Verificar que no se duplique el valor.`,
      recommendation: 'review',
    };
  }

  if (b.derivativeOf && b.derivativeOf === a.id) {
    return {
      componentA: { id: a.id, description: a.description },
      componentB: { id: b.id, description: b.description },
      overlapType: 'overlapping_derivatives',
      severity: 'high',
      explanation: `${b.description} es un derecho derivado de ${a.description}. Verificar que no se duplique el valor.`,
      recommendation: 'review',
    };
  }

  // Mismo activo económico
  if (a.assetId && b.assetId && a.assetId === b.assetId && a.method !== b.method) {
    return {
      componentA: { id: a.id, description: a.description },
      componentB: { id: b.id, description: b.description },
      overlapType: 'same_asset',
      severity: 'low',
      explanation: `Mismo activo valorado por métodos diferentes (${a.method} vs ${b.method}). Esto puede ser válido (triangulación), verificar que no se sumen.`,
      recommendation: 'allow',
    };
  }

  return {
    componentA: { id: a.id, description: a.description },
    componentB: { id: b.id, description: b.description },
    overlapType: 'same_right',
    severity: 'none',
    explanation: 'Sin solapamiento detectado.',
    recommendation: 'allow',
  };
}
