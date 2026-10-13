'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function subscribeUser() {
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const { data } = await api.get('/push/public-key');
  if (!data.publicKey) throw new Error('Push is not configured on the server');

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
    });
  }
  await api.post('/push/subscribe', sub.toJSON());
}

export default function PushPrompt() {
  const [mode, setMode] = useState<'hidden' | 'prompt' | 'ios'>('hidden');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('push-dismissed') === '1') return;
    } catch {}

    const supported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    if (!supported) {
      const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const standalone = (navigator as any).standalone === true;
      if (isIos && !standalone) setMode('ios');
      return;
    }

    if (Notification.permission === 'granted') {
      // already allowed: quietly make sure this device is saved for this account
      subscribeUser().catch(() => {});
    } else if (Notification.permission === 'default') {
      setMode('prompt');
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem('push-dismissed', '1'); } catch {}
    setMode('hidden');
  }

  async function enable() {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        await subscribeUser();
        setMode('hidden');
      } else {
        dismiss();
      }
    } catch {
      // leave the banner so they can try again
    }
    setBusy(false);
  }

  if (mode === 'hidden') return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3
      shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Get NACOS alerts on your phone
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {mode === 'ios'
            ? 'On iPhone: tap Share, then "Add to Home Screen", and open the app from there.'
            : 'Receive announcements as a popup, even when the site is closed.'}
        </p>
      </div>
      {mode === 'prompt' && (
        <button onClick={enable} disabled={busy}
          className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold disabled:opacity-50"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {busy ? '...' : 'Enable'}
        </button>
      )}
      <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600">Not now</button>
    </div>
  );
}