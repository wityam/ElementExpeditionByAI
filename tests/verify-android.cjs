'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const gradle = read('android/app/build.gradle.kts');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const activity = read('android/app/src/main/java/org/chatbox/elementexpedition/MainActivity.kt');
const workflow = read('.github/workflows/android.yml');
const requiredWebAssets = ['index.html', 'styles.css', 'game.js', 'pwa.js', 'service-worker.js', 'manifest.webmanifest', 'icons/**'];
for (const asset of requiredWebAssets) assert.ok(gradle.includes(`"${asset}"`), `Gradle sync includes ${asset}`);
assert.match(gradle, /tasks\.named\("preBuild"\)[\s\S]*dependsOn\(syncWebAssets\)/);
assert.match(gradle, /compileSdk\s*=\s*35/);
assert.match(gradle, /minSdk\s*=\s*23/);
assert.match(gradle, /targetSdk\s*=\s*35/);
assert.match(gradle, /sourceCompatibility\s*=\s*JavaVersion\.VERSION_17/);
assert.match(gradle, /targetCompatibility\s*=\s*JavaVersion\.VERSION_17/);
assert.match(gradle, /jvmTarget\s*=\s*JavaVersion\.VERSION_17\.toString\(\)/);
assert.match(manifest, /android:exported="true"/);
assert.match(manifest, /android:icon="@mipmap\/ic_launcher"/);
assert.match(activity, /WebViewAssetLoader/);
assert.match(activity, /https:\/\/appassets\.androidplatform\.net\/assets\/index\.html/);
assert.match(activity, /settings\.javaScriptEnabled = true/);
assert.match(activity, /settings\.allowFileAccess = false/);
assert.match(activity, /MIXED_CONTENT_NEVER_ALLOW/);
assert.match(activity, /setOnApplyWindowInsetsListener/);
assert.match(activity, /consumeSystemWindowInsets\(\)/);
assert.match(workflow, /runs-on:\s*ubuntu-24\.04/);
assert.match(workflow, /actions\/checkout@v7/);
assert.match(workflow, /actions\/setup-java@v6/);
assert.match(workflow, /android-actions\/setup-android@v4/);
assert.match(workflow, /gradle\/actions\/setup-gradle@v6/);
assert.match(workflow, /actions\/upload-artifact@v7/);
assert.match(workflow, /platforms;android-35/);
assert.match(workflow, /build-tools;35\.0\.0/);
assert.match(workflow, /gradle --no-daemon -p android :app:assembleDebug/);
assert.match(workflow, /actions\/upload-artifact@v7/);
for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
  const icon = path.join(root, 'android/app/src/main/res', `mipmap-${density}`, 'ic_launcher.png');
  assert.ok(fs.existsSync(icon), `Android launcher icon for ${density} exists`);
  assert.equal(fs.readFileSync(icon).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
}
console.log('PASS: Android WebView wrapper, bundled web assets, launcher icons, and GitHub Actions APK build configuration.');
