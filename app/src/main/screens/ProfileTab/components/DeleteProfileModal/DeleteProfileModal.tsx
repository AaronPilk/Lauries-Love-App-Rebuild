import React, { FunctionComponent, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

// components
import ModalUniversal from 'components/ModalUniversal/ModalUniversal';

// styles
import styles from './DeleteProfileModal.styles';

type DeleteProfileModalProps = {
  onClose: () => void;
  onPressDelete: () => void;
};

const DeleteProfileModal: FunctionComponent<DeleteProfileModalProps> = ({
  onClose,
  onPressDelete,
}) => {
  const [state, setState] = useState<'close' | 'delete' | null>(null);

  const actionModal = () => {
    if (state === 'delete') return onPressDelete();
    return onClose();
  };

  return (
    <ModalUniversal
      onClose={actionModal}
      styleBackgroundButton={styles.modalContainer}
      isHide={Boolean(state)}
    >
      <View style={styles.container}>
        <View style={styles.titles}>
          <Text style={styles.title}>Delete account</Text>
          <Text style={styles.subTitle}>
            This will remove all data relating with you. This action cannot be
            reversed. Deleted data cannot be recovered.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setState('close')}
          >
            <Text style={styles.titleButton}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonDelete]}
            onPress={() => setState('delete')}
          >
            <Text style={[styles.titleButton, styles.titleButtonDelete]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalUniversal>
  );
};

export default DeleteProfileModal;
