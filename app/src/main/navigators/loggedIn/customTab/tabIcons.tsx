import React from 'react';
import { Text, View } from 'react-native';
import _ from 'lodash';

// icons
import {
  IconTabHeart,
  IconTabHome,
  IconTabMapPin,
  IconTabMessageCircle,
  IconTabUser,
} from 'assets/icons-auto/components';

// styles
import colors from 'styles/colors';
import styles from './tabIcons.styles';

interface TabBarIcon {
  title: 'donate' | 'messages' | 'home' | 'connect' | 'profile';
  focused: boolean;
  size: number;
}

function IconWrapper({ focused, title }: TabBarIcon) {
  const renderIcon = () => {
    switch (title) {
      case 'donate':
        return (
          <IconTabHeart
            fill={focused ? colors.primary[500] : colors.transparent}
            stroke={focused ? colors.primary[500] : colors.neutral[600]}
            strokeWidth={2.3}
            width={28}
            height={28}
          />
        );
      case 'messages':
        return (
          <IconTabMessageCircle
            fill={focused ? colors.primary[500] : colors.transparent}
            stroke={focused ? colors.primary[500] : colors.neutral[600]}
            strokeWidth={2.3}
            width={28}
            height={28}
          />
        );
      case 'home':
        return (
          <IconTabHome
            fill={focused ? colors.primary[500] : colors.transparent}
            stroke={focused ? colors.primary[500] : colors.neutral[600]}
            strokeWidth={2.3}
            width={28}
            height={28}
          />
        );
      case 'connect':
        return (
          <IconTabMapPin
            fill={focused ? colors.primary[500] : colors.transparent}
            stroke={focused ? colors.primary[500] : colors.neutral[600]}
            strokeWidth={2.3}
            width={28}
            height={28}
          />
        );
      case 'profile':
        return (
          <IconTabUser
            fill={focused ? colors.primary[500] : colors.transparent}
            stroke={focused ? colors.primary[500] : colors.neutral[600]}
            strokeWidth={2.3}
            width={28}
            height={28}
          />
        );
    }
  };

  return (
    <View style={styles.iconContainer}>
      {renderIcon()}
      <Text style={[styles.title, focused && styles.titleFocused]}>
        {_.startCase(_.toLower(title))}
      </Text>
    </View>
  );
}

export function DonateTabIcon(props: Omit<TabBarIcon, 'title'>) {
  return <IconWrapper title="donate" {...props} />;
}
export function MessagesTabIcon(props: Omit<TabBarIcon, 'title'>) {
  return <IconWrapper title="messages" {...props} />;
}
export function StoryTabIcon(props: Omit<TabBarIcon, 'title'>) {
  return <IconWrapper title="home" {...props} />;
}
export function ConnectTabIcon(props: Omit<TabBarIcon, 'title'>) {
  return <IconWrapper title="connect" {...props} />;
}
export function ProfileTabIcon(props: Omit<TabBarIcon, 'title'>) {
  return <IconWrapper title="profile" {...props} />;
}
