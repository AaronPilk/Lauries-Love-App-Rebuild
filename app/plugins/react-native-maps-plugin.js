const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function addCustomPods(podfilePath) {
  let podfileContent = fs.readFileSync(podfilePath, 'utf8');

  // Check if the required Pods have already been added
  if (!podfileContent.includes("pod 'GoogleMaps', '7.4.0'")) {
    // Find the place before `post_install do |installer|`
    const postInstallMatch = podfileContent.match(
      /post_install do \|installer\|/,
    );
    if (postInstallMatch) {
      const insertionIndex = postInstallMatch.index;

      // Generate new Podfile content
      const customPods = `pod 'GoogleMaps', '7.4.0'
  pod 'Google-Maps-iOS-Utils', '4.2.2'
`;

      podfileContent =
        podfileContent.slice(0, insertionIndex) +
        customPods +
        '\n  ' +
        podfileContent.slice(insertionIndex);
    } else {
      console.warn('post_install hook not found in Podfile.');
    }

    // Write the modified Podfile
    fs.writeFileSync(podfilePath, podfileContent, 'utf8');
  }
}

const withCustomPodfFle = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      addCustomPods(podfilePath);
      return config;
    },
  ]);
};

module.exports = withCustomPodfFle;
