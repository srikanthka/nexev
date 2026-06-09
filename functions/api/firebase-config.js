/**
 * Cloudflare Pages Function: GET /api/firebase-config
 *
 * Returns Firebase client SDK config built from Cloudflare environment variables.
 * Set these in Pages → Settings → Environment variables:
 *   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL,
 *   FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET,
 *   FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
 */
export async function onRequestGet(context) {
  const env = context.env;

  if (!env.FIREBASE_API_KEY) {
    /* Return 404 (not 500) so search crawlers don't flag this as a server error.
       The real fix is setting FIREBASE_* env vars in Cloudflare Pages settings. */
    return new Response(
      JSON.stringify({ error: 'Not configured.' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const config = {
    apiKey:            env.FIREBASE_API_KEY,
    authDomain:        env.FIREBASE_AUTH_DOMAIN,
    databaseURL:       env.FIREBASE_DATABASE_URL,
    projectId:         env.FIREBASE_PROJECT_ID,
    storageBucket:     env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId:             env.FIREBASE_APP_ID,
  };

  return new Response(JSON.stringify(config), {
    headers: {
      'Content-Type': 'application/json',
      /* Config is not secret (Firebase keys are public by design) but
         no-store prevents CDN caching — ensures config changes deploy immediately */
      'Cache-Control': 'private, no-store',
    },
  });
}
