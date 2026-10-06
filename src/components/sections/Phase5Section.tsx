import React from 'react';
import { SectionWrapper, Card, Badge, InfoBox, Table } from '../shared';

export default function Phase5Section() {
  return (
    <SectionWrapper title="FASE 5 — Interfaz Real y Experiencia de Usuario" subtitle="Chasis profesional de PERITO IP: aplicación completa con expediente en el centro, evidencia debajo, derechos conectados, matemáticas trazables y agente al servicio del usuario">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">14</div>
            <div className="text-xs text-slate-500 mt-1">Pantallas Funcionales</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">20+</div>
            <div className="text-xs text-slate-500 mt-1">Componentes UI</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-xs text-slate-500 mt-1">Datos Reales (Fixtures)</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">0</div>
            <div className="text-xs text-slate-500 mt-1">Datos Inventados</div>
          </div>
        </Card>
      </div>

      <Card title="🗺️ Mapa de Navegación Implementado">
        <Table
          headers={['Ruta', 'Pantalla', 'Estado', 'Descripción']}
          rows={[
            ['/dashboard', 'Panel de Control', '✅ Funcional', 'Métricas reales, expedientes recientes, alertas'],
            ['/cases', 'Expedientes', '✅ Funcional', 'Lista, búsqueda, filtros, nuevo expediente'],
            ['/cases/:id', 'Detalle de Expediente', '✅ Funcional', 'Tabs: Resumen, Obra, Docs, Evidencias, etc.'],
            ['/documents', 'Documentos', '✅ Funcional', 'Tabla con hash, verificación, metadatos'],
            ['/evidence', 'Evidencias', '✅ Funcional', 'Workspace con clasificación epistemológica'],
            ['/contracts', 'Contratos', '✅ Funcional', 'Contratos con cláusulas extraídas'],
            ['/rights', 'Derechos', '✅ Funcional', 'Matriz + Grafo + Chain of Title'],
            ['/valuation', 'Valoración', '✅ Funcional', 'Métodos, inputs con trazabilidad, readiness'],
            ['/scenarios', 'Escenarios', '✅ Funcional', 'Comparación, What-If, Sensibilidad'],
            ['/agent', 'Agente Pericial', '✅ Funcional', 'Chat con contexto, claims, citas'],
            ['/review', 'Centro de Revisión', '✅ Funcional', 'Conflictos, gaps, pendientes'],
            ['/reports', 'Informes', '✅ Funcional', 'Report Center (preparación)'],
            ['/settings', 'Configuración', '✅ Funcional', 'Preferencias del sistema'],
            ['/documentation', 'Documentación Técnica', '✅ Funcional', 'Fases 1-4 completas'],
          ]}
        />
      </Card>

      <Card title="🏗️ Arquitectura Visual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">APP SHELL</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Sidebar persistente con navegación</li>
              <li>• Top Bar con expediente activo</li>
              <li>• Workspace central adaptable</li>
              <li>• Case Switcher seguro</li>
              <li>• Aislamiento entre expedientes</li>
            </ul>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 mb-2">COMPONENTES REUTILIZABLES</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>• VerificationBadge (VERIFIED, UNVERIFIED, etc.)</li>
              <li>• StatusBadge (DRAFT, ACTIVE, etc.)</li>
              <li>• MoneyValue (formato monetario)</li>
              <li>• EmptyState, LoadingState, ErrorState</li>
              <li>• RightsMatrix, RightsGraph, ChainTimeline</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="text-sm font-bold text-purple-800 mb-2">VISTAS PRINCIPALES</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Dashboard con métricas reales</li>
              <li>• Case Workspace (corazón operativo)</li>
              <li>• Rights Workspace (Matriz + Grafo + Cadena)</li>
              <li>• Valuation Workspace (métodos + trazabilidad)</li>
              <li>• Scenario Lab (comparación + what-if)</li>
            </ul>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-800 mb-2">INTEGRACIÓN CON FASES 2-4</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Motores de Fase 2 invocados desde UI</li>
              <li>• Registros de Fase 3 como fuente de datos</li>
              <li>• Agente de Fase 4 integrado como herramienta</li>
              <li>• Trazabilidad DOCUMENTO → CÁLCULO → RESULTADO</li>
              <li>• Evidence Gate visible en Valuation Workspace</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="📁 Archivos Creados/Modificados">
        <Table
          headers={['Archivo', 'Descripción', 'Estado']}
          rows={[
            ['src/ui/components/AppShell.tsx', 'Layout principal con Sidebar + TopBar + Workspace', '✅'],
            ['src/ui/components/shared.tsx', 'Badges, MoneyValue, EmptyState, etc.', '✅'],
            ['src/ui/context.tsx', 'Estado global con registros y agente', '✅'],
            ['src/ui/config.ts', 'Rutas, navegación, configuración', '✅'],
            ['src/ui/views/Dashboard.tsx', 'Panel con métricas reales', '✅'],
            ['src/ui/views/CasesView.tsx', 'Lista de expedientes', '✅'],
            ['src/ui/views/CaseDetail.tsx', 'Detalle con tabs', '✅'],
            ['src/ui/views/RightsWorkspace.tsx', 'Matriz + Grafo + Chain of Title', '✅ NUEVO'],
            ['src/ui/views/ValuationWorkspace.tsx', 'Métodos + trazabilidad + linaje', '✅ NUEVO'],
            ['src/ui/views/ScenarioLab.tsx', 'Comparación + What-If + Sensibilidad', '✅ NUEVO'],
            ['src/ui/views/ReviewCenter.tsx', 'Conflictos y pendientes', '✅ NUEVO'],
            ['src/ui/views/AgentWorkspace.tsx', 'Chat con agente pericial', '✅'],
            ['src/ui/views/SimpleViews.tsx', 'Documents, Evidence, Contracts, etc.', '✅'],
            ['src/App.tsx', 'Router principal actualizado', '✅ Modificado'],
          ]}
        />
      </Card>

      <Card title="🎯 Principios de Diseño Implementados">
        <div className="space-y-3">
          <InfoBox type="success">
            <strong>EXPEDIENTE EN EL CENTRO:</strong> Todas las herramientas orbitan alrededor del expediente activo. El usuario nunca se pregunta "¿de qué obra es esta cifra?".
          </InfoBox>
          <InfoBox type="success">
            <strong>SIN FALSA CERTEZA:</strong> Cifras UNVERIFIED se muestran diferentes a VERIFIED. Simulaciones etiquetadas. Cadenas incompletas visibles.
          </InfoBox>
          <InfoBox type="success">
            <strong>TRAZABILIDAD VISUAL:</strong> Cada cifra muestra su procedencia. Linaje DOCUMENTO → EVIDENCIA → CÁLCULO → RESULTADO navegable.
          </InfoBox>
          <InfoBox type="success">
            <strong>DATOS REALES:</strong> Todas las métricas provienen de registros de Fase 3. No se inventan números para dashboards.
          </InfoBox>
          <InfoBox type="warning">
            <strong>ESTADOS VACÍOS ÚTILES:</strong> En lugar de mostrar "0" cuando no hay datos, se muestran mensajes claros como "Todavía no hay documentos. Añade contratos para comenzar."
          </InfoBox>
          <InfoBox type="info">
            <strong>AGENTE COMO HERRAMIENTA:</strong> El agente no es toda la aplicación. Es una herramienta dentro del expediente que responde preguntas con datos reales.
          </InfoBox>
        </div>
      </Card>

      <Card title="⚠️ Decisiones Pendientes de Aprobación">
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">1. Gráficos avanzados</p>
            <p className="text-[11px] text-amber-700">Monte Carlo y sensibilidad usan representaciones CSS simplificadas. ¿Se integra una librería de gráficos (Recharts, Chart.js) para distribuciones y histogramas?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">2. Document Viewer</p>
            <p className="text-[11px] text-amber-700">Los documentos se listan pero no se visualizan inline. ¿Se integra un visor PDF o se mantiene como descarga?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">3. Drag & Drop para documentos</p>
            <p className="text-[11px] text-amber-700">La subida de archivos es mediante input file. ¿Se implementa drag & drop con progreso?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">4. Onboarding guiado</p>
            <p className="text-[11px] text-amber-700">No hay flujo de onboarding para usuarios nuevos. ¿Se implementa un tour guiado o se mantiene descubrimiento natural?</p>
          </div>
        </div>
      </Card>

      <Card title="📊 Deuda Técnica">
        <ul className="text-xs text-slate-700 space-y-1">
          <li>• Tests E2E completos para todos los flujos</li>
          <li>• Accesibilidad auditada (aria-labels, keyboard navigation)</li>
          <li>• Responsive completo para móvil (actualmente desktop-first)</li>
          <li>• Modo oscuro completo (preparado pero no pulido)</li>
          <li>• Paginación en tablas con muchos registros</li>
          <li>• Búsqueda global con resultados cruzados</li>
          <li>• Exportación de informes (PDF/DOCX)</li>
          <li>• Notificaciones en tiempo real</li>
        </ul>
      </Card>

      <InfoBox type="success">
        <strong>Build status:</strong> ✅ Compila sin errores. La interfaz es funcional y profesional. El usuario puede crear expedientes, gestionar documentos, revisar evidencias, analizar derechos (matriz + grafo + cadena), ejecutar valoraciones con trazabilidad, comparar escenarios, consultar al agente y revisar conflictos. Todo con datos reales de los fixtures ficticios.
      </InfoBox>
    </SectionWrapper>
  );
}
