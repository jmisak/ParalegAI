/**
 * User Entity Factory
 *
 * Creates test User instances with realistic data using Fishery pattern.
 * Used for unit and integration tests.
 */

import { nanoid } from 'nanoid';

export type UserRole = 'ADMIN' | 'ATTORNEY' | 'PARALEGAL' | 'LEGAL_ASSISTANT' | 'ACCOUNTANT' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserParams {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  organizationId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * User factory - creates realistic user test data
 */
export class UserFactory {
  private static counter = 0;

  static build(params: CreateUserParams = {}): User {
    const now = new Date();
    const id = UserFactory.counter++;

    return {
      id: params.id ?? nanoid(),
      email: params.email ?? `test.user${id}@ironclad.test`,
      firstName: params.firstName ?? `Test${id}`,
      lastName: params.lastName ?? `User`,
      role: params.role ?? 'PARALEGAL',
      organizationId: params.organizationId ?? nanoid(),
      isActive: params.isActive ?? true,
      emailVerified: params.emailVerified ?? true,
      mfaEnabled: params.mfaEnabled ?? false,
      createdAt: params.createdAt ?? now,
      updatedAt: params.updatedAt ?? now,
      deletedAt: params.deletedAt ?? null,
    };
  }

  static buildList(count: number, params: CreateUserParams = {}): User[] {
    return Array.from({ length: count }, () => this.build(params));
  }

  static buildAdmin(params: CreateUserParams = {}): User {
    return this.build({ ...params, role: 'ADMIN' });
  }

  static buildAttorney(params: CreateUserParams = {}): User {
    return this.build({ ...params, role: 'ATTORNEY' });
  }

  static buildParalegal(params: CreateUserParams = {}): User {
    return this.build({ ...params, role: 'PARALEGAL' });
  }
}
