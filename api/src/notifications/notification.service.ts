import * as firebase from 'firebase-admin';

import {
  Notification,
  NotificationChange,
  NotificationObject,
  ValuesDefinition,
} from '@app/database/entities';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Repository, In } from 'typeorm';
import {
  CreateNotificationInput,
  CreateNotificationOutput,
} from './dto/create-notification.dto';
import { UsersService } from 'src/users/users.service';
import { getMessage } from './utils/getMessage';
import { SendPushNotificationDto } from './dto/send-push-notification.dto';
import { MetricsStatus } from '@aws-sdk/client-s3';

@Injectable()
export class NotificationsService extends TypeOrmCrudService<Notification> {
  constructor(
    @InjectRepository(Notification)
    readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationObject)
    readonly notificationObjectRepository: Repository<NotificationObject>,
    @InjectRepository(NotificationChange)
    readonly notificationChangeRepository: Repository<NotificationChange>,
    @InjectRepository(ValuesDefinition)
    private readonly valueRepository: Repository<ValuesDefinition>,
    private readonly userService: UsersService,
  ) {
    super(notificationRepository);
  }

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
}
