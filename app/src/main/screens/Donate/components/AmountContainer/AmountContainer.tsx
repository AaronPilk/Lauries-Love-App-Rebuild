import React from 'react';
import { Text, View } from 'react-native';

// styles
import styles from './AmountContainer.styles';

interface AmountContainerProps {
  amount: number;
  children?: React.ReactNode;
  error?: string;
  symbol: string;
  currencyName: string;
}

export default function AmountContainer({
  amount,
  children,
  error,
  currencyName,
  symbol,
}: AmountContainerProps) {
  return (
    <View style={styles.amountContainer}>
      <Text style={styles.amount}>
        {Number(Math.floor(amount)).toLocaleString('en-US', {
          style: 'currency',
          currency: currencyName,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
        <Text style={styles.amountCents}>
          .{Number(amount).toFixed(2).split('.')[1]}
        </Text>
      </Text>
      {children}
      <Text style={styles.info}>
        Every bit helps! Donations from {symbol}1 to {symbol}5,000 are welcome.
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
