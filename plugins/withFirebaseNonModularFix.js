const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Config plugin para arreglar headers no modulares de Firebase con static frameworks
 */
const withFirebaseNonModularFix = config => {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      let podfileContent = fs.readFileSync(podfilePath, 'utf-8');

      // Agregar el fix para Firebase en post_install
      const postInstallFix = `
    # Fix for Firebase non-modular headers with static frameworks
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        # Allow non-modular includes for ALL Firebase pods
        if target.name.start_with?('RNFB') || target.name.start_with?('Firebase')
          config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
          config.build_settings['CLANG_WARN_NON_MODULAR_INCLUDE_IN_FRAMEWORK_MODULE'] = 'NO'
          # Fix for RCT_EXPORT_MODULE/METHOD errors (implicit-int warnings)
          config.build_settings['GCC_TREAT_WARNINGS_AS_ERRORS'] = 'NO'
          config.build_settings['WARNING_CFLAGS'] = '$(inherited) -Wno-error=implicit-int -Wno-implicit-int'
        end
      end
    end`;

      // Verificar si el fix ya existe
      if (
        !podfileContent.includes(
          'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'
        )
      ) {
        // Buscar el cierre del post_install antes del último 'end'
        const postInstallRegex =
          /(post_install do \|installer\|[\s\S]*?)( {2}end\nend)/;

        if (postInstallRegex.test(podfileContent)) {
          podfileContent = podfileContent.replace(
            postInstallRegex,
            `$1${postInstallFix}\n$2`
          );

          fs.writeFileSync(podfilePath, podfileContent);
          console.log(
            '✅ Firebase non-modular headers fix aplicado al Podfile'
          );
        }
      }

      return config;
    }
  ]);
};

module.exports = withFirebaseNonModularFix;
