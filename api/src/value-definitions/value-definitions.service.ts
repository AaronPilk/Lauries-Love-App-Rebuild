import { ValuesDefinition } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Repository } from 'typeorm';

import { DefinitionTypesService } from 'src/definition-types/definition-types.service';
import { ValueDefinitionsInput } from './value-definitions.model';

@Injectable()
export class ValueDefinitionsService extends TypeOrmCrudService<ValuesDefinition> {
  constructor(
    @InjectRepository(ValuesDefinition) repo: Repository<ValuesDefinition>,
    private definitionTypesService: DefinitionTypesService,
  ) {
    super(repo);
  }

  async getValuesByTypeAndName(type: string, name?: string) {
    const definitionType = await this.definitionTypesService.findOne({
      where: { definitionType: type },
    });

    if (definitionType) {
      const valueDefinitions = await this.repo.findBy({
        valueDefinition: name,
        definitionType: {
          id: definitionType.id,
        },
      });

      return valueDefinitions;
    }
  }

  async createValueWithTypeName(
    data: ValueDefinitionsInput,
  ): Promise<ValuesDefinition | null> {
    const definitionType = await this.definitionTypesService.findOne({
      where: { definitionType: data.valueDefinition },
    });

    if (definitionType) {
      const result = new ValuesDefinition();
      result.valueDefinition = data.definitionType;
      result.description = data.description;
      result.definitionType = definitionType;

      await this.repo.manager.save(result);
      return result;
    }

    return null;
  }
}
