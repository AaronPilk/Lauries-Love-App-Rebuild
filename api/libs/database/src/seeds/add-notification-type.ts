import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { DefinitionsType, ValuesDefinition } from '../entities';

export default class AddNotificationTypes implements Seeder {
  definitionTypes: Partial<
    DefinitionsType & { items: Partial<ValuesDefinition>[] }
  >[] = [
    {
      definitionType: 'USER_NOTIFICATIONS',
      description: 'Group of values for user notifications',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'NEW_MESSAGE',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'NEW_FRIEND_REQUEST',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '030',
          description: 'NEW_LIKE',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },

  ];

  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    try {
      const definitionRepository = dataSource.getRepository(DefinitionsType);
      const valueRepository = dataSource.getRepository(ValuesDefinition);
      const definitions = await definitionRepository.find({
        where: this.definitionTypes.map(({ definitionType }) => ({
          definitionType,
        })),
      });

      const notFound = this.definitionTypes.filter(
        (elem) =>
          !definitions.find(
            ({ definitionType }) => elem.definitionType === definitionType,
          ),
      );

      if (notFound.length > 0) {
        for (const { items, ...def } of notFound) {
          const newDef = await definitionRepository.save(
            definitionRepository.create(def),
          );

          for (const value of items) {
            await valueRepository.save(
              valueRepository.create({
                ...value,
                definitionType: newDef,
              }),
            );
          }
        }
      }

      for (const def of definitions) {
        const currentDef = this.definitionTypes.find(
          (item) => item.definitionType === def.definitionType,
        );

        const values = await valueRepository.find({
          where: currentDef.items?.map(({ description }) => ({
            description,
          })),
        });
        const notFoundValues = currentDef.items?.filter(
          (elem) =>
            !values.find(({ description }) => elem.description === description),
        );
        if (notFoundValues.length > 0) {
          for (const value of notFoundValues) {
            await valueRepository.save(
              valueRepository.create({ ...value, definitionType: def }),
            );
          }
        }
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.error('There is no need to create the definition type');
      } else {
        throw new Error(error.message);
      }
    }
  }
}
