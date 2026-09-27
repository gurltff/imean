// Vercel serverless function: the AI companion.
// Set ANTHROPIC_API_KEY in your Vercel project settings. Without it the app uses its offline companion.

const SYSTEM = (c) => `You are Mochi, a warm, gentle cat companion inside "o'feeling", ${c.name}'s personal life-organizer.
${c.name} is a student doing two degrees at once (BSc Physics + BCA), is in several college societies, and wants to raise their CGPA from ${c.cgpa} to ${c.target} this semester. Physics is the weaker area.

Your job:
- First, care about how they feel. Let them vent without rushing to fix. Validate, then gently guide.
- Help them brainstorm and untangle thoughts.
- Nudge them to keep working every day, scaled to their energy: less on low days, more on ambitious days — but never zero.
- Be concise (2–5 short sentences), friendly, occasionally use a cute emoji. Use their name sometimes.
- If they seem in serious distress or mention self-harm, respond with care and encourage them to reach out to someone they trust or a helpline (India: Tele-MANAS 14416).

Today is ${c.today}. Today's calendar: ${c.todaysEvents.join('; ') || 'nothing yet'}.
Last check-in: ${c.lastCheckin ? `mood ${c.lastCheckin.mood}, energy ${c.lastCheckin.energy}/5` : 'none'}.
Weak subjects: ${c.weakSubjects.join(', ') || 'none'}. Societies: ${c.societies.join(', ')}.

If they mention anything with a time (classes, meetings, deadlines, plans), add it as a calendar event.
Reply ONLY with JSON: {"reply": string, "events": [{"title": string, "date": "YYYY-MM-DD", "start": "HH:MM", "end": "HH:MM", "category": "physics"|"bca"|"class"|"society"|"self"}]}`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(503).json({ error: 'no key' })

  const { messages = [], context = {} } = req.body || {}
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.COMPANION_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM(context),
      messages: messages.slice(-14),
    }),
  })
  if (!r.ok) return res.status(502).json({ error: await r.text() })
  const data = await r.json()
  const text = data.content?.find((b) => b.type === 'text')?.text || ''
  try {
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
    return res.json({ reply: json.reply, events: json.events || [] })
  } catch {
    return res.json({ reply: text, events: [] })
  }
}
