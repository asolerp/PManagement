/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * <p>This source code is licensed under the MIT license found in the LICENSE file in the root
 * directory of this source tree.
 */
package com.portmanagement;

import android.content.Context;
import com.facebook.react.ReactInstanceManager;

/**
 * Class responsible of loading Flipper inside your React Native application. This is the debug
 * flavor of it. Here you can add your own plugins and customize the Flipper setup.
 * 
 * Note: Flipper is currently disabled to avoid compilation errors.
 * To enable Flipper, add the necessary dependencies to build.gradle and uncomment the code below.
 */
public class ReactNativeFlipper {
  public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    // Flipper is currently disabled
    // To enable Flipper, add the following dependencies to android/app/build.gradle:
    // debugImplementation 'com.facebook.flipper:flipper:0.125.0'
    // debugImplementation 'com.facebook.flipper:flipper-network-plugin:0.125.0'
    // debugImplementation 'com.facebook.flipper:flipper-fresco-plugin:0.125.0'
    // debugImplementation 'com.facebook.soloader:soloader:0.10.4'
  }
}
