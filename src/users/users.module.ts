import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
// import { PrivyService } from 'src/auth/privy.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { ApiKeyService } from 'src/api-key/api-key.service';
import { ApiKey } from 'src/api-key/entities/api-key.entity';
import { CivicService } from 'src/auth/civic.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey, Transaction, User])],
  controllers: [UsersController],
  providers: [
    CivicService,
    TransactionsService,
    UsersService,
    ApiKeyService,
    JwtService,
    AuthService,
  ],
})
export class UsersModule {}
