import {
  Controller,
  Post,
  Query,
  Req,
  Get,
  Body,
  UsePipes,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { ApiKeyGuard } from 'src/auth/apiKey.guard';
import { ApiKeyService } from 'src/api-key/api-key.service';
import { VerifyApiKeyDto } from './dto/verify-api-key.dto';

@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @UseGuards(ApiKeyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('process')
  async processTransaction(@Body() input: ProcessTransactionDto, @Req() req) {
    return this.paymentGatewayService.processTransaction(
      input.signature,
      input.expectedReceiver,
    );
  }

  @Get('verify')
  async verifyApiKey(@Query(ValidationPipe) input: VerifyApiKeyDto) {
    return this.apiKeyService.verifyApiKey(input.api_key);
  }

  @Get('/wallet')
  async fetchUserWalletByKey(@Query(ValidationPipe) input: VerifyApiKeyDto) {
    return this.apiKeyService.fetchUserWalletByKey(input.api_key);
  }
}
