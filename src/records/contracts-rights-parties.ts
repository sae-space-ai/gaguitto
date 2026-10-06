/**
 * PERITO IP — Fase 3: Contract Registry + Rights Registry + Party Registry
 * 
 * Capa 3.13: Registro de contratos
 * Capa 3.14: Extracción contractual
 * Capa 3.16: Rights Registry
 * Capa 3.17: Rights Graph
 * Capa 3.18: Titulares y partes
 * 
 * PRINCIPIO: No afirmar que un contrato es válido jurídicamente solo porque existe.
 * Separar: DOCUMENT_EXISTS, SIGNATURE_VERIFIED, TERMS_EXTRACTED, LEGAL_VALIDITY_ASSESSED.
 */

import {
  Contract,
  ContractType,
  ContractClause,
  ContractVerificationAspect,
  Right,
  RightType,
  RightEconomicStatus,
  Party,
  PartyType,
  VerificationStatus,
  RightsGraph,
  GraphNode,
  GraphEdge,
  generateId,
  nowISO,
} from './types';

// ============================================================
// CONTRACT REGISTRY
// ============================================================

export interface ContractInput {
  caseId: string;
  contractType: ContractType;
  title: string;
  parties: { partyId: string; role: string }[];
  executionDate?: string;
  effectiveDate?: string;
  expirationDate?: string;
  territory?: string;
  language?: string;
  exclusivity?: boolean;
  documentId?: string;
  notes?: string;
}

export class ContractRegistry {
  private contracts: Map<string, Contract> = new Map();

  register(input: ContractInput): Contract {
    const contract: Contract = {
      contractId: generateId('CTR'),
      caseId: input.caseId,
      contractType: input.contractType,
      title: input.title,
      parties: input.parties,
      executionDate: input.executionDate,
      effectiveDate: input.effectiveDate,
      expirationDate: input.expirationDate,
      territory: input.territory,
      language: input.language,
      exclusivity: input.exclusivity,
      status: 'PENDING',
      documentId: input.documentId,
      verificationAspects: {
        DOCUMENT_EXISTS: input.documentId ? 'VERIFIED' : 'UNVERIFIED',
        SIGNATURE_VERIFIED: 'UNVERIFIED',
        TERMS_EXTRACTED: 'UNVERIFIED',
        LEGAL_VALIDITY_ASSESSED: 'NOT_APPLICABLE',
      },
      clauses: [],
      notes: input.notes,
      createdAt: nowISO(),
      version: 1,
    };

    this.contracts.set(contract.contractId, contract);
    return contract;
  }

  get(contractId: string): Contract | undefined {
    return this.contracts.get(contractId);
  }

  getByCase(caseId: string): Contract[] {
    return Array.from(this.contracts.values()).filter(c => c.caseId === caseId);
  }

  /**
   * Añade una cláusula extraída.
   * Capa 3.14: Toda extracción mantiene referencia al documento.
   * Si no aparece: NOT_FOUND. No rellenar por intuición.
   */
  addClause(contractId: string, clause: Omit<ContractClause, 'clauseId' | 'contractId'>): Contract {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error(`Contrato no encontrado: ${contractId}`);

    const newClause: ContractClause = {
      ...clause,
      clauseId: generateId('CL'),
      contractId,
    };

    const updated: Contract = {
      ...contract,
      clauses: [...contract.clauses, newClause],
      verificationAspects: {
        ...contract.verificationAspects,
        TERMS_EXTRACTED: 'PARTIALLY_VERIFIED',
      },
      version: contract.version + 1,
    };

    this.contracts.set(contractId, updated);
    return updated;
  }

  updateVerificationAspect(
    contractId: string,
    aspect: ContractVerificationAspect,
    status: VerificationStatus
  ): Contract {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error(`Contrato no encontrado: ${contractId}`);

    const updated: Contract = {
      ...contract,
      verificationAspects: { ...contract.verificationAspects, [aspect]: status },
      version: contract.version + 1,
    };

    this.contracts.set(contractId, updated);
    return updated;
  }

  getAll(): Contract[] {
    return Array.from(this.contracts.values());
  }

  count(): number {
    return this.contracts.size;
  }
}

// ============================================================
// RIGHTS REGISTRY
// ============================================================

export interface RightInput {
  caseId: string;
  workId?: string;
  rightType: RightType;
  ownerId: string;
  territory?: string;
  language?: string;
  exclusivity: boolean;
  startDate?: string;
  endDate?: string;
  contractId?: string;
  evidenceId?: string;
  economicStatus: RightEconomicStatus;
  notes?: string;
}

export class RightsRegistry {
  private rights: Map<string, Right> = new Map();

  register(input: RightInput): Right {
    const right: Right = {
      rightId: generateId('RT'),
      caseId: input.caseId,
      workId: input.workId,
      rightType: input.rightType,
      ownerId: input.ownerId,
      territory: input.territory,
      language: input.language,
      exclusivity: input.exclusivity,
      startDate: input.startDate,
      endDate: input.endDate,
      contractId: input.contractId,
      evidenceId: input.evidenceId,
      status: input.evidenceId ? 'VERIFIED' : 'IDENTIFIED',
      verificationStatus: input.evidenceId ? 'VERIFIED' : 'UNVERIFIED',
      economicStatus: input.economicStatus,
      notes: input.notes,
      createdAt: nowISO(),
      version: 1,
    };

    this.rights.set(right.rightId, right);
    return right;
  }

  get(rightId: string): Right | undefined {
    return this.rights.get(rightId);
  }

  getByCase(caseId: string): Right[] {
    return Array.from(this.rights.values()).filter(r => r.caseId === caseId);
  }

  getByOwner(caseId: string, ownerId: string): Right[] {
    return this.getByCase(caseId).filter(r => r.ownerId === ownerId);
  }

  getByType(caseId: string, rightType: RightType): Right[] {
    return this.getByCase(caseId).filter(r => r.rightType === rightType);
  }

  updateStatus(rightId: string, status: Right['status'], verification: VerificationStatus): Right {
    const right = this.rights.get(rightId);
    if (!right) throw new Error(`Derecho no encontrado: ${rightId}`);

    const updated: Right = {
      ...right,
      status,
      verificationStatus: verification,
      version: right.version + 1,
    };

    this.rights.set(rightId, updated);
    return updated;
  }

  getAll(): Right[] {
    return Array.from(this.rights.values());
  }

  count(): number {
    return this.rights.size;
  }
}

// ============================================================
// PARTY REGISTRY
// ============================================================

export interface PartyInput {
  displayName: string;
  partyType: PartyType;
  jurisdiction?: string;
  role?: string;
  source?: string;
  notes?: string;
}

export class PartyRegistry {
  private parties: Map<string, Party> = new Map();

  register(input: PartyInput): Party {
    // No fusionar automáticamente dos personas solo porque sus nombres se parecen
    const party: Party = {
      partyId: generateId('PRT'),
      displayName: input.displayName,
      partyType: input.partyType,
      jurisdiction: input.jurisdiction,
      role: input.role,
      verificationStatus: 'UNVERIFIED',
      source: input.source,
      notes: input.notes,
      createdAt: nowISO(),
    };

    this.parties.set(party.partyId, party);
    return party;
  }

  get(partyId: string): Party | undefined {
    return this.parties.get(partyId);
  }

  getAll(): Party[] {
    return Array.from(this.parties.values());
  }

  count(): number {
    return this.parties.size;
  }
}

// ============================================================
// RIGHTS GRAPH (Capa 3.17)
// ============================================================

export class RightsGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private caseId: string;

  constructor(caseId: string) {
    this.caseId = caseId;
  }

  addNode(nodeType: GraphNode['nodeType'], entityId: string, label: string, properties: Record<string, string> = {}): GraphNode {
    const nodeId = `node-${entityId}`;
    const node: GraphNode = { nodeId, nodeType, entityId, label, properties };
    this.nodes.set(nodeId, node);
    return node;
  }

  addEdge(sourceNodeId: string, targetNodeId: string, relationType: string, evidenceId?: string, properties: Record<string, string> = {}): GraphEdge {
    // No generar relaciones sin evidencia (si se requiere)
    const edgeId = generateId('EDGE');
    const edge: GraphEdge = { edgeId, sourceNodeId, targetNodeId, relationType, evidenceId, properties };
    this.edges.set(edgeId, edge);
    return edge;
  }

  /**
   * Construye el grafo a partir de los registros.
   */
  buildFromRegistries(
    rights: Right[],
    contracts: Contract[],
    parties: Party[]
  ): RightsGraph {
    // Añadir nodos de titulares
    for (const party of parties) {
      this.addNode('OWNER', party.partyId, party.displayName, { type: party.partyType });
    }

    // Añadir nodos de derechos
    for (const right of rights) {
      const rightNode = this.addNode('RIGHT', right.rightId, right.rightType, {
        territory: right.territory || 'N/A',
        exclusivity: right.exclusivity ? 'YES' : 'NO',
        status: right.status,
      });

      // Conectar derecho → titular
      const ownerNodeId = `node-${right.ownerId}`;
      if (this.nodes.has(ownerNodeId)) {
        this.addEdge(ownerNodeId, rightNode.nodeId, 'OWNS', right.evidenceId);
      }

      // Conectar derecho → contrato (si existe)
      if (right.contractId) {
        const contractNodeId = `node-${right.contractId}`;
        if (!this.nodes.has(contractNodeId)) {
          const contract = contracts.find(c => c.contractId === right.contractId);
          if (contract) {
            this.addNode('CONTRACT', contract.contractId, contract.title, { type: contract.contractType });
          }
        }
        this.addEdge(rightNode.nodeId, `node-${right.contractId}`, 'GOVERNED_BY', right.evidenceId);
      }
    }

    // Añadir nodos de contratos
    for (const contract of contracts) {
      const contractNodeId = `node-${contract.contractId}`;
      if (!this.nodes.has(contractNodeId)) {
        this.addNode('CONTRACT', contract.contractId, contract.title, { type: contract.contractType });
      }

      // Conectar contrato → partes
      for (const p of contract.parties) {
        const partyNodeId = `node-${p.partyId}`;
        if (this.nodes.has(partyNodeId)) {
          this.addEdge(contractNodeId, partyNodeId, 'INVOLVES', undefined, { role: p.role });
        }
      }
    }

    return {
      caseId: this.caseId,
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      updatedAt: nowISO(),
    };
  }

  /**
   * Responde preguntas sobre el grafo.
   */
  query(query: {
    rightId?: string;
    ownerId?: string;
    contractId?: string;
  }): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const relevantNodeIds = new Set<string>();
    
    if (query.rightId) relevantNodeIds.add(`node-${query.rightId}`);
    if (query.ownerId) relevantNodeIds.add(`node-${query.ownerId}`);
    if (query.contractId) relevantNodeIds.add(`node-${query.contractId}`);

    // Encontrar nodos conectados
    for (const edge of this.edges.values()) {
      if (relevantNodeIds.has(edge.sourceNodeId)) relevantNodeIds.add(edge.targetNodeId);
      if (relevantNodeIds.has(edge.targetNodeId)) relevantNodeIds.add(edge.sourceNodeId);
    }

    const nodes = Array.from(this.nodes.values()).filter(n => relevantNodeIds.has(n.nodeId));
    const edges = Array.from(this.edges.values()).filter(
      e => relevantNodeIds.has(e.sourceNodeId) || relevantNodeIds.has(e.targetNodeId)
    );

    return { nodes, edges };
  }
}
