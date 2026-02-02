/**
 * Matter/Case types for IronClad
 * @module types/matter
 */

import type { MatterStatus, MatterType, Priority } from '../enums';
import type { User } from './auth.types';

/**
 * Legal matter/case entity
 */
export interface Matter {
  /** Unique matter identifier */
  readonly id: string;
  /** Human-readable matter number (e.g., "2024-RE-00123") */
  matterNumber: string;
  /** Matter title/name */
  title: string;
  /** Detailed description */
  description?: string | undefined;
  /** Matter type */
  type: MatterType;
  /** Current status */
  status: MatterStatus;
  /** Priority level */
  priority: Priority;
  /** Organization ID */
  organizationId: string;
  /** Primary responsible attorney ID */
  responsibleAttorneyId: string;
  /** Originating attorney ID */
  originatingAttorneyId?: string | undefined;
  /** Assigned team member IDs */
  assignedUserIds: readonly string[];
  /** Associated client/party IDs */
  clientIds: readonly string[];
  /** Associated property ID (if applicable) */
  propertyId?: string | undefined;
  /** Associated transaction ID (if applicable) */
  transactionId?: string | undefined;
  /** Internal reference/file number */
  fileNumber?: string | undefined;
  /** Client reference/PO number */
  clientReference?: string | undefined;
  /** Jurisdiction (state code) */
  jurisdiction: string;
  /** County (if applicable) */
  county?: string | undefined;
  /** Matter opened date */
  openedDate: Date;
  /** Expected close date */
  expectedCloseDate?: Date | undefined;
  /** Actual close date */
  closedDate?: Date | undefined;
  /** Statute of limitations date */
  statuteOfLimitations?: Date | undefined;
  /** Billing type */
  billingType: BillingType;
  /** Flat fee amount (if applicable) */
  flatFeeAmount?: number | undefined;
  /** Hourly rate override */
  hourlyRateOverride?: number | undefined;
  /** Trust/retainer balance */
  trustBalance: number;
  /** Total billed amount */
  totalBilled: number;
  /** Total collected amount */
  totalCollected: number;
  /** Custom fields */
  customFields?: Record<string, unknown> | undefined;
  /** Internal notes (not visible to clients) */
  internalNotes?: string | undefined;
  /** Tags for categorization */
  tags: readonly string[];
  /** Whether matter is archived */
  isArchived: boolean;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Billing type options
 */
export type BillingType = 'HOURLY' | 'FLAT_FEE' | 'CONTINGENCY' | 'RETAINER' | 'PRO_BONO' | 'HYBRID';

/**
 * Matter creation input
 */
export interface CreateMatterInput {
  /** Matter title */
  title: string;
  /** Matter type */
  type: MatterType;
  /** Jurisdiction (state code) */
  jurisdiction: string;
  /** Primary responsible attorney ID */
  responsibleAttorneyId: string;
  /** Associated client IDs */
  clientIds: readonly string[];
  /** Optional description */
  description?: string | undefined;
  /** Optional priority (defaults to NORMAL) */
  priority?: Priority | undefined;
  /** Optional county */
  county?: string | undefined;
  /** Optional expected close date */
  expectedCloseDate?: Date | undefined;
  /** Optional billing type (defaults to HOURLY) */
  billingType?: BillingType | undefined;
  /** Optional property ID */
  propertyId?: string | undefined;
  /** Optional tags */
  tags?: readonly string[] | undefined;
}

/**
 * Matter update input
 */
export interface UpdateMatterInput {
  /** Updated title */
  title?: string | undefined;
  /** Updated description */
  description?: string | undefined;
  /** Updated status */
  status?: MatterStatus | undefined;
  /** Updated priority */
  priority?: Priority | undefined;
  /** Updated responsible attorney */
  responsibleAttorneyId?: string | undefined;
  /** Updated assigned users */
  assignedUserIds?: readonly string[] | undefined;
  /** Updated expected close date */
  expectedCloseDate?: Date | undefined;
  /** Updated billing type */
  billingType?: BillingType | undefined;
  /** Updated flat fee amount */
  flatFeeAmount?: number | undefined;
  /** Updated hourly rate override */
  hourlyRateOverride?: number | undefined;
  /** Updated internal notes */
  internalNotes?: string | undefined;
  /** Updated tags */
  tags?: readonly string[] | undefined;
  /** Updated custom fields */
  customFields?: Record<string, unknown> | undefined;
}

/**
 * Matter with populated relations
 */
export interface MatterWithRelations extends Matter {
  /** Responsible attorney user object */
  responsibleAttorney: User;
  /** Assigned team members */
  assignedUsers: readonly User[];
  /** Matter statistics */
  statistics: MatterStatistics;
}

/**
 * Matter statistics/metrics
 */
export interface MatterStatistics {
  /** Total documents count */
  documentCount: number;
  /** Total tasks count */
  taskCount: number;
  /** Completed tasks count */
  completedTaskCount: number;
  /** Overdue tasks count */
  overdueTaskCount: number;
  /** Total time entries (hours) */
  totalHours: number;
  /** Unbilled hours */
  unbilledHours: number;
  /** Days since last activity */
  daysSinceActivity: number;
  /** Upcoming deadlines (next 30 days) */
  upcomingDeadlineCount: number;
}

/**
 * Matter search/filter criteria
 */
export interface MatterSearchCriteria {
  /** Search query (matches title, number, description) */
  query?: string | undefined;
  /** Filter by status */
  status?: MatterStatus | readonly MatterStatus[] | undefined;
  /** Filter by type */
  type?: MatterType | readonly MatterType[] | undefined;
  /** Filter by priority */
  priority?: Priority | readonly Priority[] | undefined;
  /** Filter by jurisdiction */
  jurisdiction?: string | undefined;
  /** Filter by responsible attorney */
  responsibleAttorneyId?: string | undefined;
  /** Filter by assigned user */
  assignedUserId?: string | undefined;
  /** Filter by client */
  clientId?: string | undefined;
  /** Filter by opened date range */
  openedDateFrom?: Date | undefined;
  openedDateTo?: Date | undefined;
  /** Filter by tags */
  tags?: readonly string[] | undefined;
  /** Include archived matters */
  includeArchived?: boolean | undefined;
}

/**
 * Matter timeline event
 */
export interface MatterTimelineEvent {
  /** Event ID */
  readonly id: string;
  /** Matter ID */
  matterId: string;
  /** Event type */
  eventType: MatterEventType;
  /** Event title */
  title: string;
  /** Event description */
  description?: string | undefined;
  /** User who triggered the event */
  userId: string;
  /** Related entity type */
  relatedEntityType?: 'document' | 'task' | 'party' | 'transaction' | undefined;
  /** Related entity ID */
  relatedEntityId?: string | undefined;
  /** Event metadata */
  metadata?: Record<string, unknown> | undefined;
  /** Event timestamp */
  readonly timestamp: Date;
}

/**
 * Matter event types for timeline
 */
export type MatterEventType =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'DOCUMENT_ADDED'
  | 'DOCUMENT_SIGNED'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'DEADLINE_SET'
  | 'DEADLINE_MET'
  | 'DEADLINE_MISSED'
  | 'PARTY_ADDED'
  | 'NOTE_ADDED'
  | 'MILESTONE_REACHED'
  | 'BILLING_EVENT'
  | 'CLOSED'
  | 'REOPENED'
  | 'ARCHIVED';
