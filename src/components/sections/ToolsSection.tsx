import React from 'react';
import { SectionWrapper, Card, Table, Badge, InfoBox, CodeBlock } from '../shared';

export default function ToolsSection() {
  return (
    <SectionWrapper number="Sección 5" title="Herramientas Necesarias" subtitle="Stack tecnológico y herramientas del sistema">
      
      <Card title="🖥️ Stack Tecnológico Principal">
        <Table
          headers={['Capa', 'Tecnología', 'Justificación']}
          rows={[
            ['Frontend', 'React + TypeScript + Tailwind CSS', 'Componentes modulares, tipado estricto, diseño profesional'],
            ['Backend API', 'Node.js + Fastify', 'Alto rendimiento, tipado con TypeScript, validación de schemas'],
            ['Base de datos', 'PostgreSQL 16+', 'Integridad referencial, JSONB para flexibilidad, extensiones crypto'],
            ['Almacenamiento', 'S3-compatible (MinIO local)', 'Documentos con hash, versionado, acceso controlado'],
            ['Motor matemático', 'TypeScript puro', 'Determinista, testeable, independiente del LLM'],
            ['LLM', 'OpenAI GPT-4 / Claude / local', 'Solo interpretación y redacción, nunca cálculo'],
            ['Exportación PDF', 'Puppeteer / PDFKit', 'Informes profesionales con trazabilidad visual'],
            ['Exportación DOCX', 'docx.js', 'Formato editable para revisión jurídica'],
            ['Testing', 'Vitest + Supertest', 'Tests unitarios de motores + integración API'],
            ['Autenticación', 'JWT + bcrypt', 'Roles: perito, revisor, administrador, cliente'],
            ['Hashing', 'crypto (Node.js built-in)', 'SHA-256 para documentos, hash encadenado para auditoría'],
            ['Cache', 'Redis (opcional)', 'Sesiones, cache de consultas frecuentes'],
          ]}
        />
      </Card>

      <Card title="🔧 Herramientas del Motor Matemático">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Financieras</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>NPV Calculator</strong> — Valor presente neto determinista</li>
              <li>• <strong>Discount Rate Engine</strong> — WACC, tasa libre de riesgo + prima</li>
              <li>• <strong>Sensitivity Analyzer</strong> — Análisis de sensibilidad univariante y multivariante</li>
              <li>• <strong>Growth Modeler</strong> — Proyecciones con tasas variables</li>
              <li>• <strong>Currency Converter</strong> — Conversión con tipos oficiales (BCE)</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Estadísticas</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Monte Carlo Simulator</strong> — Simulación con múltiples distribuciones</li>
              <li>• <strong>Distribution Fitter</strong> — Normal, triangular, uniforme, lognormal, beta</li>
              <li>• <strong>Percentile Calculator</strong> — P5, P10, P25, P50, P75, P90, P95</li>
              <li>• <strong>Convergence Detector</strong> — Detecta si la simulación ha convergido</li>
              <li>• <strong>Correlation Matrix</strong> — Correlaciones entre variables</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Comparables</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>Scoring Engine</strong> — Puntuación de comparabilidad (0-100)</li>
              <li>• <strong>Adjustment Calculator</strong> — Ajustes por diferencias</li>
              <li>• <strong>Outlier Detector</strong> — Identifica comparables atípicos</li>
              <li>• <strong>Weighted Average</strong> — Media ponderada por comparabilidad</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Criptográficas</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• <strong>SHA-256 Hasher</strong> — Hash de documentos</li>
              <li>• <strong>Chain Hasher</strong> — Hash encadenado para auditoría</li>
              <li>• <strong>Timestamp Signer</strong> — Sellado temporal</li>
              <li>• <strong>Integrity Verifier</strong> — Verificación de integridad</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="📚 Librerías y Dependencias Clave">
        <CodeBlock language="json">{`
{
  "dependencies": {
    "react": "^18.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "fastify": "^4.x",
    "pg": "^8.x",
    "@prisma/client": "^5.x",
    "zod": "^3.x",
    "jose": "^5.x",
    "bcrypt": "^5.x",
    "uuid": "^9.x",
    "pdfkit": "^0.14.x",
    "docx": "^8.x",
    "date-fns": "^3.x",
    "decimal.js": "^10.x",
    "jstat": "^1.9.x",
    "ioredis": "^5.x"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "supertest": "^6.x",
    "@types/node": "^20.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
        `}</CodeBlock>
      </Card>

      <Card title="⚙️ Herramientas de Desarrollo">
        <Table
          headers={['Herramienta', 'Uso', 'Crítico']}
          rows={[
            ['TypeScript strict mode', 'Tipado estricto en todo el proyecto', '✅ Sí'],
            ['ESLint + Prettier', 'Calidad de código consistente', '✅ Sí'],
            ['Vitest', 'Tests unitarios de motores matemáticos', '✅ Sí'],
            ['Prisma ORM', 'Migraciones y acceso a BD tipado', '✅ Sí'],
            ['Zod', 'Validación de schemas en runtime', '✅ Sí'],
            ['Docker Compose', 'Entorno de desarrollo reproducible', '✅ Sí'],
            ['GitHub Actions', 'CI/CD con tests automatizados', 'Alta'],
            ['Sentry', 'Monitorización de errores', 'Media'],
            ['pgcrypto (extensión PG)', 'Funciones criptográficas en BD', '✅ Sí'],
          ]}
        />
      </Card>

      <InfoBox type="warning">
        <strong>Nota sobre decimal.js:</strong> Todos los cálculos financieros utilizan <code>decimal.js</code> 
        para evitar errores de precisión en punto flotante. Nunca se usan operaciones nativas de JavaScript 
        para cálculos monetarios.
      </InfoBox>
    </SectionWrapper>
  );
}
