import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ApiKeyService } from 'src/api-key/api-key.service';
import { ApiKey } from 'src/api-key/entities/api-key.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }),
    TypeOrmModule.forFeature([ApiKey, User, Transaction]),
  ],
  controllers: [PaymentGatewayController],
  providers: [
    JwtService,
    TransactionsService,
    UsersService,
    ApiKeyService,
    PaymentGatewayService,
  ],
})
export class PaymentGatewayModule {}
