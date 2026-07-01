// import React from 'react';

// import { Text, Center, VStack, HStack, Box } from 'native-base';
// import { ProfileImage } from 'presentation/ui/molecules';
// import { scale } from 'presentation/theme';
// import { selectCurrentUser } from 'presentation/store/selectors/user.selector';
// import { useAppSelector } from 'presentation/store/hooks';
// import { ViewReceiptDetails } from './view-receipt-details';
// import { CardBrandIcon, Loader } from 'presentation/ui/atoms';
// import { useRoute } from '@react-navigation/native';
// import { DonateRouteProps } from './receipt.model';
// import { useGetPayment } from 'presentation/services/react-query/payment.query';
// import { useTranslation } from 'react-i18next';
// import { ImageBackground } from 'react-native';

// export default function Receipt() {
//   const user = useAppSelector(selectCurrentUser);
//   const route = useRoute<DonateRouteProps<'DonateReceipt'>>();
//   const { t } = useTranslation('screens');

//   const { data: item, isLoading } = useGetPayment(route.params.itemId);

//   const isNew = route.params.isNew;

//   if (isLoading) {
//     return <Loader />;
//   }

//   if (!item) {
//     return <Text>Somenthing happend</Text>;
//   }

//   return (
//     <VStack
//       w="full"
//       borderRadius="12px"
//       space={scale(8)}
//       bg="white"
//       p="4"
//       pb="2"
//       zIndex="2"
//     >
//       <ImageBackground
//         source={require('presentation/ui/assets/images/onboarding-bg.png')}
//         resizeMode="cover"
//         style={{ flex: 1, justifyContent: 'center', zIndex: 999 }}
//       >
//         <HStack space={4} alignItems="center">
//           <Box>
//             <ProfileImage />
//           </Box>
//           <Box>
//             <Text color="gray.400" fontSize={scale(16)} fontWeight="600">
//               {user?.firstName + ' ' + user?.lastName}
//             </Text>
//           </Box>
//         </HStack>
//         <Center w="full">
//           <VStack alignItems="center" space={2} w="full">
//             <Box>
//               <Text color="gray.400" fontWeight="600" fontSize="16">
//                 {t('donate.receipt.card.title')}
//               </Text>
//             </Box>
//             <Box>
//               <Text color="primary.400" fontSize="40" fontWeight="600">
//                 {item.amount.toLocaleString('en-US', {
//                   style: 'currency',
//                   currency: 'USD',
//                 })}
//               </Text>
//             </Box>
//             <HStack
//               alignItems="center"
//               justifyContent="center"
//               space={2}
//               h="30px"
//             >
//               <Box>
//                 <Text color="gray.400" fontWeight="600" fontSize="12px">
//                   {item?.paymentType.description.replace('_', ' ')}
//                 </Text>
//               </Box>
//               <Box>
//                 <Text color="gray.400" fontWeight="600">
//                   /
//                 </Text>
//               </Box>
//               <Box>
//                 <CardBrandIcon
//                   icon={item.accountType.toUpperCase()}
//                   width="32px"
//                   height="32px"
//                 />
//               </Box>
//               <Box>
//                 <Text color="gray.400" fontWeight="600">
//                   {item.accountNumber.replaceAll('X', '')}
//                 </Text>
//               </Box>
//             </HStack>
//             <ViewReceiptDetails isNew={isNew} item={item} />
//           </VStack>
//         </Center>
//       </ImageBackground>
//     </VStack>
//   );
// }
