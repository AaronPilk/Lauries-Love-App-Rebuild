const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function modifyRNPDFPdfNativeComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('enableDoubleTapZoom: ?boolean')) {
    return;
  }

  const modifiedContent = content.replace(
    'enableAntialiasing: ?boolean,',
    'enableAntialiasing: ?boolean,\n  enableDoubleTapZoom: ?boolean, // added by Expo plugin',
  );

  fs.writeFileSync(filePath, modifiedContent, 'utf8');
}

const withReactNativePDFFix = config => {
  return withDangerousMod(config, [
    'ios',
    config => {
      const filePath = path.resolve(
        config.modRequest.projectRoot,
        'node_modules/react-native-pdf/fabric/RNPDFPdfNativeComponent.js',
      );

      try {
        modifyRNPDFPdfNativeComponent(filePath);
      } catch (error) {
        console.error(
          `Failed to patch RNPDFPdfNativeComponent.js: ${error.message}`,
        );
      }

      return config;
    },
  ]);
};

module.exports = withReactNativePDFFix;
