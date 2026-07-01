import { PermissionStatus } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export type PermissionsAllType = {
  camera: ImagePicker.PermissionStatus | null;
  imagePicker: ImagePicker.PermissionStatus | null;
  notificationFirebaseIOS: FirebaseMessagingTypes.AuthorizationStatus | null;
  notificationFirebaseAndroid: PermissionStatus | null;
};
