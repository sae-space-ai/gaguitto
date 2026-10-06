import React from 'react';
import { SectionWrapper, Card, CodeBlock, Badge, Table } from '../shared';

export default function DataModelSection() {
  return (
    <SectionWrapper number="Sección 2" title="Modelo de Datos" subtitle="Estructura de entidades y relaciones del sistema PERITO IP">
      
      <Card title="📋 Entidades Principales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">Case (Expediente)</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• id: UUID (identificador único)</li>
              <li>• title: string</li>
              <li>• type: AssetType (enum)</li>
              <li>• status: CaseStatus (enum)</li>
              <li>• authors: Author[]</li>
              <li>• rightsHolders: RightsHolder[]</li>
              <li>• creationDate: Date</li>
              <li>• valuationDate: Date</li>
              <li>• jurisdiction: string</li>
              <li>• territories: string[]</li>
              <li>• languages: string[]</li>
              <li>• versions: Version[]</li>
              <li>• developmentStage: string</li>
              <li>• createdAt: Date</li>
              <li>• updatedAt: Date</li>
            </ul>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 mb-2">Evidence (Evidencia)</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>• id: UUID</li>
              <li>• caseId: UUID (FK → Case)</li>
              <li>• source: string (fuente)</li>
              <li>• document: string (referencia)</li>
              <li>• date: Date</li>
              <li>• fact: string (hecho que acredita)</li>
              <li>• reliability: ReliabilityLevel (enum)</li>
              <li>• limitations: string</li>
              <li>• hash: string (SHA-256)</li>
              <li>• relationToValuation: string</li>
              <li>• isUserProvided: boolean</li>
              <li>• verifiedAt: Date | null</li>
              <li>• storagePath: string</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="text-sm font-bold text-purple-800 mb-2">Comparable</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• id: UUID</li>
              <li>• caseId: UUID (FK → Case)</li>
              <li>• work: string (obra comparable)</li>
              <li>• date: Date</li>
              <li>• market: string</li>
              <li>• territory: string</li>
              <li>• genre: string</li>
              <li>• format: string</li>
              <li>• developmentPhase: string</li>
              <li>• audience: number | null</li>
              <li>• knownAmount: number | null</li>
              <li>• operationType: string</li>
              <li>• rightsIncluded: string[]</li>
              <li>• source: Source (FK)</li>
              <li>• consultationDate: Date</li>
              <li>• comparabilityScore: number (0-100)</li>
              <li>• differences: string</li>
            </ul>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-800 mb-2">Valuation (Valoración)</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• id: UUID</li>
              <li>• caseId: UUID (FK → Case)</li>
              <li>• method: ValuationMethod (enum)</li>
              <li>• result: number | null</li>
              <li>• currency: string</li>
              <li>• confidenceLevel: number</li>
              <li>• inputs: JSON (parámetros)</li>
              <li>• formula: string</li>
              <li>• assumptions: Assumption[]</li>
              <li>• evidenceRefs: UUID[]</li>
              <li>• sourceRefs: UUID[]</li>
              <li>• calculatedAt: Date</li>
              <li>• status: ValuationStatus</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔗 Relaciones entre Entidades">
        <CodeBlock language="typescript">{`
// Relaciones principales
Case 1──N Evidence        (Un expediente tiene N evidencias)
Case 1──N Comparable      (Un expediente tiene N comparables)
Case 1──N Valuation       (Un expediente tiene N valoraciones)
Case 1──N CostComponent   (Un expediente tiene N componentes de coste)
Case 1──N IncomeStream    (Un expediente tiene N flujos de ingresos)
Case 1──N Scenario        (Un expediente tiene N escenarios)
Case 1──N AuditEntry      (Un expediente tiene N entradas de auditoría)
Case N──N Source          (Varios expedientes pueden compartir fuentes)
Case N──N Right           (Un expediente tiene N derechos asociados)

// Entidades auxiliares
Author N──N Case          (Autores pueden aparecer en varios expedientes)
RightsHolder N──N Case    (Titulares pueden aparecer en varios expedientes)
Source 1──N Comparable    (Una fuente puede respaldar N comparables)
Source 1──N Evidence      (Una fuente puede respaldar N evidencias)
Valuation 1──N Assumption (Una valoración tiene N supuestos)
Scenario 1──N Variable    (Un escenario tiene N variables)
        `}</CodeBlock>
      </Card>

      <Card title="📝 Enums y Tipos">
        <CodeBlock language="typescript">{`
type AssetType =
  | 'original_work'
  | 'manuscript'
  | 'published_book'
  | 'screenplay'
  | 'treatment'
  | 'format'
  | 'feature_film'
  | 'short_film'
  | 'documentary'
  | 'series'
  | 'episode'
  | 'character'
  | 'narrative_universe'
  | 'translation'
  | 'adaptation'
  | 'remake'
  | 'sequel'
  | 'prequel'
  | 'editorial_rights'
  | 'audiovisual_rights'
  | 'territorial_rights'
  | 'merchandising'
  | 'derivative_rights';

type CaseStatus =
  | 'draft'
  | 'evidence_gathering'
  | 'analysis'
  | 'valuation_in_progress'
  | 'review'
  | 'finalized'
  | 'archived';

type ReliabilityLevel =
  | 'verified_official'    // Fuente oficial verificada
  | 'documented'           // Documentación disponible
  | 'user_provided'        // Información del usuario
  | 'external_source'      // Fuente externa no verificada
  | 'estimate'             // Estimación
  | 'hypothesis'           // Hipótesis
  | 'unverified';          // No verificado

type ValuationMethod =
  | 'cost_historical'
  | 'cost_reproduction'
  | 'cost_replacement'
  | 'market_comparables'
  | 'income_dcf'
  | 'income_royalty'
  | 'legal_damage'
  | 'triangulation';

type RightType =
  | 'reproduction'
  | 'distribution'
  | 'public_communication'
  | 'transformation'
  | 'translation'
  | 'adaptation'
  | 'merchandising'
  | 'territorial_exclusive'
  | 'territorial_non_exclusive'
  | 'temporal_limited'
  | 'digital'
  | 'broadcast'
  | 'svod'
  | 'avod'
  | 'tvod';

interface Assumption {
  id: string;
  description: string;
  type: 'fact' | 'external_data' | 'hypothesis' | 'estimate' | 'calculation';
  source?: string;
  confidence: number; // 0-100
  evidenceRefs?: string[];
}

interface Version {
  id: string;
  number: number;
  date: Date;
  changes: string;
  author: string;
  hash: string;
}
        `}</CodeBlock>
      </Card>

      <Card title="📊 Modelo de Flujo de Ingresos">
        <CodeBlock language="typescript">{`
interface IncomeStream {
  id: string;
  caseId: string;
  category: IncomeCategory;
  description: string;
  territory: string;
  currency: string;
  projections: YearlyProjection[];
  basis: 'documented' | 'comparable' | 'estimate' | 'hypothesis';
  sourceId?: string;
  evidenceIds?: string[];
}

type IncomeCategory =
  | 'sales'
  | 'licenses'
  | 'royalties'
  | 'editorial_rights'
  | 'translations'
  | 'international_exploitation'
  | 'audiovisual_rights'
  | 'platforms'
  | 'television'
  | 'distribution'
  | 'adaptations'
  | 'derivative_rights';

interface YearlyProjection {
  year: number;
  amount: number;
  growthRate?: number;
  basis: string; // Justificación de la cifra
  confidence: number; // 0-100
}

interface CostProjection {
  id: string;
  caseId: string;
  category: CostCategory;
  description: string;
  projections: YearlyProjection[];
  basis: 'documented' | 'comparable' | 'estimate' | 'hypothesis';
  evidenceIds?: string[];
}

type CostCategory =
  | 'production'
  | 'marketing'
  | 'distribution'
  | 'commissions'
  | 'administration'
  | 'legal'
  | 'additional_exploitation';
        `}</CodeBlock>
      </Card>

      <Card title="🎲 Modelo de Escenarios y Monte Carlo">
        <CodeBlock language="typescript">{`
interface Scenario {
  id: string;
  caseId: string;
  type: 'conservative' | 'base' | 'expansive';
  description: string;
  variables: ScenarioVariable[];
  result: number | null;
  confidenceLevel: number;
  assumptions: Assumption[];
}

interface ScenarioVariable {
  name: string;
  value: number;
  distribution?: ProbabilityDistribution;
  source: string;
  justification: string;
}

interface ProbabilityDistribution {
  type: 'normal' | 'uniform' | 'triangular' | 'lognormal' | 'beta';
  params: Record<string, number>;
  // Normal: { mean, stdDev }
  // Uniform: { min, max }
  // Triangular: { min, mode, max }
  // Lognormal: { mean, stdDev }
  // Beta: { alpha, beta, min, max }
}

interface MonteCarloResult {
  iterations: number;
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number; // mediana
    p75: number;
    p90: number;
    p95: number;
  };
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  distribution: number[]; // histograma
  convergenceReached: boolean;
}
        `}</CodeBlock>
      </Card>
    </SectionWrapper>
  );
}
