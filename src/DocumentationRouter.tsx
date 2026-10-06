/**
 * PERITO IP — Router de Documentación Técnica
 * 
 * Mantiene acceso a la documentación de Fases 1-4.
 */

import React, { useState } from 'react';
import OverviewSection from './components/sections/OverviewSection';
import Phase2Section from './components/sections/Phase2Section';
import Phase3Section from './components/sections/Phase3Section';
import Phase4Section from './components/sections/Phase4Section';
import Phase5Section from './components/sections/Phase5Section';
import Phase6Section from './components/sections/Phase6Section';
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

const sections = [
  { id: 'overview', label: 'Resumen Ejecutivo', icon: '📋' },
  { id: 'phase2', label: 'FASE 2 — Motores Cuantitativos', icon: '🧮' },
  { id: 'phase3', label: 'FASE 3 — Capa Probatoria', icon: '🔍' },
  { id: 'phase4', label: 'FASE 4 — Agente Pericial', icon: '🤖' },
  { id: 'phase5', label: 'FASE 5 — Interfaz Real', icon: '🖥️' },
  { id: 'phase6', label: 'FASE 6 — Biblioteca Real', icon: '📚' },
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

export default function DocumentationRouter() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'phase2': return <Phase2Section />;
      case 'phase3': return <Phase3Section />;
      case 'phase4': return <Phase4Section />;
      case 'phase5': return <Phase5Section />;
      case 'phase6': return <Phase6Section />;
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
    <div className="flex gap-6">
      {/* Sidebar de documentación */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-lg border border-slate-200 p-3 sticky top-6">
          <h3 className="text-sm font-bold text-slate-800 px-2 py-1 mb-2">Documentación Técnica</h3>
          <nav className="space-y-0.5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{section.icon}</span>
                <span className="truncate">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 max-w-4xl">
        {renderSection()}
      </div>
    </div>
  );
}
