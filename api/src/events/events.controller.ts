import { Controller, Get, Query } from '@nestjs/common';
import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Event } from '@app/database/entities';
import { EventsService } from './events.service';
import { CreateEventInput } from './dto/create-event.dto';

@Crud({
  model: {
    type: Event,
  },
  query: {
    alwaysPaginate: false,
    join: {
      state: { eager: false },
      type: { eager: false },
      role: { eager: true },
      entity: { eager: false },
    },
  },
})
@CrudAuth({})
@Controller('event')
export class EventsController implements CrudController<Event> {
  constructor(public service: EventsService) {}
  get base(): CrudController<Event> {
    return this;
  }

  @Get('email-track/:eventId')
  async emailTrack(@Query() query: CreateEventInput) {
    return this.service.createEmailTrack(query);
  }
}
