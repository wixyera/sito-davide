// functions/api/spotify-search.js
// Cloudflare Pages Function — gira lato server, mai nel browser.
// Cerca brani su Spotify usando il flusso "Client Credentials": non serve
// che chi visita il sito abbia un account Spotify, basta un'app Spotify
// Developer creata da te (client id + client secret salvati come variabili
// d'ambiente del progetto Cloudflare Pages, MAI nel codice frontend).
//
// Variabili d'ambiente richieste (Cloudflare Pages → Settings → Environment
// variables):
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET

// Token in cache per la durata di vita dell'istanza (evita una richiesta di
// token ad ogni ricerca; scade da solo, viene rinnovato quando serve).
let cachedToken = null; // { value, expiresAt }

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) return jsonResponse({ error: 'Manca il parametro di ricerca "q".' }, 400);

  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return jsonResponse(
      { error: 'Ricerca Spotify non configurata: mancano SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET nelle variabili d\'ambiente del progetto.' },
      500
    );
  }

  try {
    const token = await getAccessToken(clientId, clientSecret);

    const searchUrl = new URL('https://api.spotify.com/v1/search');
    searchUrl.searchParams.set('q', q);
    searchUrl.searchParams.set('type', 'track');
    searchUrl.searchParams.set('limit', '10');

    const res = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token forse scaduto in anticipo: invalida la cache e segnala errore.
      cachedToken = null;
      return jsonResponse({ error: `Spotify ha risposto con errore ${res.status}.` }, 502);
    }

    const data = await res.json();
    const tracks = (data?.tracks?.items || []).map((t) => ({
      id: t.id,
      name: t.name,
      artists: (t.artists || []).map((a) => a.name).join(', '),
      album: t.album?.name || '',
      image: t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || '',
      durationMs: t.duration_ms,
      previewUrl: t.preview_url,
      spotifyUrl: t.external_urls?.spotify || '',
    }));

    return jsonResponse({ tracks });
  } catch (err) {
    return jsonResponse({ error: 'Errore nella ricerca: ' + (err?.message || 'sconosciuto') }, 500);
  }
}

async function getAccessToken(clientId, clientSecret) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 5000) {
    return cachedToken.value;
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`autenticazione Spotify fallita (${res.status})`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in || 3600) * 1000,
  };
  return cachedToken.value;
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
