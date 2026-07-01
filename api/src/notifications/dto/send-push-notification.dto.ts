import { CoreOutput } from '@app/database/dto';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendPushNotificationDto {
  @IsOptional()
  @IsString()
  content?: string;
  @IsOptional()
  @IsString()
  redirect?: string;
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  notifierIds: string[];
}

export class SendPushNotificationOutput extends CoreOutput {}
