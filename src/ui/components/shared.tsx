/**
 * PERITO IP — Fase 5: Componentes Reutilizables
 * 
 * Badges, indicadores y componentes compartidos.
 */

import React from 'react';
import { VerificationStatus } from '../../records/types';

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = {
    VERIFIED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'VERIFICADO', icon: '✓' },
    PARTIALLY_VERIFIED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'PARCIAL', icon: '◐' },
    UNVERIFIED: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'NO VERIFICADO', icon: '?' },
    CONFLICTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'CONFLICTO', icon: '⚠' },
    REJECTED: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'RECHAZADO', icon: '✗' },
    NOT_APPLICABLE: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'N/A', icon: '—' },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    EVIDENCE_GATHERING: 'bg-blue-100 text-blue-700',
    ANALYSIS: 'bg-indigo-100 text-indigo-700',
    VALUATION_IN_PROGRESS: 'bg-purple-100 text-purple-700',
    REVIEW: 'bg-amber-100 text-amber-700',
    FINALIZED: 'bg-emerald-100 text-emerald-700',
    ARCHIVED: 'bg-slate-100 text-slate-500',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    EXPIRED: 'bg-slate-100 text-slate-500',
    TERMINATED: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
    DISPUTED: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

export function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-sm text-slate-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-3xl mb-2">⚠️</div>
      <p className="text-sm text-red-800 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function MoneyValue({ value, currency = 'EUR' }: { value: number | string; currency?: string }) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const symbols: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
  const symbol = symbols[currency] || currency;
  
  return (
    <span className="font-mono font-semibold text-slate-800">
      {symbol}{num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export function PercentageValue({ value }: { value: number }) {
  return (
    <span className="font-mono text-slate-700">
      {(value * 100).toFixed(2)}%
    </span>
  );
}
