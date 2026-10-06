import React from 'react';
import { SectionWrapper, Card, CodeBlock, Table, InfoBox, Badge } from '../shared';

export default function SourcesSystemSection() {
  return (
    <SectionWrapper number="Sección 8" title="Sistema de Fuentes" subtitle="Registro formal de fuentes con clasificación por fiabilidad y verificación">
      
      <Card title="📚 Registro de Fuentes">
        <p className="text-sm text-slate-700 mb-4">
          Cada dato externo utilizado en la valoración debe tener una fuente registrada con metadatos completos. 
          No se presenta información de Internet como evidencia sin almacenar todos los metadatos requeridos.
        </p>
        <Table
          headers={['Campo', 'Tipo', 'Descripción']}
          rows={[
            ['Título', 'string', 'Nombre/título de la fuente'],
            ['Entidad responsable', 'string', 'Organización o persona responsable del contenido'],
            ['URL', 'string', 'Dirección web (si aplica)'],
            ['Fecha de publicación', 'Date', 'Cuando se publicó (si se conoce)'],
            ['Fecha de consulta', 'Date', 'Cuando se consultó (obligatorio)'],
            ['Nivel de fiabilidad', 'integer (1-5)', 'Clasificación jerárquica'],
            ['Notas', 'text', 'Observaciones sobre la fuente'],
          ]}
        />
      </Card>

      <Card title="🏆 Jerarquía de Fiabilidad de Fuentes">
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success">Nivel 1</Badge>
              <span className="text-xs font-bold text-emerald-800">Fuentes Oficiales Primarias</span>
            </div>
            <p className="text-xs text-emerald-700">Legislación oficial, WIPO/OMPI, registros de propiedad intelectual, Boletines Oficiales del Estado, tribunales de justicia, organismos públicos con datos verificados.</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">Nivel 2</Badge>
              <span className="text-xs font-bold text-blue-800">Instituciones y Registros</span>
            </div>
            <p className="text-xs text-blue-700">Instituciones de la Unión Europea, registros mercantiles, organismos reguladores audiovisuales, entidades de gestión de derechos (SGAE, CEDRO, EGEDA), bases de datos oficiales.</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple">Nivel 3</Badge>
              <span className="text-xs font-bold text-indigo-800">Bases de Datos Profesionales</span>
            </div>
            <p className="text-xs text-indigo-700">Bases de datos profesionales del sector (IMDb Pro, Box Office Mojo, Editores de España, Frankfurt Rights), informes de consultoras reconocidas, datos financieros verificados.</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">Nivel 4</Badge>
              <span className="text-xs font-bold text-amber-800">Fuentes Sectoriales</span>
            </div>
            <p className="text-xs text-amber-700">Publicaciones sectoriales identificables, asociaciones profesionales, prensa especializada con datos verificables, informes de mercado con metodología declarada.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default">Nivel 5</Badge>
              <span className="text-xs font-bold text-slate-800">Otras Fuentes</span>
            </div>
            <p className="text-xs text-slate-700">Cualquier otra fuente. Se marca explícitamente como de baja fiabilidad y no se utiliza como único respaldo de una valoración.</p>
          </div>
        </div>
      </Card>

      <Card title="🔍 Protocolo de Verificación de Fuentes">
        <CodeBlock language="typescript">{`
interface SourceVerification {
  sourceId: string;
  checks: VerificationCheck[];
  overallStatus: 'verified' | 'partially_verified' | 'unverified' | 'disputed';
  verifiedAt: Date;
  verifiedBy: string;
}

interface VerificationCheck {
  type: 'existence' | 'authority' | 'currency' | 'consistency' | 'cross_reference';
  description: string;
  result: 'pass' | 'fail' | 'partial' | 'not_applicable';
  notes: string;
}

async function verifySource(sourceId: string): Promise<SourceVerification> {
  const source = await db.source.findUnique({ where: { id: sourceId } });
  const checks: VerificationCheck[] = [];
  
  // 1. Verificar existencia (la URL es accesible, la entidad existe)
  checks.push(await checkExistence(source));
  
  // 2. Verificar autoridad (la entidad es competente en la materia)
  checks.push(await checkAuthority(source));
  
  // 3. Verificar vigencia (los datos no están obsoletos)
  checks.push(await checkCurrency(source));
  
  // 4. Verificar consistencia interna
  checks.push(await checkConsistency(source));
  
  // 5. Contrastar con otras fuentes (cross-reference)
  checks.push(await crossReference(source));
  
  const overallStatus = determineOverallStatus(checks);
  
  return {
    sourceId,
    checks,
    overallStatus,
    verifiedAt: new Date(),
    verifiedBy: 'system'
  };
}`}</CodeBlock>
      </Card>

      <Card title="📋 Ejemplo de Registro de Fuentes">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border border-slate-200 rounded-lg">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-2 py-1.5 text-left">ID</th>
                <th className="px-2 py-1.5 text-left">Título</th>
                <th className="px-2 py-1.5 text-left">Entidad</th>
                <th className="px-2 py-1.5 text-left">Nivel</th>
                <th className="px-2 py-1.5 text-left">Consulta</th>
                <th className="px-2 py-1.5 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">S-001</td>
                <td className="px-2 py-1.5">Ley de Propiedad Intelectual (RDL 1/1996)</td>
                <td className="px-2 py-1.5">BOE / Gobierno de España</td>
                <td className="px-2 py-1.5"><Badge variant="success">1</Badge></td>
                <td className="px-2 py-1.5">2024-01-15</td>
                <td className="px-2 py-1.5"><Badge variant="success">Verificada</Badge></td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-2 py-1.5">S-002</td>
                <td className="px-2 py-1.5">Berne Convention</td>
                <td className="px-2 py-1.5">WIPO</td>
                <td className="px-2 py-1.5"><Badge variant="success">1</Badge></td>
                <td className="px-2 py-1.5">2024-01-15</td>
                <td className="px-2 py-1.5"><Badge variant="success">Verificada</Badge></td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-2 py-1.5">S-003</td>
                <td className="px-2 py-1.5">Box Office Mojo — Taquilla 2023</td>
                <td className="px-2 py-1.5">IMDb / Amazon</td>
                <td className="px-2 py-1.5"><Badge variant="purple">3</Badge></td>
                <td className="px-2 py-1.5">2024-02-01</td>
                <td className="px-2 py-1.5"><Badge variant="info">Parcial</Badge></td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="px-2 py-1.5">S-004</td>
                <td className="px-2 py-1.5">Artículo "Mercado editorial 2023"</td>
                <td className="px-2 py-1.5">Blog personal</td>
                <td className="px-2 py-1.5"><Badge variant="default">5</Badge></td>
                <td className="px-2 py-1.5">2024-02-10</td>
                <td className="px-2 py-1.5"><Badge variant="danger">No verificada</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <InfoBox type="warning">
        <strong>Regla anti-alucinación:</strong> Si el LLM "recuerda" un dato de mercado, NO se utiliza directamente. 
        Debe ser verificado contra una fuente registrada. Si no puede verificarse, se muestra como 
        "NO VERIFICADO" o "DATOS INSUFICIENTES PARA UNA CONCLUSIÓN PERICIAL ROBUSTA".
      </InfoBox>
    </SectionWrapper>
  );
}
