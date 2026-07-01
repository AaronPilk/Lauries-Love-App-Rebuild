import React, { FunctionComponent } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';

import imageBackground from './DELETE_LATER.jpeg';
import { FONT_BEHIND_THE_NINETIES_700 } from 'styles/fonts';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const UpdateTab: FunctionComponent = () => {
  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: WIDTH,
        height: HEIGHT,
      }}
    >
      <Image
        source={imageBackground}
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          resizeMode: 'cover',
          opacity: 0.4,
        }}
      />
      <Text
        style={{
          fontFamily: FONT_BEHIND_THE_NINETIES_700,
          fontSize: 48,
          lineHeight: 58,
        }}
      >
        Sorry!
      </Text>
      <Text
        style={{
          fontFamily: FONT_BEHIND_THE_NINETIES_700,
          fontSize: 24,
          lineHeight: 29,
        }}
      >
        This page is under construction
      </Text>
    </View>
  );
};

export default UpdateTab;
