import { uid, todayStr } from './store.js'

const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m }
const toHM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// How much work a day gets, by energy (1–5). Never zero — a little every day.
const LOAD = {
  1: { blocks: 1, len: 30, note: 'Soft day. One small session, then rest — that still counts.' },
  2: { blocks: 2, len: 30, note: 'Gentle day. Two short sessions and lots of kindness.' },
  3: { blocks: 3, len: 45, note: 'Steady day. Three focused sessions.' },
  4: { blocks: 4, len: 50, note: 'Good energy! Four solid sessions.' },
  5: { blocks: 5, len: 50, note: 'Ambitious mode ✨ Five sessions — go get that 8!' },
}

/** Score each subject: weak subjects and near exams come first. */
function rankSubjects(subjects, date) {
  const now = new Date(date + 'T12:00:00')
  return subjects
    .map((s) => {
      const left = s.topics.filter((t) => !t.done).length
      if (!left) return null
      const days = Math.max(1, (new Date(s.examDate + 'T12:00:00') - now) / 864e5)
      const score = (left / days) * (s.weak ? 2.2 : 1) * (s.degree === 'physics' ? 1.3 : 1) * s.credits
      return { s, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s)
}

/** Build today's study blocks around existing events. Returns { events, note }. */
export function buildPlan(state, energy, date = todayStr()) {
  const cfg = LOAD[energy] || LOAD[3]
  const busy = state.events
    .filter((e) => e.date === date)
    .map((e) => [toMin(e.start), toMin(e.end)])
    .sort((a, b) => a[0] - b[0])

  const ranked = rankSubjects(state.subjects, date)
  const picks = []
  const used = new Map()
  for (let i = 0; picks.length < cfg.blocks && ranked.length && i < 50; i++) {
    const s = ranked[i % Math.min(ranked.length, 3)]
    const taken = used.get(s.id) || 0
    const topic = s.topics.filter((t) => !t.done)[taken]
    if (topic) { picks.push({ s, topic }); used.set(s.id, taken + 1) }
  }

  const nowMin = date === todayStr() ? new Date().getHours() * 60 + new Date().getMinutes() : 0
  let cursor = Math.max(9 * 60, Math.ceil((nowMin + 10) / 15) * 15)
  const events = []
  const fits = (a, b) => !busy.some(([s, e]) => a < e && b > s)

  for (const { s, topic } of picks) {
    while (!fits(cursor, cursor + cfg.len) && cursor < 23 * 60) cursor += 15
    if (cursor + cfg.len > 23 * 60) break
    events.push({ id: uid(), title: `${s.name}: ${topic.name}`, date, start: toHM(cursor), end: toHM(cursor + cfg.len),
      category: s.degree, subjectId: s.id, topicId: topic.id, done: false, auto: true })
    busy.push([cursor, cursor + cfg.len])
    cursor += cfg.len + 15 // breathing break
  }

  // Always protect a little me-time.
  while (!fits(cursor, cursor + 30) && cursor < 22 * 60) cursor += 15
  if (cursor + 30 <= 23 * 60) {
    events.push({ id: uid(), title: energy <= 2 ? 'Rest, walk or call a friend 💛' : 'Break — snack & stretch', date,
      start: toHM(cursor), end: toHM(cursor + 30), category: 'self', done: false, auto: true })
  }
  return { events, note: cfg.note }
}

export { toMin, toHM }
