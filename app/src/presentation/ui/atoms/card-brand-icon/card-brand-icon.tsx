import React from 'react';
import { Text, View } from 'react-native';

// types
import { CardBrandIconProps } from './card-brand-icon.model';

// icons
import {
  IconAmex,
  IconApple,
  IconGoogle,
  IconMastercard,
  IconVisa,
} from 'assets/icons-auto/components';

// styles
import colors from 'styles/colors';

export default function CardBrandIcon(props: CardBrandIconProps) {
  const { icon, width, height, ...rest } = props;
  const renderIcon = () => {
    switch (icon) {
      case 'AMERICANEXPRESS':
        return <IconAmex width={32.84} height={12} />;
      case 'MASTERCARD':
        return <IconMastercard width={19.42} height={12} />;
      case 'APPLE_PAY':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <IconApple width={width} height={height} fill={colors.white} />
            <Text>Pay</Text>
          </View>
        );
      case 'GOOGLE_PAY':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <IconGoogle width={width} height={height} />
            <Text>Pay</Text>
          </View>
        );
      default:
        return <IconVisa width={37.16} height={12} />;
    }
  };
  return renderIcon();
}
