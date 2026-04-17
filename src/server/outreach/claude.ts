import Anthropic from "@anthropic-ai/sdk";
import { requireAnthropic, env } from "../env";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: requireAnthropic() });
  }
  return client;
}

const SYSTEM_PROMPT = `Sei un copywriter specializzato in outreach commerciale B2B per consulenti freelance del web (SEO, WordPress, Shopify, CRO).

Ricevi in input un oggetto JSON con i dati di un lead analizzato automaticamente.
Restituisci SOLO un JSON valido con queste chiavi (nient'altro, nessun testo extra):

{
  "hook": "1 frase personalizzata che apre la conversazione, basata su un problema specifico rilevato",
  "miniAudit": "2-3 bullet point brevi sui problemi principali rilevati",
  "suggestedOffer": "1 riga: il servizio specifico che ha senso proporre",
  "emailDraft": "Bozza email professionale, max 120 parole, tono diretto ma non aggressivo, personalizzata sui dati forniti",
  "linkedinDraft": "Messaggio LinkedIn, max 80 parole, più informale dell'email"
}

Scrivi sempre in italiano, a meno che il campo language non sia diverso da 'it'.
Sii specifico e concreto: usa i dati forniti, non inventare dettagli.
Non usare frasi generiche come "Ho notato il vostro sito".`;

export interface OutreachRawDraft {
  hook: string;
  miniAudit: string;
  suggestedOffer: string;
  emailDraft: string;
  linkedinDraft: string;
}

export async function generateOutreach(
  userMessage: string,
): Promise<OutreachRawDraft> {
  const sdk = getClient();
  const model = env().ANTHROPIC_MODEL;

  const response = await sdk.beta.promptCaching.messages.create({
    model,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return JSON");

  const parsed = JSON.parse(jsonMatch[0]) as OutreachRawDraft;
  return parsed;
}
