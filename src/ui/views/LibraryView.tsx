/**
 * PERITO IP — Fase 6: Biblioteca - Vista Principal
 * 
 * Muestra el catálogo maestro de obras con filtros y búsqueda.
 * Integra datos de Amazon, Audius y otras fuentes.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { WorkType, WorkVerificationStatus } from '../../catalog/types';

export function LibraryView() {
  const { catalog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<WorkType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<WorkVerificationStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  if (!catalog) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  const allWorks = catalog.workCatalog.getAllWorks();

  const filteredWorks = useMemo(() => {
    return allWorks.filter((work: any) => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = work.canonicalTitle.toLowerCase().includes(searchLower);
        const matchesCreator = work.creatorIds.some((id: string) => {
          const creator = catalog.identityRegistry.getIdentity(id);
          return creator?.primaryAlias.toLowerCase().includes(searchLower);
        });
        if (!matchesTitle && !matchesCreator) return false;
      }

      // Filtro de tipo
      if (typeFilter !== 'ALL' && work.workType !== typeFilter) return false;

      // Filtro de estado
      if (statusFilter !== 'ALL' && work.verificationStatus !== statusFilter) return false;

      return true;
    });
  }, [allWorks, searchTerm, typeFilter, statusFilter, catalog]);

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    allWorks.forEach(work => {
      byType[work.workType] = (byType[work.workType] || 0) + 1;
      byStatus[work.verificationStatus] = (byStatus[work.verificationStatus] || 0) + 1;
    });

    return { byType, byStatus };
  }, [allWorks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Biblioteca</h1>
          <p className="text-sm text-slate-600 mt-1">
            Catálogo maestro de obras literarias, musicales y audiovisuales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cuadrícula
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tabla
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total de Obras"
          value={allWorks.length}
          color="blue"
        />
        <StatCard
          label="Libros"
          value={stats.byType['BOOK'] || 0}
          color="indigo"
        />
        <StatCard
          label="Pistas Musicales"
          value={(stats.byType['MUSICAL_COMPOSITION'] || 0) + (stats.byType['SOUND_RECORDING'] || 0)}
          color="purple"
        />
        <StatCard
          label="Verificadas"
          value={stats.byStatus['VERIFIED'] || 0}
          color="emerald"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Título, autor..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Obra
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="BOOK">Libro</option>
              <option value="NOVEL">Novela</option>
              <option value="ESSAY">Ensayo</option>
              <option value="LEGAL_WORK">Obra Legal</option>
              <option value="MUSICAL_COMPOSITION">Composición Musical</option>
              <option value="SOUND_RECORDING">Grabación</option>
              <option value="PODCAST">Podcast</option>
              <option value="AUDIOBOOK">Audiolibro</option>
              <option value="AUDIOVISUAL_WORK">Audiovisual</option>
            </select>
          </div>

          {/* Filtro de estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos los estados</option>
              <option value="VERIFIED">Verificada</option>
              <option value="CANDIDATE">Candidata</option>
              <option value="AMBIGUOUS">Ambigua</option>
              <option value="QUARANTINE">Cuarentena</option>
              <option value="REVIEW_REQUIRED">Requiere Revisión</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {filteredWorks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No se encontraron obras con los filtros aplicados.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorks.map(work => (
            <WorkCard key={work.workId} work={work} catalog={catalog} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Ediciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWorks.map(work => {
                const creator = catalog.identityRegistry.getIdentity(work.creatorIds[0]);
                return (
                  <tr key={work.workId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">{work.canonicalTitle}</div>
                      <div className="text-xs text-slate-500 mt-1">{work.workId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                        {work.workType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {creator?.primaryAlias || 'Desconocido'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={work.verificationStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {work.editions.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info de fuentes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Fuentes del Catálogo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Amazon</p>
            <p className="text-xs mt-1">
              Estado: {catalog.amazonConnector.getConnectorStatus().status} |
              Descubiertos: {catalog.amazonConnector.getConnectorStatus().itemsDiscovered}
            </p>
          </div>
          <div>
            <p className="font-medium">Audius</p>
            <p className="text-xs mt-1">
              Estado: {catalog.audiusConnector.getConnectorStatus().status} |
              Descubiertos: {catalog.audiusConnector.getConnectorStatus().itemsDiscovered}
            </p>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          ⚠️ Los datos mostrados son MOCK para demostración. En producción, los conectores obtendrán datos reales respetando ToS y rate limits.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function WorkCard({ work, catalog }: { work: any; catalog: any }) {
  const creator = catalog.identityRegistry.getIdentity(work.creatorIds[0]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1">
          {work.canonicalTitle}
        </h3>
        <StatusBadge status={work.verificationStatus} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Tipo:</span>
          <span className="font-medium text-slate-700">{work.workType}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Autor:</span>
          <span className="font-medium text-slate-700">
            {creator?.primaryAlias || 'Desconocido'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Ediciones:</span>
          <span className="font-medium text-slate-700">{work.editions.length}</span>
        </div>

        {work.editions.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Formatos disponibles:</p>
            <div className="flex flex-wrap gap-1">
              {work.editions.slice(0, 3).map((ed: any) => (
                <span
                  key={ed.editionId}
                  className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded"
                >
                  {ed.format}
                </span>
              ))}
              {work.editions.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-slate-500">
                  +{work.editions.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Ver Detalles →
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: WorkVerificationStatus }) {
  const statusConfig: Record<WorkVerificationStatus, { label: string; className: string }> = {
    VERIFIED: { label: 'Verificada', className: 'bg-emerald-100 text-emerald-700' },
    CANDIDATE: { label: 'Candidata', className: 'bg-blue-100 text-blue-700' },
    AMBIGUOUS: { label: 'Ambigua', className: 'bg-amber-100 text-amber-700' },
    QUARANTINE: { label: 'Cuarentena', className: 'bg-red-100 text-red-700' },
    REVIEW_REQUIRED: { label: 'Requiere Revisión', className: 'bg-orange-100 text-orange-700' },
    EXCLUDED: { label: 'Excluida', className: 'bg-slate-100 text-slate-700' },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${config.className}`}>
      {config.label}
    </span>
  );
}
