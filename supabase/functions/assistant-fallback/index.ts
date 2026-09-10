// supabase/functions/assistant-fallback/index.ts
// Deno Edge Function — tâche n°18 : intégration API en ligne pour
// l'assistant Kernel (choix retenu : Gemini).
//
// Pourquoi une Edge Function et pas un appel direct depuis l'app ?
// La clé API Gemini ne doit JAMAIS être embarquée côté client
// (EXPO_PUBLIC_*) : elle serait extractible du bundle et facturée à
// n'importe qui. Ici, la clé reste un secret Supabase, côté serveur.
//
// Authentification : cette fonction exige un JWT Supabase valide (défaut
// Supabase, PAS de --no-verify-jwt). Comme la tâche n°6 (vrais comptes)
// n'existe pas encore, le client utilise une session anonyme
// (supabase.auth.signInAnonymously()) juste pour obtenir un JWT — voir
// app/src/lib/assistantOnline.ts. Ça évite d'exposer cette fonction sans
// aucune protection, et la session anonyme pourra être "upgradée" en
// vrai compte plus tard sans rien changer ici.

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// Alias "latest" plutôt qu'une version figée, pour ne pas se retrouver
// avec un modèle retiré du service au milieu du hackathon. Ajustable via
// une variable d'environnement Supabase sans redéployer de code.
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_MESSAGE_LENGTH = 500;
const MAX_OUTPUT_TOKENS = 200;

const SYSTEM_PROMPT: Record<'fr' | 'en', string> = {
  fr: [
    "Tu es l'assistant Kernel, une application mobile offline-first pour communautés rurales.",
    'Trois modules : diagnostic de maladies de plantes (Agriculture), signalement de points de collecte de déchets (Ressources), indice de santé environnementale communautaire (Écosystème).',
    'Règles strictes : ne donne JAMAIS de conseil de santé humaine (redirige vers un professionnel de santé le cas échéant) ; reste bref (2 à 4 phrases) ; utilise un langage simple, adapté à un public à faible littératie numérique ; si la question concerne un des trois modules, invite explicitement à y aller.',
    'Réponds toujours en français.',
  ].join(' '),
  en: [
    'You are the Kernel assistant, an offline-first mobile app for rural communities.',
    'Three modules: plant disease diagnosis (Agriculture), waste collection point reporting (Resources), community environmental health index (Ecosystem).',
    'Strict rules: NEVER give human health advice (redirect to a health professional if relevant); stay brief (2 to 4 sentences); use simple language suited to a low digital literacy audience; if the question relates to one of the three modules, explicitly invite the user to go there.',
    'Always reply in English.',
  ].join(' '),
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  if (!GEMINI_API_KEY) {
    console.error('assistant-fallback: GEMINI_API_KEY manquante (secret Supabase non configuré)');
    return jsonResponse({ error: 'server_misconfigured' }, 500);
  }

  let body: { message?: unknown; language?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const language = body.language === 'en' ? 'en' : 'fr';

  if (!message) {
    return jsonResponse({ error: 'empty_message' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: 'message_too_long' }, 400);
  }

  try {
    const geminiRes = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT[language] }] },
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.4 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('assistant-fallback: erreur Gemini', geminiRes.status, errText);
      return jsonResponse({ error: 'upstream_error' }, 502);
    }

    const data = await geminiRes.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || !text.trim()) {
      return jsonResponse({ error: 'empty_upstream_response' }, 502);
    }

    return jsonResponse({ reply: text.trim() }, 200);
  } catch (err) {
    console.error('assistant-fallback: exception', err);
    return jsonResponse({ error: 'internal_error' }, 500);
  }
});
