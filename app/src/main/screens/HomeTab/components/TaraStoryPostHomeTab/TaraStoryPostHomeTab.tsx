import React, { FunctionComponent, useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

// assets
import imageTara from 'assets/images/tara-post-image.png';

// constants
import { KEY_SAW_FULL_TARA_STORY } from '../../HomeTab.constants';

// styles
import styles from './TaraStoryPostHomeTab.styles';
import PostReadMoreButton from '../PostReadMoreButton/PostReadMoreButton';

type TaraStoryPostHomeTabProps = {
  onPressTaraStoryPost: () => void;
};

const TaraStoryPostHomeTab: FunctionComponent<TaraStoryPostHomeTabProps> = ({
  onPressTaraStoryPost,
}) => {
  const [userSaw, setUserSaw] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStorage = async () => {
    setLoading(true);
    try {
      const valueJSON = await AsyncStorage.getItem(KEY_SAW_FULL_TARA_STORY);
      const value = valueJSON ? JSON.parse(valueJSON) : false;
      const parsedValue = z.boolean().safeParse(value);
      setUserSaw(parsedValue.success && parsedValue.data);
    } catch (error) {
      if (__DEV__) console.warn('Error getting storage', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStorage();
  }, []);

  if (loading) return null;
  if (userSaw)
    return (
      <View style={[styles.titleContainer, styles.sawTitleContainer]}>
        <Text style={styles.headerText}>Tara’s story</Text>
        <PostReadMoreButton
          onPress={onPressTaraStoryPost}
          text="Read full story"
        />
      </View>
    );
  return (
    <View style={styles.container}>
      <Image source={imageTara} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}>Tara’s story</Text>
          <PostReadMoreButton
            onPress={onPressTaraStoryPost}
            text="Learn more"
          />
        </View>
        <Text style={styles.contentText}>
          Learn more about the inspiration behind Laurie’s Love, a platform born
          from a deep friendship and shared journey through cancer.
        </Text>
      </View>
    </View>
  );
};

export default React.memo(TaraStoryPostHomeTab);
