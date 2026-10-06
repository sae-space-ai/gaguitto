/**
 * PERITO IP — Fase 6: Creator Identity Registry
 * 
 * Gestiona variantes de nombre (alias) sin fusionarlas ciegamente.
 * Implementa resolución de identidad con evidencia positiva y negativa.
 * 
 * PRINCIPIO: NO inferir que dos nombres pertenecen a la misma persona
 * únicamente por similitud textual.
 */

import {
  CreatorAlias,
  CreatorIdentity,
  AliasType,
  IdentityResolutionStatus,
  generateCatalogId,
  normalizeName,
} from './types';

export class CreatorIdentityRegistry {
  private identities: Map<string, CreatorIdentity> = new Map();
  private aliases: Map<string, CreatorAlias> = new Map();

  /**
   * Crea una nueva identidad creativa.
   */
  createIdentity(params: {
    legalName?: string;
    primaryAlias: string;
    aliasType?: AliasType;
  }): CreatorIdentity {
    const creatorId = generateCatalogId('CREATOR');
    const now = new Date().toISOString();

    const primaryAliasObj: CreatorAlias = {
      aliasId: generateCatalogId('ALIAS'),
      creatorId,
      displayedName: params.primaryAlias,
      normalizedName: normalizeName(params.primaryAlias),
      aliasType: params.aliasType || 'AUTHOR_NAME',
      firstSeen: now,
      lastSeen: now,
      usageContext: 'Primary alias',
      verificationStatus: 'MATCH_CONFIRMED',
      relationshipStatus: 'CONFIRMED',
    };

    const identity: CreatorIdentity = {
      creatorId,
      legalName: params.legalName,
      primaryAlias: params.primaryAlias,
      aliases: [primaryAliasObj],
      externalIds: {},
      verificationStatus: 'MATCH_CONFIRMED',
      createdAt: now,
      updatedAt: now,
    };

    this.identities.set(creatorId, identity);
    this.aliases.set(primaryAliasObj.aliasId, primaryAliasObj);

    return identity;
  }

  /**
   * Añade un alias a una identidad existente.
   */
  addAlias(
    creatorId: string,
    params: {
      displayedName: string;
      aliasType: AliasType;
      sourceId?: string;
      usageContext: string;
    }
  ): CreatorAlias | null {
    const identity = this.identities.get(creatorId);
    if (!identity) return null;

    const alias: CreatorAlias = {
      aliasId: generateCatalogId('ALIAS'),
      creatorId,
      displayedName: params.displayedName,
      normalizedName: normalizeName(params.displayedName),
      aliasType: params.aliasType,
      sourceId: params.sourceId,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      usageContext: params.usageContext,
      verificationStatus: 'MATCH_PROBABLE_REQUIRES_REVIEW',
      relationshipStatus: 'PROBABLE',
    };

    identity.aliases.push(alias);
    identity.updatedAt = new Date().toISOString();
    this.aliases.set(alias.aliasId, alias);

    return alias;
  }

  /**
   * Busca identidad por nombre (normalizado).
   */
  findByIdentityName(name: string): CreatorIdentity | null {
    const normalized = normalizeName(name);
    
    for (const identity of this.identities.values()) {
      for (const alias of identity.aliases) {
        if (alias.normalizedName === normalized) {
          return identity;
        }
      }
    }
    
    return null;
  }

  /**
   * Busca identidad por ID.
   */
  getIdentity(creatorId: string): CreatorIdentity | null {
    return this.identities.get(creatorId) || null;
  }

  /**
   * Obtiene todas las identidades.
   */
  getAllIdentities(): CreatorIdentity[] {
    return Array.from(this.identities.values());
  }

  /**
   * Obtiene todos los alias.
   */
  getAllAliases(): CreatorAlias[] {
    return Array.from(this.aliases.values());
  }

  /**
   * Confirma una asociación de alias (requiere revisión humana).
   */
  confirmAlias(aliasId: string, confirmedBy: string): boolean {
    const alias = this.aliases.get(aliasId);
    if (!alias) return false;

    alias.verificationStatus = 'MATCH_CONFIRMED';
    alias.relationshipStatus = 'CONFIRMED';
    alias.notes = `${alias.notes || ''}\nConfirmed by ${confirmedBy} on ${new Date().toISOString()}`.trim();

    const identity = this.identities.get(alias.creatorId);
    if (identity) {
      identity.updatedAt = new Date().toISOString();
    }

    return true;
  }

  /**
   * Rechaza una asociación de alias.
   */
  rejectAlias(aliasId: string, reason: string, rejectedBy: string): boolean {
    const alias = this.aliases.get(aliasId);
    if (!alias) return false;

    alias.verificationStatus = 'NOT_MATCH';
    alias.relationshipStatus = 'REJECTED';
    alias.notes = `${alias.notes || ''}\nRejected by ${rejectedBy}: ${reason}`.trim();

    return true;
  }

  /**
   * Cuenta identidades por estado.
   */
  countByStatus(): Record<IdentityResolutionStatus, number> {
    const counts: Record<IdentityResolutionStatus, number> = {
      MATCH_CONFIRMED: 0,
      MATCH_PROBABLE_REQUIRES_REVIEW: 0,
      AMBIGUOUS: 0,
      NOT_MATCH: 0,
      UNKNOWN: 0,
    };

    for (const identity of this.identities.values()) {
      counts[identity.verificationStatus]++;
    }

    return counts;
  }
}
