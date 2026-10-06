/**
 * PERITO IP — Fase 5: Vistas Simples
 * 
 * Vistas básicas para Documents, Evidence, Contracts, Rights, Valuation, Scenarios, Reports.
 */

import React from 'react';
import { useApp } from '../context';

export function DocumentsView() {
  const { registries, activeCase } = useApp();
  const docs = activeCase 
    ? registries.documents.getByCase(activeCase.caseId)
    : registries.documents.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Documentos</h2>
        <p className="text-sm text-slate-600 mt-1">
          Gestor documental con integridad SHA-256 y trazabilidad completa.
          {activeCase && <span className="ml-2 text-blue-600">Filtrado por expediente: {activeCase.caseId}</span>}
        </p>
      </div>

      {docs.length === 0 ? (
        <EmptyState message="No hay documentos registrados." />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tamaño</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Verificación</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <tr key={doc.documentId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{doc.originalFilename}</p>
                    <p className="text-xs text-slate-500">{doc.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{doc.documentType}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                  <td className="px-4 py-3">
                    <VerificationBadge status={doc.verificationStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{doc.hash.substring(0, 12)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function EvidenceView() {
  const { registries, activeCase } = useApp();
  const evidences = activeCase
    ? registries.evidences.getByCase(activeCase.caseId)
    : registries.evidences.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Evidencias</h2>
        <p className="text-sm text-slate-600 mt-1">
          Workspace de evidencias con clasificación epistemológica y estados de verificación.
          {activeCase && <span className="ml-2 text-blue-600">Filtrado por expediente: {activeCase.caseId}</span>}
        </p>
      </div>

      {evidences.length === 0 ? (
        <EmptyState message="No hay evidencias registradas." />
      ) : (
        <div className="space-y-3">
          {evidences.map((ev) => (
            <div key={ev.evidenceId} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{ev.factAsserted}</p>
                  <p className="text-xs text-slate-600 mt-1">{ev.factSupported}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">{ev.evidenceType}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">{ev.statementType}</span>
                  </div>
                </div>
                <VerificationBadge status={ev.verificationStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContractsView() {
  const { registries, activeCase } = useApp();
  const contracts = activeCase
    ? registries.contracts.getByCase(activeCase.caseId)
    : registries.contracts.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Contratos</h2>
        <p className="text-sm text-slate-600 mt-1">
          Contract workspace con extracción de cláusulas y verificación de aspectos.
          {activeCase && <span className="ml-2 text-blue-600">Filtrado por expediente: {activeCase.caseId}</span>}
        </p>
      </div>

      {contracts.length === 0 ? (
        <EmptyState message="No hay contratos registrados." />
      ) : (
        <div className="space-y-3">
          {contracts.map((ctr) => (
            <div key={ctr.contractId} className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">{ctr.title}</p>
              <p className="text-xs text-slate-500 mt-1">Tipo: {ctr.contractType} • Estado: {ctr.status}</p>
              {ctr.clauses.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Cláusulas: {ctr.clauses.length}</p>
                  {ctr.clauses.slice(0, 3).map((c) => (
                    <p key={c.clauseId} className="text-xs text-slate-600">• {c.clauseType}: {c.structuredInterpretation}</p>
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

export function RightsView() {
  const { registries, activeCase } = useApp();
  const rights = activeCase
    ? registries.rights.getByCase(activeCase.caseId)
    : registries.rights.getAll();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Derechos</h2>
        <p className="text-sm text-slate-600 mt-1">
          Matriz de derechos con titularidad, territorio, exclusividad y verificación.
          {activeCase && <span className="ml-2 text-blue-600">Filtrado por expediente: {activeCase.caseId}</span>}
        </p>
      </div>

      {rights.length === 0 ? (
        <EmptyState message="No hay derechos registrados." />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Titular</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Territorio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Exclusividad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estado Económico</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Verificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rights.map((r) => (
                <tr key={r.rightId}>
                  <td className="px-4 py-3 text-sm text-slate-800">{r.rightType}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-600">{r.ownerId}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.territory || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.exclusivity ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">{r.economicStatus}</span>
                  </td>
                  <td className="px-4 py-3"><VerificationBadge status={r.verificationStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ValuationView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Valoración</h2>
        <p className="text-sm text-slate-600 mt-1">
          Valuation Workspace con motores de Fase 2 conectados. Ejecuta cálculos deterministas con trazabilidad completa.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 text-sm">
          Los motores de valoración (DCF, Royalties, Coste, Comparables, etc.) están implementados y funcionales en la Fase 2.
          La interfaz de ejecución se completará en una iteración posterior.
        </p>
      </div>
    </div>
  );
}

export function ScenariosView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Escenarios</h2>
        <p className="text-sm text-slate-600 mt-1">
          Scenario Lab con comparación Conservative/Base/Expansive, What-If y Monte Carlo.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 text-sm">
          Los motores de escenarios y Monte Carlo están implementados en la Fase 2.
          La interfaz de comparación y visualización se completará en una iteración posterior.
        </p>
      </div>
    </div>
  );
}

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Informes</h2>
        <p className="text-sm text-slate-600 mt-1">
          Report Center para generación de informes periciales con las 22 secciones estándar.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 text-sm">
          El Report Preparation Layer está preparado en la Fase 4.
          La generación de informes exportables (PDF/DOCX) se completará en una iteración posterior.
        </p>
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configuración</h2>
        <p className="text-sm text-slate-600 mt-1">
          Ajustes del sistema, preferencias de usuario y gestión de permisos.
        </p>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
        <p className="text-slate-600 text-sm">Configuración en desarrollo.</p>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTES COMPARTIDOS
// ============================================================

function VerificationBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    VERIFIED: 'bg-emerald-100 text-emerald-700',
    PARTIALLY_VERIFIED: 'bg-blue-100 text-blue-700',
    UNVERIFIED: 'bg-amber-100 text-amber-700',
    CONFLICTED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-slate-100 text-slate-700',
    NOT_APPLICABLE: 'bg-slate-100 text-slate-500',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}
