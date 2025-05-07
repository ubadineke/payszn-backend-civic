import { ValidateIf, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ValidateIf((o) => !o.callbackUrl) // Requires at least one
  @IsUrl()
  webhookUrl?: string;

  @ValidateIf((o) => !o.webhookUrl) // Requires at least one
  @IsUrl()
  callbackUrl?: string;
}

export class AllowedUserUpdateDto {
  apiKey?: string;
  webhookUrl?: string;
  callbackUrl?: string;
}
