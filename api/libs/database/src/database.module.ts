import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DatabaseService } from './database.service';
import {
  User,
  Event,
  DefinitionsType,
  ValuesDefinition,
  Notification,
  NotificationChange,
  NotificationObject,
} from './entities';
import { FriendRequest } from './entities/friend-request.entity';

export const ENTITIES: any[] = [
  User,
  FriendRequest,
  Event,
  DefinitionsType,
  ValuesDefinition,
  Notification,
  NotificationChange,
  NotificationObject,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        //timezone: '+00:00', //UTC
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
        logging: ['error'],
        entities: ENTITIES,
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
