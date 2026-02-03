import { SetMetadata } from '@nestjs/common';
import { ABAC_POLICY_KEY, AbacPolicyMetadata } from './abac.guard';

/**
 * Decorator to attach ABAC policy metadata to a route handler
 *
 * @example
 * ```typescript
 * @AbacPolicy({ action: 'read', resourceType: 'matter' })
 * @Get(':id')
 * getMatter(@Param('id') id: string) { ... }
 *
 * @AbacPolicy({
 *   action: 'update',
 *   resourceType: 'document',
 *   getResource: (req) => ({
 *     id: req.params.id,
 *     confidentialityLevel: req.body.confidentialityLevel,
 *   }),
 * })
 * @Patch(':id')
 * updateDocument() { ... }
 * ```
 */
export const AbacPolicy = (metadata: AbacPolicyMetadata) =>
  SetMetadata(ABAC_POLICY_KEY, metadata);
