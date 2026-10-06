/**
 * PERITO IP — Fase 5: Vista de Expedientes
 * 
 * Lista de expedientes con búsqueda y filtros.
 */

import React, { useState } from 'react';
import { useApp } from '../context';
import { computeCaseHealth } from '../../records';

export function CasesView() {
  const { registries, setRoute } = useApp();
  const [search, setSearch] = useState('');
  
  const allCases = registries.caseManagement.getAll();
  
  const filteredCases = allCases.filter(c => 
    c.caseName.toLowerCase().includes(search.toLowerCase()) ||
    c.caseId.toLowerCase().includes(search.toLowerCase()) ||
    c.caseType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Expedientes</h2>
        <p className="text-sm text-slate-600 mt-1">
          Gestión de expedientes periciales con datos reales de los registros del sistema.
        </p>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <input
          type="text"
          placeholder="Buscar por nombre, ID o tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de expedientes */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Expediente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Fecha Valoración</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Evidencias</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Conflictos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCases.map((caseItem) => {
              const health = computeCaseHealth(
                caseItem.caseId,
                registries.documents,
                registries.evidences,
                registries.sources,
                registries.contracts,
                registries.rights,
                registries.chains,
                registries.conflicts,
                registries.assumptions
              );
              
              const openConflicts = registries.conflicts.getOpenConflicts(caseItem.caseId).length;
              
              return (
                <tr key={caseItem.caseId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{caseItem.caseName}</p>
                      <p className="text-xs text-slate-500 font-mono">{caseItem.caseId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                      {caseItem.caseType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{caseItem.valuationDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      caseItem.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                      caseItem.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <span className="text-emerald-600 font-semibold">{health.evidence.verified}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-amber-600">{health.evidence.unverified}</span>
                      <span className="text-slate-500"> pendientes</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {openConflicts > 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                        {openConflicts} abierto{openConflicts !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Sin conflictos</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setRoute('case-detail', caseItem.caseId)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Abrir →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredCases.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No se encontraron expedientes con esos criterios.
          </div>
        )}
      </div>
    </div>
  );
}
