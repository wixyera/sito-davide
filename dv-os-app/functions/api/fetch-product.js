// functions/api/fetch-product.js
// Cloudflare Pages Function — gira lato server, mai nel browser.
// Riceve un URL di un prodotto, lo scarica e ne estrae titolo, immagine,
// prezzo e nome del sito dai meta tag (Open Graph / Twitter Card / JSON-LD),
// così il frontend può compilare la scheda wishlist senza scontrarsi
// con i blocchi CORS dei singoli negozi.

export async function onRequestPost(context) {
  const { request } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Corpo della richiesta non valido.' }, 400);
  }

  const rawUrl = (body?.url || '').toString().trim();
  if (!rawUrl) return jsonResponse({ error: 'Manca il campo "url".' }, 400);

  let target;
  try {
    target = new URL(rawUrl);
    if (!/^https?:$/.test(target.protocol)) throw new Error('protocollo non valido');
  } catch (e) {
    return jsonResponse({ error: 'URL non valido.' }, 400);
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        // Molti siti servono una pagina "vera" solo a client con uno
        // user-agent da browser riconoscibile.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      cf: { cacheTtl: 0 },
    });

    if (!upstream.ok) {
      return jsonResponse({ error: `Il sito ha risposto con errore ${upstream.status}.` }, 502);
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return jsonResponse({ error: 'La pagina non sembra una pagina HTML di prodotto.' }, 415);
    }

    // Leggiamo solo i primi ~300KB: i meta tag stanno sempre nell'<head>.
    const reader = upstream.body.getReader();
    let received = 0;
    let chunks = [];
    const LIMIT = 300 * 1024;
    while (received < LIMIT) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
    }
    try { await upstream.body.cancel(); } catch (_) {}
    const html = new TextDecoder('utf-8').decode(concatUint8(chunks));

    const meta = extractMeta(html, target);
    return jsonResponse(meta);
  } catch (err) {
    console.error('fetch-product error:', err);
    return jsonResponse({ error: 'Impossibile leggere la pagina del prodotto.' }, 500);
  }
}

export async function onRequestGet() {
  return jsonResponse({ error: 'Usa il metodo POST.' }, 405);
}

function concatUint8(chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}

function getMeta(html, names) {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapeRe(name)}["'][^>]+content=["']([^"']*)["']`,
      'i'
    );
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
    // content prima di property/name (ordine invertito degli attributi)
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRe(name)}["']`,
      'i'
    );
    const m2 = html.match(re2);
    if (m2 && m2[1]) return decodeEntities(m2[1].trim());
  }
  return '';
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractMeta(html, target) {
  const title =
    getMeta(html, ['og:title', 'twitter:title']) ||
    (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '').trim();

  const image = absolutize(
    getMeta(html, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']),
    target
  );

  const siteName = getMeta(html, ['og:site_name']) || target.hostname.replace(/^www\./, '');

  // Prezzo: prima i meta OG standard, poi un tentativo su eventuale JSON-LD Product
  let price =
    getMeta(html, ['product:price:amount', 'og:price:amount']) ||
    extractJsonLdPrice(html);
  let currency =
    getMeta(html, ['product:price:currency', 'og:price:currency']) || '';

  price = price ? String(price).replace(',', '.').match(/[\d.]+/)?.[0] || '' : '';

  return {
    title: title || '',
    image: image || '',
    price: price || '',
    currency: currency || '',
    site_name: siteName || '',
    product_url: target.toString(),
  };
}

function extractJsonLdPrice(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    try {
      const data = JSON.parse(b[1].trim());
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const offers = item?.offers;
        const price = offers?.price || offers?.[0]?.price;
        if (price) return String(price);
      }
    } catch (_) { /* JSON-LD non valido, ignora */ }
  }
  return '';
}

function absolutize(url, base) {
  if (!url) return '';
  try { return new URL(url, base).toString(); } catch (_) { return url; }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
