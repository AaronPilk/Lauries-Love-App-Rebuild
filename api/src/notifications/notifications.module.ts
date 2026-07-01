import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Notification,
  NotificationChange,
  NotificationObject,
  ValuesDefinition,
} from '@app/database/entities';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Notification,
      ValuesDefinition,
      NotificationChange,
      NotificationObject,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
