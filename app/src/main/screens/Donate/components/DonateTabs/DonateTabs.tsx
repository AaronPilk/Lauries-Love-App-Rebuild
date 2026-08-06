import React, { useEffect, useMemo } from 'react';
import { GroupButton, LayoutButton } from 'presentation/ui/atoms';

import { useStorage } from 'presentation/hooks';
import { DonateTabsValues, generateDonateTabsValues } from './DonateTabs.model';
import { useNavigation } from '@react-navigation/native';
import CostCalculator from '../CostCalculator/CostCalculator';
import styles from './DonateTabs.styles';
import Button from 'components/Button/Button';
import { PATHS_DONATE_TAB } from 'main/navigators/paths';
import OtherValue from '../OtherValue/OtherValue';
import { Text, View } from 'react-native';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { getCurrency } from 'utils/getCurrency';
import { usePaymentProvider } from 'providers/PaymentProvider/PaymentProvider';

export default function DonateTabs() {
  const { userDB } = useUserDBProvider();
  const { startStripeCheckout } = usePaymentProvider();
  const [currentValue, setCurrentValue] = React.useState<number>(0);
  const [otherValue, setOtherValue] = React.useState<number | undefined>();
  const { setValue, storedValue } = useStorage<DonateTabsValues>({
    key: '@amount-tab',
    initialValue: 'amount',
  });
  const navigation = useNavigation();

  const { symbol, currencyName } = useMemo(() => {
    return getCurrency(userDB?.country ?? '');
  }, [userDB]);

  const donateTabsValues = useMemo(() => {
    return generateDonateTabsValues(symbol);
  }, [symbol]);

  const goToCheckout = async (inHonor?: boolean) => {
    const amount = otherValue ?? currentValue;
    const paymentType: 'ONE_TIME' | 'RECURRING' =
      storedValue === 'amount' ? 'ONE_TIME' : 'RECURRING';

    // Prefer hosted Stripe Checkout (Supabase Edge Function). If the function
    // is not configured (503) or errors, fall through to the existing in-app
    // card form — behavior is unchanged when Stripe isn't wired.
    const opened = await startStripeCheckout({
      amount,
      currency: currencyName,
      paymentType,
      inHonor: Boolean(inHonor),
    });
    if (opened) return;

    navigation.navigate('Donate', {
      screen: PATHS_DONATE_TAB.donateTabCheckout,
      params: {
        amount,
        paymentType,
        inHonor,
      },
    });
  };

  useEffect(() => {
    setCurrentValue(0);
    setOtherValue(undefined);
  }, [storedValue]);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.title}>Your donation</Text>
          <CostCalculator symbol={symbol} currencyName={currencyName} />
        </View>
        {/* <GroupButton
            options={[
              { label: 'One time', value: 'amount' },
              { label: 'Monthly', value: 'recurring' },
            ]}
            currentValue={storedValue}
            onChange={setValue}
          /> */}
      </View>
      <View style={{ paddingBottom: 120, gap: 8 }}>
        <LayoutButton
          options={donateTabsValues[storedValue].prices}
          currentValue={currentValue}
          setCurrentValue={value => {
            setCurrentValue(value);
            setOtherValue(undefined);
          }}
        />
        <View style={{ width: '100%' }}>
          <OtherValue
            amount={otherValue ?? 0}
            setAmount={value => {
              setCurrentValue(0);
              setOtherValue(value);
            }}
            currencyName={currencyName}
            symbol={symbol}
          />
        </View>
        <View style={{ gap: 8, paddingVertical: 8 }}>
          <Button
            disabled={!currentValue && !otherValue}
            onPress={() => goToCheckout()}
            title="Donate"
            size="md"
          />
          <Button
            disabled={!currentValue && !otherValue}
            onPress={() => goToCheckout(true)}
            title="Donate in honor"
            variant="secondary"
            size="md"
          />
          <Text style={styles.text}>
            100% of your donation helps support cancer warriors and connect them
            with others, with no compensation given to organization members.
          </Text>
        </View>
      </View>
    </View>
  );
}
