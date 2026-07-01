import { CoreOutput } from '@app/database/dto';
import { IsEnum, IsOptional, IsString, IsUUID, Validate, ValidateIf, ValidateNested } from 'class-validator';
import { each } from 'lodash';
import { NotificationTypes, notificationTypes } from 'src/common/enums/notification-types.enum';

export class CreateNotificationInput {
  @IsString()
  entityType: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  redirect?: string;

  @IsUUID()
  notifierId: string;

  @IsUUID()
  senderId: string;

  @ValidateIf((o) => o.entityType === 'NEW_LIKE')
  @IsEnum(notificationTypes, { message: `type must be one of the following values: ${notificationTypes.join(', ')}` })
  type?: NotificationTypes;

  @IsOptional()
  @ValidateNested({ each: true })
  meta?: {
    id?: string;
    commentId?: string;
    redirectUrl?: string;
  }
}

export class CreateNotificationOutput extends CoreOutput {
  meta?: {
    id?: string;
    commentId?: string;
    entityType?: string;
    type?: string;
    redirectUrl?: string;
  };
}
