// functions/api/oracolo.js
// Cloudflare Pages Function — gira lato server, mai nel browser.
// La chiave OPENAI_API_KEY va impostata come SECRET nella dashboard di
// Cloudflare Pages (Settings → Environment variables → Add secret),
// NON va mai scritta qui nel codice.

export async function onRequestPost(context) {
  const { request, env } = context;

  // Legge il messaggio inviato dal frontend
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Corpo della richiesta non valido.' }, 400);
  }

  const domanda = (body?.domanda || '').toString().trim();

  if (!domanda) {
    return jsonResponse({ error: 'Manca il campo "domanda".' }, 400);
  }
  if (domanda.length > 500) {
    return jsonResponse({ error: 'Domanda troppo lunga (max 500 caratteri).' }, 400);
  }

  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: 'Chiave API non configurata sul server.' }, 500);
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Sei un oracolo misterioso ed enigmatico chiamato "L\'Oracolo di D.V. OS". ' +
              'Rispondi in italiano a domande con risposte brevi (massimo 2-3 frasi), ' +
              'evocative, un po\' criptiche ma comunque utili e mai offensive. ' +
              'Non dare consigli medici, legali o finanziari specifici: in quel caso ' +
              'rispondi in modo vago e suggerisci di rivolgersi a un esperto umano.',
          },
          { role: 'user', content: domanda },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('OpenAI error:', upstream.status, errText);
      return jsonResponse({ error: 'L\'oracolo tace per un errore interno (' + upstream.status + ').' }, 502);
    }

    const data = await upstream.json();
    const risposta = data?.choices?.[0]?.message?.content?.trim() || 'L\'oracolo non ha voluto rispondere.';

    return jsonResponse({ risposta });
  } catch (err) {
    console.error('Fetch error:', err);
    return jsonResponse({ error: 'Errore di connessione con l\'oracolo.' }, 500);
  }
}

// Blocca esplicitamente altri metodi HTTP
export async function onRequestGet() {
  return jsonResponse({ error: 'Usa il metodo POST.' }, 405);
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
