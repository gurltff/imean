import { motion } from 'framer-motion'
import { CATEGORIES } from './store.js'

export const Tap = ({ children, className = '', ...rest }) => (
  <motion.button whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} className={className} {...rest}>{children}</motion.button>
)

/** Stagger children in as the page mounts. */
export const list = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
export const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export function Section({ title, action, children }) {
  return (
    <motion.section variants={item} className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

export function EventRow({ e, onToggle, onDelete }) {
  const c = CATEGORIES[e.category] || CATEGORIES.self
  return (
    <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      className={`event ${e.done ? 'done' : ''}`} style={{ '--c': c.color, '--ink': c.ink }}>
      <button className="check" onClick={onToggle} aria-label="toggle done">
        <motion.svg viewBox="0 0 20 20" width="14" height="14" initial={false} animate={{ scale: e.done ? 1 : 0 }}>
          <path d="M4 10 L8 14 L16 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
      <div className="event-body">
        <div className="event-title">{e.title}</div>
        <div className="event-meta">{e.start}–{e.end} · <span className="chip">{c.label}</span></div>
      </div>
      {onDelete && <button className="x" onClick={onDelete} aria-label="delete">×</button>}
    </motion.div>
  )
}
