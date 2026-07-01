import React, { Dispatch } from 'react';
import { Image, Text, View } from 'react-native';

import styles from './InfoModal.styles';
import Modal from 'components/Modal/Modal';

type Props = {
  isInfoOpen: boolean;
  setIsInfoOpen: Dispatch<boolean>;
};

export default function InfoModal({ isInfoOpen, setIsInfoOpen }: Props) {
  const INFORMATION = [
    `Laurie’s Love is committed to providing each member affected by cancer with a personalized support team who understands exactly what they are experiencing during their journey. We accomplish this with our comprehensive mapping system.`,
    `Our application connects each member with others in the United States who share similar demographics, including specific types of cancer, age range, and gender. Upon registration, users are placed on the map via their zip code in the U.S., which allows members in a general geographical location to connect with each other and share the details of their unique cancer experience. This allows members to connect not only with someone in their town, city or county, but also anyone across the United States.`,
    `The mapping feature offers members a deepened sense of connection due to the ability to see where others are located. The map function is one of the most vital components of the application as it connects warriors who are enduring the same diagnosis or members caring for or related to those with that diagnosis, inspires them to share all aspects of their stories with each other, and empowers them with the knowledge that they are not alone in their journey.`,
  ];
  return (
    <Modal onClose={setIsInfoOpen} title="Map information" visible={isInfoOpen}>
      <View style={styles.container}>
        <Image
          source={require('../../../../../assets/images/map-info.png')}
          style={styles.image}
        />
        {INFORMATION.map((info, index) => (
          <Text key={index} style={styles.text}>
            {info}
          </Text>
        ))}
      </View>
    </Modal>
  );
}
