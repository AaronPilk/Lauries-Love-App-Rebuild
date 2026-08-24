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
import { BaseMessageSendBirdType } from 'providers/ChatProvider/ChatProvider.types';

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
  /**
   * URL to open on tap when it differs from the grid image (videos: the grid
   * shows a local JPEG thumbnail, but the player/Share/Download need the real
   * signed video URL). Defaults to messageImage.url.
   */
  openUrl?: string;
};

const PhotoMediaMessagesTab: FunctionComponent<PhotoMediaMessagesTabProps> = ({
  messageImage,
  setOpen,
  styleContainer,
  isLoading = false,
  openUrl,
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
            uri: openUrl || messageImage.url || '',
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
