// NEW FILE — central place for n8n webhook URLs and the trigger helper.
// MODIFIED: one webhook per agent (not one per level) — the n8n workflow
// itself routes internally based on the `level` field in the payload.

export const N8N_WEBHOOKS = {
  email: 'https://alextsuzuki.app.n8n.cloud/webhook/email-agent',
  research: 'https://alextsuzuki.app.n8n.cloud/webhook/research-agent',
} as const

export type N8NWebhookKey = keyof typeof N8N_WEBHOOKS

// Payload sent to n8n on every triggered webhook
export interface N8NPayload {
  agent: 'email' | 'research'
  level: 1 | 2 | 3
  scenarioContext: string
  messageText: string
  timestamp: string
}

// Fires a real automation in n8n. Used instead of the original project's
// fully-simulated chat — the n8n workflow decides what to actually do based on `level`.
export async function triggerN8N(url: string, payload: N8NPayload): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[n8n] Failed to trigger webhook:', url, err)
  }
}

// NEW: separate webhooks for "AI mode" — these workflows generate the chat
// line dynamically with an LLM (and still perform the real action via
// Gmail/Serper at level 2+), instead of just executing a side effect for
// pre-written text. Kept apart from N8N_WEBHOOKS so the original scripted
// workflows are never touched.
export const N8N_AI_WEBHOOKS = {
  email: 'https://alextsuzuki.app.n8n.cloud/webhook/email-agent-ai',
  research: 'https://alextsuzuki.app.n8n.cloud/webhook/research-agent-ai',
} as const

// Payload sent to the AI-mode webhooks. `beat` describes the intent of this
// turn (what should happen) without dictating exact wording — the LLM in n8n
// writes the actual line. `conversationHistory` keeps the story coherent.
export interface N8NAIPayload {
  mode: 'ai'
  agent: 'email' | 'research'
  level: 1 | 2 | 3
  scenarioContext: string
  beat: string
  conversationHistory: { agent: string; text: string }[]
  timestamp: string
}

export interface N8NAIResponse {
  chatLine: string
}

// Synchronous call (unlike triggerN8N) — the app needs the AI-generated line
// back before it can render anything in the chat.
export async function triggerN8NSync(url: string, payload: N8NAIPayload): Promise<N8NAIResponse> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`n8n AI webhook failed: ${res.status}`)
  return res.json()
}
