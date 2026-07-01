import React, { FunctionComponent, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

// types
import { UserDBType } from 'providers/UserDBProvider/UserDBProvider.types';

// icons
import { IconCamera } from 'assets/icons-auto/components';

// styles
import styles from './AvatarProfile.styles';

//images
import defaultAvatar from 'assets/images/avatar-empty.png';

type AvatarProfileProps = {
  onPress?: () => void;
  type?: 'big' | 'small';
  user: UserDBType;
  width?: number;
  height?: number;
};

const AvatarProfile: FunctionComponent<AvatarProfileProps> = ({
  onPress,
  type = 'small',
  user,
  width,
  height,
}) => {
  const urlImage = useMemo(() => user.profileImgUrl, [user.profileImgUrl]);

  const showTwoLetters = useMemo(() => {
    if (!user) return '?';
    const firstName = user.firstName.length > 0 ? user.firstName[0] : '?';
    const lastName =
      user.lastName && user.lastName.length > 0 ? user.lastName[0] : '';
    return `${firstName}${lastName}`;
  }, [user]);

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.container,
        type === 'big' && styles.bigContainer,
        {
          width: width || type === 'big' ? 135 : 78,
          height: height || type === 'big' ? 135 : 78,
        },
      ]}
    >
      {urlImage ? (
        <Image source={{ uri: urlImage }} style={styles.image} />
      ) : (
        <Image source={ defaultAvatar } style={styles.image} />
      )}
      {onPress && (
        <View style={styles.iconContainer}>
          <IconCamera width={30} height={30} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AvatarProfile;
