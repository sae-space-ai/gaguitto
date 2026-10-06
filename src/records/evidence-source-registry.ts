/**
 * PERITO IP — Fase 3: Evidence Registry + Source Registry
 * 
 * Capa 3.5: Evidence Registry
 * Capa 3.6: Estados de verificación
 * Capa 3.7: Hecho, inferencia e hipótesis
 * Capa 3.8: Source Registry
 * Capa 3.9: Jerarquía de fuentes
 * 
 * PRINCIPIO: USER_PROVIDED no se convierte automáticamente en VERIFIED.
 * El LLM no puede convertir UNVERIFIED en VERIFIED por sí mismo.
 */

import {
  Evidence,
  EvidenceType,
  StatementType,
  ReliabilityLevel,
  VerificationStatus,
  Source,
  SourceType,
  SourceReliabilityTier,
  generateId,
  nowISO,
} from './types';

// ============================================================
// JERARQUÍA DE FUENTES (Capa 3.9)
// ============================================================

export const SOURCE_HIERARCHY: Record<SourceType, { tier: SourceReliabilityTier; description: string }> = {
  OFFICIAL_LEGISLATION: { tier: 1, description: 'Legislación oficial (BOE, DOUE)' },
  OFFICIAL_COURT_SOURCE: { tier: 1, description: 'Fuente judicial oficial (sentencias, ECLI)' },
  PUBLIC_REGISTRY: { tier: 2, description: 'Registro oficial (Propiedad Intelectual, Mercantil)' },
  WIPO: { tier: 1, description: 'Organismo internacional (OMPI/WIPO)' },
  EU_OFFICIAL: { tier: 1, description: 'Institución de la Unión Europea' },
  GOVERNMENT: { tier: 2, description: 'Organismo gubernamental' },
  CONTRACT: { tier: 3, description: 'Documento contractual original' },
  ACCOUNTING_DOCUMENT: { tier: 3, description: 'Documentación contable acreditada' },
  PROFESSIONAL_DATABASE: { tier: 4, description: 'Base de datos profesional verificable' },
  MARKET_DATABASE: { tier: 4, description: 'Base de datos de mercado' },
  INDUSTRY_SOURCE: { tier: 4, description: 'Fuente sectorial identificada' },
  PUBLICATION: { tier: 5, description: 'Publicación' },
  OTHER: { tier: 5, description: 'Otra fuente (no verificada)' },
};

// ============================================================
// EVIDENCE REGISTRY
// ============================================================

export interface EvidenceInput {
  caseId: string;
  documentId?: string;
  sourceId?: string;
  evidenceType: EvidenceType;
  statementType: StatementType;
  factAsserted: string;
  factSupported: string;
  relevantRightId?: string;
  relevantContractId?: string;
  effectiveDate?: string;
  reliability: ReliabilityLevel;
  limitations: string;
  supportingEvidenceIds?: string[];
  notes?: string;
  createdBy: string;
}

export class EvidenceRegistry {
  private evidences: Map<string, Evidence> = new Map();

  /**
   * Registra una nueva evidencia.
   * USER_PROVIDED se registra como UNVERIFIED por defecto.
   * Solo OFFICIAL o CONTRACTUAL con soporte pueden ser VERIFIED inicialmente.
   */
  register(input: EvidenceInput): Evidence {
    // Validación: USER_PROVIDED no puede ser VERIFIED sin verificación independiente
    let initialStatus: VerificationStatus = 'UNVERIFIED';
    if (input.evidenceType === 'OFFICIAL' && input.sourceId) {
      initialStatus = 'VERIFIED';
    } else if (input.evidenceType === 'CONTRACTUAL' && input.documentId) {
      initialStatus = 'PARTIALLY_VERIFIED';
    }

    const evidence: Evidence = {
      evidenceId: generateId('EV'),
      caseId: input.caseId,
      documentId: input.documentId,
      sourceId: input.sourceId,
      evidenceType: input.evidenceType,
      statementType: input.statementType,
      factAsserted: input.factAsserted,
      factSupported: input.factSupported,
      relevantRightId: input.relevantRightId,
      relevantContractId: input.relevantContractId,
      effectiveDate: input.effectiveDate,
      verificationStatus: initialStatus,
      reliability: input.reliability,
      limitations: input.limitations,
      supportingEvidenceIds: input.supportingEvidenceIds || [],
      notes: input.notes,
      createdAt: nowISO(),
      createdBy: input.createdBy,
      version: 1,
    };

    this.evidences.set(evidence.evidenceId, evidence);
    return evidence;
  }

  get(evidenceId: string): Evidence | undefined {
    return this.evidences.get(evidenceId);
  }

  getByCase(caseId: string): Evidence[] {
    return Array.from(this.evidences.values()).filter(e => e.caseId === caseId);
  }

  /**
   * Cambia el estado de verificación.
   * REGLA: Solo un usuario humano (no el LLM) puede cambiar UNVERIFIED → VERIFIED.
   */
  changeVerificationStatus(
    evidenceId: string,
    newStatus: VerificationStatus,
    changedBy: string,
    reason: string
  ): Evidence {
    const ev = this.evidences.get(evidenceId);
    if (!ev) throw new Error(`Evidencia no encontrada: ${evidenceId}`);

    // El LLM no puede convertir UNVERIFIED en VERIFIED
    if (changedBy === 'LLM' && ev.verificationStatus === 'UNVERIFIED' && newStatus === 'VERIFIED') {
      throw new Error(
        'PERITO_IP_ERROR: El LLM no puede convertir UNVERIFIED en VERIFIED. ' +
        'Se requiere verificación humana independiente.'
      );
    }

    const updated: Evidence = {
      ...ev,
      verificationStatus: newStatus,
      notes: `${ev.notes || ''}\n[${nowISO()}] Estado cambiado a ${newStatus} por ${changedBy}: ${reason}`.trim(),
      version: ev.version + 1,
    };

    this.evidences.set(evidenceId, updated);
    return updated;
  }

  /**
   * Obtiene evidencias por tipo de statement.
   */
  getByStatementType(caseId: string, type: StatementType): Evidence[] {
    return this.getByCase(caseId).filter(e => e.statementType === type);
  }

  /**
   * Obtiene evidencias no verificadas.
   */
  getUnverified(caseId: string): Evidence[] {
    return this.getByCase(caseId).filter(e => e.verificationStatus === 'UNVERIFIED');
  }

  /**
   * Obtiene evidencias en conflicto.
   */
  getConflicted(caseId: string): Evidence[] {
    return this.getByCase(caseId).filter(e => e.verificationStatus === 'CONFLICTED');
  }

  getAll(): Evidence[] {
    return Array.from(this.evidences.values());
  }

  count(): number {
    return this.evidences.size;
  }
}

// ============================================================
// SOURCE REGISTRY
// ============================================================

export interface SourceInput {
  caseId: string;
  title: string;
  publisher?: string;
  sourceType: SourceType;
  url?: string;
  publicationDate?: string;
  jurisdiction?: string;
  author?: string;
  documentReference?: string;
  archivedReference?: string;
  notes?: string;
}

export class SourceRegistry {
  private sources: Map<string, Source> = new Map();

  /**
   * Registra una nueva fuente.
   * NO inventa URLs, títulos, autores, organismos ni fechas.
   * Solo almacena lo que se proporciona explícitamente.
   */
  register(input: SourceInput): Source {
    const tier = SOURCE_HIERARCHY[input.sourceType].tier;

    const source: Source = {
      sourceId: generateId('SRC'),
      caseId: input.caseId,
      title: input.title,
      publisher: input.publisher,
      sourceType: input.sourceType,
      url: input.url,
      publicationDate: input.publicationDate,
      accessDate: nowISO(),
      jurisdiction: input.jurisdiction,
      author: input.author,
      documentReference: input.documentReference,
      reliabilityTier: tier,
      verificationStatus: 'UNVERIFIED',
      archivedReference: input.archivedReference,
      notes: input.notes,
      createdAt: nowISO(),
      version: 1,
    };

    this.sources.set(source.sourceId, source);
    return source;
  }

  get(sourceId: string): Source | undefined {
    return this.sources.get(sourceId);
  }

  getByCase(caseId: string): Source[] {
    return Array.from(this.sources.values()).filter(s => s.caseId === caseId);
  }

  updateVerificationStatus(sourceId: string, status: VerificationStatus): Source {
    const src = this.sources.get(sourceId);
    if (!src) throw new Error(`Fuente no encontrada: ${sourceId}`);

    const updated: Source = { ...src, verificationStatus: status, version: src.version + 1 };
    this.sources.set(sourceId, updated);
    return updated;
  }

  getAll(): Source[] {
    return Array.from(this.sources.values());
  }

  count(): number {
    return this.sources.size;
  }
}

// ============================================================
// SEPARACIÓN HECHO / INFERENCIA / HIPÓTESIS (Capa 3.7)
// ============================================================

/**
 * Valida que un statement type tenga el soporte adecuado.
 */
export function validateStatementSupport(evidence: Evidence): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  switch (evidence.statementType) {
    case 'FACT':
      // FACT requiere soporte documental o fuente identificada
      if (!evidence.documentId && !evidence.sourceId) {
        issues.push('FACT sin documento ni fuente de soporte.');
      }
      if (evidence.verificationStatus === 'UNVERIFIED') {
        issues.push('FACT marcado como UNVERIFIED. Requiere verificación.');
      }
      break;

    case 'INFERENCE':
      // INFERENCE debe indicar qué hechos la sustentan
      if (evidence.supportingEvidenceIds.length === 0) {
        issues.push('INFERENCE sin evidencias de soporte. Debe indicar qué hechos la sustentan.');
      }
      break;

    case 'ASSUMPTION':
      // ASSUMPTION debe declararse expresamente (ya lo está por el tipo)
      if (!evidence.limitations) {
        issues.push('ASSUMPTION sin limitaciones declaradas.');
      }
      break;

    case 'ALLEGATION':
      // ALLEGATION no se considera acreditada
      if (evidence.verificationStatus === 'VERIFIED') {
        issues.push('ALLEGATION no puede estar VERIFIED. Es una afirmación no acreditada.');
      }
      break;

    case 'CALCULATION':
      // CALCULATION debe enlazar con motor matemático
      // (Se verifica en la conexión con Fase 2)
      break;

    case 'OPINION':
      // OPINION debe identificarse como valoración, no como hecho
      if (evidence.evidenceType !== 'DERIVED' && evidence.evidenceType !== 'ASSUMPTION') {
        issues.push('OPINION debe tener evidenceType DERIVED o ASSUMPTION.');
      }
      break;
  }

  return { valid: issues.length === 0, issues };
}
