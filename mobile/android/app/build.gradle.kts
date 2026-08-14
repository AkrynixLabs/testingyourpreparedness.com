import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Optional release keystore, provided by CI (see .github/workflows/mobile-ci.yml)
// as android/app/key.properties + android/app/release.keystore, both gitignored
// (Flutter's own template .gitignore rule) and never committed. Falls back to
// the debug signing config when absent, e.g. on a local `flutter build apk`.
val keyPropertiesFile = file("key.properties")
val hasReleaseSigning = keyPropertiesFile.exists()
val keyProperties = Properties()
if (hasReleaseSigning) {
    keyProperties.load(FileInputStream(keyPropertiesFile))
}

android {
    namespace = "com.typ.mobile.typ_mobile"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.typ.mobile.typ_mobile"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(keyProperties["storeFile"] as String)
                storePassword = keyProperties["storePassword"] as String
                keyAlias = keyProperties["keyAlias"] as String
                keyPassword = keyProperties["keyPassword"] as String
            }
        }
    }

    buildTypes {
        release {
            // Every build without a release keystore present (e.g. local
            // `flutter run --release`) still falls back to the debug key so
            // that command keeps working with zero setup - only CI, which
            // provisions key.properties from a persisted secret, signs with
            // a real, stable release key. This is what fixes "App not
            // installed" on a device that already has an older CI build:
            // previously every CI run signed with a fresh, ephemeral debug
            // keystore (GitHub's runners don't persist ~/.android/debug.keystore
            // across runs), so consecutive builds had different signatures
            // and Android refused to install over the existing app.
            signingConfig = if (hasReleaseSigning) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
