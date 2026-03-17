// ─── Registro del Service Worker ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker registrado:', reg.scope))
      .catch(err => console.error('[PWA] Error al registrar SW:', err));
  });
}

// ─── Banner de instalación (botón "Instalar App") ────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  showInstallBanner();
});

function showInstallBanner() {
  // Si ya existe el banner, no duplicar
  if (document.getElementById('pwa-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #7c00ff;
      color: white;
      padding: 14px 24px;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 9999;
      font-family: sans-serif;
      font-size: 15px;
      max-width: 90vw;
    ">
      <span>📲 Instala PocketPal en tu celular</span>
      <button id="pwa-install-btn" style="
        background: white;
        color: #4f46e5;
        border: none;
        padding: 8px 18px;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        font-size: 14px;
      ">Instalar</button>
      <button id="pwa-dismiss-btn" style="
        background: transparent;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;
      ">✕</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('pwa-install-btn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Usuario eligió:', outcome);
    deferredPrompt = null;
    banner.remove();
  });

  document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
    banner.remove();
  });
}

// ─── Detectar si ya está instalada ───────────────────────────────────────────
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App instalada correctamente');
  deferredPrompt = null;
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
});