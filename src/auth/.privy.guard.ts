import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrivyService } from './privy.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PrivyAuthGuard implements CanActivate {
  constructor(
    private privyService: PrivyService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify the token
      const verifiedToken = await this.privyService.verifyToken(token);

      // Get additional user data if needed
      // const userData = await this.privyService.getUserData(request);
      const userData = await this.privyService.getUserDataV2(
        verifiedToken.userId,
      );

      //Fetch or Create User on DB
      const email = (userData.linkedAccounts[0] as any).email;
      const name = (userData.linkedAccounts[0] as any).name;
      const wallet = userData.wallet?.address;
      const privyId = userData.id;
      const user = await this.userService.findOrCreateUser(
        email,
        name,
        wallet as string,
        privyId,
      );

      // Add both token payload and user data to request
      request.user = user;

      return true;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
