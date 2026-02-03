export { AbacService } from './abac.service';
export { AbacGuard, ABAC_POLICY_KEY } from './abac.guard';
export { AbacPolicy } from './abac.decorator';
export type { AbacPolicyMetadata } from './abac.guard';
export {
  type PolicyContext,
  type PolicyDecision,
  type SubjectAttributes,
  type ResourceAttributes,
  type EnvironmentAttributes,
  type Action,
  type ResourceType,
  PolicyEffect,
} from './abac.types';
