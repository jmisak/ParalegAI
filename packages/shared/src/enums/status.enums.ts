/**
 * Status enumerations for IronClad entities
 * @module enums/status
 */

/**
 * Status of a legal matter/case
 */
export enum MatterStatus {
  /** Initial intake, not yet active */
  INTAKE = 'INTAKE',
  /** Active and in progress */
  ACTIVE = 'ACTIVE',
  /** Temporarily paused */
  ON_HOLD = 'ON_HOLD',
  /** Pending specific action or event */
  PENDING = 'PENDING',
  /** In closing process */
  CLOSING = 'CLOSING',
  /** Successfully completed */
  CLOSED = 'CLOSED',
  /** Cancelled before completion */
  CANCELLED = 'CANCELLED',
  /** Archived for record keeping */
  ARCHIVED = 'ARCHIVED',
}

/**
 * Status of a document within the system
 */
export enum DocumentStatus {
  /** Document is being drafted */
  DRAFT = 'DRAFT',
  /** Pending internal review */
  PENDING_REVIEW = 'PENDING_REVIEW',
  /** Approved for use/sending */
  APPROVED = 'APPROVED',
  /** Sent to external party */
  SENT = 'SENT',
  /** Signed by required parties */
  SIGNED = 'SIGNED',
  /** Fully executed by all parties */
  EXECUTED = 'EXECUTED',
  /** Recorded with county/jurisdiction */
  RECORDED = 'RECORDED',
  /** Rejected and needs revision */
  REJECTED = 'REJECTED',
  /** Superseded by newer version */
  SUPERSEDED = 'SUPERSEDED',
  /** Voided and no longer valid */
  VOIDED = 'VOIDED',
}

/**
 * Status of a real estate transaction
 */
export enum TransactionStatus {
  /** Pre-contract phase */
  PRE_CONTRACT = 'PRE_CONTRACT',
  /** Under contract, due diligence period */
  UNDER_CONTRACT = 'UNDER_CONTRACT',
  /** Due diligence/inspection period */
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  /** Financing contingency period */
  FINANCING = 'FINANCING',
  /** Title review and clearance */
  TITLE_REVIEW = 'TITLE_REVIEW',
  /** Preparing for closing */
  PRE_CLOSING = 'PRE_CLOSING',
  /** At closing table */
  CLOSING = 'CLOSING',
  /** Post-closing tasks */
  POST_CLOSING = 'POST_CLOSING',
  /** Transaction completed */
  COMPLETED = 'COMPLETED',
  /** Transaction terminated */
  TERMINATED = 'TERMINATED',
  /** Transaction on hold */
  ON_HOLD = 'ON_HOLD',
}

/**
 * Status of a workflow task
 */
export enum TaskStatus {
  /** Not yet started */
  NOT_STARTED = 'NOT_STARTED',
  /** In progress */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Waiting on external party */
  WAITING = 'WAITING',
  /** Blocked by dependency */
  BLOCKED = 'BLOCKED',
  /** Completed successfully */
  COMPLETED = 'COMPLETED',
  /** Skipped (not applicable) */
  SKIPPED = 'SKIPPED',
  /** Cancelled */
  CANCELLED = 'CANCELLED',
  /** Failed */
  FAILED = 'FAILED',
}

/**
 * Priority levels for tasks and matters
 */
export enum Priority {
  /** Low priority */
  LOW = 'LOW',
  /** Normal/default priority */
  NORMAL = 'NORMAL',
  /** High priority */
  HIGH = 'HIGH',
  /** Urgent - requires immediate attention */
  URGENT = 'URGENT',
  /** Critical - blocking other work */
  CRITICAL = 'CRITICAL',
}

/**
 * User account status
 */
export enum UserStatus {
  /** Account pending activation */
  PENDING = 'PENDING',
  /** Account active and usable */
  ACTIVE = 'ACTIVE',
  /** Account suspended */
  SUSPENDED = 'SUSPENDED',
  /** Account deactivated */
  INACTIVE = 'INACTIVE',
  /** Account locked due to security */
  LOCKED = 'LOCKED',
}

/**
 * Contingency status for transaction contingencies
 */
export enum ContingencyStatus {
  /** Contingency is active */
  ACTIVE = 'ACTIVE',
  /** Contingency satisfied/waived */
  SATISFIED = 'SATISFIED',
  /** Contingency waived by party */
  WAIVED = 'WAIVED',
  /** Contingency failed/not met */
  FAILED = 'FAILED',
  /** Contingency expired */
  EXPIRED = 'EXPIRED',
}

/**
 * AI processing status
 */
export enum AIProcessingStatus {
  /** Queued for processing */
  QUEUED = 'QUEUED',
  /** Currently processing */
  PROCESSING = 'PROCESSING',
  /** Processing completed */
  COMPLETED = 'COMPLETED',
  /** Processing failed */
  FAILED = 'FAILED',
  /** Processing cancelled */
  CANCELLED = 'CANCELLED',
}
