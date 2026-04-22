# PWA_PERFORMANCE.md — Schulte Tunisia Candidate App
# Performance Architecture + PWA Setup
# Agent: diagnose first, fix in order, do not skip steps.
# Do not touch backend. Do not touch HR or Admin apps.

---

## What the logs are telling you right now

First compile: 37.8 seconds. First response: 42 seconds.
Subsequent routes: 3-6 seconds each on first visit.

This is not a network problem. This is a compilation problem caused by three
things happening at the same time:

1. Webpack and Turbopack are both configured. They are fighting each other.
   Next.js 15 with --turbopack flag ignores your next.config webpack config
   but still loads and parses it, which means you are paying the cost of both
   bundlers during dev startup without getting the benefit of either.

2. The bundle includes things it should not include at initial load. Heavy
   libraries (framer-motion, react-pdf, jsPDF, socket.io-client) are likely
   being imported at the root layout level or in components that load on every
   page, which means every page compile drags in the entire dependency tree.

3. No code splitting is happening intentionally. Next.js does automatic route-
   level splitting but if you import heavy components at the top of a file
   instead of dynamically, they block the initial compile and the initial paint.

These three problems explain 90% of what you are seeing. Fix them in order.

---

## PHASE 1 — Stop the Webpack/Turbopack conflict (do this first, takes 10 minutes)

The warning "Webpack is configured while Turbopack is not" means your
next.config file has a webpack() function or webpack-specific plugin
(like next-pwa's older versions, bundle analyzer, or a custom loader).

Turbopack does not use webpack config. When both exist, dev startup is
slower than either alone because Next.js resolves the conflict at startup.

What the agent must do:
- Open next.config.ts (or .js or .mjs — whichever exists)
- Find any webpack() function or webpack plugin configuration
- If it is from next-pwa: next-pwa's standard version uses webpack under the
  hood. You need to either remove it from dev mode or switch to @ducanh2912/
  next-pwa which has native Turbopack support and does not inject webpack config
- Remove or guard every webpack-specific block behind a
  process.env.NODE_ENV === 'production' check so it only runs during builds,
  never during dev
- After this change, restart dev server and the startup warning should be gone
- Expected result: first compile drops from 37s to under 10s

---

## PHASE 2 — Fix the import architecture (the biggest performance lever)

The rule: heavy libraries must never be imported at the top of a file that
renders on the initial page load. They must be loaded only when needed.

Identify and fix these specific patterns:

### Pattern A — socket.io-client
Socket.io-client is a large library (~200kb). If it is imported at the top
of your root layout (app/layout.tsx) or in a provider that wraps every page,
it loads on every single route including login and register where it is not
needed at all.

Fix: the socket connection should only be initialized after the user is
authenticated. Move the SocketProvider so it only wraps the (main) route
group layout, not the root layout. This way login and register pages never
load socket.io-client.

### Pattern B — framer-motion
Framer-motion is large (~150kb). If you are importing { motion } at the top
of components that are imported at the layout level, it loads on every page.

Fix: any component that uses framer-motion and is not needed on the initial
screen should be dynamically imported with Next.js dynamic() and the
loading state should be a simple CSS fade-in instead of a motion component.

### Pattern C — jsPDF and html2canvas
These are extremely heavy (jsPDF ~500kb, html2canvas ~200kb). They should
never be imported at the top of any file. They are only needed when the user
clicks "Generate my CV."

Fix: these must be dynamically imported inside the function that generates
the CV, at the moment the user triggers the action. Not at component mount.
Not at file top. Only inside the click handler, lazily.

### Pattern D — react-pdf (pdfjs-dist)
pdfjs-dist is enormous (~3MB for the full worker). If it is loaded anywhere
in the component tree that renders by default, it will destroy initial load
time on mobile.

Fix: the CV viewer component must be dynamically imported with Next.js
dynamic() and ssr: false. The PDF only renders inside the (main) layout
and only when HR opens a drawer, so it should never appear in the candidate
PWA at all. Confirm it is not imported anywhere in the candidate app.
If it is, remove it entirely.

---

## PHASE 3 — Next.js configuration for speed

These settings belong in next.config.ts. They do not conflict with Turbopack.

### Turbopack-clean config
The next.config should have the Turbopack section configured explicitly so
Next.js does not need to guess. Turbopack resolves aliases differently than
webpack and if aliases are set in webpack config only, Turbopack silently
skips them which causes module resolution delays.

### Image optimization
If the app has any next/image components pointing at external URLs (Cloudinary,
S3, your own backend /uploads route), the domains or remotePatterns must be
configured. Without this, every image request fails with a 400 during dev
which adds waterfall delays in the Network tab even if images are not visible.

### Package import optimization
The experimental.optimizePackageImports option (already shown in your logs
as enabled) helps but only for packages that support tree-shaking. Confirm
that framer-motion, lucide-react (or whatever icon library you chose), and
any component library is listed there. Lucide imports the entire icon set
if you import from 'lucide-react' without tree-shaking — it should be in
optimizePackageImports.

### Strict mode in production only
React Strict Mode causes every component to render twice in development.
This doubles compile time for complex component trees. During development,
consider disabling reactStrictMode temporarily if compile times are the
priority. Re-enable before production build.

---

## PHASE 4 — PWA setup (the right way with Turbopack)

The standard next-pwa package uses webpack InjectManifest under the hood.
This is the source of your Turbopack conflict. The correct approach for
Next.js 15 with Turbopack is:

### Use @ducanh2912/next-pwa instead of next-pwa

@ducanh2912/next-pwa is a fork maintained specifically for Next.js 13+ and
has been updated for Turbopack compatibility. It does not inject webpack
config. It generates the service worker during the build process and does
not interfere with dev mode at all.

The agent should:
1. Remove next-pwa from dependencies
2. Remove any withPWA wrapper from next.config that came from next-pwa
3. Install @ducanh2912/next-pwa
4. Wrap the next.config export with withPWA from @ducanh2912/next-pwa
5. Set disable: process.env.NODE_ENV === 'development' so the service worker
   is never registered during dev (this is critical — PWA service worker in
   dev mode causes aggressive caching that makes hot reload stop working)

### manifest.json placement and content
The manifest.json must be in the /public folder and must be linked in the
root layout's metadata. The required fields for Android installability are:
name, short_name, start_url, display: standalone, background_color,
theme_color, icons (at minimum 192x192 and 512x512 in PNG format).

The theme_color in the manifest must match the meta theme-color in the
HTML head. If they differ, Android Chrome shows a color flash on launch.
For this app, both should be #F4F2EF (the warm page background).

### Icons
Two sizes are required for Android installability:
- 192x192: used for the home screen icon on most Android devices
- 512x512: used for the splash screen and Play Store listing
Both must be maskable (safe zone in the center 80% of the image) so Android
can apply rounded corner masks without clipping the logo.

A maskable icon has purpose: "maskable any" in the manifest. If you only have
one set, use purpose: "any maskable" which tells Android to use it for both.

### Service worker strategy — do not cache everything
The default next-pwa service worker tries to precache the entire Next.js
build. This is wrong for a mobile app where data changes constantly.

The correct caching strategy:
- App shell (layout, fonts, manifest, icons): cache-first, long TTL
- API calls to /api/*: network-first with a 3-second timeout, then serve
  stale if available. This means the offers list loads instantly from cache
  even on slow 3G while a fresh fetch happens in background.
- Images from /uploads: cache-first with a 7-day max-age. CV files do not
  change once uploaded.
- Static assets (JS chunks, CSS): stale-while-revalidate. Next.js assets
  have hashed filenames so the cache is invalidated automatically on build.
- Never cache: POST requests, auth endpoints, socket connections.

### Offline behavior
When the app is offline, the candidate should see their last-loaded offers
list and their application status from cache. They should not see a blank
page or a browser error.

The service worker's fallback page (the page shown when the network fails
and no cache exists) should be a custom /offline page that tells the user
they are offline and shows their last cached application status if available.

Without a fallback page configured, Android shows the Chrome dinosaur game.
That is not acceptable for a professional recruitment app.

---

## PHASE 5 — Runtime performance on mobile

These changes affect how the app feels on a mid-range Android phone once
it loads. They do not affect compile time.

### TanStack Query configuration
The default staleTime in TanStack Query is 0, meaning every component mount
triggers a background refetch. On mobile where network round trips are slow,
this causes visible loading flickers on every navigation.

For this app:
- Offers list: staleTime 60 seconds. Offers do not change every second.
- My applications: staleTime 30 seconds. Status changes are pushed via
  socket anyway so polling is redundant.
- Notifications: staleTime 15 seconds.
- Single offer detail: staleTime 120 seconds.

Also set gcTime (formerly cacheTime) to at least 5 minutes so navigating
back to the home screen does not re-mount with empty state.

### Socket.io connection management
Socket.io should connect once on authentication and disconnect on logout.
It must not reconnect on every navigation or on every component mount.

The socket singleton pattern (a module-level variable that holds the single
socket instance) must be in place. If socket.io-client is creating a new
connection every time a component mounts, the app will have multiple
parallel connections on mobile which drains battery and causes duplicate
real-time events.

The connect call must be behind a guard: if the socket already exists and
is connected, return the existing socket. Do not create a new one.

### Image and font loading
The Plus Jakarta Sans and JetBrains Mono fonts must be loaded via next/font,
not via a Google Fonts link tag in the layout. next/font downloads fonts at
build time and serves them from your own domain with optimal caching headers.
A Google Fonts link tag in the layout makes a DNS lookup + round trip to
Google's servers on every cold page load, which on mobile 3G can add 200-400ms
to First Contentful Paint.

### Viewport and scroll behavior
The candidate PWA scrolls within the page, not within a div. Using overflow:
auto on inner divs instead of letting the browser handle scrolling disables
native momentum scrolling on iOS and Android, making the app feel sluggish
and janky compared to native apps.

Remove overflow: auto and overflow: scroll from any container that wraps
a scrollable list. Let the page scroll naturally. The bottom navigation
should be position: sticky at the bottom of the flow, not fixed — fixed
positioning causes layout shifts during keyboard appearance on Android.

### Bundle size target
After all fixes, the initial JS bundle served to the user on first visit
should be under 200kb (gzipped). Run next build and check the output.
Any route over 100kb (gzipped) should be investigated for unnecessary imports.

---

## PHASE 6 — Verifying it worked

After each phase, verify with a specific test before moving to the next.

Phase 1 verification: `npm run dev` should start with no Webpack/Turbopack
warning. First compile should be under 10 seconds.

Phase 2 verification: open the Network tab in Chrome DevTools, navigate to
/login. The transferred JS should be under 150kb. If you see pdfjs or jsPDF
in the network requests on the login page, the dynamic import fix did not work.

Phase 3 verification: `npm run build` should complete without warnings about
large chunks. The build output shows gzipped sizes per route.

Phase 4 verification: open Chrome DevTools > Application > Manifest. The
manifest must parse without errors. Application > Service Workers must show
the service worker as active. On Android Chrome, the browser should offer
an "Add to Home Screen" prompt after visiting the app twice.

Phase 5 verification: throttle the network to "Slow 3G" in Chrome DevTools.
Navigate between Offers and Applications. You should see cached content
immediately with a background refresh indicator, not a blank loading screen.

---

## What not to touch

Do not modify the backend. The performance issues are entirely in the
frontend build and import architecture. The backend response times are
not the bottleneck — 42 seconds comes from compile time, not API latency.

Do not touch the HR dashboard or Admin dashboard. This document is for
the candidate PWA only. The other apps have different dependency profiles
and need their own analysis.

Do not add a CDN or edge deployment yet. Fix the compile and bundle issues
first. A CDN serving a 500kb unoptimized bundle is still slow.

Do not add more caching layers (Redis, etc.) to the backend to compensate
for slow frontend loads. That is the wrong fix for the wrong problem.