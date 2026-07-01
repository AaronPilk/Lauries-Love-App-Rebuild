import { DefinitionsType } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DefinitionTypesService extends TypeOrmCrudService<DefinitionsType> {
  constructor(
    @InjectRepository(DefinitionsType) public repo: Repository<DefinitionsType>,
  ) {
    super(repo);
  }
}
