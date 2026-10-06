/**
 * PERITO IP — Fase 5: Detalle de Expediente
 * 
 * Vista principal del expediente con pestañas para todas las secciones.
 */

import React, { useState } from 'react';
import { useApp } from '../context';
import { computeCaseHealth } from '../../records';

export function CaseDetail() {
  const { registries, activeCase, setRoute } = useApp();
  const [activeTab, setActiveTab] = useState('summary');

  if (!activeCase) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <p className="text-amber-800">No hay expediente activo. Selecciona un expediente desde la lista.</p>
        <button
          onClick={() => setRoute('cases')}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Ir a Expedientes
        </button>
      </div>
    );
  }

  const health = computeCaseHealth(
    activeCase.caseId,
    registries.documents,
    registries.evidences,
    registries.sources,
    registries.contracts,
    registries.rights,
    registries.chains,
    registries.conflicts,
    registries.assumptions
  );

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: '📋' },
    { id: 'documents', label: 'Documentos', icon: '📄', count: health.documents.total },
    { id: 'evidence', label: 'Evidencias', icon: '🔍', count: health.evidence.verified + health.evidence.unverified },
    { id: 'contracts', label: 'Contratos', icon: '📝', count: health.contracts.analyzed + health.contracts.pending },
    { id: 'rights', label: 'Derechos', icon: '⚖️', count: health.rights.identified + health.rights.verified },
    { id: 'conflicts', label: 'Conflictos', icon: '⚠️', count: health.conflicts.open },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera del expediente */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{activeCase.caseName}</h2>
            <p className="text-sm text-slate-500 font-mono mt-1">{activeCase.caseId}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {activeCase.caseType}
              </span>
              <span className="text-sm text-slate-600">
                Fecha valoración: <strong>{activeCase.valuationDate}</strong>
              </span>
              {activeCase.jurisdiction && (
                <span className="text-sm text-slate-600">
                  Jurisdicción: <strong>{activeCase.jurisdiction}</strong>
                </span>
              )}
              <span className="text-sm text-slate-600">
                Moneda: <strong>{activeCase.currency}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => setRoute('cases')}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de pestañas */}
        <div className="p-6">
          {activeTab === 'summary' && <CaseSummary activeCase={activeCase} health={health} registries={registries} />}
          {activeTab === 'documents' && <CaseDocuments caseId={activeCase.caseId} registries={registries} />}
          {activeTab === 'evidence' && <CaseEvidence caseId={activeCase.caseId} registries={registries} />}
          {activeTab === 'contracts' && <CaseContracts caseId={activeCase.caseId} registries={registries} />}
          {activeTab === 'rights' && <CaseRights caseId={activeCase.caseId} registries={registries} />}
          {activeTab === 'conflicts' && <CaseConflicts caseId={activeCase.caseId} registries={registries} />}
        </div>
      </div>
    </div>
  );
}

function CaseSummary({ activeCase, health, registries }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">Resumen Ejecutivo</h3>
        <p className="text-sm text-slate-600">{activeCase.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Documentos" value={health.documents.total} color="blue" />
        <StatBox label="Evidencias Verificadas" value={health.evidence.verified} color="emerald" />
        <StatBox label="Evidencias Pendientes" value={health.evidence.unverified} color="amber" />
        <StatBox label="Contratos" value={health.contracts.analyzed + health.contracts.pending} color="indigo" />
        <StatBox label="Derechos Identificados" value={health.rights.identified + health.rights.verified} color="purple" />
        <StatBox label="Conflictos Abiertos" value={health.conflicts.open} color="red" />
        <StatBox label="Fuentes" value={health.sources.verified + health.sources.unverified} color="slate" />
        <StatBox label="Hipótesis Activas" value={health.assumptions.active} color="orange" />
      </div>

      {health.conflicts.open > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Hay {health.conflicts.open} conflicto{health.conflicts.open !== 1 ? 's' : ''} abierto{health.conflicts.open !== 1 ? 's' : ''} que requiere{health.conflicts.open !== 1 ? 'n' : ''} resolución.
          </p>
        </div>
      )}

      {health.chainGaps > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-800">
            🔗 Hay {health.chainGaps} cadena{health.chainGaps !== 1 ? 's' : ''} de titularidad incompleta{health.chainGaps !== 1 ? 's' : ''}.
          </p>
        </div>
      )}
    </div>
  );
}

function CaseDocuments({ caseId, registries }: any) {
  const docs = registries.documents.getByCase(caseId);
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">Documentos del Expediente</h3>
      {docs.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay documentos registrados para este expediente.
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc: any) => (
            <div key={doc.documentId} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{doc.originalFilename}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tipo: {doc.documentType} • Tamaño: {(doc.fileSize / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{doc.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                  doc.verificationStatus === 'UNVERIFIED' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {doc.verificationStatus}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500 font-mono">
                Hash: {doc.hash.substring(0, 16)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseEvidence({ caseId, registries }: any) {
  const evidences = registries.evidences.getByCase(caseId);
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">Evidencias del Expediente</h3>
      {evidences.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay evidencias registradas para este expediente.
        </div>
      ) : (
        <div className="space-y-2">
          {evidences.map((ev: any) => (
            <div key={ev.evidenceId} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{ev.factAsserted}</p>
                  <p className="text-xs text-slate-600 mt-1">{ev.factSupported}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                      {ev.evidenceType}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                      {ev.statementType}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  ev.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                  ev.verificationStatus === 'UNVERIFIED' ? 'bg-amber-100 text-amber-700' :
                  ev.verificationStatus === 'CONFLICTED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {ev.verificationStatus}
                </span>
              </div>
              {ev.limitations && (
                <p className="text-xs text-slate-500 mt-2 italic">
                  Limitaciones: {ev.limitations}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseContracts({ caseId, registries }: any) {
  const contracts = registries.contracts.getByCase(caseId);
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">Contratos del Expediente</h3>
      {contracts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay contratos registrados para este expediente.
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((ctr: any) => (
            <div key={ctr.contractId} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{ctr.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tipo: {ctr.contractType} • Estado: {ctr.status}
                  </p>
                  {ctr.territory && (
                    <p className="text-xs text-slate-600 mt-1">Territorio: {ctr.territory}</p>
                  )}
                  {ctr.exclusivity !== undefined && (
                    <p className="text-xs text-slate-600">
                      Exclusividad: {ctr.exclusivity ? 'Sí' : 'No'}
                    </p>
                  )}
                </div>
              </div>
              {ctr.clauses.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Cláusulas extraídas: {ctr.clauses.length}
                  </p>
                  {ctr.clauses.map((clause: any) => (
                    <div key={clause.clauseId} className="text-xs text-slate-600 mb-1">
                      • {clause.clauseType}: {clause.structuredInterpretation}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseRights({ caseId, registries }: any) {
  const rights = registries.rights.getByCase(caseId);
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">Derechos del Expediente</h3>
      {rights.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay derechos registrados para este expediente.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Tipo</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Titular</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Territorio</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Exclusividad</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Verificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rights.map((right: any) => (
                <tr key={right.rightId}>
                  <td className="px-3 py-2 text-slate-800">{right.rightType}</td>
                  <td className="px-3 py-2 text-slate-600 font-mono text-xs">{right.ownerId}</td>
                  <td className="px-3 py-2 text-slate-600">{right.territory || '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{right.exclusivity ? 'Sí' : 'No'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      right.economicStatus === 'OWNED' ? 'bg-emerald-100 text-emerald-700' :
                      right.economicStatus === 'LICENSED' ? 'bg-blue-100 text-blue-700' :
                      right.economicStatus === 'ASSIGNED' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {right.economicStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      right.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                      right.verificationStatus === 'UNVERIFIED' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {right.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CaseConflicts({ caseId, registries }: any) {
  const conflicts = registries.conflicts.getByCase(caseId);
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-3">Conflictos del Expediente</h3>
      {conflicts.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No hay conflictos registrados para este expediente.
        </div>
      ) : (
        <div className="space-y-3">
          {conflicts.map((conflict: any) => (
            <div key={conflict.conflictId} className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-800">{conflict.description}</p>
                  <p className="text-xs text-red-700 mt-1">
                    Tipo: {conflict.conflictType} • Severidad: {conflict.severity}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Estado: {conflict.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    indigo: 'text-indigo-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    slate: 'text-slate-600',
    orange: 'text-orange-600',
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-1">{label}</p>
    </div>
  );
}
