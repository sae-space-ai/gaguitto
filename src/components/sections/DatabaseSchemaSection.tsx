import React from 'react';
import { SectionWrapper, Card, CodeBlock, Table, InfoBox } from '../shared';

export default function DatabaseSchemaSection() {
  return (
    <SectionWrapper number="Sección 3" title="Esquema de Base de Datos" subtitle="PostgreSQL — Diseño relacional con integridad referencial">
      
      <Card title="🗄️ Tablas Principales">
        <CodeBlock language="sql">{`
-- ============================================
-- TABLA: cases (Expedientes periciales)
-- ============================================
CREATE TABLE cases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number     VARCHAR(20) UNIQUE NOT NULL,  -- ej: PIP-2024-0001
    title           VARCHAR(500) NOT NULL,
    asset_type      VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    jurisdiction    VARCHAR(100),
    valuation_date  DATE NOT NULL,
    creation_date   DATE,
    development_stage VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES users(id),
    
    CONSTRAINT chk_case_status CHECK (status IN (
        'draft', 'evidence_gathering', 'analysis',
        'valuation_in_progress', 'review', 'finalized', 'archived'
    ))
);

-- ============================================
-- TABLA: authors (Autores)
-- ============================================
CREATE TABLE authors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(300) NOT NULL,
    role        VARCHAR(100),
    nationality VARCHAR(100),
    notes       TEXT
);

-- ============================================
-- TABLA: case_authors (Relación N:N)
-- ============================================
CREATE TABLE case_authors (
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    author_id   UUID REFERENCES authors(id),
    role        VARCHAR(100),
    PRIMARY KEY (case_id, author_id)
);

-- ============================================
-- TABLA: rights_holders (Titulares de derechos)
-- ============================================
CREATE TABLE rights_holders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(300) NOT NULL,
    type        VARCHAR(50), -- 'individual', 'company', 'estate'
    contact     TEXT,
    notes       TEXT
);

-- ============================================
-- TABLA: case_rights_holders
-- ============================================
CREATE TABLE case_rights_holders (
    case_id           UUID REFERENCES cases(id) ON DELETE CASCADE,
    rights_holder_id  UUID REFERENCES rights_holders(id),
    right_type        VARCHAR(100),
    percentage        DECIMAL(5,2),
    territory         VARCHAR(100),
    period_start      DATE,
    period_end        DATE,
    PRIMARY KEY (case_id, rights_holder_id, right_type)
);

-- ============================================
-- TABLA: territories
-- ============================================
CREATE TABLE case_territories (
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    territory   VARCHAR(100) NOT NULL,
    is_exclusive BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (case_id, territory)
);

-- ============================================
-- TABLA: languages
-- ============================================
CREATE TABLE case_languages (
    case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
    language    VARCHAR(50) NOT NULL,
    is_original BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (case_id, language)
);
        `}</CodeBlock>
      </Card>

      <Card title="📎 Tablas de Evidencias y Fuentes">
        <CodeBlock language="sql">{`
-- ============================================
-- TABLA: evidence (Evidencias documentales)
-- ============================================
CREATE TABLE evidence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id             UUID REFERENCES cases(id) ON DELETE CASCADE,
    source_description  VARCHAR(500) NOT NULL,
    document_ref        VARCHAR(300),
    document_date       DATE,
    fact_accredited     TEXT NOT NULL,
    reliability_level   VARCHAR(30) NOT NULL,
    limitations         TEXT,
    sha256_hash         VARCHAR(64) NOT NULL,
    relation_to_valuation TEXT,
    is_user_provided    BOOLEAN NOT NULL DEFAULT TRUE,
    storage_path        VARCHAR(500),
    ingested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at         TIMESTAMPTZ,
    verified_by         UUID REFERENCES users(id),
    
    CONSTRAINT chk_reliability CHECK (reliability_level IN (
        'verified_official', 'documented', 'user_provided',
        'external_source', 'estimate', 'hypothesis', 'unverified'
    ))
);

CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_evidence_hash ON evidence(sha256_hash);

-- ============================================
-- TABLA: sources (Fuentes externas)
-- ============================================
CREATE TABLE sources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    entity          VARCHAR(300),       -- Entidad responsable
    url             VARCHAR(1000),
    publication_date DATE,
    consultation_date DATE NOT NULL,
    reliability_tier INTEGER NOT NULL CHECK (reliability_tier BETWEEN 1 AND 5),
    -- 1 = Legislación oficial / WIPO
    -- 2 = Organismos públicos / registros oficiales
    -- 3 = Bases de datos profesionales
    -- 4 = Fuentes sectoriales identificables
    -- 5 = Otras fuentes
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: evidence_sources (Relación N:N)
-- ============================================
CREATE TABLE evidence_sources (
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    source_id   UUID REFERENCES sources(id),
    PRIMARY KEY (evidence_id, source_id)
);
        `}</CodeBlock>
      </Card>

      <Card title="💰 Tablas de Valoración">
        <CodeBlock language="sql">{`
-- ============================================
-- TABLA: cost_components (Componentes de coste)
-- ============================================
CREATE TABLE cost_components (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
    category        VARCHAR(50) NOT NULL,
    -- writing, research, development, production, filming,
    -- editing, postproduction, design, illustration, translation,
    -- publishing, personnel, external_professionals, software,
    -- equipment, promotion, ip_protection, administrative, other
    description     VARCHAR(500) NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',
    date            DATE,
    basis           VARCHAR(30) NOT NULL,
    -- 'documented', 'invoice', 'estimate', 'hypothesis'
    evidence_id     UUID REFERENCES evidence(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: income_streams (Flujos de ingresos)
-- ============================================
CREATE TABLE income_streams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
    category        VARCHAR(50) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    territory       VARCHAR(100),
    currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',
    basis           VARCHAR(30) NOT NULL,
    source_id       UUID REFERENCES sources(id),
    evidence_ids    UUID[],
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: income_projections (Proyecciones anuales)
-- ============================================
CREATE TABLE income_projections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    income_stream_id UUID REFERENCES income_streams(id) ON DELETE CASCADE,
    year            INTEGER NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    growth_rate     DECIMAL(5,4),
    basis           TEXT NOT NULL,
    confidence      INTEGER CHECK (confidence BETWEEN 0 AND 100),
    UNIQUE(income_stream_id, year)
);

-- ============================================
-- TABLA: valuations (Resultados de valoración)
-- ============================================
CREATE TABLE valuations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
    method          VARCHAR(50) NOT NULL,
    result_amount   DECIMAL(15,2),
    currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',
    confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 100),
    formula         TEXT NOT NULL,
    inputs          JSONB NOT NULL,
    assumptions     JSONB,
    evidence_refs   UUID[],
    source_refs     UUID[],
    calculated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    notes           TEXT,
    
    CONSTRAINT chk_valuation_method CHECK (method IN (
        'cost_historical', 'cost_reproduction', 'cost_replacement',
        'market_comparables', 'income_dcf', 'income_royalty',
        'legal_damage', 'triangulation'
    ))
);

-- ============================================
-- TABLA: comparables
-- ============================================
CREATE TABLE comparables (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id             UUID REFERENCES cases(id) ON DELETE CASCADE,
    work_title          VARCHAR(500) NOT NULL,
    transaction_date    DATE,
    market              VARCHAR(100),
    territory           VARCHAR(100),
    genre               VARCHAR(100),
    format              VARCHAR(100),
    development_phase   VARCHAR(100),
    audience            BIGINT,
    known_amount        DECIMAL(15,2),
    currency            VARCHAR(3) DEFAULT 'EUR',
    operation_type      VARCHAR(100),
    rights_included     TEXT[],
    source_id           UUID REFERENCES sources(id),
    consultation_date   DATE NOT NULL,
    comparability_score INTEGER CHECK (comparability_score BETWEEN 0 AND 100),
    differences         TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
        `}</CodeBlock>
      </Card>

      <Card title="🎲 Tablas de Escenarios y Auditoría">
        <CodeBlock language="sql">{`
-- ============================================
-- TABLA: scenarios
-- ============================================
CREATE TABLE scenarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,
    -- 'conservative', 'base', 'expansive'
    description     TEXT,
    result_amount   DECIMAL(15,2),
    currency        VARCHAR(3) DEFAULT 'EUR',
    variables       JSONB NOT NULL,
    assumptions     JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT chk_scenario_type CHECK (type IN (
        'conservative', 'base', 'expansive'
    ))
);

-- ============================================
-- TABLA: monte_carlo_results
-- ============================================
CREATE TABLE monte_carlo_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE CASCADE,
    iterations      INTEGER NOT NULL,
    mean_value      DECIMAL(15,2),
    std_dev         DECIMAL(15,2),
    min_value       DECIMAL(15,2),
    max_value       DECIMAL(15,2),
    p5              DECIMAL(15,2),
    p10             DECIMAL(15,2),
    p25             DECIMAL(15,2),
    p50             DECIMAL(15,2),
    p75             DECIMAL(15,2),
    p90             DECIMAL(15,2),
    p95             DECIMAL(15,2),
    distribution    JSONB,  -- histograma
    convergence     BOOLEAN,
    variables       JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: audit_log (Log inmutable)
-- ============================================
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    case_id         UUID REFERENCES cases(id),
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    previous_value  JSONB,
    new_value       JSONB,
    user_id         UUID REFERENCES users(id),
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      INET,
    chain_hash      VARCHAR(64) NOT NULL,  -- Hash encadenado
    metadata        JSONB,
    
    -- El log es append-only: NO UPDATE, NO DELETE
    CONSTRAINT chk_audit_action CHECK (action IN (
        'create', 'update', 'delete', 'calculate', 'verify',
        'export', 'import', 'login', 'permission_change'
    ))
);

-- Índice para trazabilidad por expediente
CREATE INDEX idx_audit_case ON audit_log(case_id, timestamp DESC);
-- Índice para verificación de cadena
CREATE INDEX idx_audit_chain ON audit_log(chain_hash);

-- ============================================
-- TABLA: triangulation_results
-- ============================================
CREATE TABLE triangulation_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id             UUID REFERENCES cases(id) ON DELETE CASCADE,
    cost_value          DECIMAL(15,2),
    market_value        DECIMAL(15,2),
    income_value        DECIMAL(15,2),
    probabilistic_value DECIMAL(15,2),
    weight_cost         DECIMAL(3,2),
    weight_market       DECIMAL(3,2),
    weight_income       DECIMAL(3,2),
    weight_probabilistic DECIMAL(3,2),
    lower_bound         DECIMAL(15,2),
    central_value       DECIMAL(15,2),
    upper_bound         DECIMAL(15,2),
    confidence_level    INTEGER,
    methodology_notes   TEXT,
    modifying_factors   JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
        `}</CodeBlock>
      </Card>

      <InfoBox type="warning">
        <strong>Nota sobre inmutabilidad:</strong> La tabla <code>audit_log</code> está diseñada como append-only. 
        No se permiten operaciones UPDATE ni DELETE. La integridad se verifica mediante hash encadenado 
        (cada entrada incluye el hash de la entrada anterior).
      </InfoBox>

      <Card title="📈 Índices y Optimización">
        <Table
          headers={['Tabla', 'Índice', 'Propósito']}
          rows={[
            ['cases', 'case_number UNIQUE', 'Búsqueda por número de expediente'],
            ['evidence', 'case_id', 'Listado de evidencias por expediente'],
            ['evidence', 'sha256_hash', 'Verificación de integridad'],
            ['valuations', 'case_id + method', 'Valoraciones por expediente y método'],
            ['comparables', 'case_id', 'Comparables por expediente'],
            ['audit_log', 'case_id + timestamp', 'Trazabilidad cronológica'],
            ['audit_log', 'chain_hash', 'Verificación de cadena'],
            ['income_projections', 'income_stream_id + year', 'Proyecciones por flujo'],
          ]}
        />
      </Card>
    </SectionWrapper>
  );
}
