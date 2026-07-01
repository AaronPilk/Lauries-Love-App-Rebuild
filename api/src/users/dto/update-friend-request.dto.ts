import { IsEnum } from 'class-validator';
import { FriendRequestStatus, friendRequestStatuses } from 'src/common/enums/friend-request-status.enum';

export class UpdateFriendRequestDto {
  @IsEnum(friendRequestStatuses, {
    message: `status must be one of the following values: ${friendRequestStatuses.join(', ')}`,
  })
  status: FriendRequestStatus
}
