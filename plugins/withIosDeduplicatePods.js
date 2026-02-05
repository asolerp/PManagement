/* eslint-disable immutable/no-mutation */
// plugins/with-ios-deduplicate-pods.js
// Prevents duplicate GoogleUtilities by declaring it in main target
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withIosDeduplicatePods(config) {
  return withDangerousMod(config, [
    'ios',
    async cfg => {
      const podfilePath = path.join(
        cfg.modRequest.projectRoot,
        'ios',
        'Podfile'
      );

      if (!fs.existsSync(podfilePath)) {
        return cfg;
      }

      let content = fs.readFileSync(podfilePath, 'utf8');

      // Skip if already injected
      if (content.includes("pod 'GoogleUtilities'")) {
        return cfg;
      }

      // Inject before use_react_native!
      content = content.replace(
        /(target .+ do\n(?:.*\n)*?)( {2}use_react_native!\()/,
        "$1  pod 'GoogleUtilities'\n\n$2"
      );

      fs.writeFileSync(podfilePath, content, 'utf8');
      return cfg;
    }
  ]);
}

module.exports = withIosDeduplicatePods;
