import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

export const AllowedGroups = (groups: string[]) =>
  SetMetadata('groups', groups);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private groups = [];
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    this.groups = this.reflector.get<string[]>('groups', context.getHandler());
    if (this.groups && this.groups.includes('public')) return true;
    const superActivated = super.canActivate(context);
    return superActivated;
  }

  handleRequest(err, user, info) {
    this.groups = this.groups ? this.groups : [];
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (this.groups.length > 0 && this.groups?.includes('user')) {
      return user;
    }
    if (
      this.groups.length > 0 &&
      user['cognito:groups'] &&
      !user['cognito:groups'].some((item) => this.groups.includes(item))
    ) {
      throw err || new ForbiddenException();
    }
    return user;
  }
}
