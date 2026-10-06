/**
 * PERITO IP — Fase 5: Review Center
 * 
 * Centraliza problemas que impiden una conclusión robusta.
 */

import React from 'react';
import { useApp } from '../context';
import { VerificationBadge, StatusBadge, EmptyState } from '../components/shared';

export function ReviewCenter() {
  const { registries, activeCase } = useApp();

  const allCases = activeCase
    ? [registries.caseManagement.get(activeCase.caseId)!]
    : registries.caseManagement.getAll();

  // Recopilar todos los problemas
  const issues: {
    type: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    caseId: string;
    entityId?: string;
  }[] = [];

  for (const c of allCases) {
    // Conflictos abiertos
    const conflicts = registries.conflicts.getOpenConflicts(c.caseId);
    for (const conflict of conflicts) {
      issues.push({
        type: 'CONFLICT',
        severity: conflict.severity as any,
        title: `Conflicto: ${conflict.conflictType}`,
        description: conflict.description,
        caseId: c.caseId,
        entityId: conflict.conflictId,
      });
    }

    // Evidencias no verificadas críticas
    const unverified = registries.evidences.getByCase(c.caseId)
      .filter(e => e.verificationStatus === 'UNVERIFIED' && e.reliability === 'HIGH');
    for (const ev of unverified) {
      issues.push({
        type: 'UNVERIFIED_EVIDENCE',
        severity: 'MEDIUM',
        title: 'Evidencia de alta fiabilidad sin verificar',
        description: ev.factAsserted,
        caseId: c.caseId,
        entityId: ev.evidenceId,
      });
    }

    // Cadenas incompletas
    const rights = registries.rights.getByCase(c.caseId);
    for (const right of rights) {
      const chain = registries.chains.getChain(right.rightId);
      if (chain && chain.overallStatus !== 'COMPLETE') {
        issues.push({
          type: 'CHAIN_GAP',
          severity: 'HIGH',
          title: `Cadena incompleta: ${right.rightType}`,
          description: chain.gaps.join('; '),
          caseId: c.caseId,
          entityId: right.rightId,
        });
      }
    }

    // Hipótesis activas
    const assumptions = registries.assumptions.getActive(c.caseId);
    for (const asm of assumptions) {
      issues.push({
        type: 'ASSUMPTION',
        severity: 'LOW',
        title: 'Hipótesis activa',
        description: asm.description,
        caseId: c.caseId,
        entityId: asm.assumptionId,
      });
    }
  }

  // Ordenar por severidad
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Centro de Revisión</h2>
        <p className="text-sm text-slate-600 mt-1">
          {issues.length} problema{issues.length !== 1 ? 's' : ''} detectado{issues.length !== 1 ? 's' : ''} •{' '}
          <span className="text-red-600 font-semibold">{criticalCount} críticos</span> •{' '}
          <span className="text-amber-600 font-semibold">{highCount} altos</span>
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm font-bold text-emerald-800">Sin problemas detectados</p>
          <p className="text-xs text-emerald-700 mt-1">
            No hay conflictos, gaps ni evidencias críticas pendientes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`bg-white rounded-lg border p-4 ${
                issue.severity === 'CRITICAL'
                  ? 'border-red-300 bg-red-50'
                  : issue.severity === 'HIGH'
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-red-600 text-white'
                        : issue.severity === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : issue.severity === 'MEDIUM'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                      {issue.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{issue.caseId}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{issue.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{issue.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
