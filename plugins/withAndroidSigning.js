const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Config plugin para configurar Android signing automáticamente
 * Lee las credenciales desde variables de entorno o archivos locales
 */
const withAndroidSigning = config => {
  return withGradleProperties(config, config => {
    // Path al keystore (relativo a android/app/)
    const keystorePath =
      process.env.ANDROID_KEYSTORE_PATH || 'portmanagement.keystore';
    const keystorePassword = process.env.ANDROID_KEYSTORE_PASSWORD || '';
    const keyAlias = process.env.ANDROID_KEY_ALIAS || 'portmanagement';
    const keyPassword = process.env.ANDROID_KEY_PASSWORD || '';

    // Agregar propiedades de signing si las credenciales existen
    if (keystorePassword && keyPassword) {
      config.modResults.push({
        type: 'property',
        key: 'MYAPP_UPLOAD_STORE_FILE',
        value: keystorePath
      });
      config.modResults.push({
        type: 'property',
        key: 'MYAPP_UPLOAD_STORE_PASSWORD',
        value: keystorePassword
      });
      config.modResults.push({
        type: 'property',
        key: 'MYAPP_UPLOAD_KEY_ALIAS',
        value: keyAlias
      });
      config.modResults.push({
        type: 'property',
        key: 'MYAPP_UPLOAD_KEY_PASSWORD',
        value: keyPassword
      });

      console.log('✅ Android signing configurado desde variables de entorno');
    } else {
      console.log(
        '⚠️  Variables de entorno para Android signing no encontradas'
      );
      console.log(
        '   Define: ANDROID_KEYSTORE_PASSWORD y ANDROID_KEY_PASSWORD'
      );
    }

    return config;
  });
};

module.exports = withAndroidSigning;
