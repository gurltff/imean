import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cat } from '../cats.jsx'
import { askCompanion } from '../companion.js'
import { uid } from '../store.js'
import { Tap } from '../ui.jsx'

const MODES = {
  talk: { label: 'Talk', hint: 'Tell me about your day…' },
  vent: { label: 'Vent', hint: 'Let it all out. No judgement here.', open: 'I’m here. Say whatever you need to — I’m just listening. 🫶' },
  brainstorm: { label: 'Brainstorm', hint: 'Dump every idea…', open: 'Brainstorm mode! Throw everything at me and we’ll sort it after ✨' },
  plan: { label: 'Plan', hint: 'e.g. physics class at 11, society meet at 5pm', open: 'Tell me what’s happening and when — I’ll put it on your calendar 📅' },
}

export default function Chat({ state, update, seed, clearSeed }) {
  const [mode, setMode] = useState(seed?.mode || 'talk')
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef(null)
  const msgs = state.messages

  useEffect(() => { clearSeed?.() }, [])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs.length, typing])

  const send = async () => {
    const t = text.trim()
    if (!t || typing) return
    setText('')
    const userMsg = { id: uid(), role: 'user', text: t, ts: Date.now(), mode }
    update((s) => ({ messages: [...s.messages, userMsg] }))
    setTyping(true)
    const { reply, events } = await askCompanion(mode === 'talk' ? t : `[${mode}] ${t}`, { ...state, messages: [...msgs, userMsg] })
    await new Promise((r) => setTimeout(r, 500))
    setTyping(false)
    update((s) => ({
      messages: [...s.messages, { id: uid(), role: 'assistant', text: reply, ts: Date.now() }],
      events: events?.length ? [...s.events, ...events] : s.events,
    }))
  }

  const opener = MODES[mode].open || `Hi ${state.profile.name}! I’m Mochi 🐾 How’s your day going?`

  return (
    <div className="chat">
      <header className="chat-head card">
        <motion.div className="bob"><Cat size={64} hat="chef" mood={typing ? 'neutral' : 'happy'} /></motion.div>
        <div>
          <h1 className="title">Mochi</h1>
          <p className="sub small">{typing ? 'thinking…' : 'your gentle study buddy'}</p>
        </div>
      </header>

      <div className="modes-row">
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} className={`seg ${mode === k ? 'on' : ''}`} onClick={() => setMode(k)}>
            {mode === k && <motion.span layoutId="seg" className="seg-bg" />}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="messages">
        <Bubble role="assistant" text={opener} />
        <AnimatePresence initial={false}>
          {msgs.slice(-60).map((m) => <Bubble key={m.id} role={m.role} text={m.text} />)}
          {typing && (
            <motion.div key="typing" className="bubble assistant typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <i /><i /><i />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={end} />
      </div>

      <div className="composer">
        <textarea rows="1" className="input" value={text} placeholder={MODES[mode].hint}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
        <Tap className="send" onClick={send} aria-label="send">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 12 L20 4 L14 20 L11 13 Z" fill="currentColor" /></svg>
        </Tap>
      </div>
    </div>
  )
}

function Bubble({ role, text }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`bubble ${role}`}>
      {text}
    </motion.div>
  )
}
