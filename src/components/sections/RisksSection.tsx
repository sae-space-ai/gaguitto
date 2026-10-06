import React from 'react';
import { SectionWrapper, Card, Table, InfoBox, Badge } from '../shared';

export default function RisksSection() {
  return (
    <SectionWrapper number="Sección 11" title="Riesgos Técnicos y Jurídicos" subtitle="Análisis de riesgos del sistema y mitigaciones">
      
      <Card title="⚠️ Riesgos Técnicos">
        <Table
          headers={['Riesgo', 'Probabilidad', 'Impacto', 'Mitigación']}
          rows={[
            ['LLM alucina datos de mercado', 'Media', 'Crítico', 'Separación estricta LLM/motores. Solo motores calculan. Verificación obligatoria de fuentes.'],
            ['Error en motor de cálculo', 'Baja', 'Crítico', 'Tests automatizados exhaustivos. Uso de decimal.js. Verificación cruzada de resultados.'],
            ['Pérdida de integridad de evidencias', 'Baja', 'Crítico', 'Hash SHA-256 en ingestión. Verificación periódica. Almacenamiento redundante.'],
            ['Manipulación del log de auditoría', 'Muy baja', 'Crítico', 'Hash encadenado. Append-only. Acceso restringido. Verificación de cadena.'],
            ['Dependencia de API de LLM externa', 'Media', 'Alto', 'Posibilidad de usar modelo local. Fallback a modo manual. No dependencia para cálculos.'],
            ['Precisión insuficiente en punto flotante', 'Baja', 'Alto', 'decimal.js en todos los cálculos. Nunca float nativo para valores monetarios.'],
            ['Volumen de datos excesivo', 'Media', 'Medio', 'Paginación. Indexación adecuada. Cache de consultas frecuentes.'],
            ['Incompatibilidad entre versiones', 'Baja', 'Medio', 'Migraciones versionadas. Backward compatibility. Tests de migración.'],
          ]}
        />
      </Card>

      <Card title="⚖️ Riesgos Jurídicos">
        <Table
          headers={['Riesgo', 'Probabilidad', 'Impacto', 'Mitigación']}
          rows={[
            ['Informe impugnado por falta de metodología', 'Media', 'Crítico', 'Metodología documentada paso a paso. Cada cifra trazable. Estándares internacionales de valoración.'],
            ['Uso de comparables no verificables', 'Media', 'Alto', 'Solo comparables con fuente registrada. Puntuación de comparabilidad. Diferencias explicadas.'],
            ['Confusión entre hipótesis y hechos', 'Media', 'Alto', 'Diferenciación visual estricta en el informe. Etiquetas claras. Nunca se mezclan.'],
            ['Valoración en jurisdicción desconocida', 'Media', 'Alto', 'Selección explícita de jurisdicción. Marco legal aplicable documentado. Limitaciones declaradas.'],
            ['El informe se interpreta como certeza', 'Alta', 'Alto', 'Rango defendible en vez de cifra única. Nivel de confianza explícito. Limitaciones destacadas.'],
            ['Responsabilidad por valoración errónea', 'Media', 'Crítico', 'Disclaimer profesional. Limitaciones claras. Seguro de responsabilidad. Revisión por segundo perito.'],
            ['Conflicto entre valoración comercial y legal', 'Media', 'Alto', 'Motores separados. Motor 7 independiente del comercial. No se asume infracción automáticamente.'],
            ['Datos de mercado desactualizados', 'Alta', 'Medio', 'Fecha de consulta obligatoria. Alertas de antigüedad. Verificación de vigencia.'],
          ]}
        />
      </Card>

      <Card title="🛡️ Estrategias de Mitigación Transversales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-800 mb-2">✅ Principio de Precaución</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Ante la duda, NO calcular</li>
              <li>• Ante datos insuficientes, DECLARARLO</li>
              <li>• Ante falta de comparables, INDICARLO</li>
              <li>• Preferir un rango amplio a una cifra falsa</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">🔄 Doble Verificación</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Los cálculos tienen tests automatizados</li>
              <li>• Las evidencias se verifican por hash</li>
              <li>• La cadena de auditoría se verifica periódicamente</li>
              <li>• Posibilidad de revisión por segundo perito</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h4 className="text-sm font-bold text-purple-800 mb-2">📝 Transparencia Radical</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Cada cifra muestra su origen al hacer clic</li>
              <li>• Las limitaciones se destacan, no se ocultan</li>
              <li>• Los supuestos se listan explícitamente</li>
              <li>• El nivel de confianza cuantifica la incertidumbre</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h4 className="text-sm font-bold text-amber-800 mb-2">🔒 Separación de Funciones</h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• LLM: solo interpreta y redacta</li>
              <li>• Motores: solo calculan (determinista)</li>
              <li>• BD: solo almacena (inmutable para evidencias)</li>
              <li>• Auditoría: solo registra (append-only)</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="📋 Matriz de Riesgo Residual">
        <InfoBox type="warning">
          <strong>Riesgo residual aceptado:</strong> Incluso con todas las mitigaciones, existe un riesgo residual 
          inherente a toda valoración de propiedad intelectual: la subjetividad en la selección de métodos, 
          tasas y supuestos. Este riesgo se gestiona mediante: (1) documentación exhaustiva de decisiones, 
          (2) rangos en vez de cifras únicas, (3) niveles de confianza cuantificados, y (4) posibilidad de revisión por pares.
        </InfoBox>
      </Card>
    </SectionWrapper>
  );
}
