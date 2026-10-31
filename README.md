# Element Expedition

A dependency-free chemistry quiz PWA for students in Grades 7–9. It covers the first 20 elements and works offline after its first successful load.

## Deploy

Publish the contents of this directory to a static web server. No build step, package manager, or server-side runtime is needed. Ensure the server:

- Serves the site over **HTTPS** (required for service workers and installation), or use `http://localhost` for local development.
- Preserves the directory structure and serves `index.html` as the default document.
- Sends correct MIME types: `.webmanifest` as `application/manifest+json` (or `application/json`), `.js` as `text/javascript`, `.css` as `text/css`, `.svg` as `image/svg+xml`, and `.png` as `image/png`.
- Publishes `service-worker.js` at the same base path as `index.html`. The worker scope and all manifest/resource paths are relative, so the app can be hosted at a domain root or a subdirectory.

Example local preview (Node.js):

```sh
npx serve .
```

Then open the HTTPS URL it provides, or use a localhost static server. Opening `index.html` directly with `file://` does not enable PWA installation/offline caching.

## Test deployment with GitHub Pages

GitHub Pages supports this static PWA. To publish a test build:

1. Push this repository and the branch you want to test to GitHub.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the test branch and the `/(root)` folder, then click **Save**. The app needs no build command.
5. Wait for the Pages deployment to finish, then open the URL shown on the Pages settings page. For a project repository, it is usually `https://<owner>.github.io/<repository>/`.

The app uses relative URLs and can run from the project subdirectory. GitHub Pages provides HTTPS, which is required for service-worker registration, installation, and offline caching. After the first successful load, test offline mode by disconnecting the network and reloading. When testing updates, increment `CACHE_NAME` in `service-worker.js` before publishing so the service worker replaces its cached app shell.

## Android app (GitHub Actions build)

The `android/` project wraps the same HTML/CSS/JavaScript game in an Android WebView. Gradle copies the current web app and icons into the APK during `preBuild`, so the packaged game runs locally without a network connection. The wrapper uses AndroidX `WebViewAssetLoader` with a secure app-local HTTPS origin; it does not enable file access or cleartext traffic.

To build and download a test APK without installing Android Studio or the Android SDK locally:

1. Push the branch to GitHub.
2. Open the repository’s **Actions** tab and select **Build Android APK** (or let it run after a push or pull request).
3. Open the successful workflow run and download the `element-expedition-android-debug` artifact.
4. Unzip the artifact and install `app-debug.apk` on an Android device or emulator. You may need to allow installation from that download source.

This workflow produces an unsigned **debug APK** for testing, not a Play Store release. A release build should use a securely stored signing key and separate release workflow. Android project settings are in `android/`; CI runs `gradle -p android :app:assembleDebug` using JDK 17, Gradle 8.10.2, Android API 35, and Ubuntu 24.04.

## Install and offline behavior

The web app manifest provides standalone display settings and SVG/PNG icons. After the app shell loads, the service worker caches HTML, CSS, JavaScript, manifest, and icons. Navigations use the network first, then the cached app shell when offline; same-origin app resources use cache first and are cached after a successful fetch. A later service-worker version removes older `element-expedition-*` caches.

When deploying an update, increment `CACHE_NAME` in `service-worker.js` (for example, `v1` to `v2`) so clients install a fresh app shell. Configure your host to revalidate the service worker script rather than serving a stale copy indefinitely. Static assets may use long-lived caching if filenames are versioned or the service worker cache version is bumped.

## Verify

With Node.js installed, run:

```sh
node tests/verify-structure.cjs
node tests/verify-game.cjs
node tests/verify-pwa.cjs
```

The PWA test checks manifest/icon references, install metadata, service-worker cache coverage, registration security conditions, and basic worker fetch/offline behavior.
