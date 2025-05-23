import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CivicService } from './civic.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { PublicKey } from '@solana/web3.js';

@Injectable()
export class CivicAuthGuard implements CanActivate {
  constructor(
    private civicService: CivicService,
    private userService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const { wallet } = request.query;

    if (!wallet) {
      throw new UnauthorizedException('Provide user wallet address');
    }

    //Check if wallet is a valid solana address
    let validWallet: boolean;
    try {
      validWallet = PublicKey.isOnCurve(new PublicKey(wallet).toBytes());
    } catch (err) {
      validWallet = false;
    }

    if (!validWallet) {
      throw new UnauthorizedException('Wallet is not a valid solana address');
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    console.log('inside here');
    try {
      // Verify the token
      const verifiedToken = await this.civicService.verifyIdToken(token);

      // Get additional user data if needed
      const { name, email } = verifiedToken;
      console.log({ Name: name, Email: email, Wallet: wallet });

      // Fetch or Create User on DB
      const user = await this.userService.findOrCreateUser(
        email,
        name,
        wallet as string,
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
