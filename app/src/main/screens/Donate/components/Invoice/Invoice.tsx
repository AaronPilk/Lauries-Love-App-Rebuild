import React, { useEffect } from 'react';

import { CardBrandIcon } from 'presentation/ui/atoms';
import { useRoute } from '@react-navigation/native';
import { usePaymentProvider } from 'providers/PaymentProvider/PaymentProvider';
import { Payment } from 'data/models';
import { View, Text } from 'react-native';
import styles from './Invoice.styles';
import {
  IconCalendarProfile,
  IconClock,
  IconTabHeart,
  IconTabUser,
} from 'assets/icons-auto/components';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { IconType } from 'assets/icons-auto/icon.types';
import { DonateRouteProps } from 'presentation/ui/organism';
import AmountContainer from '../AmountContainer/AmountContainer';
import moment from 'moment';
import { toLocalizedDateString } from 'utils/formatDate';

export default function Invoice() {
  const route = useRoute<DonateRouteProps<'donate-tab-invoice'>>();

  const { userDB } = useUserDBProvider();

  const [item, setItem] = React.useState<Payment | null>(null);

  const { getPayment } = usePaymentProvider();

  useEffect(() => {
    getPayment(route.params.itemId).then(payment => {
      setItem(payment);
    });
  }, []);

  if (!item) {
    return <Text>Somenthing happend</Text>;
  }

  const InvoiceDetailItem: React.FC<{
    Icon: (originalProps: IconType) => React.JSX.Element;
    title: string;
    value: string;
    numericValue?: boolean;
  }> = ({ Icon, title, value, numericValue = false }) => {
    return (
      <View style={styles.invoiceDetail}>
        <View style={styles.invoiceDetailTitleContainer}>
          <Icon
            width={20}
            height={20}
            style={styles.invoiceIcon}
            stroke="#000"
          />
          <Text style={styles.invoiceDetailTitle}>{title}</Text>
        </View>
        <Text
          style={[styles.invoiceDetailValue, numericValue && styles.numeric]}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ width: '100%' }}>
      <AmountContainer
        amount={item.amount}
        currencyName={item.currencyName ?? 'USD'}
        symbol={
          item.currencyName ? (item.currencyName === 'USD' ? '$' : 'CA$') : '$'
        }
      >
        <View style={styles.donationType}>
          <View>
            <Text style={styles.donationTypeText}>
              {item.description === 'ONE_TIME' ? 'One time' : 'Monthly'}{' '}
              donation
            </Text>
          </View>
          <View>
            <Text style={styles.donationTypeText}>/</Text>
          </View>
          <View>
            <CardBrandIcon
              icon={item.accountType.toUpperCase()}
              width={16}
              height={16}
            />
          </View>
          <View>
            <Text style={[styles.donationTypeText, styles.numeric]}>
              {item.accountNumber.replaceAll('X', '')}
            </Text>
          </View>
        </View>
      </AmountContainer>
      <View style={styles.invoiceDetailsContainer}>
        <Text style={styles.invoiceDetailsTitle}>Donation details</Text>
        <View style={styles.invoiceDetails}>
          {/* icon, then title, then at the right the value */}

          <InvoiceDetailItem
            Icon={IconTabUser}
            title="Donor name"
            value={`${userDB?.firstName}`}
          />
          <InvoiceDetailItem
            Icon={IconTabHeart}
            title="Amount"
            value={`${Number(item.amount).toLocaleString('en-US', {
              style: 'currency',
              currency: item.currencyName ?? 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            numericValue
          />
          <InvoiceDetailItem
            Icon={IconCalendarProfile}
            title="Donation date"
            value={toLocalizedDateString(item.createdAt, userDB?.country ?? '')}
            numericValue
          />
          {item.active && item.nextPayment && (
            <InvoiceDetailItem
              Icon={IconClock}
              title="Next payment"
              value={moment(item.createdAt)
                .add(1, 'months')
                .format('MM/DD/YYYY')}
              numericValue
            />
          )}
        </View>
      </View>
    </View>
  );
}
