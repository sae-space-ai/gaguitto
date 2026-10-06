import React from 'react';
import { SectionWrapper, Card, CodeBlock, Badge, InfoBox, Table } from '../shared';

export default function ArchitectureSection() {
  return (
    <SectionWrapper number="Sección 1" title="Arquitectura Completa del Sistema" subtitle="Diseño modular con separación estricta de responsabilidades">
      
      <Card title="🏗️ Principios Arquitectónicos">
        <div className="space-y-3 text-sm text-slate-700">
          <p><strong>Separación de responsabilidades:</strong> El LLM interpreta y redacta. El motor matemático calcula. La base documental conserva evidencia. Nunca se mezclan estas funciones.</p>
          <p><strong>Trazabilidad total:</strong> Cada número mostrado en cualquier informe es rastreable hasta su origen, fórmula, variables y supuestos.</p>
          <p><strong>Inmutabilidad de evidencia:</strong> Los documentos incorporados al expediente no se modifican silenciosamente. Se conserva hash criptográfico.</p>
          <p><strong>Determinismo matemático:</strong> Los cálculos financieros se implementan mediante código determinista con tests automatizados, nunca delegados al LLM.</p>
        </div>
      </Card>

      <Card title="📐 Diagrama de Arquitectura por Capas">
        <CodeBlock language="text">{`
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN (Frontend)                   │
│  React + TypeScript + Tailwind CSS                                   │
│  ├── Dashboard de expedientes                                        │
│  ├── Editor de evidencias y documentos                               │
│  ├── Calculadoras interactivas                                       │
│  ├── Visualizador de escenarios                                      │
│  ├── Generador de informes periciales                                │
│  └── Visor de auditoría                                              │
├─────────────────────────────────────────────────────────────────────┤
│                    CAPA DE APLICACIÓN (API / Agent)                   │
│  Node.js + Express / Fastify                                         │
│  ├── API REST para gestión de expedientes                            │
│  ├── Orquestador de agentes LLM                                      │
│  ├── Router de motores de cálculo                                    │
│  ├── Servicio de generación de informes                              │
│  └── Middleware de auditoría                                         │
├─────────────────────────────────────────────────────────────────────┤
│                    CAPA DE MOTORES (Core Engines)                     │
│  TypeScript puro (código determinista)                               │
│  ├── Motor de Coste (MC)                                             │
│  ├── Motor de Mercado (MM)                                           │
│  ├── Motor de Ingresos/DCF (MI)                                      │
│  ├── Motor de Escenarios (ME)                                        │
│  ├── Motor Monte Carlo (MMC)                                         │
│  ├── Motor Jurídico-Pericial (MJ)                                    │
│  ├── Motor de Triangulación (MT)                                     │
│  ├── Motor de Comparables (MCo)                                      │
│  ├── Motor de Identificación (MId)                                   │
│  └── Motor de Auditoría (MAu)                                        │
├─────────────────────────────────────────────────────────────────────┤
│                    CAPA DE DATOS (Persistence)                        │
│  PostgreSQL + File Storage                                           │
│  ├── Expedientes y metadatos                                         │
│  ├── Evidencias con hash criptográfico                               │
│  ├── Fuentes externas indexadas                                      │
│  ├── Comparables catalogados                                         │
│  ├── Log de auditoría inmutable                                      │
│  └── Almacenamiento de documentos (S3/local)                         │
├─────────────────────────────────────────────────────────────────────┤
│                    CAPA DE INTEGRACIÓN (External)                     │
│  ├── LLM (GPT-4 / Claude / local) — Solo interpretación y redacción │
│  ├── APIs de datos de mercado (cuando existan)                       │
│  ├── Servicios de registro de propiedad intelectual                  │
│  └── APIs de tipos de cambio y datos económicos oficiales            │
└─────────────────────────────────────────────────────────────────────┘
        `}</CodeBlock>
      </Card>

      <Card title="📁 Estructura de Módulos">
        <CodeBlock language="text">{`
/perito-ip/
├── /cases/                    # Gestión de expedientes periciales
│   ├── create.ts              # Creación de expediente con ID único
│   ├── update.ts              # Actualización con control de versiones
│   ├── query.ts               # Consultas y filtros
│   └── export.ts              # Exportación de expedientes
│
├── /evidence/                 # Sistema de evidencias
│   ├── ingest.ts              # Incorporación de documentos
│   ├── hash.ts                # Generación de hash criptográfico
│   ├── classify.ts            # Clasificación de evidencia
│   ├── verify.ts              # Verificación de integridad
│   └── matrix.ts              # Matriz de evidencias
│
├── /assets/                   # Identificación de activos
│   ├── identify.ts            # Motor 1: Identificación del activo
│   ├── classify.ts            # Clasificación tipológica
│   ├── rights-map.ts          # Mapeo de derechos asociados
│   └── scope.ts               # Delimitación del alcance
│
├── /rights/                   # Gestión de derechos
│   ├── editorial.ts           # Derechos editoriales
│   ├── audiovisual.ts         # Derechos audiovisuales
│   ├── territorial.ts         # Derechos territoriales
│   ├── derivative.ts          # Derechos derivados
│   └── licensing.ts           # Licencias y cesiones
│
├── /comparables/              # Motor 4: Comparables de mercado
│   ├── search.ts              # Búsqueda de comparables
│   ├── score.ts               # Puntuación de comparabilidad
│   ├── adjust.ts              # Ajustes por diferencias
│   └── database.ts            # Base de datos de comparables
│
├── /market_research/          # Investigación de mercado
│   ├── queries.ts             # Consultas a fuentes
│   ├── verify.ts              # Verificación de datos
│   ├── store.ts               # Almacenamiento con metadatos
│   └── sources.ts             # Registro de fuentes
│
├── /valuation_cost/           # Motor 3: Valoración por coste
│   ├── historical.ts          # Coste histórico acreditado
│   ├── reproduction.ts        # Coste de reproducción
│   ├── replacement.ts         # Coste de reemplazo
│   └── components.ts          # Desglose de componentes de coste
│
├── /valuation_market/         # Motor 4: Valoración por mercado
│   ├── comparables.ts         # Análisis de comparables
│   ├── adjustments.ts         # Ajustes comparativos
│   └── range.ts               # Rango de valoración
│
├── /valuation_income/         # Motor 5: Ingresos / DCF
│   ├── projection.ts          # Proyección de ingresos
│   ├── costs.ts               # Proyección de costes
│   ├── discount.ts            # Cálculo de tasa de descuento
│   ├── npv.ts                 # Valor presente neto
│   └── sensitivity.ts         # Análisis de sensibilidad
│
├── /scenarios/                # Motor 6: Escenarios
│   ├── conservative.ts        # Escenario conservador
│   ├── base.ts                # Escenario base
│   ├── expansive.ts           # Escenario expansivo
│   └── compare.ts             # Comparación de escenarios
│
├── /monte_carlo/              # Motor 6: Simulación Monte Carlo
│   ├── variables.ts           # Definición de variables probabilísticas
│   ├── distributions.ts       # Distribuciones de probabilidad
│   ├── simulate.ts            # Motor de simulación
│   ├── analyze.ts             # Análisis de resultados
│   └── percentiles.ts         # Cálculo de percentiles
│
├── /legal_damage/             # Motor 7: Valoración jurídico-pericial
│   ├── loss.ts                # Pérdida económica
│   ├── lost-profits.ts        # Lucro cesante
│   ├── hypothetical.ts        # Regalía hipotética
│   ├── scope.ts               # Alcance temporal y territorial
│   └── jurisdiction.ts        # Marco jurídico aplicable
│
├── /calculations/             # Motor 8: Triangulación
│   ├── triangulate.ts         # Triangulación de métodos
│   ├── weighting.ts           # Ponderación de métodos
│   ├── range.ts               # Rango defendible
│   └── confidence.ts          # Nivel de confianza
│
├── /sources/                  # Registro de fuentes
│   ├── registry.ts            # Registro formal
│   ├── verify.ts              # Verificación
│   ├── classify.ts            # Clasificación por fiabilidad
│   └── cite.ts                # Sistema de citación
│
├── /audit/                    # Motor 9: Auditoría
│   ├── log.ts                 # Log inmutable
│   ├── trace.ts               # Trazabilidad de cálculos
│   ├── verify.ts              # Verificación de integridad
│   └── report.ts              # Informe de auditoría
│
├── /reports/                  # Motor 10: Informes periciales
│   ├── generator.ts           # Generador de informes
│   ├── templates/             # Plantillas por jurisdicción
│   ├── sections/              # Secciones del informe
│   ├── export-pdf.ts          # Exportación PDF
│   └── export-docx.ts         # Exportación DOCX
│
└── /shared/                   # Utilidades compartidas
    ├── types.ts               # Tipos TypeScript
    ├── constants.ts           # Constantes del sistema
    ├── validators.ts          # Validadores
    ├── formatters.ts          # Formateadores
    └── crypto.ts              # Funciones criptográficas
        `}</CodeBlock>
      </Card>

      <Card title="🔄 Flujos de Datos Principales">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-1">FLUJO 1: Creación de Expediente</p>
            <p className="text-xs text-blue-700">Usuario → Identificación del activo → Due diligence documental → Matriz de evidencias → Expediente con ID único</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-800 mb-1">FLUJO 2: Valoración por Coste</p>
            <p className="text-xs text-indigo-700">Evidencias de coste → Desglose por componentes → Coste histórico / reproducción / reemplazo → Resultado documentado</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-800 mb-1">FLUJO 3: Valoración por Mercado</p>
            <p className="text-xs text-purple-700">Búsqueda de comparables → Puntuación de comparabilidad → Ajustes → Rango de mercado</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-800 mb-1">FLUJO 4: Valoración por Ingresos</p>
            <p className="text-xs text-emerald-700">Proyección ingresos → Proyección costes → Flujo neto → Tasa descuento → NPV → Sensibilidad</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs font-semibold text-amber-800 mb-1">FLUJO 5: Triangulación Final</p>
            <p className="text-xs text-amber-700">Resultado coste + Resultado mercado + Resultado ingresos + Escenarios → Triangulación → Rango defendible → Informe</p>
          </div>
        </div>
      </Card>

      <Card title="🔐 Requisitos de Seguridad e Integridad">
        <Table
          headers={['Requisito', 'Implementación', 'Prioridad']}
          rows={[
            ['Hash criptográfico de documentos', 'SHA-256 en ingestión', 'Crítica'],
            ['Log de auditoría inmutable', 'Append-only con hash encadenado', 'Crítica'],
            ['Control de versiones', 'Versionado de expedientes y evidencias', 'Alta'],
            ['Separación LLM/cálculo', 'Motores deterministas independientes', 'Crítica'],
            ['Trazabilidad de cada cifra', 'Metadata de origen en cada cálculo', 'Crítica'],
            ['No modificación silenciosa', 'Control de integridad por hash', 'Crítica'],
            ['Autenticación de usuarios', 'JWT + roles (perito, revisor, cliente)', 'Alta'],
            ['Cifrado en reposo', 'AES-256 para documentos sensibles', 'Media'],
          ]}
        />
      </Card>

      <InfoBox type="info">
        <strong>Nota de diseño:</strong> La arquitectura está diseñada para que cada módulo sea independiente y testeable. 
        Los motores matemáticos no dependen del LLM. El LLM no realiza cálculos financieros. 
        La base documental es la fuente de verdad para evidencias.
      </InfoBox>
    </SectionWrapper>
  );
}
