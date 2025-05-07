import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/server-auth';
import Request from 'express';

interface RequestWithCookies extends Request {
  cookies: {
    [key: string]: string;
  };
}

@Injectable()
export class PrivyService {
  private privyClient: PrivyClient;

  constructor(private configService: ConfigService) {
    this.privyClient = new PrivyClient(
      this.configService.get<string>('PRIVY_APP_ID') as string,
      this.configService.get<string>('PRIVY_APP_SECRET') as string,
    );
  }
  async verifyToken(token: string): Promise<any> {
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }
    try {
      // const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
      // const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
      // const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);
      // console.log(client);
      // const claims = await client.verifyAuthToken(token);
      // console.log('claims', claims);

      // Verify the JWT token using Privy's server SDK
      // console.log('incoming token', token);
      // console.log(this.privyClient);
      const verifiedToken = await this.privyClient.verifyAuthToken(token);
      return verifiedToken;
    } catch (error) {
      throw new Error(`Failed to verify Privy token: ${error.message}`);
    }
  }

  async getUserData(req: RequestWithCookies): Promise<any> {
    const idToken = req.cookies?.['privy-id-token']; // Retrieve token from cookies

    if (!idToken) {
      throw new UnauthorizedException('No Privy identity token found');
    }

    try {
      // Get user details from Privy
      return await this.privyClient.getUser({ idToken });
    } catch (error) {
      throw new Error(`Failed to get user from Privy: ${error.message}`);
    }
  }
  async getUserDataV2(userId: string) {
    try {
      return await this.privyClient.getUser(userId);
    } catch (error) {
      throw new Error(`Failed to get user from Privy 2: ${error.message}`);
    }
  }
}
