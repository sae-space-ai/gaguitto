/**
 * PERITO IP — Fase 5: Agente Pericial Workspace
 * 
 * Interfaz conversacional con el agente pericial.
 */

import React, { useState } from 'react';
import { useApp } from '../context';
import { AgentResponse } from '../../agent';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  response?: AgentResponse;
  timestamp: string;
}

export function AgentWorkspace() {
  const { agent, activeCase, registries } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!activeCase) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: '⚠️ Por favor, selecciona un expediente activo antes de consultar al agente. Ve a la sección de Expedientes y abre uno.',
        timestamp: new Date().toISOString(),
      }]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await agent.processQuery({
        question: input,
        caseId: activeCase.caseId,
      });

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: formatAgentResponse(response),
        response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `Error al procesar la consulta: ${error.message}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = activeCase ? [
    '¿Qué derechos tengo en este expediente?',
    '¿Qué evidencias están pendientes de verificar?',
    '¿Qué contratos existen?',
    '¿Hay conflictos abiertos?',
    '¿Está listo el expediente para valoración?',
    '¿Qué datos faltan para valorar?',
  ] : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Agente Pericial</h2>
        <p className="text-sm text-slate-600 mt-1">
          Consulta al agente sobre derechos, contratos, evidencias, valoraciones y conflictos.
          {activeCase && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              Expediente: {activeCase.caseId}
            </span>
          )}
        </p>
      </div>

      {/* Chat area */}
      <div className="bg-white rounded-lg border border-slate-200 flex flex-col" style={{ height: '600px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-slate-600 text-sm">
                El Agente Pericial puede responder preguntas sobre expedientes, derechos, contratos, evidencias y valoraciones.
              </p>
              {!activeCase && (
                <p className="text-amber-600 text-xs mt-2">
                  Selecciona un expediente para comenzar.
                </p>
              )}
              {activeCase && suggestedQuestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                {msg.response && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] rounded ${
                        msg.response.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-700' :
                        msg.response.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                        msg.response.status === 'REVIEW_REQUIRED' ? 'bg-red-100 text-red-700' :
                        msg.response.status === 'ERROR' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {msg.response.status}
                      </span>
                      {msg.response.caseId && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.response.caseId}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder={activeCase ? "Pregunta al agente pericial..." : "Selecciona un expediente primero..."}
              disabled={!activeCase || loading}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !activeCase}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAgentResponse(response: AgentResponse): string {
  const parts: string[] = [];

  if (response.findings.length > 0) {
    parts.push(response.findings.join('\n'));
  }

  if (response.unverifiedItems.length > 0) {
    parts.push('\n⚠️ Elementos no verificados:');
    response.unverifiedItems.slice(0, 5).forEach(item => {
      parts.push(`  • ${item.text}`);
    });
  }

  if (response.conflicts.length > 0) {
    parts.push('\n🔴 Conflictos:');
    response.conflicts.forEach(c => {
      parts.push(`  • [${c.severity}] ${c.description}`);
    });
  }

  if (response.limitations.length > 0) {
    parts.push('\n📝 Limitaciones:');
    response.limitations.forEach(l => {
      parts.push(`  • ${l}`);
    });
  }

  if (response.nextRequiredActions.length > 0) {
    parts.push('\n➡️ Acciones requeridas:');
    response.nextRequiredActions.slice(0, 3).forEach(a => {
      parts.push(`  • ${a}`);
    });
  }

  if (parts.length === 0) {
    return 'No se encontró información relevante para tu consulta.';
  }

  return parts.join('\n');
}
