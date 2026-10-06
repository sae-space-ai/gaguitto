import React from 'react';
import { SectionWrapper, Card, CodeBlock, Table, InfoBox } from '../shared';

export default function AuditSystemSection() {
  return (
    <SectionWrapper number="Sección 9" title="Sistema de Auditoría" subtitle="Motor 9 — Trazabilidad completa de cada número mostrado en el informe">
      
      <Card title="🔒 Principio de Auditoría">
        <InfoBox type="info">
          <strong>Cada número mostrado en el informe debe ser rastreable.</strong> Al seleccionar cualquier cifra, 
          el usuario debe poder consultar: origen del dato, documento, fuente, fecha, fórmula, variables, supuestos 
          y transformaciones realizadas.
        </InfoBox>
      </Card>

      <Card title="📝 Log de Auditoría Inmutable">
        <CodeBlock language="typescript">{`
// El log de auditoría es APPEND-ONLY: sin UPDATE, sin DELETE
// Cada entrada incluye un hash encadenado para detectar manipulaciones

interface AuditEntry {
  id: bigint;                    // Autoincremental
  caseId: string;                // Expediente afectado
  action: AuditAction;           // Tipo de operación
  entityType: string;            // Tipo de entidad modificada
  entityId: string;              // ID de la entidad
  previousValue: JSON | null;    // Valor anterior (null si creación)
  newValue: JSON | null;         // Valor nuevo (null si eliminación)
  userId: string;                // Usuario que realizó la acción
  timestamp: Date;               // Marca temporal
  ipAddress: string;             // IP del cliente
  chainHash: string;             // Hash encadenado (integridad)
  metadata: JSON;                // Metadatos adicionales
}

type AuditAction = 
  | 'create'            // Creación de entidad
  | 'update'            // Modificación
  | 'delete'            // Eliminación (soft-delete)
  | 'calculate'         // Ejecución de motor de cálculo
  | 'verify'            // Verificación de evidencia
  | 'export'            // Exportación de informe
  | 'import'            // Importación de datos
  | 'login'             // Acceso al sistema
  | 'permission_change' // Cambio de permisos
  ;

// Generación del hash encadenado
function generateChainHash(entry: Omit<AuditEntry, 'chainHash'>, previousHash: string): string {
  const data = JSON.stringify({
    ...entry,
    previousHash,
    timestamp: entry.timestamp.toISOString()
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Verificación de la cadena completa
function verifyAuditChain(caseId: string): { valid: boolean; brokenAt?: bigint } {
  const entries = db.auditLog.findMany({
    where: { caseId },
    orderBy: { id: 'asc' }
  });
  
  let previousHash = 'GENESIS'; // Hash inicial
  
  for (const entry of entries) {
    const expectedHash = generateChainHash(entry, previousHash);
    if (expectedHash !== entry.chainHash) {
      return { valid: false, brokenAt: entry.id };
    }
    previousHash = entry.chainHash;
  }
  
  return { valid: true };
}`}</CodeBlock>
      </Card>

      <Card title="🔍 Trazabilidad de Cálculos">
        <p className="text-sm text-slate-700 mb-4">
          Cada resultado de un motor de cálculo se almacena con metadatos completos que permiten reconstruir 
          el cálculo paso a paso.
        </p>
        <CodeBlock language="typescript">{`
// Cada cálculo registra su trazabilidad completa
interface CalculationTrace {
  calculationId: string;
  caseId: string;
  engine: string;              // Motor que ejecutó el cálculo
  formula: string;             // Fórmula aplicada (legible)
  
  // Variables de entrada con su origen
  variables: {
    name: string;
    value: number;
    source: 'documented' | 'comparable' | 'estimate' | 'hypothesis';
    evidenceRef?: string;      // Referencia a evidencia
    sourceRef?: string;        // Referencia a fuente externa
    justification: string;     // Por qué se usa este valor
  }[];
  
  // Pasos intermedios del cálculo
  steps: {
    stepNumber: number;
    description: string;
    formula: string;
    inputs: Record<string, number>;
    result: number;
  }[];
  
  // Resultado final
  result: number;
  currency: string;
  confidenceLevel: number;     // 0-100
  limitations: string[];
  
  // Timestamps
  startedAt: Date;
  completedAt: Date;
}

// Ejemplo de trazabilidad para un NPV:
// Paso 1: Ingresos año 1 = 120.000€ (fuente: contrato editorial, evidencia E-002)
// Paso 2: Costes año 1 = 15.000€ (fuente: declaración usuario, evidencia E-005)
// Paso 3: Flujo neto año 1 = 105.000€ (cálculo: 120.000 - 15.000)
// Paso 4: Factor descuento año 1 = 0,926 (tasa: 8%, fuente: BCE + prima sector)
// Paso 5: VP año 1 = 97.230€ (cálculo: 105.000 × 0,926)
// ... (repetir para cada año)
// Paso N: NPV = Σ VP_i = 487.500€`}</CodeBlock>
      </Card>

      <Card title="📊 Ejemplo de Registro de Auditoría">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">Timestamp</th>
                <th className="px-2 py-1.5 text-left">Acción</th>
                <th className="px-2 py-1.5 text-left">Entidad</th>
                <th className="px-2 py-1.5 text-left">Detalle</th>
                <th className="px-2 py-1.5 text-left">Hash (8 chars)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">1</td>
                <td className="px-2 py-1.5">2024-03-15 09:23:01</td>
                <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">create</span></td>
                <td className="px-2 py-1.5">case</td>
                <td className="px-2 py-1.5">Expediente PIP-2024-0001 creado</td>
                <td className="px-2 py-1.5 font-mono">a1b2c3d4</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-2 py-1.5">2</td>
                <td className="px-2 py-1.5">2024-03-15 09:24:15</td>
                <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">create</span></td>
                <td className="px-2 py-1.5">evidence</td>
                <td className="px-2 py-1.5">Evidencia E-001 incorporada (hash: a3f8b2c1...)</td>
                <td className="px-2 py-1.5 font-mono">e5f6a7b8</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">3</td>
                <td className="px-2 py-1.5">2024-03-15 10:01:33</td>
                <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">calculate</span></td>
                <td className="px-2 py-1.5">valuation</td>
                <td className="px-2 py-1.5">Motor Coste: CH = 85.000€ (3 componentes)</td>
                <td className="px-2 py-1.5 font-mono">c9d0e1f2</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-2 py-1.5">4</td>
                <td className="px-2 py-1.5">2024-03-15 10:15:47</td>
                <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">calculate</span></td>
                <td className="px-2 py-1.5">valuation</td>
                <td className="px-2 py-1.5">Motor DCF: NPV = 487.500€ (5 años, r=8%)</td>
                <td className="px-2 py-1.5 font-mono">3a4b5c6d</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">5</td>
                <td className="px-2 py-1.5">2024-03-15 10:30:00</td>
                <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">export</span></td>
                <td className="px-2 py-1.5">report</td>
                <td className="px-2 py-1.5">Informe pericial exportado (PDF)</td>
                <td className="px-2 py-1.5 font-mono">7e8f9a0b</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="🔗 Verificación de Integridad">
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800 mb-1">Verificación de documentos</p>
            <p className="text-xs text-slate-600">Se recalcula el SHA-256 de cada documento almacenado y se compara con el hash registrado. Cualquier discrepancia indica alteración.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800 mb-1">Verificación de cadena de auditoría</p>
            <p className="text-xs text-slate-600">Se reconstruye el hash encadenado desde el primer registro. Si algún hash no coincide, la cadena está rota (posible manipulación).</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800 mb-1">Reproducibilidad de cálculos</p>
            <p className="text-xs text-slate-600">Dadas las mismas variables de entrada, el motor produce exactamente el mismo resultado. Se puede verificar re-ejecutando el cálculo.</p>
          </div>
        </div>
      </Card>

      <InfoBox type="success">
        <strong>Garantía pericial:</strong> El sistema de auditoría permite demostrar ante un tribunal que: 
        (1) los documentos no han sido alterados, (2) los cálculos son reproducibles, 
        (3) cada cifra tiene un origen documentado, y (4) el proceso completo es trazable.
      </InfoBox>
    </SectionWrapper>
  );
}
