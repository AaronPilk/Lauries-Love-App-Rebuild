import { Module } from '@nestjs/common';
import { ValueDefinitionsService } from './value-definitions.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValuesDefinition } from '@app/database/entities';
import { ValueDefinitionsController } from './value-definitions.controller';
import { DefinitionTypesModule } from 'src/definition-types/definition-types.module';

@Module({
  imports: [
    DatabaseModule,
    DefinitionTypesModule,
    TypeOrmModule.forFeature([ValuesDefinition]),
  ],
  providers: [ValueDefinitionsService],
  controllers: [ValueDefinitionsController],
})
export class ValueDefinitionsModule {}
