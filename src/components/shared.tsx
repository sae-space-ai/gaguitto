import React, { ReactNode } from 'react';

interface SectionHeaderProps {
  number?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function SectionWrapper({ number, title, subtitle, children }: SectionHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-blue-600 pl-4">
        {number && <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{number}</p>}
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'info' | 'warning' | 'success' | 'danger' | 'purple' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function CodeBlock({ children, language = '' }: { children: string; language?: string }) {
  return (
    <div className="relative">
      {language && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded">
          {language}
        </div>
      )}
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-slate-600 border-b border-slate-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InfoBox({ type = 'info', children }: { type?: 'info' | 'warning' | 'danger' | 'success'; children: ReactNode }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🚫',
    success: '✅',
  };
  return (
    <div className={`border rounded-lg p-4 ${styles[type]}`}>
      <div className="flex gap-2">
        <span>{icons[type]}</span>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
