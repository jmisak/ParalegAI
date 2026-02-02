/**
 * Matter Entity Factory
 *
 * Creates test Matter instances for real estate transactions.
 */

import { nanoid } from 'nanoid';

export type MatterStatus = 'INTAKE' | 'ACTIVE' | 'PENDING' | 'ON_HOLD' | 'CLOSING' | 'CLOSED' | 'ARCHIVED';
export type TransactionType = 'PURCHASE' | 'SALE' | 'REFINANCE' | 'LEASE' | 'EXCHANGE_1031';
export type PropertyType = 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDOMINIUM' | 'COMMERCIAL' | 'VACANT_LAND';

export interface Matter {
  id: string;
  matterNumber: string;
  title: string;
  description: string | null;
  status: MatterStatus;
  transactionType: TransactionType;
  propertyType: PropertyType;
  propertyAddress: string;
  purchasePrice: number | null;
  closingDate: Date | null;
  organizationId: string;
  assignedToId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateMatterParams {
  id?: string;
  matterNumber?: string;
  title?: string;
  description?: string | null;
  status?: MatterStatus;
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  propertyAddress?: string;
  purchasePrice?: number | null;
  closingDate?: Date | null;
  organizationId?: string;
  assignedToId?: string;
  createdById?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class MatterFactory {
  private static counter = 0;

  static build(params: CreateMatterParams = {}): Matter {
    const now = new Date();
    const id = MatterFactory.counter++;
    const year = now.getFullYear();

    return {
      id: params.id ?? nanoid(),
      matterNumber: params.matterNumber ?? `${year}-${String(id).padStart(5, '0')}`,
      title: params.title ?? `123 Main St Purchase - ${id}`,
      description: params.description ?? null,
      status: params.status ?? 'ACTIVE',
      transactionType: params.transactionType ?? 'PURCHASE',
      propertyType: params.propertyType ?? 'SINGLE_FAMILY',
      propertyAddress: params.propertyAddress ?? `123 Main St Unit ${id}, Test City, TS 12345`,
      purchasePrice: params.purchasePrice ?? 350000 + id * 1000,
      closingDate: params.closingDate ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      organizationId: params.organizationId ?? nanoid(),
      assignedToId: params.assignedToId ?? nanoid(),
      createdById: params.createdById ?? nanoid(),
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
      deletedAt: params.deletedAt ?? null,
    };
  }

  static buildList(count: number, params: CreateMatterParams = {}): Matter[] {
    return Array.from({ length: count }, () => this.build(params));
  }

  static buildPurchase(params: CreateMatterParams = {}): Matter {
    return this.build({
      ...params,
      transactionType: 'PURCHASE',
      purchasePrice: params.purchasePrice ?? 425000,
    });
  }

  static buildSale(params: CreateMatterParams = {}): Matter {
    return this.build({
      ...params,
      transactionType: 'SALE',
      title: params.title ?? 'Property Sale Transaction',
    });
  }

  static buildRefinance(params: CreateMatterParams = {}): Matter {
    return this.build({
      ...params,
      transactionType: 'REFINANCE',
      title: params.title ?? 'Refinance Transaction',
      purchasePrice: null,
    });
  }
}
