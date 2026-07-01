import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Notification } from '@app/database/entities';
import { NotificationsService } from './notification.service';
import { CreateNotificationInput } from './dto/create-notification.dto';
import { AllowedGroups } from '@app/auth/groups.guard';
import { CognitoPayload } from '@app/auth/interfaces';
import { SendPushNotificationDto } from './dto/send-push-notification.dto';
import { AuthUser } from '@app/auth/auth-user.decorator';

@Crud({
  model: {
    type: Notification,
  },
  routes: {
    getManyBase: {
      decorators: [AllowedGroups(['user'])],
    },
  },
  query: {
    alwaysPaginate: true,
    limit: 100,
    join: {
      notifier: {
        alias: 'notificationNotifier',
        eager: true,
        exclude: ['id'],
      },
      notificationObject: {
        alias: 'notificationObject',
        eager: true,
        exclude: ['id'],
      },
      'notificationObject.entityType': {
        eager: true,
        alias: 'notificationObjectEntityType',
        exclude: ['id'],
      },
      'notificationObject.notificationChange': {
        eager: true,
        alias: 'notificationNotificationChange',
        exclude: ['id'],
      },
      'notificationObject.notificationChange.actor': {
        eager: true,
        alias: 'notificationNotificationChangeActor',
        exclude: ['id'],
      },
    },
    sort: [
      {
        field: 'createdAt',
        order: 'DESC',
      },
    ],
    filter: [
      {
        field: 'active',
        operator: '$eq',
        value: true,
      },
    ],
  },
})
@CrudAuth({
  property: 'user',
  filter: (user: CognitoPayload) => ({
    'notificationNotifier.cognitoId': user.sub,
  }),
})
@Controller('notifications')
export class NotificationsController implements CrudController<Notification> {
  constructor(public service: NotificationsService) {}

  get base(): CrudController<Notification> {
    return this;
  }

  @Post()
  @UsePipes(
      new ValidationPipe({
        transform: true,
      }),
    )
  async createNotification(@Body() input: CreateNotificationInput) {
    return this.service.createNotification(input);
  }

  @Post('send-push-notification')
  @AllowedGroups(['user'])
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async sendPushNotification(@Body() input: SendPushNotificationDto, @AuthUser() user: CognitoPayload) {
    return this.service.sendPushNotification(input, user.sub);
  }
}
