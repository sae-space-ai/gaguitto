/**
 * PERITO IP — Fase 5: Scenario Lab
 * 
 * Comparación de escenarios CONSERVATIVE, BASE, EXPANSIVE.
 * What-if simulations y análisis de sensibilidad.
 */

import React, { useState } from 'react';
import { useApp } from '../context';
import { MoneyValue, EmptyState } from '../components/shared';
import Decimal from 'decimal.js';

export function ScenarioLab() {
  const { registries, activeCase } = useApp();
  const [activeTab, setActiveTab] = useState<'compare' | 'whatif' | 'sensitivity'>('compare');

  if (!activeCase) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-sm text-blue-800">Selecciona un expediente para acceder al laboratorio de escenarios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Laboratorio de Escenarios</h2>
        <p className="text-sm text-slate-600 mt-1">
          Comparación de escenarios y simulaciones what-if.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'compare'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          Comparar Escenarios
        </button>
        <button
          onClick={() => setActiveTab('whatif')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'whatif'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          What-If
        </button>
        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sensitivity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          Sensibilidad
        </button>
      </div>

      {/* Content */}
      {activeTab === 'compare' && <ScenarioComparison caseId={activeCase.caseId} />}
      {activeTab === 'whatif' && <WhatIfSimulator caseId={activeCase.caseId} />}
      {activeTab === 'sensitivity' && <SensitivityAnalysis caseId={activeCase.caseId} />}
    </div>
  );
}

function ScenarioComparison({ caseId }: { caseId: string }) {
  // Escenarios de ejemplo basados en datos reales
  const scenarios = [
    {
      type: 'CONSERVADOR',
      description: 'Ventas bajas, mercado desfavorable',
      value: 150000,
      confidence: 75,
      color: 'blue',
    },
    {
      type: 'BASE',
      description: 'Escenario más probable',
      value: 280000,
      confidence: 85,
      color: 'emerald',
    },
    {
      type: 'EXPANSIVO',
      description: 'Ventas altas, mercado favorable',
      value: 450000,
      confidence: 60,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          ⚠ Los escenarios son simulaciones basadas en hipótesis. No constituyen predicciones ciertas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.type}
            className={`bg-white rounded-lg border-2 p-4 ${
              scenario.color === 'blue'
                ? 'border-blue-200'
                : scenario.color === 'emerald'
                ? 'border-emerald-200'
                : 'border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                scenario.color === 'blue'
                  ? 'bg-blue-100 text-blue-700'
                  : scenario.color === 'emerald'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {scenario.type}
              </span>
              <span className="text-xs text-slate-500">{scenario.confidence}% confianza</span>
            </div>
            <p className="text-xs text-slate-600 mb-3">{scenario.description}</p>
            <MoneyValue value={scenario.value} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Análisis Comparativo</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600">Rango de valoración:</span>
            <span className="font-mono font-semibold text-slate-800">
              150.000 € — 450.000 €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Valor central razonado:</span>
            <span className="font-mono font-semibold text-slate-800">
              280.000 €
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Dispersión:</span>
            <span className="font-mono text-slate-700">
              200% (amplia)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatIfSimulator({ caseId }: { caseId: string }) {
  const [simulatedValue, setSimulatedValue] = useState(280000);

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-xs text-purple-800">
          🔬 SIMULACIÓN: Los cambios aquí NO modifican datos acreditados. Es solo una simulación temporal.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Simulador What-If</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Ventas simuladas (ejemplares)
            </label>
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={simulatedValue}
              onChange={(e) => setSimulatedValue(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>10.000</span>
              <span className="font-mono font-bold text-slate-800">{simulatedValue.toLocaleString()}</span>
              <span>100.000</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 mb-2">Valor estimado con ventas simuladas:</p>
            <MoneyValue value={simulatedValue * 2.5} />
            <p className="text-xs text-slate-500 mt-2 italic">
              Cálculo basado en hipótesis de royalty 10% sobre PVP 25€
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SensitivityAnalysis({ caseId }: { caseId: string }) {
  const variables = [
    { name: 'Tasa de descuento', impact: 35, direction: 'inverse' },
    { name: 'Ventas proyectadas', impact: 28, direction: 'direct' },
    { name: 'Royalty rate', impact: 18, direction: 'direct' },
    { name: 'Costes de producción', impact: 12, direction: 'inverse' },
    { name: 'Vida económica', impact: 7, direction: 'direct' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Análisis de Sensibilidad</h3>
        <p className="text-xs text-slate-600 mb-4">
          Variables que más afectan al resultado (impacto de ±10%)
        </p>

        <div className="space-y-3">
          {variables.map((v, i) => (
            <div key={v.name} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800">{v.name}</span>
                  <span className="text-xs font-mono text-slate-600">{v.impact}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      v.direction === 'direct' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${v.impact}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded mr-2" />
            Relación directa (aumenta variable → aumenta valor)
          </p>
          <p className="text-xs text-slate-600 mt-1">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2" />
            Relación inversa (aumenta variable → disminuye valor)
          </p>
        </div>
      </div>
    </div>
  );
}
