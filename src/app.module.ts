import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersService } from './users/users.service';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { TransactionsModule } from './transactions/transactions.module';
import { JwtService } from '@nestjs/jwt';
import { TransactionsService } from './transactions/transactions.service';
import { Transaction } from './transactions/entities/transaction.entity';
import { ApiKeyModule } from './api-key/api-key.module';
import { ApiKeyService } from './api-key/api-key.service';
import { ApiKey } from './api-key/entities/api-key.entity';
import { CivicService } from './auth/civic.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey, Transaction]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }) as any,
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([User]),
    PaymentGatewayModule,
    TransactionsModule,
    ApiKeyModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    CivicService,
    UsersService,
    TransactionsService,
    JwtService,
    ApiKeyService,
    AuthService,
    ConfigService,
    AppService,
  ],
})
export class AppModule {}
