import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/database/entities';
import { UsersModule } from './users/users.module';
import { ValueDefinitionsModule } from './value-definitions/value-definitions.module';
import { DefinitionTypesModule } from './definition-types/definition-types.module';
import { AuthModule } from '@app/auth';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { GlobalFilter } from './common/filter/error-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    UsersModule,
    ValueDefinitionsModule,
    DefinitionTypesModule,
    AuthModule,
    EventsModule,
    NotificationsModule,
    PaymentsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
  ],
})
export class AppModule {}
