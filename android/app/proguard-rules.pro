# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ===========================
# React Native Essential Rules
# ===========================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Turbo Modules
-keep class com.facebook.react.turbomodule.** { *; }

# ===========================
# Samsung Android 14+ Specific
# ===========================
# Keep SplashScreen related classes
-keep class androidx.core.splashscreen.** { *; }
-keep class com.zoontek.rnbootsplash.** { *; }

# Keep MainActivity and MainApplication
-keep class com.portmanagement.MainActivity { *; }
-keep class com.portmanagement.MainApplication { *; }

# ===========================
# Firebase & Google Play Services
# ===========================
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**

# ===========================
# CodePush
# ===========================
-keep class com.microsoft.codepush.** { *; }
-keepclassmembers class com.microsoft.codepush.** { *; }

# ===========================
# React Native Vector Icons
# ===========================
-keep class com.oblador.vectoricons.** { *; }

# ===========================
# React Native Localize
# ===========================
-keep class com.zoontek.rnlocalize.** { *; }

# ===========================
# React Native Gesture Handler
# ===========================
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# ===========================
# OkHttp & Network
# ===========================
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ===========================
# JSC (JavaScript Core)
# ===========================
-keep class org.webkit.** { *; }

# ===========================
# General Android Rules
# ===========================
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
