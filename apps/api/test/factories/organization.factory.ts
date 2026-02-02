/**
 * Organization Entity Factory
 *
 * Creates test Organization instances (law firms/practices).
 */

import { nanoid } from 'nanoid';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
  subscriptionTier: string;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateOrganizationParams {
  id?: string;
  name?: string;
  slug?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  isActive?: boolean;
  subscriptionTier?: string;
  maxUsers?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class OrganizationFactory {
  private static counter = 0;

  static build(params: CreateOrganizationParams = {}): Organization {
    const now = new Date();
    const id = OrganizationFactory.counter++;

    const name = params.name ?? `Test Law Firm ${id}`;
    const slug = params.slug ?? name.toLowerCase().replace(/\s+/g, '-');

    return {
      id: params.id ?? nanoid(),
      name,
      slug,
      address: params.address ?? `${100 + id} Legal Plaza, Suite ${id}, Test City, TS 12345`,
      phone: params.phone ?? `555-${String(id).padStart(4, '0')}-0000`,
      email: params.email ?? `contact@${slug}.test`,
      website: params.website ?? `https://${slug}.test`,
      isActive: params.isActive ?? true,
      subscriptionTier: params.subscriptionTier ?? 'PROFESSIONAL',
      maxUsers: params.maxUsers ?? 10,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
      deletedAt: params.deletedAt ?? null,
    };
  }

  static buildList(count: number, params: CreateOrganizationParams = {}): Organization[] {
    return Array.from({ length: count }, () => this.build(params));
  }
}
