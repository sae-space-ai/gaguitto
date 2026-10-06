import React from 'react';
import { SectionWrapper, Card, Badge, InfoBox, Table } from '../shared';

export default function Phase2Section() {
  return (
    <SectionWrapper title="FASE 2 — Motor Cuantitativo Pericial" subtitle="Capa matemática implementada — 20 subcapas completadas">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">20</div>
            <div className="text-xs text-slate-500 mt-1">Subcapas Implementadas</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">18</div>
            <div className="text-xs text-slate-500 mt-1">Motores Funcionales</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">17</div>
            <div className="text-xs text-slate-500 mt-1">Archivos de Motor</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">30+</div>
            <div className="text-xs text-slate-500 mt-1">Tests Automatizados</div>
          </div>
        </Card>
      </div>

      <Card title="✅ Motores Implementados">
        <div className="space-y-2">
          {[
            { id: '2.1', name: 'Núcleo Matemático (PV, NPV, FV)', file: 'core/math-core.ts', status: 'complete' },
            { id: '2.2', name: 'Motor DCF', file: 'core/dcf-engine.ts', status: 'complete' },
            { id: '2.3', name: 'Motor de Royalties', file: 'valuation/royalty-engine.ts', status: 'complete' },
            { id: '2.4', name: 'Motor de Coste', file: 'valuation/cost-engine.ts', status: 'complete' },
            { id: '2.5', name: 'Motor de Comparables', file: 'valuation/comparable-engine.ts', status: 'complete' },
            { id: '2.6', name: 'Motor Editorial', file: 'valuation/book-engine.ts', status: 'complete' },
            { id: '2.7', name: 'Motor Audiovisual', file: 'valuation/audiovisual-engine.ts', status: 'complete' },
            { id: '2.8', name: 'Derechos de Adaptación', file: 'valuation/adaptation-engine.ts', status: 'complete' },
            { id: '2.9', name: 'Relief from Royalty', file: 'valuation/relief-from-royalty-engine.ts', status: 'complete' },
            { id: '2.10', name: 'Motor de Escenarios', file: 'analysis/scenario-engine.ts', status: 'complete' },
            { id: '2.11', name: 'Monte Carlo', file: 'analysis/monte-carlo-engine.ts', status: 'complete' },
            { id: '2.12', name: 'Lucro Cesante', file: 'valuation/lost-profits-engine.ts', status: 'complete' },
            { id: '2.13', name: 'Licencia Hipotética', file: 'valuation/hypothetical-license-engine.ts', status: 'complete' },
            { id: '2.14', name: 'Fecha Histórica', file: 'controls/valuation-date-engine.ts', status: 'complete' },
            { id: '2.15', name: 'Detector Doble Contabilización', file: 'controls/double-counting-detector.ts', status: 'complete' },
            { id: '2.16', name: 'Triangulación', file: 'analysis/triangulation-engine.ts', status: 'complete' },
            { id: '2.17', name: 'Sensibilidad', file: 'analysis/sensitivity-engine.ts', status: 'complete' },
            { id: '2.18', name: 'Trazabilidad Matemática', file: 'trace/traceability.ts', status: 'complete' },
            { id: '2.19', name: 'Tests Automatizados', file: '__tests__/engines.test.ts', status: 'complete' },
            { id: '2.20', name: 'Validación (Build)', file: '—', status: 'complete' },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
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

      <Card title="📁 Archivos Creados">
        <Table
          headers={['Ruta', 'Descripción', 'Líneas aprox.']}
          rows={[
            ['src/engines/types.ts', 'Tipos compartidos del sistema', '~200'],
            ['src/engines/core/math-core.ts', 'PV, NPV, FV, conversiones, porcentajes', '~250'],
            ['src/engines/core/dcf-engine.ts', 'Motor DCF con valor terminal', '~200'],
            ['src/engines/valuation/royalty-engine.ts', 'Royalties con tiers, MG, anticipos', '~250'],
            ['src/engines/valuation/cost-engine.ts', 'Coste histórico, reproducción, reemplazo', '~170'],
            ['src/engines/valuation/comparable-engine.ts', 'Scoring de comparables configurable', '~220'],
            ['src/engines/valuation/book-engine.ts', 'Valoración editorial por modalidad', '~170'],
            ['src/engines/valuation/audiovisual-engine.ts', 'Valoración audiovisual por ventana', '~200'],
            ['src/engines/valuation/adaptation-engine.ts', 'Derechos de adaptación ponderados', '~170'],
            ['src/engines/valuation/relief-from-royalty-engine.ts', 'Relief from Royalty', '~140'],
            ['src/engines/valuation/lost-profits-engine.ts', 'Lucro cesante (BUT_FOR vs ACTUAL)', '~150'],
            ['src/engines/valuation/hypothetical-license-engine.ts', 'Licencia hipotética', '~130'],
            ['src/engines/analysis/scenario-engine.ts', 'Escenarios conservador/base/expansivo', '~130'],
            ['src/engines/analysis/monte-carlo-engine.ts', 'Monte Carlo reproducible con seed', '~170'],
            ['src/engines/analysis/triangulation-engine.ts', 'Triangulación ponderada', '~200'],
            ['src/engines/analysis/sensitivity-engine.ts', 'Análisis de sensibilidad', '~120'],
            ['src/engines/controls/valuation-date-engine.ts', 'Fecha histórica y cutoff', '~70'],
            ['src/engines/controls/double-counting-detector.ts', 'Detector de doble contabilización', '~150'],
            ['src/engines/trace/traceability.ts', 'Trazabilidad matemática completa', '~150'],
            ['src/engines/index.ts', 'Barrel export', '~80'],
            ['src/engines/__tests__/engines.test.ts', 'Tests automatizados', '~350'],
          ]}
        />
      </Card>

      <Card title="🔑 Decisiones de Diseño Implementadas">
        <div className="space-y-3">
          <InfoBox type="success">
            <strong>decimal.js en todos los cálculos:</strong> Nunca se usan operaciones nativas de JavaScript para valores monetarios. 0.1 + 0.2 = 0.3 exactamente.
          </InfoBox>
          <InfoBox type="success">
            <strong>Trazabilidad obligatoria:</strong> Cada resultado incluye formula, inputs, intermediateSteps, sources, evidence, assumptions, version.
          </InfoBox>
          <InfoBox type="success">
            <strong>Monte Carlo reproducible:</strong> Seed configurable. Mismo seed + mismas distribuciones = mismos resultados.
          </InfoBox>
          <InfoBox type="warning">
            <strong>Coste ≠ Valor:</strong> El motor de coste produce un resultado etiquetado explícitamente como "valor obtenido mediante método del coste", nunca como valor de mercado.
          </InfoBox>
          <InfoBox type="danger">
            <strong>Anti-alucinación activo:</strong> Las probabilidades de adaptación requieren justificación explícita. Las tasas de royalty requieren fuente. El sistema rechaza inputs sin fundamento.
          </InfoBox>
          <InfoBox type="info">
            <strong>Doble contabilización:</strong> El detector bloquea la valoración final si encuentra mismo derecho + mismo territorio, o mismo flujo de ingresos duplicado.
          </InfoBox>
        </div>
      </Card>

      <Card title="⚠️ Funcionalidades Pendientes (Fases Posteriores)">
        <Table
          headers={['Pendiente', 'Fase', 'Justificación']}
          rows={[
            ['Interfaz gráfica de usuario', 'Fase 3', 'No construir UI compleja antes de tener motores sólidos'],
            ['Integración con LLM', 'Fase 4', 'El agente orquesta, no calcula'],
            ['Base de datos PostgreSQL', 'Fase 3', 'Persistencia de expedientes'],
            ['Exportación de informes PDF/DOCX', 'Fase 5', 'Depende de UI y datos persistidos'],
            ['Conexión con APIs externas', 'Fase 4', 'Fuentes de mercado verificadas'],
            ['Sistema de autenticación', 'Fase 3', 'Roles y permisos'],
          ]}
        />
      </Card>

      <Card title="📊 Deuda Técnica Detectada">
        <ul className="text-xs text-slate-700 space-y-2">
          <li>• <strong>Tests de integración entre motores:</strong> Los tests actuales son unitarios. Se necesitan tests que encadenen múltiples motores (ej: royalties → DCF → triangulación).</li>
          <li>• <strong>Cobertura de edge cases:</strong> Añadir tests para valores extremos, monedas no soportadas, períodos negativos.</li>
          <li>• <strong>Documentación JSDoc:</strong> Completar documentación en todos los tipos exportados.</li>
          <li>• <strong>Internacionalización de formatos:</strong> Los formatos monetarios están hardcodeados con símbolos. Necesita soporte para locale.</li>
          <li>• <strong>Validación de schemas con Zod:</strong> Implementar validación runtime de inputs para mayor robustez.</li>
        </ul>
      </Card>

      <Card title="🎯 Decisiones que Necesitan Aprobación">
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">1. Pesos por defecto en comparables</p>
            <p className="text-[11px] text-amber-700">Los pesos de similitud (assetType: 20%, territory: 15%, genre: 12%...) son configurables pero tienen valores por defecto. ¿Se ajustan a los criterios periciales habituales?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">2. Tasa de descuento por defecto</p>
            <p className="text-[11px] text-amber-700">No se ha implementado una tasa por defecto. El sistema siempre requiere que el usuario proporcione o justifique la tasa. ¿Es correcto o debería haber un rango orientativo?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">3. Mínimo de iteraciones Monte Carlo</p>
            <p className="text-[11px] text-amber-700">Se ha fijado en 100 como mínimo. Para valoraciones periciales, ¿debería ser 1000 o 10000 como mínimo?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">4. Monedas soportadas</p>
            <p className="text-[11px] text-amber-700">Actualmente: EUR, USD, GBP, MXN, ARS, COP, CLP, BRL. ¿Se necesitan más?</p>
          </div>
        </div>
      </Card>

      <InfoBox type="success">
        <strong>Build status:</strong> ✅ Compila sin errores. Los motores están listos para integración con la capa de persistencia y la interfaz de usuario en fases posteriores.
      </InfoBox>
    </SectionWrapper>
  );
}
