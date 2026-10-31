import org.gradle.api.tasks.Sync

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val webAssetsDir = layout.buildDirectory.dir("generated/elementExpeditionAssets")

val syncWebAssets by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) {
        include("index.html", "styles.css", "game.js", "pwa.js", "service-worker.js", "manifest.webmanifest")
        include("icons/**")
    }
    into(webAssetsDir)
}

android {
    namespace = "org.chatbox.elementexpedition"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.chatbox.elementexpedition"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    sourceSets {
        getByName("main").assets.srcDir(webAssetsDir)
    }

    buildFeatures {
        buildConfig = false
    }
}

tasks.named("preBuild") {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
