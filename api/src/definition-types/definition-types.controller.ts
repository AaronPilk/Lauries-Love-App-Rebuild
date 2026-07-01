import { DefinitionsType } from '@app/database/entities';
import { Controller } from '@nestjs/common';
import { DefinitionTypesService } from './definition-types.service';
import { Crud, CrudController } from '@dataui/crud';
import { AllowedGroups } from '@app/auth/groups.guard';

@Crud({
  model: {
    type: DefinitionsType,
  },
  routes: {
    getManyBase: {
      decorators: [AllowedGroups(['public'])],
    },
  },
})
@Controller({
  path: 'definitionTypes',
})
export class DefinitionTypesController
  implements CrudController<DefinitionsType>
{
  constructor(public service: DefinitionTypesService) {}
}
