const CACHE_VERSION = 'v5';
const CORE_CACHE = `aura-studio-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `aura-studio-runtime-${CACHE_VERSION}`;
const ALL_CACHES = [CORE_CACHE, RUNTIME_CACHE];

// 核心外殼：啟動 App 所需的最小資源，離線時一定要能用
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/sw.js',
  '/clock_app.html',
  '/taskmaster.html',
  '/notepad.html',
  '/gemini_web_chat.html',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

// 外部 CDN 資源：盡量預先快取，但失敗不能拖垮整個安裝流程
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 逐一快取，單一資源失敗不影響其他資源（比 cache.addAll 更有彈性）
async function cacheEach(cacheName, urls) {
  const cache = await caches.open(cacheName);
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const req = new Request(url, { cache: 'reload' });
      const res = await fetch(req);
      // 本站資源要求 200，CDN 跨網域資源常是 opaque（status 0）也要能快取
      if (res && (res.ok || res.type === 'opaque')) {
        await cache.put(url, res);
      } else {
        throw new Error(`Bad response for ${url}`);
      }
    })
  );
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.warn('[SW] 預先快取失敗，略過:', urls[i], r.reason);
  });
}

// 1. 安裝階段：分別快取核心資源與 CDN 資源，任何單一失敗都不會讓安裝整個中止
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[SW] 預先快取核心資源...');
      await cacheEach(CORE_CACHE, CORE_ASSETS);
      await cacheEach(RUNTIME_CACHE, CDN_ASSETS);
      await self.skipWaiting();
    })()
  );
});

// 2. 激活階段：清除舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !ALL_CACHES.includes(name))
          .map((name) => {
            console.log('[SW] 清除舊版本快取:', name);
            return caches.delete(name);
          })
      );
      await self.clients.claim();
    })()
  );
});

// 3. 攔截請求：依資源類型採用不同策略，全面提升離線可用性
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';
  const isSameOrigin = url.origin === self.location.origin;

  // 導覽請求（整頁載入）：Network First，離線時退回快取好的 index.html，
  // 確保不管使用者怎麼進站，離線時都看得到畫面而不是瀏覽器的錯誤頁。
  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CORE_CACHE);
          cache.put('/index.html', networkResponse.clone());
          return networkResponse;
        } catch (err) {
          console.log('[SW] 離線狀態，改讀取快取的 index.html');
          const cache = await caches.open(CORE_CACHE);
          return (await cache.match('/index.html')) || (await cache.match('/'));
        }
      })()
    );
    return;
  }

  // 同網域的核心資源：Cache First + 背景更新（Stale-While-Revalidate），
  // 離線時立即可用，有網路時悄悄更新下一次要用的版本。
  if (isSameOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CORE_CACHE);
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) cache.put(request, networkResponse.clone());
            return networkResponse;
          })
          .catch(() => null);
        return cached || (await networkFetch) || Response.error();
      })()
    );
    return;
  }

  // 跨網域 CDN 資源（字體、Tailwind、Font Awesome 含其內部字型檔）：
  // 一樣是 Stale-While-Revalidate，離線時只要之前成功載入過就能用。
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null);
      return cached || (await networkFetch) || Response.error();
    })()
  );
});
