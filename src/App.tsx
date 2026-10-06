import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ArchitectureSection from './components/sections/ArchitectureSection';
import DataModelSection from './components/sections/DataModelSection';
import DatabaseSchemaSection from './components/sections/DatabaseSchemaSection';
import AgentArchitectureSection from './components/sections/AgentArchitectureSection';
import ToolsSection from './components/sections/ToolsSection';
import MathEnginesSection from './components/sections/MathEnginesSection';
import EvidenceSystemSection from './components/sections/EvidenceSystemSection';
import SourcesSystemSection from './components/sections/SourcesSystemSection';
import AuditSystemSection from './components/sections/AuditSystemSection';
import ReportStructureSection from './components/sections/ReportStructureSection';
import RisksSection from './components/sections/RisksSection';
import RoadmapSection from './components/sections/RoadmapSection';
import OverviewSection from './components/sections/OverviewSection';

import Phase2Section from './components/sections/Phase2Section';
import Phase3Section from './components/sections/Phase3Section';

const sections = [
  { id: 'overview', label: 'Resumen Ejecutivo', icon: '📋' },
  { id: 'phase2', label: 'FASE 2 — Motores Cuantitativos', icon: '🧮' },
  { id: 'phase3', label: 'FASE 3 — Capa Probatoria', icon: '🔍' },
  { id: 'architecture', label: '1. Arquitectura Completa', icon: '🏗️' },
  { id: 'data-model', label: '2. Modelo de Datos', icon: '📊' },
  { id: 'database', label: '3. Esquema de Base de Datos', icon: '🗄️' },
  { id: 'agent', label: '4. Arquitectura del Agente', icon: '🤖' },
  { id: 'tools', label: '5. Herramientas Necesarias', icon: '🔧' },
  { id: 'engines', label: '6. Motores Matemáticos (Diseño)', icon: '📐' },
  { id: 'evidence', label: '7. Sistema de Evidencias', icon: '🔍' },
  { id: 'sources', label: '8. Sistema de Fuentes', icon: '📚' },
  { id: 'audit', label: '9. Sistema de Auditoría', icon: '🔒' },
  { id: 'report', label: '10. Estructura del Informe', icon: '📄' },
  { id: 'risks', label: '11. Riesgos Técnicos y Jurídicos', icon: '⚠️' },
  { id: 'roadmap', label: '12. Roadmap de Implementación', icon: '🗺️' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'phase2': return <Phase2Section />;
      case 'phase3': return <Phase3Section />;
      case 'architecture': return <ArchitectureSection />;
      case 'data-model': return <DataModelSection />;
      case 'database': return <DatabaseSchemaSection />;
      case 'agent': return <AgentArchitectureSection />;
      case 'tools': return <ToolsSection />;
      case 'engines': return <MathEnginesSection />;
      case 'evidence': return <EvidenceSystemSection />;
      case 'sources': return <SourcesSystemSection />;
      case 'audit': return <AuditSystemSection />;
      case 'report': return <ReportStructureSection />;
      case 'risks': return <RisksSection />;
      case 'roadmap': return <RoadmapSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-16'}`}>
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">PERITO IP</h1>
              <p className="text-xs text-slate-500">Documento de Arquitectura v1.0 — Pendiente de Aprobación</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
              ⏳ EN REVISIÓN
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
              {sections.find(s => s.id === activeSection)?.label}
            </span>
          </div>
        </div>
        <div className="p-8 max-w-6xl mx-auto">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
