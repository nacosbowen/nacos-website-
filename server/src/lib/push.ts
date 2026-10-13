import webpush from 'web-push';

let configured = false;

function configure() {
  if (configured) return;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    throw new Error('VAPID keys are missing in the environment');
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
}

type Sub = { endpoint: string; p256dh: string; auth: string };

// Sends a payload to many subscriptions and returns the endpoints that are
// dead (404/410), so the caller can delete them from the database.
export async function sendPush(subs: Sub[], payload: object): Promise<string[]> {
  configure();
  const body = JSON.stringify(payload);
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(s.endpoint);
        else console.error('Push failed:', err?.statusCode || err?.message);
      }
    })
  );

  return dead;
}
