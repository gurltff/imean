import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cat } from '../cats.jsx'
import { todayStr, addDays, CATEGORIES, uid } from '../store.js'
import { Tap, Section, EventRow, list, item } from '../ui.jsx'
import { toMin } from '../planner.js'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_PX = 44
const START_H = 8

export default function Plan({ state, update }) {
  const today = todayStr()
  const [day, setDay] = useState(today)
  const [view, setView] = useState('timeline')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ title: '', start: '16:00', end: '17:00', category: 'physics' })
  const [openSub, setOpenSub] = useState(null)

  const monday = addDays(today, -((new Date(today + 'T12:00:00').getDay() + 6) % 7))
  const week = Array.from({ length: 14 }, (_, i) => addDays(monday, i))
  const dayEvents = state.events.filter((e) => e.date === day).sort((a, b) => a.start.localeCompare(b.start))

  const toggle = (id) => update((s) => ({
    events: s.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
    // finishing an auto study block ticks its syllabus topic too
    subjects: (() => {
      const ev = s.events.find((e) => e.id === id)
      if (!ev?.topicId || ev.done) return s.subjects
      return s.subjects.map((sub) => ({ ...sub, topics: sub.topics.map((t) => (t.id === ev.topicId ? { ...t, done: true } : t)) }))
    })(),
  }))
  const remove = (id) => update((s) => ({ events: s.events.filter((e) => e.id !== id) }))
  const add = () => {
    if (!form.title.trim()) return
    update((s) => ({ events: [...s.events, { id: uid(), ...form, date: day, done: false }] }))
    setForm({ ...form, title: '' }); setAdding(false)
  }
  const toggleTopic = (sid, tid) => update((s) => ({
    subjects: s.subjects.map((sub) => (sub.id !== sid ? sub : { ...sub, topics: sub.topics.map((t) => (t.id === tid ? { ...t, done: !t.done } : t)) })),
  }))

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="stack">
      <motion.header variants={item} className="page-head">
        <div>
          <h1 className="title">Your plan</h1>
          <p className="sub small">{new Date(day + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Cat size={70} hat="chef" holding="calendar" />
      </motion.header>

      <motion.div variants={item} className="week">
        {week.map((d) => {
          const dt = new Date(d + 'T12:00:00')
          const cats = [...new Set(state.events.filter((e) => e.date === d).map((e) => e.category))].slice(0, 3)
          return (
            <button key={d} className={`day ${d === day ? 'on' : ''} ${d === today ? 'today' : ''}`} onClick={() => setDay(d)}>
              {d === day && <motion.span layoutId="daypill" className="day-bg" />}
              <span className="dow">{DOW[dt.getDay()]}</span>
              <b>{dt.getDate()}</b>
              <span className="dots">{cats.map((c) => <i key={c} style={{ background: CATEGORIES[c].color }} />)}</span>
            </button>
          )
        })}
      </motion.div>

      <motion.div variants={item} className="modes-row">
        {['timeline', 'list'].map((v) => (
          <button key={v} className={`seg ${view === v ? 'on' : ''}`} onClick={() => setView(v)}>
            {view === v && <motion.span layoutId="planseg" className="seg-bg" />}
            <span>{v === 'timeline' ? 'Calendar' : 'List'}</span>
          </button>
        ))}
        <Tap className="pill add" onClick={() => setAdding((a) => !a)}>{adding ? 'Close' : '+ Add'}</Tap>
      </motion.div>

      <AnimatePresence>
        {adding && (
          <motion.div className="card form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <input className="input" placeholder="What is it?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="row">
              <input className="input" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              <input className="input" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </div>
            <div className="cat-pick">
              {Object.entries(CATEGORIES).map(([k, c]) => (
                <button key={k} className={form.category === k ? 'on' : ''} style={{ '--c': c.color, '--ink': c.ink }} onClick={() => setForm({ ...form, category: k })}>{c.label}</button>
              ))}
            </div>
            <Tap className="btn primary wide" onClick={add}>Add to {day === today ? 'today' : 'this day'}</Tap>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} key={day + view} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
        {view === 'timeline' ? (
          <div className="timeline card" style={{ height: (23 - START_H) * HOUR_PX + 16 }}>
            {Array.from({ length: 23 - START_H }, (_, i) => (
              <div key={i} className="hour" style={{ top: i * HOUR_PX + 8 }}><span>{String(START_H + i).padStart(2, '0')}</span></div>
            ))}
            {day === today && <NowLine />}
            {dayEvents.map((e) => {
              const c = CATEGORIES[e.category] || CATEGORIES.self
              const top = ((toMin(e.start) - START_H * 60) / 60) * HOUR_PX + 8
              const h = Math.max(24, ((toMin(e.end) - toMin(e.start)) / 60) * HOUR_PX - 3)
              return (
                <motion.button key={e.id} layout className={`block ${e.done ? 'done' : ''}`} onClick={() => toggle(e.id)}
                  style={{ top, height: h, '--c': c.color, '--ink': c.ink }} whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <b>{e.title}</b><span>{e.start}–{e.end}</span>
                </motion.button>
              )
            })}
          </div>
        ) : (
          <div>
            <AnimatePresence initial={false}>
              {dayEvents.map((e) => <EventRow key={e.id} e={e} onToggle={() => toggle(e.id)} onDelete={() => remove(e.id)} />)}
            </AnimatePresence>
            {!dayEvents.length && <p className="empty">A free day! Add something or check in to get a plan.</p>}
          </div>
        )}
      </motion.div>

      <Section title="Syllabus tracker">
        {state.subjects.map((s) => {
          const done = s.topics.filter((t) => t.done).length
          const pct = (done / s.topics.length) * 100
          const c = CATEGORIES[s.degree]
          return (
            <div key={s.id} className="card subject" style={{ '--c': c.color, '--ink': c.ink }}>
              <button className="subject-head" onClick={() => setOpenSub(openSub === s.id ? null : s.id)}>
                <div>
                  <b>{s.name}</b> {s.weak && <span className="chip warn">focus</span>}
                  <div className="event-meta">{c.label} · exam {new Date(s.examDate + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                </div>
                <span className="pct">{Math.round(pct)}%</span>
              </button>
              <div className="bar thin"><motion.i animate={{ width: `${pct}%` }} /></div>
              <AnimatePresence initial={false}>
                {openSub === s.id && (
                  <motion.ul className="topics" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    {s.topics.map((t) => (
                      <li key={t.id} className={t.done ? 'done' : ''} onClick={() => toggleTopic(s.id, t.id)}>
                        <span className="tick">{t.done ? '✓' : ''}</span>{t.name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </Section>
    </motion.div>
  )
}

function NowLine() {
  const n = new Date()
  const top = ((n.getHours() * 60 + n.getMinutes() - START_H * 60) / 60) * HOUR_PX + 8
  if (top < 0) return null
  return <div className="now" style={{ top }} />
}
