import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cat } from '../cats.jsx'
import { todayStr } from '../store.js'
import { buildPlan } from '../planner.js'
import { extractEvents } from '../companion.js'
import { Tap } from '../ui.jsx'

const MOODS = [
  { id: 'great', label: 'Great', cat: 'excited' },
  { id: 'good', label: 'Good', cat: 'happy' },
  { id: 'okay', label: 'Okay', cat: 'neutral' },
  { id: 'low', label: 'Low', cat: 'sleepy' },
  { id: 'rough', label: 'Rough', cat: 'sad' },
]
const ENERGY = ['', 'Running on empty', 'A bit tired', 'Steady', 'Pretty good', 'Ambitious ✨']

export default function CheckIn({ state, update, close, go }) {
  const [mood, setMood] = useState('okay')
  const [energy, setEnergy] = useState(3)
  const [note, setNote] = useState('')
  const [result, setResult] = useState(null)

  const submit = () => {
    const date = todayStr()
    const told = extractEvents(note, date)
    // Replace earlier auto-generated blocks for today so re-checking-in re-plans.
    const base = { ...state, events: [...state.events.filter((e) => !(e.date === date && e.auto && !e.done)), ...told] }
    const { events, note: planNote } = buildPlan(base, energy, date)
    const plan = `${planNote} ${events.filter((e) => e.category !== 'self').length} study blocks are on your calendar.`
    update((s) => ({
      events: [...base.events, ...events],
      checkins: [...s.checkins.filter((c) => c.date !== date), { date, mood, energy, note, plan }],
      messages: note.trim() ? [...s.messages, { id: date + 'n', role: 'user', text: note, ts: Date.now() }] : s.messages,
    }))
    setResult({ plan, events, told })
  }

  return (
    <>
      <motion.div className="scrim" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, i) => { if (i.offset.y > 120 || i.velocity.y > 600) close() }}>
        <div className="grabber" />
        {!result ? (
          <>
            <h2 className="sheet-title">How are you feeling, {state.profile.name}?</h2>
            <div className="moods">
              {MOODS.map((m) => (
                <motion.button key={m.id} whileTap={{ scale: 0.9 }} className={`mood ${mood === m.id ? 'on' : ''}`} onClick={() => setMood(m.id)}>
                  <motion.div animate={{ y: mood === m.id ? -4 : 0, scale: mood === m.id ? 1.08 : 1 }}>
                    <Cat size={54} hat="none" scarf={mood === m.id} mood={m.cat} />
                  </motion.div>
                  <span>{m.label}</span>
                </motion.button>
              ))}
            </div>
            <label className="field-label">Energy · <b>{ENERGY[energy]}</b></label>
            <input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(+e.target.value)} className="range" style={{ '--p': `${(energy - 1) * 25}%` }} />
            <label className="field-label">What’s on your mind? Anything happening today?</label>
            <textarea className="input" rows="3" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Tired but okay. Tech society meeting at 5pm, thermo assignment due tomorrow…" />
            <Tap className="btn primary wide" onClick={submit}>Plan my day</Tap>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="result">
            <Cat size={110} hat="chef" mood={energy >= 4 ? 'excited' : energy <= 2 ? 'calm' : 'happy'} />
            <h2 className="sheet-title">Here’s your day 💛</h2>
            <p className="sub">{result.plan}</p>
            {result.told.length > 0 && <p className="sub">Also added: {result.told.map((e) => e.title).join(', ')}.</p>}
            <div className="row">
              <Tap className="btn" onClick={() => { close(); go('chat') }}>Talk to Mochi</Tap>
              <Tap className="btn primary" onClick={() => { close(); go('plan') }}>See plan</Tap>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
