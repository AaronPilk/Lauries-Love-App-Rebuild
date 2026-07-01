import { Event, ValuesDefinition } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { CreateEventInput, CreateEventOutput } from './dto/create-event.dto';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class EventsService extends TypeOrmCrudService<Event> {
  constructor(
    @InjectRepository(Event) eventRepository: Repository<Event>,
    @InjectRepository(ValuesDefinition)
    private readonly valueRepository: Repository<ValuesDefinition>,
    private readonly userService: UsersService,
  ) {
    super(eventRepository);
  }

  async createEmailTrack(query: CreateEventInput): Promise<CreateEventOutput> {
    try {
      const valueDefinition = await this.valueRepository.findOne({
        where: {
          description: query.eventType,
        },
      });
      if (!valueDefinition) {
        throw Error('ValuesDefinition does not exist');
      }

      const event = await this.repo.findOne({
        where: {
          eventId: query.eventId,
          eventType: {
            id: valueDefinition.id,
          },
        },
      });

      if (event) {
        await this.repo.increment({ eventId: query.eventId }, 'counter', 1);
        return {
          ok: true,
          msg: 'Event updated',
        };
      }
      const user = await this.userService.findUserByCognitoId(query.cognitoId);
      if (!user) {
        throw Error('User does not exist');
      }
      await this.repo.save(
        this.repo.create({
          eventId: query.eventId,
          user,
          counter: 1,
          logTime: new Date(),
          eventType: valueDefinition,
        }),
      );
      return {
        ok: true,
        msg: 'Event created',
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          ok: false,
          msg: error.message,
        };
      }

      return {
        ok: false,
        msg: 'Something went wrong',
      };
    }
  }
}
