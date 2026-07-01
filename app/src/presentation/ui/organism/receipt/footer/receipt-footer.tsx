// import React from 'react';

// import { Text, VStack, HStack, Box } from 'native-base';

// import { scale } from 'presentation/theme';
// import { ReceiptFooterProps } from './receipt-footer.model';
// import moment from 'moment';
// import { useTranslation } from 'react-i18next';

// export default function ReceiptFooter(props: ReceiptFooterProps) {
//   const { date } = props;
//   const { t } = useTranslation('screens');
//   return (
//     <HStack space={2} justifyContent="space-between" w="100%" p="4">
//       <VStack>
//         <Box>
//           <Text color="gray.400" fontWeight="600">
//             {t('donate.receipt.card.footer.date')}
//           </Text>
//         </Box>
//         <Box>
//           <Text color="gray.400" fontSize={scale(16)} fontWeight="600">
//             {moment(date).format('MMMM DD, YYYY')}
//           </Text>
//         </Box>
//       </VStack>
//       <VStack>
//         <Box>
//           <Text color="gray.400" fontWeight="600">
//             {t('donate.receipt.card.footer.paymentType')}
//           </Text>
//         </Box>
//         <Box>
//           <Text color="gray.400" fontSize={scale(16)} fontWeight="600">
//             Saved
//           </Text>
//         </Box>
//       </VStack>
//     </HStack>
//   );
// }
