import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationChange, NotificationObject, User, ValuesDefinition, Notification } from '@app/database/entities';
import { FriendRequest } from '@app/database/entities/friend-request.entity';
import { SendBirdService } from 'src/service/sendbird/sendbird.service';
import { HttpModule } from '@nestjs/axios';
import { S3Service } from 'src/service/aws/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, ValuesDefinition, FriendRequest, Notification, NotificationObject, NotificationChange]), HttpModule],
  controllers: [UsersController],
  providers: [UsersService, SendBirdService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
