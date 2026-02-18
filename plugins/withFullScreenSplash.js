/* eslint-disable immutable/no-mutation */
/**
 * plugins/withFullScreenSplash.js
 *
 * Config plugin that makes the splash screen fill the entire screen
 * using assets/bootsplash/splash@2x.png (and its 1x/3x variants).
 *
 * Must be listed AFTER 'expo-splash-screen' in app.config.js plugins
 * so it overrides the default 100×100 centered layout.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withFullScreenSplash(config) {
  // ─── iOS ───────────────────────────────────────────────────────
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const platformRoot = cfg.modRequest.platformProjectRoot;
      const projectRoot = cfg.modRequest.projectRoot;
      const assetsDir = path.join(projectRoot, 'assets', 'bootsplash');
      const appName = 'PortManagement';

      // 1. Copy full-screen images to the SplashScreenLogo imageset
      const imagesetDir = path.join(
        platformRoot,
        appName,
        'Images.xcassets',
        'SplashScreenLogo.imageset'
      );

      if (fs.existsSync(imagesetDir)) {
        const copies = [
          ['splash@1x.png', 'image.png'],
          ['splash@2x.png', 'image@2x.png'],
          ['splash.png', 'image@3x.png'],
        ];
        for (const [src, dest] of copies) {
          const srcPath = path.join(assetsDir, src);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.join(imagesetDir, dest));
          }
        }
      }

      // 2. Rewrite storyboard so the image fills the entire screen
      const storyboardPath = path.join(
        platformRoot,
        appName,
        'SplashScreen.storyboard'
      );

      if (fs.existsSync(storyboardPath)) {
        let sb = fs.readFileSync(storyboardPath, 'utf8');

        // Replace image frame → full container
        sb = sb.replace(
          /(<imageView[^>]*id="EXPO-SplashScreen"[^>]*>)\s*<rect key="frame"[^/]*\/>/s,
          '$1\n                                <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>'
        );

        // Replace constraints → pin all edges
        sb = sb.replace(
          /<constraints>[\s\S]*?<\/constraints>/,
          `<constraints>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="top" secondItem="EXPO-ContainerView" secondAttribute="top" id="splashTop"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="bottom" secondItem="EXPO-ContainerView" secondAttribute="bottom" id="splashBottom"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="leading" secondItem="EXPO-ContainerView" secondAttribute="leading" id="splashLeading"/>
                            <constraint firstItem="EXPO-SplashScreen" firstAttribute="trailing" secondItem="EXPO-ContainerView" secondAttribute="trailing" id="splashTrailing"/>
                        </constraints>`
        );

        // Update resource image intrinsic size
        sb = sb.replace(
          /<image name="SplashScreenLogo" width="[^"]*" height="[^"]*"\/>/,
          '<image name="SplashScreenLogo" width="375" height="812"/>'
        );

        fs.writeFileSync(storyboardPath, sb, 'utf8');
      }

      return cfg;
    },
  ]);

  // ─── Android ───────────────────────────────────────────────────
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const platformRoot = cfg.modRequest.platformProjectRoot;
      const projectRoot = cfg.modRequest.projectRoot;
      const assetsDir = path.join(projectRoot, 'assets', 'bootsplash');
      const resDir = path.join(platformRoot, 'app', 'src', 'main', 'res');

      // Copy full splash image to each density bucket.
      // expo-splash-screen's SplashScreenManager reads splashscreen_logo
      // and renders it with the configured resize_mode (cover).
      const densityMap = {
        'drawable-mdpi': 'splash@1x.png',
        'drawable-hdpi': 'splash@1x.png',
        'drawable-xhdpi': 'splash@2x.png',
        'drawable-xxhdpi': 'splash@2x.png',
        'drawable-xxxhdpi': 'splash.png',
      };

      for (const [folder, srcFile] of Object.entries(densityMap)) {
        const destDir = path.join(resDir, folder);
        const srcPath = path.join(assetsDir, srcFile);
        if (fs.existsSync(destDir) && fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.join(destDir, 'splashscreen_logo.png'));
        }
      }

      return cfg;
    },
  ]);

  return config;
}

module.exports = withFullScreenSplash;
