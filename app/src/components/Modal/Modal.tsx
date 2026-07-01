import React, { Dispatch, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal as ModalComponent,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './Modal.styles';
import { IconArrowLeft } from 'assets/icons-auto/components';

type Props = {
  children: ReactNode;
  onClose: Dispatch<boolean>;
  title: string;
  visible: boolean;
  disableScroll?: boolean;
};

export default function Modal({
  children,
  onClose,
  title,
  visible,
  disableScroll = false,
}: Props) {
  return (
    <>
      <View style={[styles.overlay, { display: visible ? 'flex' : 'none' }]} />
      <ModalComponent
        animationType="slide"
        visible={visible}
        transparent={true}
        onRequestClose={() => onClose(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => onClose(false)}>
                <IconArrowLeft width={30} height={30} />
              </TouchableOpacity>
              <Text style={styles.titleText}>{title}</Text>
            </View>
            <ScrollView
              scrollEnabled={!disableScroll}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ModalComponent>
    </>
  );
}
