import {
  Controller,
  Get,
  Req,
  Post,
  UseGuards,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { PrivyAuthGuard } from './privy.guard';
import { CivicAuthGuard } from './civic.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(CivicAuthGuard)
  @Post('login')
  login(@Req() req) {
    return { message: 'Logged in successfully', user: req.user };
  }
}
