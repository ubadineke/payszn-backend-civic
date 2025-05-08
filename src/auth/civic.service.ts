import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import Request from 'express';

// interface RequestWithCookies extends Request {
//   cookies: {
//     [key: string]: string;
//   };
// }

@Injectable()
export class CivicService {
  async verifyIdToken(token: any) {
    // Issue: TypeScript annotation in JS
    // console.log('token', token);

    // Use eval to ensure TypeScript doesn't transform this into require()
    // This is a workaround to force a true dynamic import
    // @ts-ignore
    const jose = await eval('import("jose")');
    const JWKS = jose.createRemoteJWKSet(
      new URL('https://auth.civic.com/oauth/jwks'),
    );

    try {
      const { payload } = await jose.jwtVerify(token, JWKS, {
        algorithms: ['RS256'], // Civic uses RS256
      });
      return payload; // Contains claims like sub, name, email, wallet address
    } catch (error) {
      console.log(error);
      throw new Error('Invalid or expired token');
    }
  }
}
