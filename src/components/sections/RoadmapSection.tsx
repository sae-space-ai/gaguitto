import React from 'react';
import { SectionWrapper, Card, InfoBox, Badge, Table } from '../shared';

export default function RoadmapSection() {
  return (
    <SectionWrapper number="Sección 12" title="Roadmap de Implementación" subtitle="Plan de desarrollo por fases con entregables verificables">
      
      <Card title="🗺️ Visión General del Roadmap">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Fase 5', 'Fase 6'].map((phase, i) => (
            <React.Fragment key={phase}>
              <div className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white ${
                i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-indigo-600' : i === 2 ? 'bg-purple-600' : i === 3 ? 'bg-emerald-600' : i === 4 ? 'bg-amber-600' : 'bg-red-600'
              }`}>
                {phase}
              </div>
              {i < 5 && <div className="flex-shrink-0 text-slate-300">→</div>}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card title="🔵 FASE 1 — Fundamentos (Semanas 1-3)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">OBJETIVO: Base técnica funcional con gestión de expedientes y evidencias</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Configuración del proyecto (TypeScript, React, PostgreSQL)',
              'Esquema de base de datos completo con migraciones',
              'Sistema de autenticación (JWT + roles)',
              'CRUD de expedientes (cases) con ID único',
              'Sistema de ingestión de evidencias con hash SHA-256',
              'Matriz de evidencias básica',
              'Log de auditoría append-only con hash encadenado',
              'Tests unitarios de infraestructura',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                <span className="text-xs text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <p className="text-xs font-bold text-blue-800">🎯 Entregable: Sistema capaz de crear expedientes, incorporar evidencias con hash, y registrar auditoría.</p>
          </div>
        </div>
      </Card>

      <Card title="🟣 FASE 2 — Motores de Cálculo (Semanas 4-6)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">OBJETIVO: Implementar los 3 motores principales con tests exhaustivos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Motor de Coste (histórico, reproducción, reemplazo)',
              'Motor de Comparables (búsqueda, scoring, ajustes)',
              'Motor de Ingresos/DCF (proyecciones, NPV, sensibilidad)',
              'decimal.js en todos los cálculos financieros',
              'Tests unitarios para cada motor (>90% cobertura)',
              'Tests de integración entre motores',
              'Validadores de entrada (Zod schemas)',
              'Sistema de tipos completo (TypeScript strict)',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                <span className="text-xs text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <p className="text-xs font-bold text-purple-800">🎯 Entregable: Los 3 motores producen resultados correctos y verificados por tests automatizados.</p>
          </div>
        </div>
      </Card>

      <Card title="🟢 FASE 3 — Escenarios, Monte Carlo y Triangulación (Semanas 7-9)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">OBJETIVO: Motores avanzados de análisis probabilístico y síntesis</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Motor de Escenarios (conservador, base, expansivo)',
              'Motor Monte Carlo (distribuciones, simulación, percentiles)',
              'Detector de convergencia para Monte Carlo',
              'Motor de Triangulación (ponderación, rango, confianza)',
              'Motor Jurídico-Pericial (lucro cesante, regalía hipotética)',
              'Análisis de sensibilidad univariante y multivariante',
              'Visualización de distribuciones (histogramas)',
              'Tests de escenarios contra valores conocidos',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded">
                <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                <span className="text-xs text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-emerald-100 rounded-lg">
            <p className="text-xs font-bold text-emerald-800">🎯 Entregable: Sistema completo de valoración con escenarios, simulación y triangulación funcional.</p>
          </div>
        </div>
      </Card>

      <Card title="🟡 FASE 4 — Agente LLM e Interfaz (Semanas 10-12)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">OBJETIVO: Integración del agente LLM con interfaz profesional</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Orquestador de agentes (ingestión, investigación, análisis, redacción)',
              'Protocolos anti-alucinación implementados',
              'Interfaz de creación de expedientes',
              'Editor de evidencias con matriz visual',
              'Dashboard de valoraciones con trazabilidad',
              'Visor de auditoría con verificación de cadena',
              'Sistema de fuentes con registro y verificación',
              'Gestión de roles y permisos en UI',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded">
                <span className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                <span className="text-xs text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-amber-100 rounded-lg">
            <p className="text-xs font-bold text-amber-800">🎯 Entregable: Aplicación web completa con agente LLM integrado y UI profesional funcional.</p>
          </div>
        </div>
      </Card>

      <Card title="🔴 FASE 5 — Informes y Exportación (Semanas 13-14)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">OBJETIVO: Generación de informes periciales profesionales exportables</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Generador de informes con las 22 secciones',
              'Diferenciación visual de tipos de dato',
              'Exportación PDF profesional',
              'Exportación DOCX editable',
              'Exportación XLSX con datos y cálculos',
              'Memoria matemática automática',
              'Tabla de fuentes y evidencias automática',
              'Plantillas por jurisdicción',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                <span className="text-xs text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-red-100 rounded-lg">
            <p className="text-xs font-bold text-red-800">🎯 Entregable: Informe pericial completo, exportable y profesionalmente presentable.</p>
          </div>
        </div>
      </Card>

      <Card title="⚫ FASE 6 — Pruebas, Seguridad y Despliegue (Semanas 15-16)">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">OBJETIVO: Validación completa, seguridad y preparación para producción</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Tests end-to-end del flujo completo',
              'Auditoría de seguridad (penetration testing)',
              'Verificación de integridad del sistema',
              'Pruebas con casos reales (anonimizados)',
              'Documentación técnica completa',
              'Manual de usuario para peritos',
              'Configuración de producción (Docker, CI/CD)',
              'Plan de backup y recuperación',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-100 rounded">
                <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px]">{i+1}</span>
                <span className="text-xs text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-800">🎯 Entregable: Sistema validado, seguro y listo para uso profesional.</p>
          </div>
        </div>
      </Card>

      <Card title="📊 Resumen de Fases">
        <Table
          headers={['Fase', 'Duración', 'Entregable Principal', 'Dependencias']}
          rows={[
            ['1. Fundamentos', '3 semanas', 'Expedientes + Evidencias + Auditoría', 'Ninguna'],
            ['2. Motores', '3 semanas', 'Coste + Mercado + Ingresos funcionales', 'Fase 1'],
            ['3. Avanzado', '3 semanas', 'Escenarios + Monte Carlo + Triangulación', 'Fase 2'],
            ['4. Agente + UI', '3 semanas', 'Aplicación web completa con LLM', 'Fases 1-3'],
            ['5. Informes', '2 semanas', 'Informes periciales exportables', 'Fase 4'],
            ['6. Validación', '2 semanas', 'Sistema en producción', 'Todas'],
          ]}
        />
      </Card>

      <InfoBox type="info">
        <strong>Duración total estimada:</strong> 16 semanas (4 meses) para un desarrollo completo con un equipo de 2-3 desarrolladores. 
        Las fases 1-3 son críticas y no deberían acortarse, ya que constituyen el núcleo matemático del sistema.
      </InfoBox>

      <Card title="🔮 Extensiones Futuras (Post-MVP)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800 mb-1">🌍 Internacionalización</p>
            <p className="text-[11px] text-slate-600">Soporte multi-jurisdicción, multi-idioma, tipos de cambio automáticos, marcos legales de múltiples países.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800 mb-1">📡 APIs de Mercado</p>
            <p className="text-[11px] text-slate-600">Integración con bases de datos profesionales de comparables cuando estén disponibles vía API.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800 mb-1">🤝 Colaboración</p>
            <p className="text-[11px] text-slate-600">Sistema de revisión por pares, comentarios en evidencias, flujo de aprobación multi-perito.</p>
          </div>
        </div>
      </Card>
    </SectionWrapper>
  );
}
