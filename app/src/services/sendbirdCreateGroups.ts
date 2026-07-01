import { SendbirdChatSDK } from '@sendbird/uikit-utils';

const groupNames = [
  'Appendiceal Adenocarcinoma',
  'Bile Duct Cancer',
  'Bladder Cancer',
  'Bone Cancer',
  'Brain & Nervous System Cancer',
  'Breast Cancer',
  'Cancer of Unknown Primary (CUP)',
  'Cervical Cancer',
  'CML (Leukemia - Chronic Myeloid)',
  'Colorectal (Bowel) Cancer',
  'Esophageal Cancer',
  'Eye Cancer',
  'Kidney Cancer',
  'Leukemia (CML, CLL, AML, ALL...)',
  'Liver Cancer',
  'Lung Cancer',
  'Lymphoma',
  'MDS',
  'Melanoma',
  'Mesothelioma',
  'Multiple Myeloma',
  'Neuroendocrine Tumors (NET)',
  'Oral Cancer',
  'Ovarian Cancer',
  'Pancreatic Cancer',
  'Prostate Cancer',
  'Sarcoma',
  'Stomach Cancer',
  'Testicular Cancer',
  'Thymoma',
  'Thyroid Cancer',
  'Uterine Cancer',
  'DCIS: Ductal Carcinoma in Situ',

  'Caregiver',
  'Family Member',
  'Warrior (patient)',
  'Friend',
];

// This function creates groups in Sendbird, replace the createGroup function in the original code
// path: /src/main/screens/MessagesTab/MessagesTabCreateGroup/MessagesTabCreateGroup.tsx
export const replicateCreateGroup = async (sdk: SendbirdChatSDK) => {
  try {
    for (const groupName of groupNames) {
      const channel = await sdk.groupChannel.createChannel({
        isPublic: true,
        isDiscoverable: true,
        isEphemeral: false,
        name: groupName,
        data: JSON.stringify({ type: 'post', recommendation: 'true' }),
        invitedUserIds: undefined,
        coverImage: undefined,
      });

      await channel.createMetaData({ type: 'group', recommendation: 'true' });
      console.log(`Group "${groupName}" created successfully`);
    }
  } catch (error) {
    console.error('Error creating groups:', error);
  }
};
