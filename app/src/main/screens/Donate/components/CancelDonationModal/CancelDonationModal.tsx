import React, { FunctionComponent, useState } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';

// components
import ModalUniversal from 'components/ModalUniversal/ModalUniversal';

// styles
import styles from './CancelDonationModal.styles';

type CancelDonationModalProps = {
  onClose: () => void;
  onPressCancel: () => void;
  amount: number;
};

const CancelDonationModal: FunctionComponent<CancelDonationModalProps> = ({
  onClose,
  onPressCancel,
  amount,
}) => {
  const [state, setState] = useState<'close' | 'cancel' | null>(null);

  const actionModal = () => {
    if (state === 'cancel') return onPressCancel();
    return onClose();
  };

  return (
    <ModalUniversal
      onClose={actionModal}
      styleBackgroundButton={styles.modalContainer}
      isHide={Boolean(state)}
    >
      <View style={styles.container}>
        <View style={{ alignSelf: 'center' }}>
          <Image source={require('assets/images/intro-connect.png')} />
        </View>
        <View style={styles.titles}>
          <Text style={styles.title}>Cancel Donation?</Text>
          <Text style={styles.subTitle}>
            Are you sure you want to cancel your $${amount.toFixed(2)} monthly
            donation? You won't be charged again, but you can donate anytime in
            the Donate section.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setState('close')}
          >
            <Text style={styles.titleButton}>Back home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonDelete]}
            onPress={() => setState('cancel')}
          >
            <Text style={[styles.titleButton, styles.titleButtonDelete]}>
              Cancel Donation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalUniversal>
  );
};

export default CancelDonationModal;
