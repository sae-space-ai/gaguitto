import React from 'react';
import { SectionWrapper, Card, CodeBlock, Badge, InfoBox, Table } from '../shared';

export default function AgentArchitectureSection() {
  return (
    <SectionWrapper number="Sección 4" title="Arquitectura del Agente" subtitle="Diseño del agente LLM con separación estricta de funciones">
      
      <Card title="🤖 Principio Fundamental del Agente">
        <InfoBox type="danger">
          <strong>El LLM NUNCA calcula.</strong> El LLM interpreta, clasifica, investiga y redacta. 
          Todos los cálculos financieros los ejecuta código determinista con tests automatizados. 
          El LLM puede proponer hipótesis, pero las marca explícitamente como tales.
        </InfoBox>
      </Card>

      <Card title="🧠 Componentes del Agente">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">📥 Agente de Ingestión</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Recibe datos del usuario</li>
              <li>• Clasifica tipo de activo</li>
              <li>• Identifica campos faltantes</li>
              <li>• Solicita documentación</li>
              <li>• Genera hash de documentos</li>
              <li>• NO calcula valores</li>
            </ul>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 mb-2">🔍 Agente de Investigación</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>• Busca comparables de mercado</li>
              <li>• Consulta fuentes externas</li>
              <li>• Verifica datos encontrados</li>
              <li>• Registra URL, fecha, entidad</li>
              <li>• Marca datos NO VERIFICADOS</li>
              <li>• NO inventa comparables</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="text-sm font-bold text-purple-800 mb-2">📊 Agente de Análisis</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Interpreta evidencias</li>
              <li>• Propone metodologías aplicables</li>
              <li>• Identifica hipótesis necesarias</li>
              <li>• Define variables para motores</li>
              <li>• Llama a motores de cálculo</li>
              <li>• NO realiza cálculos directamente</li>
            </ul>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-800 mb-2">📝 Agente de Redacción</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Redacta informe pericial</li>
              <li>• Diferencia hechos/hipótesis</li>
              <li>• Explica metodología</li>
              <li>• Documenta limitaciones</li>
              <li>• Genera conclusiones trazables</li>
              <li>• NO añade cifras no calculadas</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔄 Flujo del Agente por Fase">
        <CodeBlock language="text">{`
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 1: RECEPCIÓN Y CLASIFICACIÓN                                   │
│ ─────────────────────────────────                                    │
│ Agente Ingestión:                                                    │
│   1. Recibe información del usuario                                  │
│   2. Clasifica tipo de activo (Motor 1)                              │
│   3. Identifica derechos asociados                                   │
│   4. Detecta datos faltantes → solicita al usuario                   │
│   5. Crea expediente con ID único                                    │
│   6. Genera hash de documentos recibidos                             │
│                                                                      │
│ SALIDA: Expediente inicial + lista de datos pendientes               │
├─────────────────────────────────────────────────────────────────────┤
│ FASE 2: DUE DILIGENCE DOCUMENTAL                                     │
│ ─────────────────────────────────                                    │
│ Agente Ingestión + Agente Investigación:                             │
│   1. Construye matriz de evidencias (Motor 2)                        │
│   2. Clasifica cada evidencia por fiabilidad                         │
│   3. Distingue info del usuario vs. evidencia independiente          │
│   4. Busca fuentes externas complementarias                          │
│   5. Registra fuentes con metadatos completos                        │
│   6. Identifica gaps documentales                                    │
│                                                                      │
│ SALIDA: Matriz de evidencias completa + gaps identificados           │
├─────────────────────────────────────────────────────────────────────┤
│ FASE 3: ANÁLISIS Y VALORACIÓN                                        │
│ ─────────────────────────────                                        │
│ Agente Análisis → Motores de cálculo:                                │
│   1. Ejecuta Motor de Coste con datos documentados                   │
│   2. Ejecuta Motor de Mercado con comparables verificados            │
│   3. Ejecuta Motor de Ingresos con proyecciones justificadas         │
│   4. Genera escenarios (conservador/base/expansivo)                  │
│   5. Si procede, ejecuta Monte Carlo                                 │
│   6. Si procede, ejecuta Motor Jurídico-Pericial                     │
│                                                                      │
│ SALIDA: Resultados de cada motor con trazabilidad completa           │
├─────────────────────────────────────────────────────────────────────┤
│ FASE 4: TRIANGULACIÓN Y CONCLUSIÓN                                   │
│ ─────────────────────────────────────                                │
│ Agente Análisis → Motor de Triangulación:                            │
│   1. Compara resultados de todos los métodos                         │
│   2. Pondera según calidad de evidencia disponible                   │
│   3. Genera rango defendible                                         │
│   4. Identifica factores modificadores                               │
│   5. Asigna nivel de confianza                                       │
│                                                                      │
│ SALIDA: Triangulación con rango y nivel de confianza                 │
├─────────────────────────────────────────────────────────────────────┤
│ FASE 5: INFORME PERICIAL                                             │
│ ─────────────────────────                                            │
│ Agente Redacción:                                                    │
│   1. Genera informe con las 22 secciones                             │
│   2. Diferencia visualmente hechos/hipótesis/cálculos                │
│   3. Incluye memoria matemática completa                             │
│   4. Documenta todas las limitaciones                                │
│   5. Adjunta tabla de fuentes y evidencias                           │
│   6. Exporta en formato profesional                                  │
│                                                                      │
│ SALIDA: Informe pericial exportable + log de auditoría               │
└─────────────────────────────────────────────────────────────────────┘
        `}</CodeBlock>
      </Card>

      <Card title="🛡️ Protocolos Anti-Alucinación del Agente">
        <Table
          headers={['Situación', 'Acción del Agente', 'Resultado']}
          rows={[
            ['Faltan datos necesarios', 'Solicita al usuario o marca como "DATOS INSUFICIENTES"', 'No se calcula sin datos'],
            ['No hay comparables fiables', 'Indica explícitamente "NO EXISTEN COMPARABLES SUFICIENTEMENTE FIABLES"', 'No se fuerza valoración por mercado'],
            ['Dato no verificable', 'Marca como "NO VERIFICADO"', 'No se presenta como hecho'],
            ['El LLM "recuerda" una cifra', 'La descarta si no tiene fuente documentada', 'Solo datos con trazabilidad'],
            ['Usuario pide cifra rápida', 'Explica que necesita seguir metodología', 'No se dan cifras sin método'],
            ['Información contradictoria', 'Presenta ambas fuentes con sus limitaciones', 'No se oculta incertidumbre'],
          ]}
        />
      </Card>

      <Card title="📡 Comunicación Agente ↔ Motores">
        <CodeBlock language="typescript">{`
// El agente se comunica con los motores mediante interfaces estrictas
// NUNCA pasa instrucciones ambiguas ni solicita "estimaciones"

interface EngineRequest {
  caseId: string;
  method: ValuationMethod;
  parameters: Record<string, unknown>;
  evidenceRefs: string[];     // Solo evidencias verificadas
  assumptions: Assumption[];  // Explícitamente marcadas
}

interface EngineResponse {
  result: number | null;       // null si no se puede calcular
  currency: string;
  formula: string;             // Fórmula aplicada
  variables: Record<string, {
    value: number;
    source: 'documented' | 'comparable' | 'estimate' | 'hypothesis';
    evidenceRef?: string;
    justification: string;
  }>;
  confidenceLevel: number;     // 0-100
  limitations: string[];
  calculatedAt: Date;
}

// El agente NUNCA modifica el resultado del motor
// Solo lo interpreta y redacta la explicación
        `}</CodeBlock>
      </Card>

      <InfoBox type="info">
        <strong>Decisión de diseño:</strong> El agente está implementado como un orquestador de agentes especializados 
        (patrón multi-agente). Cada sub-agente tiene un rol definido y limitado. Esto reduce el riesgo de que 
        el LLM exceda sus competencias y realice funciones que corresponden a los motores deterministas.
      </InfoBox>
    </SectionWrapper>
  );
}
