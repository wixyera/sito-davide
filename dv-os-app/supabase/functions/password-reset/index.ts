// ============================================================================
// Supabase Edge Function: password-reset
//
// Sostituisce la vecchia versione basata sulla "domanda di sicurezza"
// (facilmente indovinabile) con la verifica di un CODICE DI RECUPERO
// casuale a 128 bit, generato dal client in fase di registrazione e
// salvato qui SOLO come hash SHA-256 (mai in chiaro).
//
// Nessuna email in uscita: pensato per account creati anche con
// indirizzi email non reali/non raggiungibili.
//
// COME (RI)PUBBLICARLA sul progetto Supabase:
//   supabase functions deploy password-reset
// (richiede la Supabase CLI collegata al progetto; le variabili
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili in
// automatico nell'ambiente delle Edge Function, non vanno impostate a mano.)
// ============================================================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// L'Admin API di GoTrue non espone un filtro diretto per email in tutte
// le versioni: per un progetto personale con poche decine/centinaia di
// utenti è sufficiente scaricare la lista e filtrare qui.
async function findUserByEmail(email: string) {
  for (let page = 1; page <= 100; page++) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error('Servizio account non disponibile.');
    const data = await res.json();
    const users = data.users || [];
    const user = users.find((u: any) => (u.email || '').toLowerCase() === email.trim().toLowerCase());
    if (user) return user;
    if (users.length < 1000) return null;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Metodo non consentito." }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Richiesta non valida." }, 400);
  }

  const { email, code, newPassword } = body || {};
  if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string' || email.length > 254 || code.length > 128 || newPassword.length > 1024 || !email || !code || !newPassword) {
    return json({ error: "Dati mancanti: email, code e newPassword sono obbligatori." }, 400);
  }
  if (String(newPassword).length < 6) {
    return json({ error: "La password deve avere almeno 6 caratteri." }, 400);
  }

  // Messaggio generico per non rivelare se un'email è registrata o meno.
  const invalid = () => json({ error: "Email o codice di recupero non validi." }, 400);

  let user;
  try { user = await findUserByEmail(String(email)); } catch { return json({ error: 'Servizio temporaneamente non disponibile. Riprova.' }, 503); }
  if (!user) return invalid();

  const storedHash = user.user_metadata?.recovery_code_hash;
  if (!storedHash) return invalid();

  const providedHash = await sha256Hex(`${String(email).trim().toLowerCase()}::${String(code).trim().toUpperCase()}`);
  if (providedHash !== storedHash) return invalid();

  let updateRes;
  try { updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: "PUT",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: newPassword }),
    signal: AbortSignal.timeout(15000),
  }); } catch { return json({error: "Servizio temporaneamente non disponibile."}, 503); }

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    return json({ error: errData.msg || "Errore durante il salvataggio della password." }, 500);
  }

  return json({ ok: true });
});
