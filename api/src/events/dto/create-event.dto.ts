import { CoreOutput } from '@app/database/dto';
import { IsString } from 'class-validator';

export class CreateEventInput {
  @IsString()
  eventType: string;

  @IsString()
  cognitoId: string;

  @IsString()
  eventId: string;
}
export class CreateEventOutput extends CoreOutput {}
