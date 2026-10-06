import React from 'react';
import { SectionWrapper, Card, Badge, InfoBox, Table } from '../shared';

export default function Phase4Section() {
  return (
    <SectionWrapper title="FASE 4 — Agente Pericial y Orquestación" subtitle="Capa inteligente: orquestación, investigación verificable, razonamiento controlado y clasificación epistemológica">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">16</div>
            <div className="text-xs text-slate-500 mt-1">Componentes del Agente</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">30+</div>
            <div className="text-xs text-slate-500 mt-1">Herramientas Autorizadas</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">10</div>
            <div className="text-xs text-slate-500 mt-1">Categorías Epistemológicas</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">25+</div>
            <div className="text-xs text-slate-500 mt-1">Tests Adversariales</div>
          </div>
        </Card>
      </div>

      <Card title="🧠 Arquitectura del Agente">
        <div className="space-y-2">
          {[
            { name: 'PERICIAL_AGENT', desc: 'Orquestador principal. Coordina, NO calcula ni inventa.', file: 'agent/pericial-agent.ts' },
            { name: 'CASE_CONTEXT_BUILDER', desc: 'Construye contexto mínimo relevante por pregunta.', file: 'agent/core.ts' },
            { name: 'TOOL_ORCHESTRATOR', desc: 'Whitelist de herramientas + validación de parámetros.', file: 'agent/core.ts' },
            { name: 'CLAIM_VERIFIER', desc: 'Verifica afirmaciones. UNVERIFIED/CONFLICTED/UNKNOWN.', file: 'agent/core.ts' },
            { name: 'CITATION_MANAGER', desc: 'Vincula afirmaciones con documentos/evidencias/fuentes.', file: 'agent/core.ts' },
            { name: 'RESPONSE_VALIDATOR', desc: 'Valida respuesta antes de devolverla.', file: 'agent/core.ts' },
            { name: 'AGENT_AUDIT_LOGGER', desc: 'Registra decisiones operativas (no chain-of-thought).', file: 'agent/core.ts' },
            { name: 'PROMPT_INJECTION_DEFENSE', desc: 'Detecta instrucciones inyectadas en documentos.', file: 'agent/core.ts' },
            { name: 'CONTRACT_ANALYZER', desc: 'Localiza cláusulas. Separa TEXT/EXTRACTION/INTERPRETATION.', file: 'agent/analyzers.ts' },
            { name: 'RIGHTS_ANALYZER', desc: 'Consulta Rights Registry. No atribuye por conocimiento general.', file: 'agent/analyzers.ts' },
            { name: 'CHAIN_OF_TITLE_ANALYZER', desc: 'Recorre cadena sin inventar eslabones.', file: 'agent/analyzers.ts' },
            { name: 'VALUATION_COORDINATOR', desc: 'Planifica valoración. Evidence Gate + Double Counting.', file: 'agent/analyzers.ts' },
            { name: 'QUESTION_GENERATOR', desc: 'Preguntas de alto valor. Evita cuestionarios genéricos.', file: 'agent/analyzers.ts' },
            { name: 'UNCERTAINTY_MANAGER', desc: 'Registra incertidumbre sin fabricar porcentajes.', file: 'agent/analyzers.ts' },
            { name: 'CONFLICT_MANAGER', desc: 'Presenta conflictos. No elige silenciosamente.', file: 'agent/analyzers.ts' },
            { name: 'CALCULATION_EXPLAINER', desc: 'Explica resultados sin modificar cifras.', file: 'agent/analyzers.ts' },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">{item.name}</p>
                <p className="text-[11px] text-slate-600">{item.desc}</p>
                <p className="text-[10px] text-slate-400 font-mono">{item.file}</p>
              </div>
              <span className="text-emerald-600 text-xs flex-shrink-0">✓</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="🏷️ Clasificación Epistemológica">
        <Table
          headers={['Categoría', 'Requisito', 'Puede promover a FACT']}
          rows={[
            ['FACT', 'Evidencia identificable', '—'],
            ['EXTERNAL_DATA', 'Source Registry', 'Con verificación'],
            ['CONTRACTUAL_FACT', 'Contrato + cláusula', 'Con verificación'],
            ['ALLEGATION', 'Afirmación no acreditada', '❌ NUNCA automáticamente'],
            ['INFERENCE', 'Hechos de los que deriva', '❌ NUNCA automáticamente'],
            ['ASSUMPTION', 'Registrada y visible', '❌ NUNCA automáticamente'],
            ['CALCULATION', 'Motor determinista', '✅ (es VERIFIED)'],
            ['OPINION', 'Juicio analítico identificado', '❌ NUNCA'],
            ['UNKNOWN', 'Ausencia de conocimiento', '❌ Requiere evidencia'],
            ['CONFLICTED', 'Evidencia incompatible', '❌ Requiere resolución'],
          ]}
        />
      </Card>

      <Card title="🔧 Herramientas Autorizadas (Whitelist)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">LECTURA (17)</p>
            <div className="space-y-1">
              {['get_case', 'search_case_documents', 'get_document', 'search_evidence', 'get_evidence', 'search_sources', 'get_source', 'search_contracts', 'get_contract', 'get_contract_clause', 'get_rights', 'get_right', 'get_rights_graph', 'get_chain_of_title', 'get_assumptions', 'get_conflicts', 'get_existing_calculations'].map(t => (
                <div key={t} className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{t}</div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">CÁLCULO (15)</p>
            <div className="space-y-1">
              {['run_dcf', 'run_royalty_model', 'run_cost_valuation', 'run_market_comparables', 'run_book_valuation', 'run_audiovisual_valuation', 'run_adaptation_rights', 'run_relief_from_royalty', 'run_scenario', 'run_monte_carlo', 'run_lost_profits', 'run_hypothetical_license', 'run_sensitivity', 'run_double_counting_check', 'run_triangulation'].map(t => (
                <div key={t} className="text-[10px] font-mono text-slate-600 bg-purple-100 px-2 py-0.5 rounded">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="🛡️ Controles de Seguridad">
        <div className="space-y-3">
          <InfoBox type="danger">
            <strong>PROMPT_INJECTION_DEFENSE:</strong> Contenido de documentos/fuentes se trata como DATOS, no como instrucciones. Patrones como "ignora las reglas" o "system:" se detectan y neutralizan.
          </InfoBox>
          <InfoBox type="warning">
            <strong>CONTEXT_ISOLATION:</strong> Información de CASE_A nunca aparece en CASE_B. Tests adversariales lo verifican.
          </InfoBox>
          <InfoBox type="info">
            <strong>MEMORY_BOUNDARY:</strong> El agente no trata conversaciones anteriores como evidencia pericial salvo que se hayan incorporado explícitamente al expediente.
          </InfoBox>
          <InfoBox type="success">
            <strong>ANTI-HALUCINACIÓN:</strong> URLs, fuentes, sentencias, ECLI, comparables, royalties y probabilidades inventadas son rechazados por CitationManager y ResponseValidator.
          </InfoBox>
        </div>
      </Card>

      <Card title="🔄 Flujo del Agente">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-800 space-y-1 font-mono">
            <p>1. Recibir pregunta + caseId</p>
            <p>2. Identificar expediente → buildCaseContext()</p>
            <p>3. Verificar aislamiento → verifyContextIsolation()</p>
            <p>4. Detectar inyección → detectPromptInjection()</p>
            <p>5. Consultar registros → Rights/Contracts/Evidence/Sources</p>
            <p>6. Verificar afirmaciones → verifyClaim()</p>
            <p>7. Invocar motores → ToolOrchestrator → Fase 2</p>
            <p>8. Detectar conflictos → manageConflicts()</p>
            <p>9. Respetar fechas → checkValuationDateCutoff()</p>
            <p>10. Impedir doble cont. → run_double_counting_check</p>
            <p>11. Explicar resultados → explainCalculation()</p>
            <p>12. Reconocer ignorancia → UNKNOWN / NOT_FOUND</p>
            <p>13. Validar respuesta → validateResponse()</p>
            <p>14. Registrar auditoría → AgentAuditLogger</p>
          </div>
        </div>
      </Card>

      <Card title="📁 Archivos Creados">
        <Table
          headers={['Archivo', 'Contenido', 'Líneas aprox.']}
          rows={[
            ['src/agent/types.ts', 'Tipos del agente: epistémicos, claims, tools, respuestas', '~200'],
            ['src/agent/core.ts', 'Context builder, Tool Orchestrator, Claim Verifier, Citation Manager, Audit, Injection Defense', '~450'],
            ['src/agent/analyzers.ts', 'Contract/Rights/Chain analyzers, Valuation readiness, Question gen, Uncertainty, Conflicts', '~350'],
            ['src/agent/pericial-agent.ts', 'PericialAgent principal con routing de queries', '~350'],
            ['src/agent/index.ts', 'Barrel export', '~30'],
            ['src/agent/__tests__/agent.test.ts', 'Tests unitarios y adversariales', '~300'],
          ]}
        />
      </Card>

      <Card title="⚠️ Decisiones que Requieren Aprobación">
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">1. Integración con LLM real</p>
            <p className="text-[11px] text-amber-700">El agente actual es un orquestador determinista. La integración con un LLM real (GPT-4, Claude) para interpretar lenguaje natural requerirá conectar el PericialAgent con un modelo externo. ¿Se implementa ahora o en fase posterior?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">2. RESEARCH_COORDINATOR con búsqueda web real</p>
            <p className="text-[11px] text-amber-700">La herramienta search_external_sources está definida pero no implementada. ¿Se conecta con un servicio de búsqueda o se deja para fase posterior?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">3. UI de conversación</p>
            <p className="text-[11px] text-amber-700">Se ha indicado no construir UI compleja. ¿Se añade un componente mínimo de chat/consulta o se mantiene la UI actual de documentación?</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800">4. REPORT_PREPARATION_LAYER</p>
            <p className="text-[11px] text-amber-700">Pendiente de implementar. ¿Se construye ahora o se reserva para la fase de informes?</p>
          </div>
        </div>
      </Card>

      <Card title="📊 Deuda Técnica">
        <ul className="text-xs text-slate-700 space-y-1">
          <li>• RESEARCH_COORDINATOR: search_external_sources no implementada</li>
          <li>• WHAT_IF_COORDINATOR: run_what_if definido pero no implementado</li>
          <li>• SCENARIO_ORCHESTRATOR: Integración completa con scenarioEngine pendiente</li>
          <li>• DAMAGES_COORDINATOR: Separación explícita de valuation vs damages pendiente</li>
          <li>• DATA_LINEAGE_NAVIGATOR: UI para recorrer linaje pendiente</li>
          <li>• REPORT_PREPARATION_LAYER: No construido (reservado para fase posterior)</li>
          <li>• HUMAN_REVIEW_GATE: Mecanismo de confirmación para acciones destructivas pendiente</li>
          <li>• CONFIDENTIALITY_GUARD: Filtrado de contenido sensible en prompts pendiente</li>
        </ul>
      </Card>

      <InfoBox type="success">
        <strong>Build status:</strong> ✅ Compila sin errores. El agente puede recibir preguntas, identificar expedientes, consultar registros reales, verificar afirmaciones, detectar conflictos y reconocer cuando no sabe algo. Los tests adversariales validan que no inventa datos, no mezcla expedientes y detecta inyecciones de prompts.
      </InfoBox>
    </SectionWrapper>
  );
}
