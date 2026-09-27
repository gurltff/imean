import { useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { useStore } from './store.js'
import { Cat, Doodle } from './cats.jsx'
import Home from './screens/Home.jsx'
import Plan from './screens/Plan.jsx'
import Chat from './screens/Chat.jsx'
import Me from './screens/Me.jsx'
import CheckIn from './screens/CheckIn.jsx'

const TABS = [
  { id: 'home', label: 'Home', icon: <Cat size={30} hat="chef" scarf /> },
  { id: 'plan', label: 'Plan', icon: <Doodle name="calendar" size={26} /> },
  { id: 'chat', label: 'Mochi', icon: <Doodle name="heart" size={26} /> },
  { id: 'me', label: 'Me', icon: <Doodle name="croissant" size={28} /> },
]

export const spring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }

export default function App() {
  const [state, update, reset] = useStore()
  const [tab, setTab] = useState('home')
  const [checkin, setCheckin] = useState(false)
  const [chatSeed, setChatSeed] = useState(null)

  const go = (t, seed) => { if (seed) setChatSeed(seed); setTab(t) }
  const props = { state, update, go, openCheckin: () => setCheckin(true) }

  return (
    <MotionConfig transition={spring} reducedMotion="user">
      <div className="shell">
        <main className="page">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === 'home' && <Home {...props} />}
              {tab === 'plan' && <Plan {...props} />}
              {tab === 'chat' && <Chat {...props} seed={chatSeed} clearSeed={() => setChatSeed(null)} />}
              {tab === 'me' && <Me {...props} reset={reset} />}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="tabbar">
          {TABS.map((t) => (
            <motion.button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)} whileTap={{ scale: 0.9 }}>
              {tab === t.id && <motion.span layoutId="tabpill" className="tabpill" />}
              <span className="tabicon">{t.icon}</span>
              <span className="tablabel">{t.label}</span>
            </motion.button>
          ))}
        </nav>

        <AnimatePresence>
          {checkin && <CheckIn state={state} update={update} close={() => setCheckin(false)} go={go} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
