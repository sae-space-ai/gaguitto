/**
 * PERITO IP — Capa 2.14: Motor de Fecha Histórica de Valoración
 * 
 * Permite VALUATION_DATE e INFORMATION_CUTOFF_DATE.
 * Detecta POST_VALUATION_INFORMATION.
 * Reduce hindsight bias.
 */

import { ValuationConfig } from '../types';

export interface ValuationDateCheck {
  valuationDate: string;
  informationCutoffDate: string;
  informationDate: string;
  isPostValuation: boolean;
  classification: 'available_at_valuation' | 'post_valuation' | 'at_cutoff';
  warning: string | null;
}

/**
 * Verifica si una información es anterior o posterior a la fecha de valoración.
 */
export function checkValuationDateCutoff(
  config: ValuationConfig,
  informationDate: string
): ValuationDateCheck {
  const valuationDate = new Date(config.valuationDate);
  const cutoffDate = config.informationCutoffDate
    ? new Date(config.informationCutoffDate)
    : valuationDate;
  const infoDate = new Date(informationDate);

  const isPostValuation = infoDate > valuationDate;
  
  let classification: ValuationDateCheck['classification'];
  let warning: string | null = null;

  if (infoDate <= valuationDate) {
    classification = 'available_at_valuation';
  } else if (infoDate.getTime() === valuationDate.getTime()) {
    classification = 'at_cutoff';
  } else {
    classification = 'post_valuation';
    warning = `POST_VALUATION_INFORMATION: Esta información tiene fecha ${informationDate}, posterior a la fecha de valoración ${config.valuationDate}. NO debe utilizarse automáticamente en la valoración. Marcar como hindsight y evaluar si es excepcionalmente relevante.`;
  }

  return {
    valuationDate: config.valuationDate,
    informationCutoffDate: cutoffDate.toISOString(),
    informationDate,
    isPostValuation,
    classification,
    warning,
  };
}

/**
 * Filtra un conjunto de datos según la fecha de valoración.
 * Separa información disponible de información posterior.
 */
export function filterByValuationDate<T extends { date: string }>(
  config: ValuationConfig,
  items: T[]
): {
  available: T[];
  postValuation: T[];
  warnings: string[];
} {
  const available: T[] = [];
  const postValuation: T[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    const check = checkValuationDateCutoff(config, item.date);
    if (check.isPostValuation) {
      postValuation.push(item);
      warnings.push(check.warning!);
    } else {
      available.push(item);
    }
  }

  return { available, postValuation, warnings };
}
