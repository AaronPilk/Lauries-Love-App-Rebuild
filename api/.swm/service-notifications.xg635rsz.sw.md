---
title: '[Service] Notifications'
---
Create new Notification

\[POST\] /notifications

```typescript
async createNotification(
    input: CreateNotificationInput,
  ): Promise<CreateNotificationOutput> {
    try {
      const { senderId, notifierId } = input;
      const users = await this.userService.find({
        where: [
          { id: In([senderId, notifierId]) }, 
          { cognitoId: In([senderId, notifierId]) }],
      });

      Logger.log({users});
      const sender = users.find((user) => user.id === senderId || user.cognitoId === senderId);
      const notifier = users.find((user) => user.id === notifierId || user.cognitoId === notifierId);
      if (!sender) {
        throw Error('Sender Not found!');
      }
      if (!notifier) {
        throw Error('Notifier Not found!');
      }
      const entityType = await this.valueRepository.findOne({
        where: {
          description: input.entityType,
        },
      });

      if (!entityType) {
        throw Error('ValuesDefinition does not exist');
      }

      Logger.log('entityType: ', {entityType});
      const notification = this.notificationRepository.create({
        notifier,
      });
      const notificationChange = this.notificationChangeRepository.create({
        actor: sender,
      });
      const notificationObject = this.notificationObjectRepository.create({
        entityType,
        entity: String(senderId),
        content: input?.content,
        redirect: input?.meta?.redirectUrl ?? null,
      });

      notificationChange.notificationObject = notificationObject;
      notificationObject.notificationChange = notificationChange;

      notification.notificationObject = notificationObject;
      notificationObject.notification = notification;

      try {
        await this.notificationChangeRepository.save(notificationChange);
        Logger.log('notificationChange saved');
      } catch (error) {
        Logger.error('error: ' + error.message);
        throw new BadRequestException(error.message);
      }

      try {
        await this.notificationObjectRepository.save(notificationObject);
        Logger.log('notificationObject saved');
      } catch (error) {
        Logger.error('error: ' + error.message);
        throw new BadRequestException(error.message);
      }

      try {
        await this.notificationRepository.save(notification);
        Logger.log('notification saved');
      } catch (error) {
        Logger.error('error: ' + error.message);
        throw new BadRequestException(error.message);
      }

      if (notifier?.config.notifications?.active) {
        Logger.log('Sending push notification', {
          notiification: {
            sender,
            type: entityType.description,
            content: input?.content ?? null,
          }
        });
        await firebase.messaging().send({
          notification: await getMessage({
            sender,
            type: entityType.description,
            content: input.content,
            notificationType: input.type,
          }),
          token: notifier.config.notifications.notificationToken,
          android: { priority: 'high' },
        });
      }
      return {
        ok: true,
        msg: 'Successfully created!',
        meta: {
          id: input?.meta?.id,
          commentId: input.meta?.commentId,
          entityType: entityType.description,
          type: input.type,
          redirectUrl: input.meta?.redirectUrl,
          },
      };
    } catch (error) {
      Logger.error('error: ', JSON.stringify(error));
      return {
        ok: false,
        msg: error.message,
      };
    }
  }
```

Sample payload for FRIEND REQUEST

```postman_json
{
    "entityType": "NEW_FRIEND_REQUEST",
    "content": "this is a test2",
    "redirect": "bla bla bla",
    "notifierId": "e96e3d90-f845-4d6e-9677-eed0f4413bc5",
    "senderId": "a88ead42-a13c-45dc-8fc5-20f2cfc9455b"
}
```

NEW LIKE

```postman_json
{
    "entityType": "NEW_LIkE",
    "notifierId": "b11fb6d9-bf7a-44f4-b9ac-dabf5deff742",
    "senderId": "6d9c19d1-682f-4c90-a101-7e0227acddb2",
    "type": "post",
    "content": "this is a new message",
    "meta": {
        "id": "postId",
         "redirectUrl": "sendbird/postId/commentId"
    }
}
```

NEW MESSAGE IN CHAT

```postman_json
{
    "entityType": "NEW_MESSAGE",
    "notifierId": "24b793ca-f297-4ce0-b4a3-cd532db9e873",
    "senderId": "6d9c19d1-682f-4c90-a101-7e0227acddb2",
    "type": "post",
    "content": "sacate esos tatuajes tumberos que tenes",
    "meta": {
        "id": "chatId",
        "redirectUrl": "sendbird/postId/commentId"
    }
}
```

NEW COMMENTS ON POST

```postman_json
{
    "entityType": "NEW_MESSAGE",
    "notifierId": "24b793ca-f297-4ce0-b4a3-cd532db9e873",
    "senderId": "6d9c19d1-682f-4c90-a101-7e0227acddb2",
    "type": "comment",
    "content": "tumba",
    "meta": {
        "id": "chatId",
        "redirectUrl": "sendbird/postId/commentId"
    }
}
```

\[POST\] Send Push Notifications\
/notifications/send-push-notification

```typescript
async sendPushNotification(sendPushNotificationDto: SendPushNotificationDto, cognitoId: string) {
    const sender = await this.userService.findOne({
      where: {
        cognitoId,
      },
    });
    try {
      const { notifierIds } = sendPushNotificationDto;
      const users = await this.userService.find({
        where: {
          id: In([...notifierIds]),
        },
      });
      if (!sender) {
        throw Error('Not founded sender!');
      }
      const notifiers = users.filter((user) => notifierIds.includes(user.id));
      if (!notifiers.length) {
        throw Error('Notifiers not found');
      }

      const notification = await getMessage({
        sender,
        type: 'NEW_MESSAGE',
        content: sendPushNotificationDto.content,
      });

      await Promise.all(
        notifiers.map(async (notifier) => {
          if (notifier.config.notifications?.active) {
            Logger.log('Sending push notification', {
              notification,
              token: notifier.config.notifications.notificationToken,
              android: { priority: 'high' },
              data: {
                redirect: sendPushNotificationDto.redirect,
              }
            });
            await firebase.messaging().send({
              notification,
              token: notifier.config.notifications.notificationToken,
              android: { priority: 'high' },
              data: {
                redirect: sendPushNotificationDto.redirect,

              }
            });
          }
        }),
      );

      return {
        ok: true,
        msg: 'Successfully sent!',
        meta: {
          redirect: sendPushNotificationDto.redirect,
        }
      };
    } catch (error) {
      return {
        ok: false,
        msg: error.message,
      };
    }
  }
```

Sample Payload

```postman_json
{
    "content": "felino",
    "redirect": "https://jhsjhasjkdhkjas",
    "notifierIds": ["85d89239-3b81-4dc7-b10f-579ef24b8493"]
}
```

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBbGF1cmllc2xvdmUtYXBpJTNBJTNBTGF1cmllLXMtTG92ZQ==" repo-name="laurieslove-api"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
