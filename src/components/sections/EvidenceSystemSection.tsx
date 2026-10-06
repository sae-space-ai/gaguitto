import React from 'react';
import { SectionWrapper, Card, CodeBlock, Table, InfoBox, Badge } from '../shared';

export default function EvidenceSystemSection() {
  return (
    <SectionWrapper number="Sección 7" title="Sistema de Evidencias" subtitle="Matriz de evidencias con hash criptográfico y trazabilidad completa">
      
      <Card title="🔍 Motor 2: Due Diligence Documental">
        <p className="text-sm text-slate-700 mb-4">
          El sistema construye una <strong>matriz de evidencias</strong> para cada expediente. Cada elemento de la matriz 
          registra la relación entre un documento y el hecho que acredita, con su nivel de fiabilidad y limitaciones.
        </p>
        <Table
          headers={['Campo', 'Tipo', 'Descripción', 'Obligatorio']}
          rows={[
            ['FUENTE', 'string', 'Origen del documento (editorial, registro, usuario...)', '✅'],
            ['DOCUMENTO', 'string', 'Identificación del documento', '✅'],
            ['FECHA', 'Date', 'Fecha del documento o del hecho', '✅'],
            ['HECHO QUE ACREDITA', 'text', 'Qué hecho concreto demuestra', '✅'],
            ['FIABILIDAD', 'enum', 'verified_official / documented / user_provided / external_source / estimate / hypothesis / unverified', '✅'],
            ['LIMITACIONES', 'text', 'Restricciones o salvedades de la evidencia', '✅'],
            ['HASH', 'string (SHA-256)', 'Hash criptográfico del documento', '✅'],
            ['RELACIÓN CON VALORACIÓN', 'text', 'Cómo afecta esta evidencia al cálculo', '✅'],
            ['ES DEL USUARIO', 'boolean', 'true si lo proporcionó el usuario, false si es independiente', '✅'],
            ['VERIFICADA', 'Date | null', 'Fecha de verificación independiente', '—'],
          ]}
        />
      </Card>

      <Card title="🔐 Flujo de Incorporación de Evidencias">
        <CodeBlock language="typescript">{`
async function ingestEvidence(
  caseId: string,
  document: File | Buffer,
  metadata: EvidenceMetadata
): Promise<Evidence> {
  
  // 1. Calcular hash SHA-256 del documento ORIGINAL
  const hash = crypto.createHash('sha256').update(document).digest('hex');
  
  // 2. Verificar que no existe ya una evidencia con ese hash para este caso
  const existing = await db.evidence.findFirst({
    where: { caseId, sha256Hash: hash }
  });
  if (existing) {
    throw new DuplicateEvidenceError('Esta evidencia ya existe en el expediente');
  }
  
  // 3. Almacenar documento en storage seguro
  const storagePath = await storage.save(document, {
    caseId,
    hash,
    timestamp: new Date()
  });
  
  // 4. Crear registro de evidencia
  const evidence = await db.evidence.create({
    data: {
      caseId,
      sourceDescription: metadata.source,
      documentRef: metadata.documentRef,
      documentDate: metadata.date,
      factAccredited: metadata.fact,
      reliabilityLevel: metadata.reliability,
      limitations: metadata.limitations,
      sha256Hash: hash,
      relationToValuation: metadata.relation,
      isUserProvided: metadata.isUserProvided,
      storagePath,
      ingestedAt: new Date()
    }
  });
  
  // 5. Registrar en log de auditoría
  await auditLog.record({
    caseId,
    action: 'create',
    entityType: 'evidence',
    entityId: evidence.id,
    newValue: { hash, source: metadata.source, fact: metadata.fact },
    metadata: { storagePath }
  });
  
  // 6. Actualizar matriz de evidencias del caso
  await updateEvidenceMatrix(caseId);
  
  return evidence;
}

// Verificación de integridad
async function verifyEvidenceIntegrity(evidenceId: string): Promise<boolean> {
  const evidence = await db.evidence.findUnique({ where: { id: evidenceId } });
  if (!evidence) return false;
  
  const currentHash = await storage.calculateHash(evidence.storagePath);
  return currentHash === evidence.sha256Hash;
}`}</CodeBlock>
      </Card>

      <Card title="📊 Niveles de Fiabilidad">
        <div className="space-y-2">
          {[
            { level: 'verified_official', label: 'Fuente Oficial Verificada', color: 'emerald', desc: 'Legislación, registros oficiales, WIPO, organismos públicos' },
            { level: 'documented', label: 'Documentado', color: 'blue', desc: 'Contratos, facturas, registros con documentación disponible' },
            { level: 'user_provided', label: 'Proporcionado por el Usuario', color: 'indigo', desc: 'Información declarada por el solicitante sin verificación independiente' },
            { level: 'external_source', label: 'Fuente Externa', color: 'amber', desc: 'Datos de fuentes externas no verificadas directamente' },
            { level: 'estimate', label: 'Estimación', color: 'orange', desc: 'Estimación razonada con metodología documentada' },
            { level: 'hypothesis', label: 'Hipótesis', color: 'red', desc: 'Suposición necesaria ante falta de datos, explícitamente marcada' },
            { level: 'unverified', label: 'No Verificado', color: 'slate', desc: 'Información que no ha podido verificarse — se muestra como tal' },
          ].map((item) => (
            <div key={item.level} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <Badge variant={item.color as any}>{item.level}</Badge>
              <div>
                <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="📋 Ejemplo de Matriz de Evidencias">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">Fuente</th>
                <th className="px-2 py-1.5 text-left">Documento</th>
                <th className="px-2 py-1.5 text-left">Hecho</th>
                <th className="px-2 py-1.5 text-left">Fiabilidad</th>
                <th className="px-2 py-1.5 text-left">Hash (primeros 8)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">E-001</td>
                <td className="px-2 py-1.5">Registro Propiedad Intelectual</td>
                <td className="px-2 py-1.5">Certificado registro nº 2023/XXXX</td>
                <td className="px-2 py-1.5">Autoría y fecha de creación</td>
                <td className="px-2 py-1.5"><Badge variant="success">verified_official</Badge></td>
                <td className="px-2 py-1.5 font-mono">a3f8b2c1...</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-2 py-1.5">E-002</td>
                <td className="px-2 py-1.5">Editorial Planeta</td>
                <td className="px-2 py-1.5">Contrato editorial 15/03/2023</td>
                <td className="px-2 py-1.5">Cesión derechos editoriales, anticipo 50.000€</td>
                <td className="px-2 py-1.5"><Badge variant="info">documented</Badge></td>
                <td className="px-2 py-1.5 font-mono">7d2e9f4a...</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">E-003</td>
                <td className="px-2 py-1.5">Usuario (declaración)</td>
                <td className="px-2 py-1.5">Declaración de ventas Q1 2024</td>
                <td className="px-2 py-1.5">12.000 ejemplares vendidos</td>
                <td className="px-2 py-1.5"><Badge variant="purple">user_provided</Badge></td>
                <td className="px-2 py-1.5 font-mono">N/A (sin doc.)</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-2 py-1.5">E-004</td>
                <td className="px-2 py-1.5">NO VERIFICADO</td>
                <td className="px-2 py-1.5">—</td>
                <td className="px-2 py-1.5">DATOS INSUFICIENTES para valorar derechos audiovisuales</td>
                <td className="px-2 py-1.5"><Badge variant="danger">unverified</Badge></td>
                <td className="px-2 py-1.5 font-mono">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <InfoBox type="danger">
        <strong>Regla inquebrantable:</strong> Nunca se modifica silenciosamente una evidencia original. 
        Si se detecta un error, se incorpora una nueva evidencia correctiva con referencia a la original, 
        manteniendo el historial completo. El hash del documento original permanece inalterado.
      </InfoBox>
    </SectionWrapper>
  );
}
