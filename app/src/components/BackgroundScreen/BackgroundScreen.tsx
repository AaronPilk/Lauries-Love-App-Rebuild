import React, { FunctionComponent, useMemo } from 'react';
import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// types
import { LinearGradientBackgroundScreenType } from './BackgroundScreen.types';

// images
import BackgroundProfileQr from 'assets/images/background-profile-QR.png';
import BackgroundPostFirst from 'assets/images/background-ellipse-post-screen-1.png';
import BackgroundPostSecond from 'assets/images/background-ellipse-post-screen-2.png';
import BackgroundPostThird from 'assets/images/background-ellipse-post-screen-3.png';
import BackgroundPostFourth from 'assets/images/background-ellipse-post-screen-4.png';

// styles
import colors from 'styles/colors';
import styles from './BackgroundScreen.styles';

type BackgroundScreenProps = {
  children: React.ReactNode;
  type?:
    | 'profile'
    | 'updateProfile'
    | 'profile-QR'
    | 'messages'
    | 'friendBlock'
    | 'home-main'
    | 'home-create-post'
    | 'home-post'
    | 'messages-tab-profile'
    | 'messagesDetails';
};

const BackgroundScreen: FunctionComponent<BackgroundScreenProps> = ({
  children,
  type = 'profile',
}) => {
  const { top } = useSafeAreaInsets();
  const config: LinearGradientBackgroundScreenType = useMemo(() => {
    if (type === 'updateProfile')
      return {
        colors: [
          colors.tertiary[200],
          colors.quaternary[100],
          colors.secondary[300],
        ],
        locations: [0.1, 0.5, 1],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'messages')
      return {
        colors: [colors.white, colors.white, colors.tertiary[300]],
        locations: [0.1, 0.5, 1],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'messagesDetails')
      return {
        colors: [colors.white, colors.white, colors.tertiary[300]],
        locations: [0.1, 0.55, 0.8],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'friendBlock')
      return {
        colors: [
          colors.secondary[200],
          colors.quaternary[100],
          colors.secondary[200],
          colors.tertiary[300],
        ],
        locations: [0.1, 0.5, 0.7, 0.9],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'home-main')
      return {
        colors: [colors.cararra50, colors.cararra50, colors.tertiary[300]],
        locations: [0.1, 0.5, 1],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'home-create-post')
      return {
        colors: [colors.quaternary[200], colors.white, colors.primary[100]],
        locations: [0.2, 0.5, 1],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'home-post')
      return {
        colors: [
          colors.quaternary[200],
          colors.quaternary[100],
          colors.primary[100],
        ],
        locations: [0.2, 0.4, 0.8],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 1.4 },
      };
    if (type === 'messages-tab-profile')
      return {
        colors: [colors.secondary[200], colors.white, colors.tertiary[100]],
        locations: [0.2, 1, 0.1],
        start: { x: 0, y: -0.5 },
        end: { x: 0, y: 0.5 },
      };
    return {
      colors: [
        colors.quaternary[200],
        colors.quaternary[200],
        colors.primary[100],
      ],
      locations: [0, 0.8, 1],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    };
  }, [type]);

  if (type === 'profile-QR')
    return (
      <View
        style={[
          styles.universalContainer,
          {
            paddingTop: top,
          },
        ]}
      >
        <Image source={BackgroundProfileQr} style={styles.image} />
        {children}
      </View>
    );

  if (type === 'home-post')
    return (
      <View
        style={[
          styles.universalContainer,
          {
            backgroundColor: colors.quaternary[100],
            paddingTop: top,
          },
        ]}
      >
        <Image source={BackgroundPostFirst} style={styles.imagePostFirst} />
        <Image source={BackgroundPostSecond} style={styles.imagePostSecond} />
        {children}
      </View>
    );

  if (type === 'home-create-post')
    return (
      <View
        style={[
          styles.universalContainer,
          {
            backgroundColor: colors.quaternary[100],
            paddingTop: top,
          },
        ]}
      >
        <Image source={BackgroundPostThird} style={styles.imagePostThird} />
        <Image source={BackgroundPostFourth} style={styles.imagePostFourth} />
        {children}
      </View>
    );

  return (
    <LinearGradient
      colors={config.colors}
      locations={config.locations}
      style={[
        styles.universalContainer,
        type === 'messages' && { paddingBottom: 0 },
      ]}
      start={config.start}
      end={config.end}
    >
      <View
        style={[
          styles.universalContainer,
          {
            paddingTop: top,
          },
          type === 'messages' && { paddingBottom: 0 },
        ]}
      >
        {children}
      </View>
    </LinearGradient>
  );
};

export default BackgroundScreen;
