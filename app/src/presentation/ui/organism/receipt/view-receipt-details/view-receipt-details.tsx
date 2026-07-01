// import React from 'react';

// import { Box, Divider, VStack, Button, Icon, Text } from 'native-base';

// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { scale } from 'presentation/theme';
// import { ReceiptFooter } from '../footer';
// import { BottomSheet } from 'presentation/ui/atoms';
// import { ViewReceiptDetailsProps } from './view-receipt-details.model';
// import moment from 'moment';
// import { useTranslation } from 'react-i18next';
// import { startCase } from 'lodash';

// export default function ViewReceiptDetails(props: ViewReceiptDetailsProps) {
//   const { isNew, item } = props;
//   const isOneTime = item.paymentType.description === 'ONE_TIME';
//   const [isOpen, setIsOpen] = React.useState(Boolean(!isNew && !isOneTime));
//   const [isDataProtectionOpen, setIsDataProtectionOpen] = React.useState(false);
//   const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
//   const { t } = useTranslation('screens');
//   return (
//     <Box w="100%">
//       <VStack my="2" space={2}>
//         {isOpen && !isOneTime && (
//           <VStack>
//             <Box px="4">
//               <Text color="gray.400" fontSize={scale(16)} fontWeight="600">
//                 {t('donate.receipt.nextPayment')}
//               </Text>
//             </Box>
//             <Box px="4">
//               <Text color="black" fontSize={scale(32)} fontWeight="600">
//                 {moment(item.createdAt).add(1, 'month').format('MMMM DD, YYYY')}
//               </Text>
//             </Box>
//             <Box px="4">
//               <Box bg="gray.100" borderRadius="12px" p="2">
//                 <Text
//                   fontFamily="mono"
//                   fontStyle="normal"
//                   fontSize={scale(12)}
//                   fontWeight="600"
//                   color="gray.400"
//                 >
//                   {t('donate.receipt.terms.title')}{' '}
//                   <Text
//                     color="primary.400"
//                     textDecoration="none"
//                     fontFamily="mono"
//                     fontStyle="normal"
//                     fontSize={scale(12)}
//                     fontWeight="600"
//                     onPress={() => setIsDataProtectionOpen(true)}
//                   >
//                     {t('donate.receipt.terms.protection')}
//                   </Text>
//                 </Text>
//                 <Text
//                   fontFamily="mono"
//                   fontStyle="normal"
//                   fontSize={scale(12)}
//                   fontWeight="600"
//                   color="gray.400"
//                 >
//                   {t('donate.receipt.terms.title')}{' '}
//                   <Text
//                     color="primary.400"
//                     textDecoration="none"
//                     fontFamily="mono"
//                     fontStyle="normal"
//                     fontSize={scale(12)}
//                     fontWeight="600"
//                     onPress={() => setIsPrivacyOpen(true)}
//                   >
//                     {t('donate.receipt.terms.privacy')}
//                   </Text>
//                 </Text>
//               </Box>
//               <BottomSheet
//                 show={isDataProtectionOpen}
//                 height="100%"
//                 enablePanDownToClose
//                 onClose={() => setIsDataProtectionOpen(false)}
//               >
//                 <VStack
//                   space="24px"
//                   paddingX="24px"
//                   paddingBottom="48px"
//                   height="100%"
//                 >
//                   <Text
//                     fontWeight="700"
//                     fontSize="24px"
//                     color="gray.400"
//                     textAlign="center"
//                   >
//                     {startCase(t('donate.receipt.terms.protection'))}
//                   </Text>
//                 </VStack>
//               </BottomSheet>
//               <BottomSheet
//                 show={isPrivacyOpen}
//                 height="80%"
//                 enablePanDownToClose
//                 onClose={() => setIsPrivacyOpen(false)}
//               >
//                 <VStack
//                   space="24px"
//                   paddingX="24px"
//                   paddingBottom="48px"
//                   height="100%"
//                 >
//                   <Text
//                     fontWeight="700"
//                     fontSize="24px"
//                     color="gray.400"
//                     textAlign="center"
//                   >
//                     {startCase(t('donate.receipt.terms.privacy'))}
//                   </Text>
//                 </VStack>
//               </BottomSheet>
//             </Box>
//             <ReceiptFooter date={item.createdAt} />
//           </VStack>
//         )}
//         {(isOneTime || !isNew) && !isOpen && (
//           <ReceiptFooter date={item.createdAt} />
//         )}

//         {isNew && !isOneTime && (
//           <>
//             <Divider />
//             <Box>
//               <Button
//                 variant="unstyled"
//                 endIcon={
//                   <Icon
//                     as={MaterialIcons}
//                     name={isOpen ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
//                   />
//                 }
//                 onPress={() => setIsOpen(val => !val)}
//               >
//                 <Text
//                   fontWeight="700"
//                   fontSize="12"
//                   color="gray.400"
//                   textAlign="center"
//                 >
//                   {isOpen
//                     ? t('donate.receipt.card.details.opened')
//                     : t('donate.receipt.card.details.closed')}
//                 </Text>
//               </Button>
//             </Box>
//           </>
//         )}
//       </VStack>
//     </Box>
//   );
// }
