import * as Storage from '@aws-amplify/storage';
import { GetUrlOptions } from '@aws-amplify/storage/dist/esm/providers/s3/types/options';
import { StorageUploadDataPayload } from '@aws-amplify/storage/dist/esm/types';

export const getFileStorageAmplify = async (
  path: string,
  options?: GetUrlOptions,
) => {
  try {
    const result = await Storage.getUrl({
      path,
      options: {
        expiresIn: 60 * 60 * 24 * 7,
        ...options,
      },
    });

    return result.url;
  } catch (error) {}
};

export const removeFileStorageAmplify = async (path: string) => {
  try {
    await Storage.remove({
      path,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const uploadFileStorageAmplify = async (
  path: string,
  data: StorageUploadDataPayload,
) => {
  try {
    const result = await Storage.uploadData({
      path,
      data,
    }).result;
    return result.path;
  } catch (error) {
    return false;
  }
};
