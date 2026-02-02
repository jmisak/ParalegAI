/**
 * Workflow types for IronClad
 * @module types/workflow
 */

import type { TaskStatus, Priority, MatterType } from '../enums';

/**
 * Workflow task entity
 */
export interface Task {
  /** Unique task identifier */
  readonly id: string;
  /** Associated matter ID */
  matterId: string;
  /** Parent task ID (for subtasks) */
  parentTaskId?: string | undefined;
  /** Task template ID (if created from template) */
  templateId?: string | undefined;
  /** Task title */
  title: string;
  /** Task description */
  description?: string | undefined;
  /** Current status */
  status: TaskStatus;
  /** Priority level */
  priority: Priority;
  /** Task category */
  category: TaskCategory;
  /** Assigned user ID */
  assignedTo?: string | undefined;
  /** Assigned user IDs (for team tasks) */
  assignedToTeam?: readonly string[] | undefined;
  /** Due date */
  dueDate?: Date | undefined;
  /** Start date */
  startDate?: Date | undefined;
  /** Completed date */
  completedDate?: Date | undefined;
  /** Estimated hours */
  estimatedHours?: number | undefined;
  /** Actual hours spent */
  actualHours?: number | undefined;
  /** Whether task is billable */
  isBillable: boolean;
  /** Whether task is recurring */
  isRecurring: boolean;
  /** Recurrence rule (if recurring) */
  recurrenceRule?: RecurrenceRule | undefined;
  /** Dependent task IDs (blocked by) */
  dependsOn?: readonly string[] | undefined;
  /** Tasks blocked by this task */
  blocks?: readonly string[] | undefined;
  /** Related document IDs */
  documentIds?: readonly string[] | undefined;
  /** Related party IDs */
  partyIds?: readonly string[] | undefined;
  /** Checklist items */
  checklist?: readonly ChecklistItem[] | undefined;
  /** Reminder settings */
  reminders?: readonly TaskReminder[] | undefined;
  /** Tags for categorization */
  tags: readonly string[];
  /** Custom fields */
  customFields?: Record<string, unknown> | undefined;
  /** Internal notes */
  notes?: string | undefined;
  /** Sort order within category */
  sortOrder: number;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Task categories
 */
export type TaskCategory =
  | 'DOCUMENT_PREPARATION'
  | 'DOCUMENT_REVIEW'
  | 'CLIENT_COMMUNICATION'
  | 'LENDER_COMMUNICATION'
  | 'TITLE_WORK'
  | 'DUE_DILIGENCE'
  | 'CLOSING_PREP'
  | 'POST_CLOSING'
  | 'DEADLINE_TRACKING'
  | 'INTERNAL'
  | 'OTHER';

/**
 * Checklist item
 */
export interface ChecklistItem {
  /** Item ID */
  id: string;
  /** Item text */
  text: string;
  /** Whether item is completed */
  isCompleted: boolean;
  /** Completed date */
  completedAt?: Date | undefined;
  /** Completed by user ID */
  completedBy?: string | undefined;
  /** Sort order */
  sortOrder: number;
}

/**
 * Task reminder
 */
export interface TaskReminder {
  /** Reminder ID */
  id: string;
  /** Reminder type */
  type: 'EMAIL' | 'IN_APP' | 'SMS';
  /** Minutes before due date */
  minutesBefore: number;
  /** Whether reminder has been sent */
  sent: boolean;
  /** Sent timestamp */
  sentAt?: Date | undefined;
}

/**
 * Recurrence rule
 */
export interface RecurrenceRule {
  /** Frequency */
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  /** Interval (every N periods) */
  interval: number;
  /** Days of week (for weekly) */
  daysOfWeek?: readonly number[] | undefined;
  /** Day of month (for monthly) */
  dayOfMonth?: number | undefined;
  /** End date */
  endDate?: Date | undefined;
  /** Maximum occurrences */
  maxOccurrences?: number | undefined;
}

/**
 * Deadline entity (critical date tracking)
 */
export interface Deadline {
  /** Unique deadline identifier */
  readonly id: string;
  /** Associated matter ID */
  matterId: string;
  /** Associated transaction ID */
  transactionId?: string | undefined;
  /** Deadline type */
  type: DeadlineType;
  /** Deadline title */
  title: string;
  /** Description */
  description?: string | undefined;
  /** Deadline date */
  date: Date;
  /** Calculation basis */
  calculationBasis?: DeadlineCalculationBasis | undefined;
  /** Is statutory/legal requirement */
  isStatutory: boolean;
  /** Jurisdiction (if statutory) */
  jurisdiction?: string | undefined;
  /** Responsible party */
  responsibleParty?: 'BUYER' | 'SELLER' | 'ATTORNEY' | 'LENDER' | 'TITLE' | undefined;
  /** Whether deadline is met */
  isMet: boolean;
  /** Met date */
  metDate?: Date | undefined;
  /** Consequence of missing */
  consequence?: string | undefined;
  /** Associated task ID */
  taskId?: string | undefined;
  /** Reminder days before */
  reminderDays: readonly number[];
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Deadline types
 */
export type DeadlineType =
  | 'CONTRACT_EFFECTIVE'
  | 'EARNEST_MONEY'
  | 'INSPECTION'
  | 'DUE_DILIGENCE'
  | 'FINANCING_CONTINGENCY'
  | 'APPRAISAL'
  | 'TITLE_COMMITMENT'
  | 'SURVEY'
  | 'HOA_DOCS'
  | 'CLOSING'
  | 'POSSESSION'
  | 'RECORDING'
  | 'ATTORNEY_REVIEW'
  | '1031_IDENTIFICATION'
  | '1031_EXCHANGE'
  | 'STATUTE_OF_LIMITATIONS'
  | 'CUSTOM';

/**
 * Deadline calculation basis
 */
export interface DeadlineCalculationBasis {
  /** Base event */
  baseEvent: 'CONTRACT_DATE' | 'EFFECTIVE_DATE' | 'CLOSING_DATE' | 'CUSTOM_DATE';
  /** Custom base date (if baseEvent is CUSTOM_DATE) */
  customDate?: Date | undefined;
  /** Days offset (positive = after, negative = before) */
  daysOffset: number;
  /** Calendar type for calculation */
  calendarType: 'CALENDAR' | 'BUSINESS';
  /** Exclude holidays */
  excludeHolidays: boolean;
  /** Jurisdiction for holidays */
  holidayJurisdiction?: string | undefined;
}

/**
 * Workflow pipeline entity
 */
export interface Pipeline {
  /** Unique pipeline identifier */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Pipeline name */
  name: string;
  /** Pipeline description */
  description?: string | undefined;
  /** Matter types this pipeline applies to */
  matterTypes: readonly MatterType[];
  /** Jurisdictions (empty = all) */
  jurisdictions: readonly string[];
  /** Pipeline stages */
  stages: readonly PipelineStage[];
  /** Whether pipeline is active */
  isActive: boolean;
  /** Whether this is a system pipeline */
  isSystem: boolean;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Pipeline stage
 */
export interface PipelineStage {
  /** Stage ID */
  id: string;
  /** Stage name */
  name: string;
  /** Stage description */
  description?: string | undefined;
  /** Stage order */
  order: number;
  /** Stage color (hex) */
  color: string;
  /** Default tasks for this stage */
  defaultTasks: readonly TaskTemplate[];
  /** Entry criteria */
  entryCriteria?: readonly StageCriterion[] | undefined;
  /** Exit criteria */
  exitCriteria?: readonly StageCriterion[] | undefined;
  /** Auto-advance when exit criteria met */
  autoAdvance: boolean;
}

/**
 * Stage entry/exit criterion
 */
export interface StageCriterion {
  /** Criterion type */
  type: 'TASK_COMPLETED' | 'DOCUMENT_UPLOADED' | 'DEADLINE_MET' | 'FIELD_VALUE' | 'CUSTOM';
  /** Criterion details */
  details: Record<string, unknown>;
  /** Description */
  description: string;
}

/**
 * Task template
 */
export interface TaskTemplate {
  /** Template ID */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string | undefined;
  /** Task title (can contain variables) */
  titleTemplate: string;
  /** Task description template */
  descriptionTemplate?: string | undefined;
  /** Default category */
  category: TaskCategory;
  /** Default priority */
  priority: Priority;
  /** Estimated hours */
  estimatedHours?: number | undefined;
  /** Default assignee role */
  defaultAssigneeRole?: string | undefined;
  /** Due date calculation */
  dueDateCalculation?: DeadlineCalculationBasis | undefined;
  /** Default checklist */
  defaultChecklist?: readonly string[] | undefined;
  /** Default reminder minutes */
  defaultReminderMinutes?: readonly number[] | undefined;
  /** Whether billable by default */
  isBillable: boolean;
  /** Applicable matter types */
  matterTypes: readonly MatterType[];
  /** Applicable jurisdictions */
  jurisdictions: readonly string[];
  /** Whether template is active */
  isActive: boolean;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Workflow step for execution tracking
 */
export interface WorkflowStep {
  /** Step ID */
  readonly id: string;
  /** Matter ID */
  matterId: string;
  /** Pipeline ID */
  pipelineId: string;
  /** Stage ID */
  stageId: string;
  /** Step name */
  name: string;
  /** Step status */
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  /** Started date */
  startedAt?: Date | undefined;
  /** Completed date */
  completedAt?: Date | undefined;
  /** Completed by user ID */
  completedBy?: string | undefined;
  /** Associated task IDs */
  taskIds: readonly string[];
  /** Notes */
  notes?: string | undefined;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Matter workflow state
 */
export interface MatterWorkflowState {
  /** Matter ID */
  matterId: string;
  /** Active pipeline ID */
  pipelineId: string;
  /** Current stage ID */
  currentStageId: string;
  /** Completed stage IDs */
  completedStageIds: readonly string[];
  /** Progress percentage */
  progressPercentage: number;
  /** Workflow steps */
  steps: readonly WorkflowStep[];
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Task creation input
 */
export interface CreateTaskInput {
  /** Matter ID */
  matterId: string;
  /** Task title */
  title: string;
  /** Task category */
  category: TaskCategory;
  /** Optional description */
  description?: string | undefined;
  /** Optional priority (defaults to NORMAL) */
  priority?: Priority | undefined;
  /** Optional due date */
  dueDate?: Date | undefined;
  /** Optional assignee */
  assignedTo?: string | undefined;
  /** Optional checklist items */
  checklist?: readonly string[] | undefined;
  /** Optional tags */
  tags?: readonly string[] | undefined;
  /** Whether billable */
  isBillable?: boolean | undefined;
}

/**
 * Task search criteria
 */
export interface TaskSearchCriteria {
  /** Filter by matter ID */
  matterId?: string | undefined;
  /** Filter by assigned user */
  assignedTo?: string | undefined;
  /** Filter by status */
  status?: TaskStatus | readonly TaskStatus[] | undefined;
  /** Filter by priority */
  priority?: Priority | readonly Priority[] | undefined;
  /** Filter by category */
  category?: TaskCategory | readonly TaskCategory[] | undefined;
  /** Filter by due date range */
  dueDateFrom?: Date | undefined;
  dueDateTo?: Date | undefined;
  /** Include completed tasks */
  includeCompleted?: boolean | undefined;
  /** Filter overdue only */
  overdueOnly?: boolean | undefined;
  /** Filter by tags */
  tags?: readonly string[] | undefined;
}
