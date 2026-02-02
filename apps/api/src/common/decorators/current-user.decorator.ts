import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, AuthenticatedRequest } from '@common/interfaces';

/**
 * Extracts the current authenticated user from the request
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 *
 * // Extract specific property
 * @Get('my-id')
 * getMyId(@CurrentUser('sub') userId: string) {
 *   return userId;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
