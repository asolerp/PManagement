const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin para asegurar que build.gradle tenga la configuración de signing correcta
 */
const withAndroidSigningConfig = config => {
  return withAppBuildGradle(config, config => {
    let buildGradle = config.modResults.contents;

    // Asegurar que existe el bloque signingConfigs con release
    const signingConfigBlock = `
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }`;

    // Verificar si ya existe signingConfigs
    if (!buildGradle.includes('signingConfigs {')) {
      // Buscar el bloque android { y agregar signingConfigs después de defaultConfig
      const defaultConfigEndRegex = /(defaultConfig\s*\{[^}]*\})/s;
      if (defaultConfigEndRegex.test(buildGradle)) {
        buildGradle = buildGradle.replace(
          defaultConfigEndRegex,
          `$1\n${signingConfigBlock}`
        );
        console.log('✅ signingConfigs agregado a build.gradle');
      }
    }

    // Asegurar que buildTypes usa signingConfig
    if (
      !buildGradle.includes('signingConfig signingConfigs.release') &&
      buildGradle.includes('buildTypes {')
    ) {
      // Agregar signingConfig al release buildType
      const releaseBuildTypeRegex = /(release\s*\{[^}]*)(minifyEnabled)/;
      if (releaseBuildTypeRegex.test(buildGradle)) {
        buildGradle = buildGradle.replace(
          releaseBuildTypeRegex,
          '$1signingConfig signingConfigs.release\n            $2'
        );
        console.log('✅ signingConfig agregado a release buildType');
      }
    }

    config.modResults.contents = buildGradle;
    return config;
  });
};

module.exports = withAndroidSigningConfig;
