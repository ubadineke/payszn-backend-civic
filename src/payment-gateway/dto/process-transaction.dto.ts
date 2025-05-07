import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessTransactionDto {
  @IsString()
  @IsNotEmpty()
  signature: string;

  @IsString()
  @IsNotEmpty()
  expectedReceiver: string;
}
