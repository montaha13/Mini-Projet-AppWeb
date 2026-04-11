import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // CORRECTED: Return exact 401 response format with service name
    if (err || !user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
        service: 'user-service', // CORRECTED: Service name in response
      });
    }
    return user;
  }
}
