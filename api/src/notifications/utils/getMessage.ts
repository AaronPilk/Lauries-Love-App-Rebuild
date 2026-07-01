import { User } from '@app/database/entities';
import { Notification } from 'firebase-admin/lib/messaging';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';
import { NotificationDTO } from '../dto/response/notification.dto';

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

interface GetMessageInput {
  type: string;
  sender?: User;
  content: string;
  notificationType?: string;
  meta?: { id?: string };
}

export async function getMessage({
  type,
  sender,
  content,
  notificationType,
  meta
}: GetMessageInput): Promise<Notification> {
  Logger.log('getMessage', { type, sender, content, meta });
  let imageUrl = '';
  switch (type) {
    case 'NEW_MESSAGE': {
      Logger.log('NEW_MESSAGE', {
        title: `New comment from ${sender.displayName}`,
        body: content
      });

      const _input = notificationType === 'comment' ? 'comment' : 'message';
      return {
        title: `New ${_input} from ${sender.displayName}`,
        body: content,
      };
    }
    case 'NEW_FRIEND_REQUEST':
      if (sender.profilePicture) {
        const listCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: 'public/' + sender.profilePicture,
        });
        imageUrl = await getSignedUrl(s3, listCommand);
      }

      return {
        title: `New Friend request from ${sender.displayName}`,
        body: content,
        ...(imageUrl && { imageUrl }),
      };
    case 'NEW_LIKE':
      // if (sender.profilePicture) {
      //   const listCommand = new GetObjectCommand({
      //     Bucket: process.env.AWS_S3_BUCKET,
      //     Key: 'public/' + sender.profilePicture,
      //   });
      //   imageUrl = await getSignedUrl(s3, listCommand);
      // }

      Logger.log('NEW_LIKE', {
        title: `${sender.displayName} liked your ${notificationType}`,
        body: content,
        ...(imageUrl && { imageUrl }),
      });
      return {
        title: `${sender.displayName} liked your ${notificationType}`,
        body: content,
        ...(imageUrl && { imageUrl })
      };
    default:
      return {
        title: '',
        body: '',
      };
  }
}
