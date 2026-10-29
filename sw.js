const CACHE = "qcd-v2.3";
const FILES = ["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png",
  "vendor/vexflow-min.js","vendor/html2canvas.min.js","vendor/jspdf.umd.min.js","vendor/inter.woff2"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Prima la cache (funziona offline), aggiornando in background quando c'è rete
self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch:true}).then(hit=>{
    const net = fetch(req).then(r=>{
      if(r && r.ok){ const cp = r.clone(); caches.open(CACHE).then(c=>c.put(req, cp)); }
      return r;
    }).catch(()=>hit || (req.mode === "navigate" ? caches.match("index.html") : undefined));
    return hit || net;
  }));
});
