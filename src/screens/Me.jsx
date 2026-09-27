import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cat, Doodle } from '../cats.jsx'
import { uid, todayStr, addDays } from '../store.js'
import { Tap, Section, list, item } from '../ui.jsx'

export default function Me({ state, update, reset }) {
  const [semCredits, setSemCredits] = useState(22)
  const [semGoal, setSemGoal] = useState(8)
  const [newSoc, setNewSoc] = useState('')
  const [taskText, setTaskText] = useState({})

  const doneCredits = state.semesters.reduce((n, s) => n + s.credits, 0)
  const points = state.semesters.reduce((n, s) => n + s.sgpa * s.credits, 0)
  const cgpa = doneCredits ? points / doneCredits : 0
  const projected = (points + semGoal * semCredits) / (doneCredits + semCredits)
  const remainingSems = 4
  const neededPerSem = (state.profile.targetCgpa * (doneCredits + remainingSems * semCredits) - points) / (remainingSems * semCredits)

  const setSem = (id, k, v) => update((s) => {
    const semesters = s.semesters.map((x) => (x.id === id ? { ...x, [k]: +v } : x))
    const c = semesters.reduce((n, x) => n + x.credits, 0)
    const p = semesters.reduce((n, x) => n + x.sgpa * x.credits, 0)
    return { semesters, profile: { ...s.profile, currentCgpa: c ? +(p / c).toFixed(2) : 0 } }
  })

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="stack">
      <motion.header variants={item} className="page-head">
        <div>
          <h1 className="title">Me & goals</h1>
          <p className="sub small">Small steps, every single day.</p>
        </div>
        <Cat size={70} hat="apple" mood="happy" wave />
      </motion.header>

      <motion.div variants={item} className="card member">
        <div className="member-head">
          <div>
            <div className="member-title">CGPA planner</div>
            <div className="member-sub">current {cgpa.toFixed(2)} · target {state.profile.targetCgpa.toFixed(1)}</div>
          </div>
          <Doodle name="star" size={40} className="float" />
        </div>
        <div className="calc">
          <label className="field-label">This semester’s SGPA goal · <b>{semGoal.toFixed(1)}</b></label>
          <input type="range" className="range" min="5" max="10" step="0.1" value={semGoal} onChange={(e) => setSemGoal(+e.target.value)} style={{ '--p': `${((semGoal - 5) / 5) * 100}%` }} />
          <div className="calc-grid">
            <div><b>{projected.toFixed(2)}</b><span>CGPA after this sem</span></div>
            <div><b>{neededPerSem > 10 ? '10+' : neededPerSem.toFixed(2)}</b><span>avg SGPA needed for {state.profile.targetCgpa} overall</span></div>
          </div>
          <p className="sub small">Credits per semester
            <input className="mini" type="number" value={semCredits} onChange={(e) => setSemCredits(Math.max(1, +e.target.value))} />
          </p>
        </div>
      </motion.div>

      <Section title="Semesters" action={<Tap className="pill" onClick={() => update((s) => ({ semesters: [...s.semesters, { id: uid(), name: `Sem ${s.semesters.length + 2}`, sgpa: 7, credits: 22 }] }))}>+ Add</Tap>}>
        {state.semesters.map((s) => (
          <div key={s.id} className="card sem">
            <b>{s.name}</b>
            <label>SGPA <input className="mini" type="number" step="0.01" value={s.sgpa} onChange={(e) => setSem(s.id, 'sgpa', e.target.value)} /></label>
            <label>Credits <input className="mini" type="number" value={s.credits} onChange={(e) => setSem(s.id, 'credits', e.target.value)} /></label>
          </div>
        ))}
      </Section>

      <Section title="Societies">
        <AnimatePresence initial={false}>
          {state.societies.map((soc) => (
            <motion.div key={soc.id} layout className="card society" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
              <div className="society-head">
                <Cat size={44} hat="party" scarf={false} mood="happy" />
                <div><b>{soc.name}</b><div className="event-meta">{soc.role}</div></div>
                <button className="x" onClick={() => update((s) => ({ societies: s.societies.filter((x) => x.id !== soc.id) }))}>×</button>
              </div>
              {soc.tasks.map((t) => (
                <label key={t.id} className={`soc-task ${t.done ? 'done' : ''}`}>
                  <input type="checkbox" checked={t.done} onChange={() => update((s) => ({
                    societies: s.societies.map((x) => (x.id !== soc.id ? x : { ...x, tasks: x.tasks.map((y) => (y.id === t.id ? { ...y, done: !y.done } : y)) })),
                  }))} />
                  <span>{t.title}</span><small>{t.due}</small>
                </label>
              ))}
              <form className="row" onSubmit={(e) => {
                e.preventDefault()
                const title = (taskText[soc.id] || '').trim(); if (!title) return
                update((s) => ({ societies: s.societies.map((x) => (x.id !== soc.id ? x : { ...x, tasks: [...x.tasks, { id: uid(), title, due: addDays(todayStr(), 3), done: false }] })) }))
                setTaskText({ ...taskText, [soc.id]: '' })
              }}>
                <input className="input" placeholder="Add a society task…" value={taskText[soc.id] || ''} onChange={(e) => setTaskText({ ...taskText, [soc.id]: e.target.value })} />
              </form>
            </motion.div>
          ))}
        </AnimatePresence>
        <form className="row" onSubmit={(e) => {
          e.preventDefault(); if (!newSoc.trim()) return
          update((s) => ({ societies: [...s.societies, { id: uid(), name: newSoc.trim(), role: 'Member', color: 'society', tasks: [] }] }))
          setNewSoc('')
        }}>
          <input className="input" placeholder="Join a new society…" value={newSoc} onChange={(e) => setNewSoc(e.target.value)} />
          <Tap className="btn" type="submit">Add</Tap>
        </form>
      </Section>

      <Section title="Connections">
        {[
          ['Google Classroom', 'Auto-import assignments & due dates', 'book'],
          ['Google Calendar', 'Sync your plan to your phone', 'calendar'],
          ['WhatsApp reminders', 'Mochi nudges you on WhatsApp', 'heart'],
        ].map(([name, desc, icon]) => (
          <div key={name} className="card connect">
            <Doodle name={icon} size={34} />
            <div><b>{name}</b><div className="event-meta">{desc}</div></div>
            <span className="chip">soon</span>
          </div>
        ))}
      </Section>

      <motion.div variants={item} className="footer">
        <Cat size={48} hat="chef" mood="sleepy" />
        <p className="sub small">Everything is saved on this device.</p>
        <button className="link" onClick={() => { if (confirm('Reset all data to the starter example?')) reset() }}>Reset data</button>
      </motion.div>
    </motion.div>
  )
}
