import { Module } from '@nestjs/common';
import { DefinitionTypesService } from './definition-types.service';
import { DatabaseModule } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefinitionsType } from '@app/database/entities';
import { DefinitionTypesController } from './definition-types.controller';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([DefinitionsType])],
  providers: [DefinitionTypesService],
  controllers: [DefinitionTypesController],
  exports: [DefinitionTypesService],
})
export class DefinitionTypesModule {}
