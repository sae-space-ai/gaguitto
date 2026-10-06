/**
 * PERITO IP — Fase 5: Rights Workspace mejorado
 * 
 * Incluye: MATRIZ DE DERECHOS, GRAFO DE DERECHOS, CHAIN OF TITLE
 */

import React, { useState } from 'react';
import { useApp } from '../context';
import { VerificationBadge, StatusBadge, EmptyState } from '../components/shared';
import { analyzeRights, analyzeChainOfTitle } from '../../agent';

export function RightsWorkspace() {
  const { registries, activeCase } = useApp();
  const [viewMode, setViewMode] = useState<'matrix' | 'graph' | 'chain'>('matrix');

  if (!activeCase) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-sm text-blue-800">Selecciona un expediente para ver sus derechos.</p>
      </div>
    );
  }

  const rightsAnalysis = analyzeRights(
    activeCase.caseId,
    registries.rights,
    registries.contracts,
    registries.evidences
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Derechos</h2>
          <p className="text-sm text-slate-600 mt-1">
            {rightsAnalysis.summary.total} derechos identificados • {rightsAnalysis.summary.verified} verificados
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              viewMode === 'matrix' ? 'bg-white shadow text-slate-800' : 'text-slate-600'
            }`}
          >
            Matriz
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              viewMode === 'graph' ? 'bg-white shadow text-slate-800' : 'text-slate-600'
            }`}
          >
            Grafo
          </button>
          <button
            onClick={() => setViewMode('chain')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${
              viewMode === 'chain' ? 'bg-white shadow text-slate-800' : 'text-slate-600'
            }`}
          >
            Cadena
          </button>
        </div>
      </div>

      {rightsAnalysis.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          {rightsAnalysis.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-800">⚠ {w}</p>
          ))}
        </div>
      )}

      {viewMode === 'matrix' && <RightsMatrix rights={rightsAnalysis.rights} registries={registries} />}
      {viewMode === 'graph' && <RightsGraph rights={rightsAnalysis.rights} registries={registries} caseId={activeCase.caseId} />}
      {viewMode === 'chain' && <ChainOfTitleView caseId={activeCase.caseId} registries={registries} />}
    </div>
  );
}

function RightsMatrix({ rights, registries }: { rights: any[]; registries: any }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Derecho</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Titular</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Territorio</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Idioma</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Exclusividad</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Vigencia</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Verificación</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-600">Estado Econ.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rights.map((r) => {
              const owner = registries.parties.get(r.owner);
              return (
                <tr key={r.rightId} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-800">{r.type}</td>
                  <td className="px-3 py-2 text-slate-600">{owner?.displayName || r.owner}</td>
                  <td className="px-3 py-2 text-slate-600">{r.territory || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{r.language || '—'}</td>
                  <td className="px-3 py-2">
                    {r.exclusivity ? (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">EXCLUSIVO</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {r.startDate ? `${r.startDate}${r.endDate ? ` → ${r.endDate}` : ''}` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <VerificationBadge status={r.verificationStatus} />
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.economicStatus} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RightsGraph({ rights, registries, caseId }: { rights: any[]; registries: any; caseId: string }) {
  // Grafo simplificado usando CSS
  const owners = Array.from(new Set(rights.map(r => r.owner)));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Grafo de Derechos</h3>
      <div className="space-y-4">
        {owners.map((ownerId) => {
          const owner = registries.parties.get(ownerId);
          const ownerRights = rights.filter(r => r.owner === ownerId);
          
          return (
            <div key={ownerId} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                  {owner?.displayName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{owner?.displayName || ownerId}</p>
                  <p className="text-xs text-slate-500">{owner?.partyType || 'Titular'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ownerRights.map((r) => (
                  <div
                    key={r.rightId}
                    className={`p-2 rounded border ${
                      r.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-50 border-emerald-200'
                        : r.verificationStatus === 'UNVERIFIED'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-800">{r.type}</p>
                    <p className="text-[10px] text-slate-600">{r.territory || 'Mundial'}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChainOfTitleView({ caseId, registries }: { caseId: string; registries: any }) {
  const rights = registries.rights.getByCase(caseId);
  
  if (rights.length === 0) {
    return <EmptyState message="No hay derechos para analizar cadena de titularidad." />;
  }

  return (
    <div className="space-y-4">
      {rights.map((right: any) => {
        const chain = registries.chains.getChain(right.rightId);
        const analysis = chain ? analyzeChainOfTitle(right.rightId, registries.chains) : null;

        return (
          <div key={right.rightId} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-800">{right.rightType}</p>
                <p className="text-xs text-slate-500">ID: {right.rightId}</p>
              </div>
              {analysis && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysis.status === 'VERIFIED_CHAIN'
                    ? 'bg-emerald-100 text-emerald-700'
                    : analysis.status === 'CHAIN_GAP'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {analysis.status}
                </span>
              )}
            </div>

            {analysis && analysis.links.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {analysis.links.map((link, i) => {
                  const fromParty = registries.parties.get(link.from);
                  const toParty = registries.parties.get(link.to);
                  
                  return (
                    <React.Fragment key={i}>
                      <div className={`flex-shrink-0 px-3 py-2 rounded border ${
                        link.status === 'VERIFIED'
                          ? 'bg-emerald-50 border-emerald-200'
                          : link.status === 'GAP'
                          ? 'bg-red-50 border-red-200 border-dashed'
                          : 'bg-amber-50 border-amber-200'
                      }`}>
                        <p className="text-xs font-semibold text-slate-800">
                          {toParty?.displayName || link.to}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {link.status === 'GAP' ? 'ESLABÓN FALTANTE' : 'Titular'}
                        </p>
                      </div>
                      {i < analysis.links.length - 1 && (
                        <div className="flex-shrink-0 text-slate-400">→</div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Cadena no documentada</p>
            )}

            {analysis && analysis.gaps.length > 0 && (
              <div className="mt-3 p-2 bg-red-50 rounded">
                <p className="text-xs font-semibold text-red-800">Gaps detectados:</p>
                {analysis.gaps.map((gap, i) => (
                  <p key={i} className="text-xs text-red-700">• {gap}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
