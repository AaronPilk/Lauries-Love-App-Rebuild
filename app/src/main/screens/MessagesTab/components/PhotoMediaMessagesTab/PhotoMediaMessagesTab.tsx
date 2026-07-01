import React, { FunctionComponent, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { DocumentPickerAsset } from 'expo-document-picker';
import { ImagePickerAsset } from 'expo-image-picker';

// types
import { BaseMessageSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// styles
import styles from './PhotoMediaMessagesTab.styles';
import colors from 'styles/colors';

type PhotoMediaMessagesTabProps = {
  messageImage: BaseMessageSendBirdType;
  setOpen: (
    value: React.SetStateAction<{
      image: (ImagePickerAsset & { name?: string }) | null;
      document: DocumentPickerAsset | null;
    }>,
  ) => void;
  styleContainer?: StyleProp<ViewStyle>;
  isLoading?: boolean;
};

const PhotoMediaMessagesTab: FunctionComponent<PhotoMediaMessagesTabProps> = ({
  messageImage,
  setOpen,
  styleContainer,
  isLoading = false,
}) => {
  const [loading, setLoading] = useState(true);
  return (
    <TouchableOpacity
      style={[styles.container, styleContainer]}
      onPress={() =>
        setOpen({
          image: {
            width: 0,
            height: 0,
            uri: messageImage.url || '',
            mimeType: messageImage.type || '',
            name: messageImage.name,
          },
          document: null,
        })
      }
    >
      {(isLoading || loading) && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.primary[100]} />
        </View>
      )}
      {!isLoading && (
        <Image
          source={{ uri: messageImage.url, cache: 'force-cache' }}
          style={styles.sizeElement}
          onLoadEnd={() => setLoading(false)}
        />
      )}
    </TouchableOpacity>
  );
};

export default PhotoMediaMessagesTab;
