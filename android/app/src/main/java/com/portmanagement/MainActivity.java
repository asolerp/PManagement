package com.portmanagement;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.os.Bundle;
import com.zoontek.rnbootsplash.RNBootSplash;
import androidx.core.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "portmanagement";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // CRITICAL: Install native SplashScreen API BEFORE super.onCreate()
        // This fixes Samsung Android 12+ (API 31+) crashes
        SplashScreen.installSplashScreen(this);
        
        // Initialize RNBootSplash after native splash
        RNBootSplash.init(this, R.style.BootTheme);
        
        super.onCreate(savedInstanceState); // super.onCreate(null) with react-native-screens
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }
}
