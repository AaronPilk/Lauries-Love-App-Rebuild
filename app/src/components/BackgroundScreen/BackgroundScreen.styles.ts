import { Dimensions, Platform, StyleSheet } from 'react-native';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  universalContainer: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 0 : 16,
  },
  image: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
  },
  imagePostFirst: {
    position: 'absolute',
    width: WIDTH,
    height: 470,
    bottom: 0,
    left: 0,
  },
  imagePostSecond: {
    position: 'absolute',
    width: WIDTH,
    height: 470,
    top: 0,
    left: 0,
  },
  imagePostThird: {
    position: 'absolute',
    width: WIDTH,
    height: 470,
    top: 0,
    left: 0,
  },
  imagePostFourth: {
    position: 'absolute',
    width: 260,
    height: 650,
    bottom: 0,
    left: 0,
    objectFit: 'contain',
  },
});

export default styles;
