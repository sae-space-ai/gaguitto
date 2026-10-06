import React from 'react';
import { SectionWrapper, Card, InfoBox, Badge } from '../shared';

export default function ReportStructureSection() {
  return (
    <SectionWrapper number="Sección 10" title="Estructura del Informe Pericial" subtitle="Motor 10 — Informe profesional exportable con diferenciación visual de tipos de dato">
      
      <Card title="📄 Secciones del Informe (22 apartados)">
        <div className="space-y-2">
          {[
            { n: 1, title: 'Portada', desc: 'Identificación del perito, expediente, fecha, confidencialidad', color: 'blue' },
            { n: 2, title: 'Identificación del Expediente', desc: 'Número, título, tipo de obra, estado, jurisdicción', color: 'blue' },
            { n: 3, title: 'Objeto de la Valoración', desc: 'Qué se valora exactamente y qué queda excluido', color: 'blue' },
            { n: 4, title: 'Fecha de Valoración', desc: 'Fecha de referencia para la valoración', color: 'blue' },
            { n: 5, title: 'Activos y Derechos Analizados', desc: 'Desglose del activo y derechos incluidos/excluidos', color: 'indigo' },
            { n: 6, title: 'Documentación Examinada', desc: 'Lista completa de documentos revisados', color: 'indigo' },
            { n: 7, title: 'Fuentes Utilizadas', desc: 'Registro de fuentes con nivel de fiabilidad', color: 'indigo' },
            { n: 8, title: 'Metodología', desc: 'Métodos aplicados y justificación de cada uno', color: 'purple' },
            { n: 9, title: 'Análisis del Activo', desc: 'Características, estado, potencial, limitaciones', color: 'purple' },
            { n: 10, title: 'Análisis de Mercado', desc: 'Contexto del mercado relevante para el activo', color: 'purple' },
            { n: 11, title: 'Comparables', desc: 'Tabla de comparables con puntuación y ajustes', color: 'emerald' },
            { n: 12, title: 'Método del Coste', desc: 'Desglose de costes históricos, reproducción y reemplazo', color: 'emerald' },
            { n: 13, title: 'Método de Mercado', desc: 'Valoración basada en comparables ajustados', color: 'emerald' },
            { n: 14, title: 'Método de Ingresos', desc: 'Proyecciones, DCF, tasa de descuento, NPV', color: 'emerald' },
            { n: 15, title: 'Escenarios', desc: 'Conservador, base y expansivo con variables', color: 'amber' },
            { n: 16, title: 'Análisis de Sensibilidad', desc: 'Impacto de variables clave en el resultado', color: 'amber' },
            { n: 17, title: 'Riesgos', desc: 'Riesgos identificados y su impacto potencial', color: 'amber' },
            { n: 18, title: 'Triangulación', desc: 'Comparación de métodos y ponderación', color: 'red' },
            { n: 19, title: 'Conclusiones', desc: 'Síntesis de hallazgos y valoración', color: 'red' },
            { n: 20, title: 'Rango de Valoración', desc: 'Rango inferior, central y superior defendible', color: 'red' },
            { n: 21, title: 'Limitaciones', desc: 'Limitaciones del análisis y datos insuficientes', color: 'slate' },
            { n: 22, title: 'Anexos', desc: 'Tablas completas, memoria matemática, fuentes', color: 'slate' },
          ].map((item) => {
            const bgColors: Record<string, string> = {
              blue: 'bg-blue-600', indigo: 'bg-indigo-600', purple: 'bg-purple-600',
              emerald: 'bg-emerald-600', amber: 'bg-amber-600', red: 'bg-red-600', slate: 'bg-slate-600'
            };
            return (
              <div key={item.n} className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${bgColors[item.color] || 'bg-slate-600'}`}>
                  {item.n}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="🎨 Diferenciación Visual de Tipos de Dato">
        <p className="text-sm text-slate-700 mb-4">
          El informe diferencia visualmente cada tipo de información mediante colores y etiquetas:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">HECHO ACREDITADO</span>
            </div>
            <p className="text-xs text-emerald-800">Datos respaldados por documentación verificada. Nivel de fiabilidad: verified_official o documented.</p>
          </div>
          <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">DATO EXTERNO</span>
            </div>
            <p className="text-xs text-blue-800">Información de fuentes externas con registro completo (URL, entidad, fecha consulta).</p>
          </div>
          <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded">HIPÓTESIS</span>
            </div>
            <p className="text-xs text-amber-800">Suposición necesaria ante falta de datos. Explícitamente marcada como tal. No es un hecho.</p>
          </div>
          <div className="p-3 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-bold rounded">ESTIMACIÓN</span>
            </div>
            <p className="text-xs text-orange-800">Valoración razonada con metodología documentada pero sin dato exacto disponible.</p>
          </div>
          <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded">CÁLCULO</span>
            </div>
            <p className="text-xs text-purple-800">Resultado de aplicar una fórmula a variables documentadas. Trazable hasta la fórmula y los inputs.</p>
          </div>
          <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">CONCLUSIÓN</span>
            </div>
            <p className="text-xs text-red-800">Síntesis pericial basada en el análisis de todos los elementos anteriores. No es un dato directo.</p>
          </div>
        </div>
      </Card>

      <Card title="📎 Anexos Obligatorios">
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800">Anexo A: Tabla Completa de Fuentes y Evidencias</p>
            <p className="text-[11px] text-slate-600">Matriz completa con todos los campos: fuente, documento, fecha, hecho, fiabilidad, limitaciones, hash, relación con la valoración.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800">Anexo B: Memoria Matemática de Cálculos</p>
            <p className="text-[11px] text-slate-600">Paso a paso de cada cálculo realizado, con fórmulas, variables, valores de entrada y resultado. Reproducible íntegramente.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800">Anexo C: Registro de Auditoría</p>
            <p className="text-[11px] text-slate-600">Log completo de operaciones relevantes realizadas durante la elaboración del informe.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800">Anexo D: Comparables Detallados</p>
            <p className="text-[11px] text-slate-600">Ficha individual de cada comparable con puntuación de comparabilidad, ajustes realizados y diferencias explicadas.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-bold text-slate-800">Anexo E: Resultados de Simulación (si aplica)</p>
            <p className="text-[11px] text-slate-600">Distribución de resultados Monte Carlo, percentiles, variables probabilísticas y sus distribuciones.</p>
          </div>
        </div>
      </Card>

      <Card title="📤 Formatos de Exportación">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-lg mb-1">📕</p>
            <p className="text-xs font-bold text-red-800">PDF</p>
            <p className="text-[10px] text-red-600">Informe final firmado</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-lg mb-1">📘</p>
            <p className="text-xs font-bold text-blue-800">DOCX</p>
            <p className="text-[10px] text-blue-600">Versión editable</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <p className="text-lg mb-1">📊</p>
            <p className="text-xs font-bold text-emerald-800">XLSX</p>
            <p className="text-[10px] text-emerald-600">Datos y cálculos</p>
          </div>
        </div>
      </Card>

      <InfoBox type="info">
        <strong>Nota:</strong> El informe nunca presenta una cifra única como "el valor". Siempre presenta un rango defendible 
        con nivel de confianza, diferenciando claramente qué parte del resultado se basa en hechos y qué parte en hipótesis.
      </InfoBox>
    </SectionWrapper>
  );
}
