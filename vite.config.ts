import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const BUILD_ID = `mihrab-${Date.now()}`;
const LIVE_OTA_URL =
  process.env.VITE_OTA_SERVER_URL ||
  'https://ais-pre-sd7psl2bnxgqgy6mwqyrp5-846997521525.europe-west2.run.app';

export default defineConfig(() => {
  return {
    define: {
      __APP_BUILD_ID__: JSON.stringify(BUILD_ID),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'sw-notifications.js',
          'najm-app-icon.png',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Mihrab Noor',
          short_name: 'Mihrab',
          description:
            'Offline-first Holy Quran, 604-page Madani Mushaf (مِحْرَاب النُّور), Prayer Times & Qibla Finder with Hafs & Warsh narrations.',
          theme_color: '#27784C',
          background_color: '#F4F7F5',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}', 'data/*.json'],
          globIgnores: ['**/version.json', '**/*.apk', '**/ads.txt', '**/google*.html'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          skipWaiting: true,
          clientsClaim: true,
          importScripts: ['/sw-notifications.js'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/\.apk$/i, /\/version\.json$/i, /\/ads\.txt$/i, /\/google[a-z0-9]+\.html$/i],
          runtimeCaching: [
            {
              urlPattern: /\/data\/.*\.json$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'najm-quran-json-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'serve-android-apk-and-version',
        configureServer(server) {
          const devBuildId = BUILD_ID;
          server.middlewares.use((req, res, next) => {
            if (req.url && /^\/version\.json(\?.*)?$/i.test(req.url)) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(
                JSON.stringify({
                  version: '3.2.0',
                  buildId: devBuildId,
                  otaUrl: LIVE_OTA_URL,
                  apkUrl: '/mihrab-noor.apk',
                })
              );
              return;
            }
            if (req.url && /^\/(naghma-quran|najm-quran)\.apk(\?.*)?$/i.test(req.url)) {
              req.url = '/mihrab-noor.apk';
            }
            if (req.url && /\.apk(\?.*)?$/i.test(req.url)) {
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="mihrab-noor.apk"');
              res.setHeader('X-Content-Type-Options', 'nosniff');
            }
            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && /^\/version\.json(\?.*)?$/i.test(req.url)) {
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
              res.setHeader('Access-Control-Allow-Origin', '*');
            }
            if (req.url && /^\/(naghma-quran|najm-quran)\.apk(\?.*)?$/i.test(req.url)) {
              req.url = '/mihrab-noor.apk';
            }
            if (req.url && /\.apk(\?.*)?$/i.test(req.url)) {
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="mihrab-noor.apk"');
              res.setHeader('X-Content-Type-Options', 'nosniff');
            }
            next();
          });
        },
      },
      {
        name: 'write-version-manifest',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          if (fs.existsSync(distDir)) {
            fs.writeFileSync(
              path.join(distDir, 'version.json'),
              JSON.stringify({
                version: '3.2.0',
                buildId: BUILD_ID,
                otaUrl: LIVE_OTA_URL,
                apkUrl: '/mihrab-noor.apk',
              }),
              'utf-8'
            );
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
