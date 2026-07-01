import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { DefinitionsType, ValuesDefinition } from '../entities';

export default class CreateDefinitionsTypes implements Seeder {
  definitionTypes: Partial<
    DefinitionsType & { items: Partial<ValuesDefinition>[] }
  >[] = [
    {
      definitionType: 'USER_DESIGNATION',
      description: 'Group of values for user designations',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'Warrior (patient)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'Caregiver',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '030',
          description: 'Friend',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '040',
          description: 'Family Member',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },
    {
      definitionType: 'USER_ROLE',
      description: 'Group of values for user roles',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '030',
          description: 'Super Admin',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'Admin',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '010',
          description: 'Basic',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '040',
          description: 'Guest',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },
    {
      definitionType: 'USER_STATUS',
      description: 'Group of values for user roles',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'Active',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'Draft',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '030',
          description: 'Invited',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '040',
          description: 'Deactive',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '050',
          description: 'Blocked',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '060',
          description: 'Archived',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },
    {
      definitionType: 'EVENT_TRACKER',
      description: 'Group of values for user events',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'EMAIL_OPEN',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'EMAIL_CTA_CLICKED',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '030',
          description: 'EMAIL_URL_CLICKED',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },
    {
      definitionType: 'DIAGNOSIS_TYPE',
      description: 'Group of values for user diagnosis types',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'Bile Duct Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'Bladder Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '030',
          description: 'Bone Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '040',
          description: 'Brain & Nervous System Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '050',
          description: 'Breast Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '060',
          description: 'Cancer of Unknown Primary (CUP)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '070',
          description: 'Cervical Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '080',
          description: 'CML (Leukemia - Chronic Myeloid)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '090',
          description: 'Colorectal (Bowel) Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '100',
          description: 'Esophageal Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '101',
          description: 'Eye Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '102',
          description: 'Kidney Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '103',
          description: 'Leukemia (CML, CLL, AML, ALL...)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '104',
          description: 'Liver Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '105',
          description: 'Lung Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '106',
          description: 'Lymphoma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '107',
          description: 'MDS',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '108',
          description: 'Melanoma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '109',
          description: 'Mesothelioma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '110',
          description: 'Multiple Myeloma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '111',
          description: 'Neuroendocrine Tumors (NET)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '112',
          description: 'Oral Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '113',
          description: 'Ovarian Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '114',
          description: 'Ovarian Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '115',
          description: 'Pancreatic Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '116',
          description: 'Prostate Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '117',
          description: 'Sarcoma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '118',
          description: 'Stomach Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '119',
          description: 'Testicular Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '120',
          description: 'Thymoma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '121',
          description: 'Thyroid Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '122',
          description: 'Uterine Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '123',
          description: 'Other',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '124',
          description: 'No Preference',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '125',
          description: 'Appendiceal Adenocarcinoma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '126',
          description: 'DCIS: Ductal Carcinoma in Situ',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },
    {
      definitionType: 'DIAGNOSIS_SUB_TYPE',
      description: 'Group of values for user diagnosis sub-types',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'Metastatic',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'Non Metastatic',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '030',
          description: 'Angiosarcoma',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '040',
          description: 'Ductal Sarcoma (DCIS)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '050',
          description: 'Ductal Sarcoma In Situ (DCIS)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '060',
          description: 'Inflammatory Breast Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '070',
          description: 'Invasive Ductal Carcinoma (IDC)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '080',
          description: 'Invasive Lobular Carcinoma (ILC)',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '090',
          description: 'Male Breast Cancer',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '100',
          description: 'Molecular Subtypes of the Breast',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '110',
          description: 'Paget Disease of the Nipple',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '120',
          description: 'Pyhllodes Tumor',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '130',
          description: 'Other',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '140',
          description: 'HER2 positive',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '150',
          description: 'Triple negative',
          creatorUserId: 'laurieslove-app',
        },
      ],
    },
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
      ],
    },
    {
      definitionType: 'PAYMENT_TYPES',
      description: 'Group of values for payments',
      creatorUserId: 'laurieslove-app',
      items: [
        {
          valueDefinition: '010',
          description: 'ONE_TIME',
          creatorUserId: 'laurieslove-app',
        },
        {
          valueDefinition: '020',
          description: 'RECURRING',
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
