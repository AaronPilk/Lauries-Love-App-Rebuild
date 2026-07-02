import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  ImageStyle,
  ImageResizeMode,
  StyleProp,
  ViewStyle,
} from 'react-native';
import styles from './PostImageWithLoading.styles';
import colors from 'styles/colors';

type ImageWithLoadingProps = {
  uri: string;
  backupUri?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  containerStyle?: StyleProp<ViewStyle>;
  maxRetry?: number;
  retryDelayMs?: number;
};

/**
 * Displays an image with a loading spinner and retry-on-failure support.
 *
 * ⚠️ To ensure internal state resets correctly when the image URI changes,
 * please provide `key={uri}` when using this component.
 *
 * @example
 * <PostImageWithLoading key={imageUrl} uri={imageUrl} />
 */
const PostImageWithLoadingComponent: React.FC<ImageWithLoadingProps> = ({
  uri,
  backupUri,
  style,
  resizeMode = 'cover',
  containerStyle,
  maxRetry = 5,
  retryDelayMs = 1000,
}) => {
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [imageUri, setImageUri] = useState(uri);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backupTriedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleError = () => {
    // Short-circuit: a sized (-sm/-md) URL that 404s will keep 404ing —
    // go straight to the backup (original) URL instead of retrying it.
    if (backupUri && backupUri !== imageUri && !backupTriedRef.current) {
      backupTriedRef.current = true;
      setLoading(true);
      setImageUri(backupUri);
      return;
    }
    // Never re-retry a dead URL once the backup has also failed
    if (backupTriedRef.current) {
      setLoading(false);
      return;
    }
    if (retryCount < maxRetry) {
      setLoading(true);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      retryTimeoutRef.current = setTimeout(() => {
        const retryUri = uri.includes('?')
          ? `${uri}&retry=${Date.now()}`
          : `${uri}?retry=${Date.now()}`;
        setRetryCount(prev => prev + 1);
        setImageUri(retryUri);
      }, retryDelayMs);
    } else {
      // If all retries fail, stop loading
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={{ uri: imageUri }}
        style={style}
        resizeMode={resizeMode}
        onLoad={() => setLoading(false)}
        onError={handleError}
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator color={colors.primary[100]} />
        </View>
      )}
    </View>
  );
};

export const PostImageWithLoading = React.memo(PostImageWithLoadingComponent);
