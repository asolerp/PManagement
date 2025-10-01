package com.portmanagement

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.os.Handler
import android.os.Looper

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String {
        return "portmanagement"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Keep splash theme for a moment
        setTheme(R.style.SplashTheme)
        super.onCreate(savedInstanceState)
        
        // Switch to main theme after a short delay
        Handler(Looper.getMainLooper()).postDelayed({
            setTheme(R.style.AppTheme)
        }, 2000) // 2 seconds delay
    }

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            mainComponentName,
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.fabricEnabled
        )
    }
}
