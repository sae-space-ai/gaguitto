/**
 * PERITO IP — Fase 5: App Shell
 * 
 * Layout principal con Sidebar, Topbar y Workspace.
 */

import React from 'react';
import { useApp } from '../context';
import { NAVIGATION, PRODUCT_CONFIG } from '../config';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { uiState, setRoute, toggleSidebar, activeCase } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-30 ${
        uiState.sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
              IP
            </div>
            {!uiState.sidebarCollapsed && (
              <div>
                <h2 className="font-bold text-sm">{PRODUCT_CONFIG.name}</h2>
                <p className="text-[10px] text-slate-400">v{PRODUCT_CONFIG.version}</p>
              </div>
            )}
          </div>
        </div>
        <nav className="p-2 overflow-y-auto h-[calc(100%-80px)]">
          {NAVIGATION.map((item) => (
            <button
              key={item.route}
              onClick={() => setRoute(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 mb-0.5 ${
                uiState.currentRoute === item.route
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${item.comingSoon ? 'opacity-50' : ''}`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!uiState.sidebarCollapsed && (
                <span className="text-xs font-medium truncate flex-1">{item.label}</span>
              )}
              {item.badge && !uiState.sidebarCollapsed && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                  {item.badge}
                </span>
              )}
              {item.comingSoon && !uiState.sidebarCollapsed && (
                <span className="text-[9px] text-slate-500">PRÓXIMAMENTE</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${uiState.sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {NAVIGATION.find(n => n.route === uiState.currentRoute)?.label || 'PERITO IP'}
                </h1>
                {activeCase && (
                  <p className="text-xs text-slate-500">
                    Expediente activo: <span className="font-mono font-semibold">{activeCase.caseId}</span> — {activeCase.caseName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                ✓ Sistema Operativo
              </span>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
