import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import {
  Event,
  ValuesDefinition,
  DefinitionsType,
  User,
} from '@app/database/entities';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Event, ValuesDefinition, DefinitionsType, User]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
