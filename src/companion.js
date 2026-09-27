import { uid, todayStr, addDays } from './store.js'

// Pull calendar items out of plain sentences, e.g.
// "physics class at 11 tomorrow", "tech society meeting at 5:30pm", "dbms lab from 2 to 4"
export function extractEvents(text, date = todayStr()) {
  const out = []
  const parts = text.split(/[.,;\n]| and (?=\w+ (?:at|from) )/i)
  const re = /(.{3,60}?)\s+(?:at|@|from)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?:\s*(?:-|to|till|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i
  for (const raw of parts) {
    const m = raw.match(re)
    if (!m) continue
    let title = m[1].trim()
    const filler = /^(and|so|but|also|then|plus|i have|i've got|i got|there'?s|there is|have|got|a|an|my|the|today|tomorrow)\s+/i
    while (filler.test(title)) title = title.replace(filler, '')
    if (!title || /^(i|me|it|we)$/i.test(title)) continue
    const to24 = (h, ap) => {
      h = +h
      if (ap?.toLowerCase() === 'pm' && h < 12) h += 12
      else if (ap?.toLowerCase() === 'am' && h === 12) h = 0
      else if (!ap && h >= 1 && h <= 7) h += 12 // "at 5" usually means evening
      return h
    }
    const sh = to24(m[2], m[4]); const sm = +(m[3] || 0)
    let eh = m[5] ? to24(m[5], m[7] || m[4]) : sh + 1; const em = +(m[6] || (m[5] ? 0 : sm))
    if (eh * 60 + em <= sh * 60 + sm) eh = sh + 1
    const pad = (n) => String(n).padStart(2, '0')
    const lower = raw.toLowerCase()
    const category = /society|club|meeting|event|fest|council/.test(lower) ? 'society'
      : /class|lecture|lab|tutorial|practical/.test(lower) ? 'class'
      : /physics|quantum|thermo|mechanics|optics/.test(lower) ? 'physics'
      : /bca|dbms|code|java|python|data struct|os\b/.test(lower) ? 'bca' : 'self'
    out.push({ id: uid(), title: title[0].toUpperCase() + title.slice(1), date: /tomorrow/.test(lower) ? addDays(date, 1) : date,
      start: `${pad(sh)}:${pad(sm)}`, end: `${pad(Math.min(eh, 23))}:${pad(em)}`, category, done: false })
  }
  return out
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Offline companion: gentle, rule-based. Used when no AI key is configured.
export function localReply(text, state) {
  const t = text.toLowerCase()
  const name = state.profile.name
  const events = extractEvents(text)
  const bits = []

  if (/(sad|cry|lonely|down|hurt|upset|bad day|awful|hate)/.test(t)) {
    bits.push(pick([`I'm really sorry, ${name}. That sounds heavy. You don't have to fix everything today — let's just take one small step.`,
      `That's a lot to carry, ${name}. Thank you for telling me. Want to vent more, or should we make today lighter?`]))
  } else if (/(stress|anxious|anxiety|overwhelm|panic|too much|pressure|scared)/.test(t)) {
    bits.push(`Okay, breathe with me for a sec — in for 4, hold 4, out for 6. 🫧 When everything feels urgent, we pick just the next thing. I'll keep today's list small.`)
  } else if (/(tired|exhausted|sleepy|drained|no energy)/.test(t)) {
    bits.push(`Low battery day — that's allowed. We'll do a short session and protect some rest. Consistency beats intensity.`)
  } else if (/(happy|great|good|excited|motivated|productive|ambitious)/.test(t)) {
    bits.push(pick([`Yay, I love this energy! ✨ Let's use it on the tough Physics topics while you're fresh.`,
      `That makes me so happy, ${name}! Let's ride this wave — want me to plan an ambitious day?`]))
  } else if (/(exam|test|quiz|assignment|deadline)/.test(t)) {
    bits.push(`Noted! Tell me the subject and date and I'll put it on your calendar and pace the syllabus backwards from it.`)
  } else if (/(idea|brainstorm|thinking about|what if)/.test(t)) {
    bits.push(`Ooh, brainstorm time. Dump everything — no filter. I'll help sort it into "do now", "later" and "just a thought".`)
  } else {
    bits.push(pick([`I'm listening, ${name}. What's taking up the most space in your head right now?`,
      `Tell me more — how's your day been so far?`, `Got it. Anything you're worried about today?`]))
  }
  if (events.length) {
    bits.push(`I added ${events.map((e) => `“${e.title}” at ${e.start}`).join(', ')} to your calendar 📅`)
  }
  return { reply: bits.join(' '), events }
}

/** Ask the real AI (serverless /api/chat). Falls back to the local companion. */
export async function askCompanion(text, state) {
  const today = todayStr()
  const context = {
    name: state.profile.name, today,
    target: state.profile.targetCgpa, cgpa: state.profile.currentCgpa,
    lastCheckin: state.checkins.at(-1) || null,
    todaysEvents: state.events.filter((e) => e.date === today).map((e) => `${e.start}-${e.end} ${e.title}`),
    weakSubjects: state.subjects.filter((s) => s.weak).map((s) => s.name),
    societies: state.societies.map((s) => s.name),
  }
  const history = state.messages.slice(-12).map((m) => ({ role: m.role, content: m.text }))
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...history, { role: 'user', content: text }], context }),
    })
    if (!res.ok) throw new Error('no api')
    const data = await res.json()
    const events = (data.events || []).map((e) => ({ id: uid(), done: false, category: 'self', date: today, ...e }))
    return { reply: data.reply, events, ai: true }
  } catch {
    return localReply(text, state)
  }
}
