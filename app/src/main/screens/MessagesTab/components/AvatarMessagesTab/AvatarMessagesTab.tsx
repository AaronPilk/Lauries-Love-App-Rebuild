import React, { FunctionComponent, useMemo, useState } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Text,
  ImageSourcePropType,
} from 'react-native';

// styles
import styles from './AvatarMessagesTab.styles';
import colors from 'styles/colors';

type AvatarMessagesTabProps = {
  imageUrl: string | ImageSourcePropType;
  width?: number;
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  name?: string;
};

const AvatarMessagesTab: FunctionComponent<AvatarMessagesTabProps> = ({
  imageUrl,
  width = 60,
  height = 60,
  resizeMode = 'cover',
  name,
}) => {
  const [loading, setLoading] = useState(true);

  const showTwoLetters = useMemo(() => {
    if (!name) return '...';
    const firstName = name.length > 0 ? name[0] : '?';
    const lastName = name.split(' ').length > 0 ? name.split(' ')[0][0] : '';
    return `${firstName}${lastName}`;
  }, [name]);

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width,
          height,
        },
      ]}
    >
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.primary[100]} />
        </View>
      )}
      {typeof imageUrl === 'string' && imageUrl.length > 0 ? (
        <Image
          source={{ uri: imageUrl, cache: 'force-cache' }}
          style={styles.avatar}
          resizeMode={resizeMode}
          onLoadEnd={() => setLoading(false)}
        />
      ) : imageUrl && typeof imageUrl !== 'string' ? (
        <Image
          source={imageUrl}
          style={styles.avatar}
          resizeMode={resizeMode}
        />
      ) : (
        <View style={[styles.avatar, styles.notImage]}>
          <Text style={styles.text}>{showTwoLetters}</Text>
        </View>
      )}
    </View>
  );
};

export default AvatarMessagesTab;
