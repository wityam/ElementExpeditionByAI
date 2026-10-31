# Implementation changes

## Android CI failure and warning fixes
- Confirmed from the public GitHub Actions run API that the failed step was `Set up Android SDK`; SDK package installation and Gradle compilation were skipped. The run annotations also showed Node 20 action warnings and the future ubuntu-latest migration notice.
- Updated checkout/setup-java/setup-android/Gradle setup/artifact upload to current major releases and pinned the runner to Ubuntu 24.04. This moves JavaScript actions to Node 24 and removes reliance on a moving runner label.
- Updated Android CI integration assertions to guard the runner and action versions. An actual build still needs a new GitHub Actions run; Android SDK and Gradle are not available locally.

## Android wrapper
- Added a standalone Kotlin/Gradle Android project that wraps the web game in a full-screen WebView using AndroidX `WebViewAssetLoader` on its app-local HTTPS origin. File access, cleartext traffic, and mixed content remain disabled.
- Added a `preBuild` Gradle sync task to package the current HTML, CSS, JavaScript, manifest, and icons directly into the APK, keeping Android content aligned with the web app and available offline.
- Added density-specific Android launcher icons, a GitHub Actions workflow that builds and uploads a debug APK, and README instructions for obtaining/testing the CI artifact. Release signing is intentionally out of scope.
- Added a Node integration check for asset sync coverage, WebView security settings, launcher resources, and workflow configuration. Android SDK/Gradle are not installed locally, so an actual APK build must be verified by GitHub Actions; CI explicitly installs API 35 and Build Tools 35.0.0.


## PWA deployment packaging
- Added `manifest.webmanifest` with standalone display, relative base-path URLs, app metadata, and SVG plus 192px/512px PNG icons (512px maskable); linked install metadata and an Apple touch PNG from the page.
- Added secure-context service-worker registration (`https:` and localhost) and a versioned cache-first app shell for offline use. Navigations use network-first with cached app-shell fallback; old app cache versions are cleaned up on activation.
- Added `README.md` with static-host deployment prerequisites, MIME types, subdirectory support, HTTPS requirements, offline behavior, and cache-version update instructions.
- Added automated PWA checks for manifest/icon validity, registration conditions, app-shell coverage, and offline navigation fallback. PNG artwork was visually inspected.

## Initial design → structure and styling
- Implemented the single-page welcome, quiz, field guide, and results views using semantic HTML, responsive CSS, visible focus states, live feedback, and reduced-motion support.
- Kept the field-lab visual direction, replacing decorative image dependencies with CSS and text-based motifs.
- Removed a proposed Google Fonts import so the game remains fully usable offline and has no runtime network dependency; system sans/monospace fallbacks preserve the intended hierarchy.

## Structure → interaction
- Added a vetted 20-element data set, balanced rotating clue types, shuffled unique choices, a 10-question no-repeat session, speed bonus, streak, explanations, and replay.
- Added A–D keyboard shortcuts, search by name/symbol/number, and context-aware back navigation from the guide.
- Implemented feedback through DOM text nodes rather than injecting answer content as HTML.

## Verification adjustments
- Added a dependency-free Node test harness that simulates the required DOM controls and checks data integrity, session flow, choice uniqueness, scoring, study search, and wrong-answer behavior.
- Normalized cross-VM arrays in one test assertion with `Array.from`; Node’s strict deep comparison distinguishes arrays with different realm prototypes even when their contents match. This was a test issue, not a game defect.
- Final accessibility review moves focus to each view’s heading after navigation (with `tabindex="-1"`), while study search remains one Tab away; automated tests verify all navigation destinations exist.
- Verified rendering in Firefox headless at desktop (1365×1000) and narrow mobile (390×844) viewport sizes. The settled desktop home screen renders as designed; the mobile view stacks content, keeps both actions accessible, and shows the element tile without horizontal clipping. Animation timing initially caused partial screenshots, so visual captures were repeated with motion disabled in a temporary Firefox profile; no browser-only visual issue was found.
- Automated logic and static structure tests pass. The game interaction flow was simulated in the Node harness rather than manually exercised in a visible browser session.
