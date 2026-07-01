import { ValuesDefinition } from '@app/database/entities';
import {
  Controller,
  Body,
  Get,
  Query,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ValueDefinitionsService } from './value-definitions.service';
import { Crud, CrudController } from '@dataui/crud';

import { ValueDefinitionsInput } from './value-definitions.model';
import { AllowedGroups } from '@app/auth/groups.guard';

@Crud({
  model: {
    type: ValuesDefinition,
  },
  routes: {
    getManyBase: {
      decorators: [AllowedGroups(['public'])],
    },
  },
})
@Controller({
  path: 'valueDefinitions',
})
export class ValueDefinitionsController
  implements CrudController<ValuesDefinition>
{
  constructor(public service: ValueDefinitionsService) {}

  @Get('byTypeAndName')
  @AllowedGroups(['public'])
  async getValueDefinitionByType(
    @Query('type') type: string,
    @Query('name') name?: string,
  ) {
    try {
      return await this.service.getValuesByTypeAndName(type, name);
    } catch (e) {
      console.log(
        '🚀 ~ file: value-definitions.controller.ts ~ getValueDefinitionByType ~ ValueDefinitionsController ~ error',
        e,
      );
      if (e.code === 'ValuesDefinitionNotFoundException')
        throw new HttpException(
          'Value Definition not found',
          HttpStatus.NOT_FOUND,
        );
    }
  }

  @Post('createWithTypeName')
  async createWithTypeName(@Body() data: ValueDefinitionsInput) {
    try {
      return await this.service.createValueWithTypeName(data);
    } catch (e) {
      console.log(
        '🚀 ~ file: value-definitions.controller.ts ~ createWithTypeName ~ ValueDefinitionsController ~ error',
        e,
      );
      throw new HttpException(
        'Error while creating Definition Value',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
