import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { makeRemoteStorageAdapter } from 'main/factories/storage';

export function getUrlExtension(url: string) {
  return url.split(/[#?]/)?.at(0)?.split('.')?.pop()?.trim();
}

export function getNameFromPath(str: string) {
  return str.split('\\')?.pop()?.split('/').pop();
}

export default async function openFilePreview(key: string) {
  const result = await makeRemoteStorageAdapter().getFile(key);

  const name = getNameFromPath(key);
  // Feel free to change main path according to your requirements.
  const localFile = `${RNFS.DocumentDirectoryPath}/${name}`;

  const options = {
    fromUrl: result,
    toFile: localFile,
  };
  RNFS.downloadFile(options).promise.then(() =>
    FileViewer.open(localFile, {
      showOpenWithDialog: true,
      showAppsSuggestions: true,
    }),
  );
}
