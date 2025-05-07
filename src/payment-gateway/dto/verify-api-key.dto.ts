import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyApiKeyDto {
  @IsString()
  @IsNotEmpty()
  api_key: string;
}
