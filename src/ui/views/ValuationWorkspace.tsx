/**
 * PERITO IP — Fase 5: Valuation Workspace mejorado
 * 
 * Incluye: métodos de valoración, inputs con trazabilidad,
 * Calculation Trace, Data Lineage Navigator.
 */

import React, { useState } from 'react';
import { useApp } from '../context';
import { MoneyValue, VerificationBadge, StatusBadge, EmptyState } from '../components/shared';
import { checkValuationReadiness } from '../../agent';
import Decimal from 'decimal.js';

export function ValuationWorkspace() {
  const { registries, activeCase } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);

  if (!activeCase) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-sm text-blue-800">Selecciona un expediente para acceder a la valoración.</p>
      </div>
    );
  }

  const readiness = checkValuationReadiness(
    activeCase.caseId,
    registries.rights,
    registries.evidences,
    registries.contracts,
    registries.conflicts,
    registries.chains
  );

  const lineage = registries.lineage.getByCase(activeCase.caseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Valoración</h2>
          <p className="text-sm text-slate-600 mt-1">
            Fecha de valoración: {activeCase.valuationDate} • Moneda: {activeCase.currency}
          </p>
        </div>
        <StatusBadge status={readiness.status} />
      </div>

      {/* Readiness Alert */}
      {readiness.status !== 'READY' && (
        <div className={`rounded-lg p-4 border ${
          readiness.status === 'NOT_READY'
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-sm font-bold ${
            readiness.status === 'NOT_READY' ? 'text-red-800' : 'text-amber-800'
          }`}>
            {readiness.status === 'NOT_READY'
              ? '⛔ Expediente no listo para valoración'
              : '⚠ Expediente requiere revisión antes de valoración definitiva'}
          </p>
          {readiness.reasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {readiness.reasons.map((r, i) => (
                <li key={i} className="text-xs text-slate-700">• {r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Métodos de valoración */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ValuationMethodCard
          title="Coste"
          description="Valoración por coste histórico, reproducción o reemplazo"
          status={readiness.canProceedExploratory ? 'available' : 'blocked'}
          onClick={() => setSelectedMethod('cost')}
        />
        <ValuationMethodCard
          title="Mercado"
          description="Comparables de mercado verificados"
          status={readiness.canProceedExploratory ? 'available' : 'blocked'}
          onClick={() => setSelectedMethod('market')}
        />
        <ValuationMethodCard
          title="Ingresos (DCF)"
          description="Flujos de caja descontados"
          status={readiness.canProceedExploratory ? 'available' : 'blocked'}
          onClick={() => setSelectedMethod('dcf')}
        />
        <ValuationMethodCard
          title="Editorial"
          description="Valoración de derechos editoriales"
          status={readiness.canProceedExploratory ? 'available' : 'blocked'}
          onClick={() => setSelectedMethod('book')}
        />
        <ValuationMethodCard
          title="Audiovisual"
          description="Valoración por ventanas de explotación"
          status={readiness.canProceedExploratory ? 'available' : 'blocked'}
          onClick={() => setSelectedMethod('audiovisual')}
        />
        <ValuationMethodCard
          title="Triangulación"
          description="Comparación ponderada de métodos"
          status={readiness.canProceedFinal ? 'available' : 'blocked'}
          onClick={() => setSelectedMethod('triangulation')}
        />
      </div>

      {/* Data Lineage */}
      {lineage.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Linaje de Datos</h3>
          <p className="text-xs text-slate-600 mb-3">
            {lineage.length} inputs con trazabilidad completa
          </p>
          <div className="space-y-2">
            {lineage.slice(0, 5).map((entry) => (
              <div key={entry.lineageId} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-xs">
                <span className="font-mono font-semibold text-slate-800">{entry.targetField}</span>
                <span className="text-slate-500">=</span>
                <span className="font-mono text-slate-700">{entry.targetValue}</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-500">
                  {entry.chain.map((step, i) => (
                    <React.Fragment key={i}>
                      <span className="px-1 py-0.5 bg-slate-200 rounded">{step}</span>
                      {i < entry.chain.length - 1 && <span>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculation Trace Modal */}
      {showTrace && selectedMethod && (
        <CalculationTraceModal
          method={selectedMethod}
          onClose={() => setShowTrace(false)}
        />
      )}
    </div>
  );
}

function ValuationMethodCard({
  title,
  description,
  status,
  onClick,
}: {
  title: string;
  description: string;
  status: 'available' | 'blocked';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={status === 'blocked'}
      className={`p-4 rounded-lg border text-left transition-all ${
        status === 'available'
          ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
          : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
      }`}
    >
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-600 mt-1">{description}</p>
      <div className="mt-3">
        {status === 'available' ? (
          <span className="text-xs font-medium text-blue-600">Ejecutar →</span>
        ) : (
          <span className="text-xs font-medium text-slate-400">No disponible</span>
        )}
      </div>
    </button>
  );
}

function CalculationTraceModal({ method, onClose }: { method: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Trazabilidad del Cálculo</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Método</p>
            <p className="text-sm text-slate-800 mt-1">{method.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Fórmula</p>
            <p className="text-sm font-mono text-slate-800 mt-1 bg-slate-50 p-2 rounded">
              {method === 'dcf' && 'NPV = Σ [CF_t / (1 + k)^t]'}
              {method === 'cost' && 'Cost = Σ(componentes)'}
              {method === 'market' && 'Value = Σ(value_i × similarity_i) / Σ(similarity_i)'}
              {method === 'book' && 'V = Σ_modalidades [Σ_t (Royalty_t + Other_t - Costs_t) / (1+k)^t]'}
              {method === 'triangulation' && 'Central = Σ(value_i × weight_i)'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Inputs</p>
            <div className="mt-1 space-y-1">
              <p className="text-xs text-slate-700">• Cada input vinculado a evidencia/contrato/fuente</p>
              <p className="text-xs text-slate-700">• Estado de verificación visible</p>
              <p className="text-xs text-slate-700">• Navegación al documento original</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase">Pasos Intermedios</p>
            <div className="mt-1 space-y-1">
              <p className="text-xs text-slate-700">• Paso 1: Calcular flujos por período</p>
              <p className="text-xs text-slate-700">• Paso 2: Aplicar factor de descuento</p>
              <p className="text-xs text-slate-700">• Paso 3: Sumar valores presentes</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 italic">
              Todos los cálculos son ejecutados por motores deterministas de Fase 2.
              El agente NO calcula, solo coordina y explica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
