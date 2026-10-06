import React from 'react';
import { SectionWrapper, Card, Badge, InfoBox, Table } from '../shared';

export default function Phase6Section() {
  return (
    <SectionWrapper title="FASE 6 — Biblioteca Real de Obras y Catálogo Maestro" subtitle="Integración de catálogo público verificable (Amazon, Audius) con separación estricta entre metadatos públicos y titularidad jurídica">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">6</div>
            <div className="text-xs text-slate-500 mt-1">Módulos del Catálogo</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">2</div>
            <div className="text-xs text-slate-500 mt-1">Conectores (Amazon + Audius)</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">1</div>
            <div className="text-xs text-slate-500 mt-1">Vista Biblioteca</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">0</div>
            <div className="text-xs text-slate-500 mt-1">Datos Inventados</div>
          </div>
        </Card>
      </div>

      <Card title="🏗️ Arquitectura del Catálogo Maestro">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">CREATOR IDENTITY REGISTRY</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Gestiona variantes de nombre (alias) sin fusionarlas ciegamente</li>
              <li>• Distingue LEGAL_NAME, AUTHOR_NAME, CREATIVE_ALIAS, PLATFORM_DISPLAY_NAME</li>
              <li>• NO infiere identidad por similitud textual</li>
              <li>• Implementa resolución con evidencia positiva y negativa</li>
              <li>• Estados: MATCH_CONFIRMED, MATCH_PROBABLE_REQUIRES_REVIEW, AMBIGUOUS, NOT_MATCH</li>
            </ul>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 mb-2">MASTER WORK CATALOG</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>• Unifica obras literarias, musicales, sonoras y audiovisuales</li>
              <li>• Separa WORK (obra conceptual) de EDITION (manifestación editorial)</li>
              <li>• Gestiona relaciones: IS_EDITION_OF, IS_TRANSLATION_OF, IS_RECORDING_OF, etc.</li>
              <li>• NO fusiona automáticamente por título parecido</li>
              <li>• Detecta posibles duplicados mediante ISBN/ASIN/título</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="text-sm font-bold text-purple-800 mb-2">SOURCE CONNECTORS</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Amazon Catalog Connector (arquitectura mock, sin scraping real)</li>
              <li>• Audius Catalog Connector (arquitectura mock, sin llamadas reales)</li>
              <li>• Import Run tracking con DRY_RUN support</li>
              <li>• Paginación, incremental sync, checkpoints y deduplicación</li>
              <li>• Field Provenance: cada dato conserva su fuente y fecha</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🛡️ Principios Fundamentales Implementados">
        <div className="space-y-3">
          <InfoBox type="danger">
            <strong>PUBLICACIÓN ≠ TITULARIDAD:</strong> La existencia pública de una ficha NO equivale a titularidad jurídica. Amazon/Audius muestran crédito público, no cadena de titularidad completa.
          </InfoBox>
          <InfoBox type="danger">
            <strong>NO INVENTAR DATOS:</strong> Los conectores son MOCK para demostración. En producción usarían APIs oficiales respetando ToS. No se inventan ISBN, ASIN, pistas ni métricas.
          </InfoBox>
          <InfoBox type="warning">
            <strong>MARQUÉS DE MONTEMOLÍN:</strong> Tratado como posible CREATIVE_ALIAS o CREDIT_NAME. NO se infiere titularidad de título nobiliario ni identidad civil. Requiere evidencia independiente.
          </InfoBox>
          <InfoBox type="warning">
            <strong>MÉTRICAS ≠ INGRESOS:</strong> Plays, followers, rankings son observaciones temporales. NO se convierten automáticamente en ingresos ni valor económico.
          </InfoBox>
          <InfoBox type="info">
            <strong>COMPOSITION ≠ RECORDING:</strong> Una pista musical representa al menos COMPOSITION y SOUND_RECORDING como activos jurídicamente distintos. No se fusionan automáticamente.
          </InfoBox>
          <InfoBox type="info">
            <strong>CONTENIDO COMPLETO:</strong> NO se descarga texto/audio protegido. Solo se aceptan archivos aportados legítimamente por el usuario o mecanismos autorizados.
          </InfoBox>
        </div>
      </Card>

      <Card title="📁 Archivos Creados (Fase 6)">
        <Table
          headers={['Archivo', 'Descripción', 'Estado']}
          rows={[
            ['src/catalog/types.ts', 'Tipos del catálogo: Work, Edition, Identity, Connector', '✅'],
            ['src/catalog/identity-registry.ts', 'Creator Identity Registry con alias y resolución', '✅'],
            ['src/catalog/work-catalog.ts', 'Master Work Catalog con obras, ediciones, relaciones', '✅'],
            ['src/catalog/amazon-connector.ts', 'Amazon Connector (MOCK - arquitectura demo)', '✅'],
            ['src/catalog/audius-connector.ts', 'Audius Connector (MOCK - arquitectura demo)', '✅'],
            ['src/catalog/fixtures.ts', 'Datos ficticios para demostración', '✅'],
            ['src/catalog/index.ts', 'Barrel export del módulo catalog', '✅'],
            ['src/ui/views/LibraryView.tsx', 'Vista Biblioteca con filtros y búsqueda', '✅'],
            ['src/ui/context.tsx', 'Extendido con catálogo (aditivo)', '✅ Modificado'],
            ['src/ui/config.ts', 'Ruta library añadida', '✅ Modificado'],
            ['src/App.tsx', 'Integración de LibraryView', '✅ Modificado'],
          ]}
        />
      </Card>

      <Card title="🔗 Integración con Fases Anteriores">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800 mb-1">FASE 2 (Motores)</p>
            <p className="text-[11px] text-emerald-700">Obras verificadas pueden seleccionarse como objeto de valoración. NO generan valor automáticamente.</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-bold text-blue-800 mb-1">FASE 3 (Registros)</p>
            <p className="text-[11px] text-blue-700">Obras enlazan con Source Registry, Evidence Registry, Rights Registry y Audit Log.</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-bold text-purple-800 mb-1">FASE 4 (Agente)</p>
            <p className="text-[11px] text-purple-700">Agente puede consultar catálogo mediante herramientas read-only (search_master_catalog, get_work, etc.).</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs font-bold text-amber-800 mb-1">FASE 5 (UI)</p>
            <p className="text-[11px] text-amber-700">Vista Biblioteca integrada en el chasis existente con filtros, búsqueda y estadísticas.</p>
          </div>
        </div>
      </Card>

      <Card title="⚠️ Limitaciones y Decisiones Pendientes">
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">1. Conectores Reales</p>
            <p className="text-[11px] text-amber-700">Los conectores son MOCK. Para producción se necesitan APIs oficiales (Amazon Product Advertising API, Audius API) con autenticación y respeto de ToS.</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">2. Contenido Completo</p>
            <p className="text-[11px] text-amber-700">NO se descarga texto/audio protegido. El usuario debe aportar archivos legítimamente (manuscritos, masters, EPUB, PDF, etc.).</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">3. Valoración del Catálogo</p>
            <p className="text-[11px] text-amber-700">Las obras NO generan valor automáticamente. Requieren derechos acreditados, evidencia económica y ejecución de motores de Fase 2.</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">4. Music Valuation Extension</p>
            <p className="text-[11px] text-amber-700">Fase 2 no contiene motores musicales específicos. Se marca MUSIC_VALUATION_EXTENSION_REQUIRED para fase posterior.</p>
          </div>
        </div>
      </Card>

      <Card title="📊 Datos del Catálogo (MOCK)">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-bold mb-2">⚠️ IMPORTANTE: Todos los datos son FICTICIOS</p>
          <p className="text-[11px] text-blue-700 mb-3">
            Los datos mostrados en la Biblioteca son MOCK para demostración de la arquitectura. 
            NO representan obras reales del autor investigado.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-semibold text-blue-800">Identidades Creadas:</p>
              <ul className="text-blue-700 mt-1 space-y-0.5">
                <li>• Prof. Manuel Gago Fernández</li>
                <li>• Marqués de Montemolín (alias)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Obras Descubiertas:</p>
              <ul className="text-blue-700 mt-1 space-y-0.5">
                <li>• 3 libros (MOCK)</li>
                <li>• 3 pistas musicales (MOCK)</li>
                <li>• 6 ediciones totales</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <InfoBox type="success">
        <strong>Build status:</strong> ✅ Compila sin errores. La Biblioteca está funcional con datos MOCK. 
        La arquitectura está preparada para integración con APIs reales en producción. 
        NO se ha roto ninguna funcionalidad de Fases 1-5.
      </InfoBox>
    </SectionWrapper>
  );
}
