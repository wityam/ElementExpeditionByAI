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
