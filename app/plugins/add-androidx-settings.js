const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function addCustomProperties(config) {
  const context = config.modRequest;
  const gradlePropertiesPath = path.join(
    context.platformProjectRoot,
    'gradle.properties',
  );

  if (fs.existsSync(gradlePropertiesPath)) {
    let gradleProperties = fs.readFileSync(gradlePropertiesPath, 'utf8');

    if (gradleProperties.includes('=-Xmx2048m -XX:MaxMetaspaceSize=512m'))
      gradleProperties = gradleProperties.replace(
        '=-Xmx2048m -XX:MaxMetaspaceSize=512m',
        '=-Xmx4096m -XX:MaxMetaspaceSize=2048m',
      );
    else
      gradleProperties +=
        '\norg.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m\n';
    if (!gradleProperties.includes('android.enableJetifier=true'))
      gradleProperties += '\nandroid.enableJetifier=true\n';
    if (!gradleProperties.includes('android.useAndroidX=true'))
      gradleProperties += 'android.useAndroidX=true\n';

    /* gradleProperties += `FLIPPER_VERSION=0.125.0
LAURIES_LOVE_UPLOAD_STORE_FILE=laurieslove.keystore
LAURIES_LOVE_UPLOAD_KEY_ALIAS=laurieslove
LAURIES_LOVE_UPLOAD_STORE_PASSWORD=laurieslove123
LAURIES_LOVE_UPLOAD_KEY_PASSWORD=laurieslove123
`; */

    fs.writeFileSync(gradlePropertiesPath, gradleProperties);
  }
  return config;
}

module.exports = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      return addCustomProperties(config);
    },
  ]);
};
