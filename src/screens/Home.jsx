import { motion, AnimatePresence } from 'framer-motion'
import { Cat, Doodle, Sparkle } from '../cats.jsx'
import { todayStr, CATEGORIES } from '../store.js'
import { Tap, Section, EventRow, list, item } from '../ui.jsx'
import { toMin } from '../planner.js'

const MOOD_CAT = { great: 'excited', good: 'happy', okay: 'neutral', low: 'sleepy', rough: 'sad' }

function greeting() {
  const h = new Date().getHours()
  return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function streak(checkins) {
  const days = new Set(checkins.map((c) => c.date))
  let n = 0; const d = new Date()
  while (days.has(todayStr(d))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

export default function Home({ state, update, go, openCheckin }) {
  const today = todayStr()
  const todays = state.events.filter((e) => e.date === today).sort((a, b) => a.start.localeCompare(b.start))
  const checkedIn = state.checkins.find((c) => c.date === today)
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const next = todays.find((e) => !e.done && toMin(e.end) > nowMin)
  const doneCount = todays.filter((e) => e.done).length
  const topicsTotal = state.subjects.reduce((n, s) => n + s.topics.length, 0)
  const topicsDone = state.subjects.reduce((n, s) => n + s.topics.filter((t) => t.done).length, 0)
  const exam = [...state.subjects].sort((a, b) => a.examDate.localeCompare(b.examDate))[0]
  const examDays = exam ? Math.ceil((new Date(exam.examDate) - new Date(today)) / 864e5) : null

  const toggle = (id) => update((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e)) }))

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="stack">
      {/* Hero, like the bakery poster */}
      <motion.header variants={item} className="hero card">
        <div className="hero-top">
          <span className="brand-small">o'feeling</span>
          <span className="script">fresh start<br />every day</span>
        </div>
        <Sparkle style={{ position: 'absolute', left: 22, top: 70 }} />
        <Sparkle size={10} style={{ position: 'absolute', right: 30, top: 110 }} />
        <Doodle name="croissant" size={30} className="float" style={{ position: 'absolute', left: 18, top: 120 }} />
        <Doodle name="apple" size={22} className="float delay" style={{ position: 'absolute', right: 26, top: 190 }} />
        <div className="table-scene">
          <motion.div className="bob" whileTap={{ scale: 0.92, rotate: -4 }}>
            <Cat size={150} hat="chef" mood={checkedIn ? MOOD_CAT[checkedIn.mood] : 'neutral'} wave={!checkedIn} />
          </motion.div>
          <div className="table">
            <Doodle name="cake" size={40} />
            <Doodle name="coffee" size={30} />
            <Doodle name="book" size={34} />
          </div>
        </div>
        <h1 className="logo">
          <span className="logo-o">o'</span><span>feel</span><span>ing</span>
        </h1>
        <p className="hello">{greeting()}, {state.profile.name}!</p>
        <p className="sub">
          {checkedIn ? checkedIn.plan : 'How are you feeling today? Let’s check in and I’ll plan your day around you.'}
        </p>
        <Tap className="btn primary" onClick={openCheckin}>{checkedIn ? 'Check in again' : 'Check in with Mochi'}</Tap>
      </motion.header>

      {/* Membership-card style stats */}
      <motion.div variants={item} className="card member">
        <div className="member-head">
          <div>
            <div className="member-title">Semester card · Goal {state.profile.targetCgpa.toFixed(1)}</div>
            <div className="member-sub">{state.profile.name} · Physics + BCA</div>
          </div>
          <Cat size={56} hat="apple" mood="happy" />
        </div>
        <div className="stats">
          <div><b>{state.profile.currentCgpa.toFixed(1)}</b><span>CGPA</span></div>
          <div><b>{streak(state.checkins)}</b><span>Streak</span></div>
          <div><b>{doneCount}/{todays.length}</b><span>Today</span></div>
          <div><b>{topicsDone}</b><span>Topics</span></div>
        </div>
        <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${(topicsDone / Math.max(1, topicsTotal)) * 100}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} /></div>
        <div className="member-foot">
          <span>{topicsDone} of {topicsTotal} syllabus topics done</span>
          <Tap className="pill" onClick={() => go('me')}>View goals</Tap>
        </div>
      </motion.div>

      {/* Three tiles */}
      <motion.div variants={item} className="tiles">
        <Tap className="tile card" onClick={() => go('chat', { mode: 'vent' })}>
          <Cat size={62} hat="none" mood="calm" holding="heart" />
          <b>Vent</b><small>LET IT OUT</small>
        </Tap>
        <Tap className="tile card" onClick={() => go('chat', { mode: 'brainstorm' })}>
          <Cat size={62} hat="apple" mood="happy" holding="star" />
          <b>Brainstorm</b><small>THINK ALOUD</small>
        </Tap>
        <Tap className="tile card" onClick={() => go('plan')}>
          <Cat size={62} hat="chef" holding="book" />
          <b>Study</b><small>MY PLAN</small>
        </Tap>
      </motion.div>

      {/* Red banner: next up */}
      <motion.div variants={item} className="banner red" onClick={() => go('plan')}>
        <span>{next ? `Now: ${next.title}` : checkedIn ? 'All done for now — proud of you!' : 'Tap check-in to build today'}</span>
        <span className="banner-time">{next ? next.start : '♡'}</span>
      </motion.div>

      <Section title="Today" action={<Tap className="pill" onClick={() => go('plan')}>Open plan</Tap>}>
        <AnimatePresence initial={false}>
          {todays.length ? todays.map((e) => <EventRow key={e.id} e={e} onToggle={() => toggle(e.id)} />) : (
            <p className="empty">Nothing planned yet. Tell Mochi about your day ✨</p>
          )}
        </AnimatePresence>
      </Section>

      {/* Birthday-cake style blue banner → exam countdown */}
      {exam && (
        <motion.div variants={item} className="banner blue big" onClick={() => go('plan')}>
          <Doodle name="cake" size={54} />
          <div className="countdown">
            <div className="countdown-num">{examDays} DAYS</div>
            <div className="countdown-sub">until {exam.name}</div>
          </div>
          <Cat size={64} hat="party" mood="excited" />
        </motion.div>
      )}

      <motion.div variants={item} className="legend">
        {Object.entries(CATEGORIES).map(([k, c]) => (
          <span key={k} style={{ '--c': c.color }}><i />{c.label}</span>
        ))}
      </motion.div>
    </motion.div>
  )
}
