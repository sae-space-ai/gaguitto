/**
 * PERITO IP — Fase 3: Integridad Documental + Document Registry
 * 
 * Capa 3.3: Registro de documentos
 * Capa 3.4: Integridad documental (SHA-256)
 * 
 * El hash demuestra INTEGRIDAD del archivo, NO autoría, titularidad,
 * fecha histórica de creación, ni registro.
 */

import {
  Document,
  DocumentType,
  ConfidentialityLevel,
  VerificationStatus,
  generateId,
  nowISO,
} from './types';

// ============================================================
// HASH (Simulado en frontend — en producción usar crypto.subtle)
// ============================================================

/**
 * Genera un hash SHA-256 simulado del contenido.
 * En producción se usaría crypto.subtle.digest('SHA-256', ...)
 * Esta implementación es determinista para testing.
 */
export function computeDocumentHash(content: string): string {
  // Implementación simplificada determinista para el entorno frontend
  // En producción: const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convertir a formato hex de 64 caracteres (simulando SHA-256)
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex.repeat(8)).substring(0, 64);
}

/**
 * Verifica que un documento no ha sido alterado.
 * IMPORTANTE: El hash solo demuestra INTEGRIDAD, no autoría ni titularidad.
 */
export function verifyDocumentIntegrity(
  content: string,
  expectedHash: string,
  algorithm: string = 'SHA-256'
): { valid: boolean; computedHash: string; algorithm: string } {
  const computedHash = computeDocumentHash(content);
  return {
    valid: computedHash === expectedHash,
    computedHash,
    algorithm,
  };
}

// ============================================================
// DOCUMENT REGISTRY
// ============================================================

export interface DocumentInput {
  caseId: string;
  filename: string;
  originalFilename: string;
  documentType: DocumentType;
  mimeType: string;
  fileSize: number;
  documentDate?: string;
  sourceType: string;
  providedBy: string;
  description: string;
  content: string; // Contenido para hashing
  confidentialityLevel: ConfidentialityLevel;
  notes?: string;
}

export class DocumentRegistry {
  private documents: Map<string, Document> = new Map();

  /**
   * Registra un nuevo documento.
   * Calcula hash automáticamente del contenido.
   * NO altera el archivo original.
   */
  register(input: DocumentInput): Document {
    const hash = computeDocumentHash(input.content);
    const now = nowISO();

    const doc: Document = {
      documentId: generateId('DOC'),
      caseId: input.caseId,
      filename: input.filename,
      originalFilename: input.originalFilename,
      documentType: input.documentType,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      uploadDate: now,
      documentDate: input.documentDate,
      sourceType: input.sourceType,
      providedBy: input.providedBy,
      description: input.description,
      storageReference: `storage://${input.caseId}/${hash}`,
      hash,
      hashAlgorithm: 'SHA-256',
      verificationStatus: 'UNVERIFIED',
      confidentialityLevel: input.confidentialityLevel,
      notes: input.notes,
      createdAt: now,
      version: 1,
    };

    this.documents.set(doc.documentId, doc);
    return doc;
  }

  get(documentId: string): Document | undefined {
    return this.documents.get(documentId);
  }

  getByCase(caseId: string): Document[] {
    return Array.from(this.documents.values()).filter(d => d.caseId === caseId);
  }

  /**
   * Actualiza el estado de verificación de un documento.
   * NO modifica el hash ni el contenido.
   */
  updateVerificationStatus(
    documentId: string,
    status: VerificationStatus,
    reason?: string
  ): Document {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Documento no encontrado: ${documentId}`);

    const updated: Document = {
      ...doc,
      verificationStatus: status,
      notes: reason ? `${doc.notes || ''}\n[${nowISO()}] Verificación: ${status}. ${reason}`.trim() : doc.notes,
      version: doc.version + 1,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  /**
   * Archiva un documento (no lo elimina).
   * Preferir ARCHIVED/WITHDRAWN/SUPERSEDED sobre eliminación.
   */
  archive(documentId: string, reason: string): Document {
    const doc = this.documents.get(documentId);
    if (!doc) throw new Error(`Documento no encontrado: ${documentId}`);

    const updated: Document = {
      ...doc,
      verificationStatus: 'NOT_APPLICABLE',
      notes: `${doc.notes || ''}\n[${nowISO()}] ARCHIVADO: ${reason}`.trim(),
      version: doc.version + 1,
    };

    this.documents.set(documentId, updated);
    return updated;
  }

  getAll(): Document[] {
    return Array.from(this.documents.values());
  }

  count(): number {
    return this.documents.size;
  }
}

// ============================================================
// ACLARACIÓN CONCEPTUAL (Capa 3.4)
// ============================================================

/**
 * El hash SHA-256 de un documento demuestra ÚNICAMENTE:
 * - FILE_INTEGRITY: El archivo no ha sido modificado desde que se calculó el hash.
 * 
 * NO demuestra:
 * - AUTHORSHIP_PROOF: Quién creó el documento.
 * - OWNERSHIP_PROOF: Quién es el titular de los derechos.
 * - CREATION_DATE_PROOF: Cuándo se creó el documento.
 * - REGISTRATION_PROOF: Si está registrado en algún organismo.
 * 
 * Para demostrar estos otros hechos se necesitan evidencias adicionales.
 */
export const HASH_LIMITATIONS = {
  demonstrates: ['FILE_INTEGRITY'],
  doesNotDemonstrate: [
    'AUTHORSHIP_PROOF',
    'OWNERSHIP_PROOF', 
    'CREATION_DATE_PROOF',
    'REGISTRATION_PROOF',
  ],
} as const;
