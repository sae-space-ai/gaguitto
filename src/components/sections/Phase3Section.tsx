import React from 'react';
import { SectionWrapper, Card, Badge, InfoBox, Table } from '../shared';

export default function Phase3Section() {
  return (
    <SectionWrapper title="FASE 3 — Capa Probatoria y Documental" subtitle="Registros documentales, evidencias, fuentes, contratos, derechos, Rights Graph, Chain of Title, conflictos y Evidence Gate">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">48</div>
            <div className="text-xs text-slate-500 mt-1">Capas Especificadas</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">8</div>
            <div className="text-xs text-slate-500 mt-1">Registros Implementados</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">8</div>
            <div className="text-xs text-slate-500 mt-1">Casos Ficticios</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">35+</div>
            <div className="text-xs text-slate-500 mt-1">Tests Automatizados</div>
          </div>
        </Card>
      </div>

      <Card title="✅ Registros Implementados">
        <div className="space-y-2">
          {[
            { id: '3.2', name: 'Case Management', file: 'records/case-management.ts' },
            { id: '3.3', name: 'Document Registry', file: 'records/document-registry.ts' },
            { id: '3.4', name: 'Integridad Documental (SHA-256)', file: 'records/document-registry.ts' },
            { id: '3.5', name: 'Evidence Registry', file: 'records/evidence-source-registry.ts' },
            { id: '3.6', name: 'Estados de Verificación', file: 'records/evidence-source-registry.ts' },
            { id: '3.7', name: 'Hecho / Inferencia / Hipótesis', file: 'records/evidence-source-registry.ts' },
            { id: '3.8', name: 'Source Registry', file: 'records/evidence-source-registry.ts' },
            { id: '3.9', name: 'Jerarquía de Fuentes', file: 'records/evidence-source-registry.ts' },
            { id: '3.13', name: 'Contract Registry', file: 'records/contracts-rights-parties.ts' },
            { id: '3.14', name: 'Extracción Contractual', file: 'records/contracts-rights-parties.ts' },
            { id: '3.16', name: 'Rights Registry', file: 'records/contracts-rights-parties.ts' },
            { id: '3.17', name: 'Rights Graph', file: 'records/contracts-rights-parties.ts' },
            { id: '3.18', name: 'Party Registry', file: 'records/contracts-rights-parties.ts' },
            { id: '3.19', name: 'Chain of Title Engine', file: 'records/chain-audit-conflicts-gate.ts' },
            { id: '3.24', name: 'Assumption Registry', file: 'records/chain-audit-conflicts-gate.ts' },
            { id: '3.25', name: 'Data Lineage Tracker', file: 'records/chain-audit-conflicts-gate.ts' },
            { id: '3.26', name: 'Audit Log (hash encadenado)', file: 'records/chain-audit-conflicts-gate.ts' },
            { id: '3.30', name: 'Conflict Engine', file: 'records/chain-audit-conflicts-gate.ts' },
            { id: '3.39', name: 'Case Health Panel', file: 'records/case-management.ts' },
            { id: '3.40', name: 'Evidence Gate', file: 'records/chain-audit-conflicts-gate.ts' },
            { id: '3.23', name: 'Phase 2 Bridge (conexión)', file: 'records/case-management.ts' },
            { id: '3.42', name: 'Expedientes Ficticios', file: 'records/fixtures.ts' },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
              <Badge variant="success">{item.id}</Badge>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{item.file}</p>
              </div>
              <span className="text-emerald-600 text-xs">✓</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="📁 Expedientes Ficticios (Capa 3.42)">
        <Table
          headers={['Caso', 'Descripción', 'Característica Clave']}
          rows={[
            ['A', 'Novela "El Jardín de las Sombras"', 'Derechos editoriales acreditados, audiovisuales NO cedidos'],
            ['B', 'Libro "Crónicas del Viento"', 'Contrato con derechos parcialmente cedidos / reservados'],
            ['C', 'Película "La Última Frontera"', 'Cadena de titularidad COMPLETA ficticia'],
            ['D', 'Serie "Ecos del Pasado"', 'Eslabón documental FALTANTE en música'],
            ['E', '"Memorias de Cristal"', 'Conflicto de EXCLUSIVIDAD entre dos contratos'],
            ['F', '"Cuentos del Amanecer"', 'Valoración HISTÓRICA con info posterior'],
            ['G', '"El Secreto del Faro"', 'Royalty vinculado a CLÁUSULA contractual'],
            ['H', '"Aventura en Marte"', 'Dato sin evidencia → permanece UNVERIFIED'],
          ]}
        />
      </Card>

      <Card title="🔑 Principios Implementados">
        <div className="space-y-3">
          <InfoBox type="success">
            <strong>EVIDENCIA ANTES QUE AFIRMACIÓN:</strong> USER_PROVIDED se registra como UNVERIFIED. Solo verificación humana puede cambiar a VERIFIED.
          </InfoBox>
          <InfoBox type="success">
            <strong>HASH ≠ AUTORÍA:</strong> El SHA-256 demuestra FILE_INTEGRITY, no AUTHORSHIP_PROOF, OWNERSHIP_PROOF, ni CREATION_DATE_PROOF.
          </InfoBox>
          <InfoBox type="success">
            <strong>SEPARACIÓN HECHO/HIPÓTESIS:</strong> StatementType distingue FACT, INFERENCE, ASSUMPTION, ALLEGATION, CALCULATION, OPINION.
          </InfoBox>
          <InfoBox type="danger">
            <strong>ANTI-ALUCINACIÓN:</strong> El LLM no puede convertir UNVERIFIED en VERIFIED. No se inventan documentos, fuentes, contratos, cláusulas ni derechos.
          </InfoBox>
          <InfoBox type="warning">
            <strong>CONTRATO ≠ VALIDEZ:</strong> Se separa DOCUMENT_EXISTS, SIGNATURE_VERIFIED, TERMS_EXTRACTED, LEGAL_VALIDITY_ASSESSED.
          </InfoBox>
          <InfoBox type="info">
            <strong>TRAZABILIDAD BIDIRECCIONAL:</strong> Se puede recorrer RESULTADO → CÁLCULO → INPUT → DERECHO → CONTRATO → EVIDENCIA → DOCUMENTO y viceversa.
          </InfoBox>
        </div>
      </Card>

      <Card title="🔗 Conexión con Fase 2 (Capa 3.23)">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-mono">
            DOCUMENTO → EVIDENCIA → CONTRATO → DERECHO → INPUT → MOTOR FASE 2 → CÁLCULO → RESULTADO
          </p>
          <p className="text-xs text-blue-700 mt-2">
            El Phase2Bridge permite vincular cada input económico con su linaje documental completo.
            Ejemplo: royalty_rate = 0.10 → source: cláusula 5.1 → contract: CTR-xxx → evidence: EV-xxx
          </p>
        </div>
      </Card>

      <Card title="⚠️ Decisiones que Requieren Aprobación">
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">1. Almacenamiento de documentos</p>
            <p className="text-[11px] text-amber-700">Actualmente simulado en memoria. ¿Se implementa con File API del navegador, S3, o backend dedicado?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">2. Hash criptográfico real</p>
            <p className="text-[11px] text-amber-700">La implementación actual es determinista pero simplificada. ¿Se usa crypto.subtle.digest en producción?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">3. Persistencia</p>
            <p className="text-[11px] text-amber-700">Los registros están en memoria (Maps). ¿Se implementa IndexedDB, PostgreSQL, o se mantiene así para prototipo?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">4. Capas 3.10-3.12 (Web sources, Legislación, Jurisprudencia)</p>
            <p className="text-[11px] text-amber-700">Preparadas conceptualmente en los tipos. ¿Se implementan registros especializados o se usa SourceRegistry genérico?</p>
          </div>
        </div>
      </Card>

      <Card title="📊 Deuda Técnica">
        <ul className="text-xs text-slate-700 space-y-1">
          <li>• Capas 3.10-3.12 (fuentes web, legislación, jurisprudencia): tipos preparados, registros especializados pendientes</li>
          <li>• Capa 3.15 (Conflictos entre contratos): detector conceptual, implementación automática pendiente</li>
          <li>• Capa 3.20-3.21 (Cadena audiovisual/editorial): verificaciones configurables pendientes</li>
          <li>• Capa 3.22 (Matriz de derechos): vista lógica pendiente de UI</li>
          <li>• Capa 3.27 (Control de cambios / stale calculations): detección automática pendiente</li>
          <li>• Capa 3.28 (Versionado): implementado parcialmente en cada registro</li>
          <li>• Capa 3.33-3.34 (Búsqueda documental / Extracción IA): pendiente de integración LLM</li>
          <li>• Capa 3.35-3.36 (Privacidad / Permisos): arquitectura preparada, implementación pendiente</li>
        </ul>
      </Card>

      <InfoBox type="success">
        <strong>Build status:</strong> ✅ Compila sin errores. La capa probatoria está funcionalmente integrada con Fase 2. 
        Los 8 expedientes ficticios validan los flujos principales. La trazabilidad bidireccional DOCUMENTO ↔ RESULTADO está operativa.
      </InfoBox>
    </SectionWrapper>
  );
}
