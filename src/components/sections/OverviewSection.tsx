import React from 'react';
import { SectionWrapper, Card, Badge, InfoBox } from '../shared';

export default function OverviewSection() {
  return (
    <SectionWrapper title="Resumen Ejecutivo" subtitle="Documento de arquitectura del sistema PERITO IP — Versión para aprobación">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">10</div>
            <div className="text-xs text-slate-500 mt-1">Motores de Análisis</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">22</div>
            <div className="text-xs text-slate-500 mt-1">Secciones del Informe</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">14</div>
            <div className="text-xs text-slate-500 mt-1">Módulos del Sistema</div>
          </div>
        </Card>
      </div>

      <Card title="🎯 Objetivo del Sistema">
        <p className="text-sm text-slate-700 leading-relaxed">
          PERITO IP es un <strong>sistema pericial trazable</strong> para la identificación, análisis y valoración económica 
          de activos de propiedad intelectual en los ámbitos audiovisual y literario. No es un chatbot que proporciona 
          cifras subjetivas: es un motor de cálculo determinista con trazabilidad completa de cada dato, hipótesis y resultado.
        </p>
      </Card>

      <Card title="📌 Principios Fundamentales">
        <div className="space-y-3">
          <InfoBox type="danger">
            <strong>NUNCA inventar un valor económico.</strong> Si faltan datos, solicitarlos o construir escenarios identificados como hipótesis.
          </InfoBox>
          <InfoBox type="warning">
            <strong>Toda valoración debe ser reconstruible matemáticamente.</strong> Cada cifra debe poder trazarse hasta su origen: hecho documentado, fuente externa, comparable, estimación, hipótesis o cálculo.
          </InfoBox>
          <InfoBox type="info">
            <strong>Separación estricta de responsabilidades:</strong> El LLM interpreta, clasifica e investiga. El motor matemático calcula. La base documental conserva evidencia.
          </InfoBox>
          <InfoBox type="success">
            <strong>Control anti-alucinación activo:</strong> Prohibido inventar contratos, ventas, royalties, precedentes, jurisprudencia, comparables, fuentes o cifras de mercado.
          </InfoBox>
        </div>
      </Card>

      <Card title="📂 Ámbito de Aplicación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Obras audiovisuales (largometrajes, cortometrajes, documentales, series)',
            'Libros y obras literarias (novelas, ensayos, poesía, no-ficción)',
            'Guiones y proyectos audiovisuales en desarrollo',
            'Biblias, tratamientos, formatos y universos narrativos',
            'Derechos derivados: adaptaciones, traducciones, secuelas',
            'Licencias y explotación territorial',
            'Personajes y elementos identificables',
            'Derechos editoriales y audiovisuales separados',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Badge variant="info">{i + 1}</Badge>
              <span className="text-xs text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="🏛️ Componentes del Documento">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { n: '1', t: 'Arquitectura Completa del Sistema' },
            { n: '2', t: 'Modelo de Datos' },
            { n: '3', t: 'Esquema de Base de Datos' },
            { n: '4', t: 'Arquitectura del Agente' },
            { n: '5', t: 'Herramientas Necesarias' },
            { n: '6', t: 'Motores Matemáticos' },
            { n: '7', t: 'Sistema de Evidencias' },
            { n: '8', t: 'Sistema de Fuentes' },
            { n: '9', t: 'Sistema de Auditoría' },
            { n: '10', t: 'Estructura del Informe Pericial' },
            { n: '11', t: 'Riesgos Técnicos y Jurídicos' },
            { n: '12', t: 'Roadmap de Implementación' },
          ].map((item) => (
            <div key={item.n} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{item.n}</span>
              <span className="text-xs text-slate-700 font-medium">{item.t}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="⚡ Estado Actual">
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Documento en fase de revisión</p>
            <p className="text-xs text-amber-700">Se requiere aprobación antes de comenzar la implementación. Este documento define la arquitectura, modelo de datos, motores y roadmap completo.</p>
          </div>
        </div>
      </Card>
    </SectionWrapper>
  );
}
