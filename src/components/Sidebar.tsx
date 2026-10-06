import React from 'react';

interface Section {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  sections: Section[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({ sections, activeSection, setActiveSection, isOpen }: SidebarProps) {
  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-20 ${isOpen ? 'w-72' : 'w-16'}`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
            IP
          </div>
          {isOpen && (
            <div>
              <h2 className="font-bold text-sm">PERITO IP</h2>
              <p className="text-[10px] text-slate-400">Sistema Pericial Trazable</p>
            </div>
          )}
        </div>
      </div>
      <nav className="p-2 overflow-y-auto h-[calc(100%-80px)]">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 mb-0.5 ${
              activeSection === section.id
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg flex-shrink-0">{section.icon}</span>
            {isOpen && (
              <span className="text-xs font-medium truncate">{section.label}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
