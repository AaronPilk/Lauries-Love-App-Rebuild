import React from 'react';

import { CardBrandIcon } from 'presentation/ui/atoms';
import { DonationCardProps } from './donation-card.model';
import { useNavigation } from '@react-navigation/native';
import { usePaymentProvider } from 'providers/PaymentProvider/PaymentProvider';
import styles from './donation-card.styles';
import { Text, View } from 'react-native';
import moment from 'moment';
import Button from 'components/Button/Button';
import CancelDonationModal from 'main/screens/Donate/components/CancelDonationModal/CancelDonationModal';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';

export default function DonationCard(props: DonationCardProps) {
  const { item, onPressViewReceipt } = props;
  const isRecurring = item.description === 'RECURRING';
  const navigation = useNavigation();
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false);
  const { showToast } = useToastProvider();
  const { isLoading, cancelPaymentSubscription } = usePaymentProvider();

  const onViewReceipt = () => {
    onPressViewReceipt?.();
    navigation.navigate('Donate', {
      screen: 'donate-tab-invoice',
      params: {
        isNew: false,
        itemId: item.id,
      },
    });
  };

  const cancelSubscription = async () => {
    try {
      await cancelPaymentSubscription(item.id);
      showToast({
        message: 'Canceled successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error(error);
    }
  };

  //   if (isLoading) {
  //     return (
  //       <VStack h="50px">
  //         <Loader />
  //       </VStack>
  //     );
  //   }

  return (
    <>
      <View style={[styles.card, !item.active && styles.inactive]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {Number(item.amount).toLocaleString('en-US', {
              style: 'currency',
              currency: item.currencyName ?? 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.cardType}>
            {isRecurring ? 'Monthly' : 'One time'}
          </Text>
        </View>
        <View style={styles.accountContainer}>
          <CardBrandIcon
            icon={item.accountType.toUpperCase()}
            height={16}
            width={16}
          />
          <Text style={styles.accountNumber}>
            {item.accountNumber.replaceAll('X', '')}
          </Text>
        </View>
        <View style={styles.accountContainer}>
          <Text style={styles.accountText}>
            {isRecurring ? 'Next donation payment' : 'Donation date'}
          </Text>
          <Text>•</Text>
          <Text style={styles.accountNumber}>
            {moment(item.createdAt).format('MM/DD/YYYY')}
          </Text>
        </View>
        {!item.active && (
          <View style={styles.accountContainer}>
            <Text style={styles.cancelledDonation}>
              You have canceled this donation
            </Text>
          </View>
        )}
        <View style={styles.accountContainer}>
          {isRecurring && item.active && (
            <Button
              title="Cancel donation"
              onPress={() => setCancelModalOpen(true)}
              variant="invalid"
              size="md"
              style={{ borderRadius: 40, flex: 1 }}
            />
          )}
          <Button
            title="View receipt"
            onPress={onViewReceipt}
            variant="primary"
            size="md"
            style={{ borderRadius: 40, flex: 1 }}
          />
        </View>
      </View>
      {cancelModalOpen && (
        <CancelDonationModal
          onClose={() => setCancelModalOpen(false)}
          amount={item.amount}
          onPressCancel={() => {
            setCancelModalOpen(false);
            cancelSubscription();
          }}
        />
      )}
    </>
  );
}
