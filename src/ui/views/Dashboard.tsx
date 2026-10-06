/**
 * PERITO IP — Fase 5: Dashboard
 * 
 * Panel principal con métricas reales y accesos rápidos.
 */

import React from 'react';
import { useApp } from '../context';
import { computeCaseHealth } from '../../records';

export function Dashboard() {
  const { registries, setRoute } = useApp();
  
  const allCases = registries.caseManagement.getAll();
  
  // Calcular métricas globales
  const totalDocuments = registries.documents.count();
  const totalEvidences = registries.evidences.count();
  const totalContracts = registries.contracts.count();
  const totalRights = registries.rights.count();
  const openConflicts = registries.conflicts.getAll().filter(c => c.status === 'OPEN').length;
  
  // Evidencias pendientes de verificar
  const unverifiedEvidences = allCases.reduce((sum, c) => {
    const evs = registries.evidences.getByCase(c.caseId);
    return sum + evs.filter(e => e.verificationStatus === 'UNVERIFIED').length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
        <p className="text-sm text-slate-600 mt-1">
          Vista general del sistema PERITO IP con datos reales de expedientes ficticios de demostración.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Expedientes"
          value={allCases.length}
          icon="📁"
          color="blue"
          onClick={() => setRoute('cases')}
        />
        <MetricCard
          title="Documentos"
          value={totalDocuments}
          icon="📄"
          color="indigo"
          onClick={() => setRoute('documents')}
        />
        <MetricCard
          title="Evidencias"
          value={totalEvidences}
          icon="🔍"
          color="purple"
          onClick={() => setRoute('evidence')}
          badge={unverifiedEvidences > 0 ? unverifiedEvidences : undefined}
        />
        <MetricCard
          title="Contratos"
          value={totalContracts}
          icon="📝"
          color="emerald"
          onClick={() => setRoute('contracts')}
        />
      </div>

      {/* Alertas */}
      {openConflicts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800">Conflictos Abiertos</h3>
              <p className="text-xs text-amber-700 mt-1">
                Hay {openConflicts} conflicto{openConflicts !== 1 ? 's' : ''} que requiere{openConflicts !== 1 ? 'n' : ''} revisión antes de poder finalizar valoraciones.
              </p>
              <button
                onClick={() => setRoute('evidence')}
                className="mt-2 text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
              >
                Revisar conflictos →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expedientes recientes */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Expedientes Recientes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {allCases.slice(0, 5).map((caseItem) => {
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
            
            return (
              <button
                key={caseItem.caseId}
                onClick={() => setRoute('case-detail', caseItem.caseId)}
                className="w-full px-5 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{caseItem.caseName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {caseItem.caseType} • {caseItem.valuationDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-600">
                        {health.evidence.verified} verificadas
                      </p>
                      <p className="text-xs text-slate-500">
                        {health.evidence.unverified} pendientes
                      </p>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          icon="📁"
          title="Abrir Expediente"
          description="Accede a un expediente existente para revisar documentos, evidencias y derechos"
          onClick={() => setRoute('cases')}
        />
        <QuickAction
          icon="🤖"
          title="Consultar Agente"
          description="Pregunta al Agente Pericial sobre derechos, contratos, valoraciones o conflictos"
          onClick={() => setRoute('agent')}
        />
        <QuickAction
          icon="📚"
          title="Ver Documentación"
          description="Revisa la arquitectura técnica, motores matemáticos y sistema documental"
          onClick={() => setRoute('documentation')}
        />
      </div>

      {/* Nota sobre datos demo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-800">Datos de Demostración</h3>
            <p className="text-xs text-blue-700 mt-1">
              Esta interfaz utiliza 8 expedientes ficticios creados para demostración. Todos los datos son completamente inventados y no representan casos reales.
              Los expedientes incluyen: novelas con derechos editoriales, libros con contratos parciales, películas con cadenas completas, series con eslabones faltantes, conflictos de exclusividad, valoraciones históricas, royalties contractuales y datos sin evidencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, onClick, badge }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  onClick?: () => void;
  badge?: number;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow text-left relative"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
          {badge} pendientes
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-600">{title}</p>
        </div>
      </div>
    </button>
  );
}

function QuickAction({ icon, title, description, onClick }: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow text-left"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-600 mt-1">{description}</p>
    </button>
  );
}
