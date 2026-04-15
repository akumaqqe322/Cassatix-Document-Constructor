import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // If no roles are required, we still want to resolve the user if the header is present
      // but we don't block access if it's missing or invalid
      const request = context.switchToHttp().getRequest();
      const rawUserId = request.headers['x-user-id'];
      const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
      
      if (userId) {
        try {
          const user = await this.prisma.user.findFirst({
            where: userId.includes('@') ? { email: userId } : { id: userId },
            include: { role: true },
          });
          if (user) {
            request.user = user;
          }
        } catch (e) {
          // Ignore errors for optional user resolution
        }
      }
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const rawUserId = request.headers['x-user-id'];
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      throw new UnauthorizedException('User ID header missing');
    }

    // Support both UUID and email for mock auth stability
    const user = await this.prisma.user.findFirst({
      where: userId.includes('@') ? { email: userId } : { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(`User not found: ${userId}`);
    }

    // Attach user to request for use in controllers if needed
    request.user = user;

    if (!user.role || !user.role.code) {
      throw new ForbiddenException('User has no assigned role');
    }

    const hasRole = requiredRoles.includes(user.role.code);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
