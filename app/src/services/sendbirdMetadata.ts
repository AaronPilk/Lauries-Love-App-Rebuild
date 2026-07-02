import { SendbirdChatSDK } from '@sendbird/uikit-utils';
import { BaseMessageSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// This function sets metadata for a group channel in Sendbird
// path: /src/main/screens/HomeTab/components/PostHomeTab/PostHomeTab.tsx
export async function setMetadata(
  sdk: SendbirdChatSDK,
  comments: Record<string, BaseMessageSendBirdType[]>,
  channelUrl: string,
) {
  const messages = comments[channelUrl];

    // console.log('channelUrl', channelUrl);

  if (messages && messages[0]) {
    try {
      const channel = await sdk.groupChannel.getChannel(channelUrl);

      await channel.join();

      const existingData = JSON.parse(channel.data || '{}');
      const reactions = messages[0].reactions;
      let sampledUserIds: string[] = [];
      
      if (Array.isArray(reactions) && reactions.length > 0) {
        // You can either combine all user IDs or pick specific ones
        sampledUserIds = reactions.flatMap(
          reaction => reaction._sampledUserIds || [],
        );
      }
      // console.log('existingData', existingData);
      // console.log('reactions', sampledUserIds);
      const updatedData = {
        ...existingData,
        firstMessage: messages[0].message,
        commentQty: messages.length -1,
        likes: sampledUserIds,
      };

      await channel.updateChannel({
        data: JSON.stringify(updatedData),
      });
    } catch (error) {
      console.log('Error setting metadata:', error);
    }
  }
}
