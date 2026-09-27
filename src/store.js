import { useEffect, useState, useCallback } from 'react'

const KEY = 'ofeeling:v1'

export const CATEGORIES = {
  physics: { label: 'Physics', color: '#A8C3DF', ink: '#27496D' },
  bca: { label: 'BCA', color: '#F3B7B3', ink: '#8E2A2F' },
  class: { label: 'Class', color: '#CFC6EC', ink: '#4A3D80' },
  society: { label: 'Society', color: '#F6D98B', ink: '#7A5A0B' },
  self: { label: 'Me time', color: '#BFDDB5', ink: '#35602A' },
}

export const uid = () => Math.random().toString(36).slice(2, 9)

export const todayStr = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export const addDays = (dateStr, n) => {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

const topics = (...names) => names.map((name) => ({ id: uid(), name, done: false }))

function seed() {
  const t = todayStr()
  return {
    profile: { name: 'Anshita', targetCgpa: 8, currentCgpa: 6.2 },
    subjects: [
      { id: uid(), name: 'Quantum Mechanics', degree: 'physics', credits: 4, weak: true, examDate: addDays(t, 45),
        topics: topics('Wave function & Born rule', 'Schrödinger equation', 'Particle in a box', 'Harmonic oscillator', 'Operators & commutators', 'Hydrogen atom') },
      { id: uid(), name: 'Thermodynamics', degree: 'physics', credits: 4, weak: true, examDate: addDays(t, 48),
        topics: topics('Laws of thermodynamics', 'Entropy', 'Carnot cycle', 'Maxwell relations', 'Kinetic theory') },
      { id: uid(), name: 'Mathematical Physics', degree: 'physics', credits: 4, weak: false, examDate: addDays(t, 50),
        topics: topics('Vector calculus', 'Fourier series', 'Differential equations', 'Complex analysis') },
      { id: uid(), name: 'Data Structures', degree: 'bca', credits: 4, weak: false, examDate: addDays(t, 42),
        topics: topics('Arrays & linked lists', 'Stacks & queues', 'Trees', 'Graphs', 'Sorting & searching') },
      { id: uid(), name: 'DBMS', degree: 'bca', credits: 3, weak: false, examDate: addDays(t, 46),
        topics: topics('ER model', 'Relational algebra', 'SQL', 'Normalization', 'Transactions') },
    ],
    societies: [
      { id: uid(), name: 'Tech Society', role: 'Core member', color: 'society',
        tasks: [{ id: uid(), title: 'Poster for workshop', due: addDays(t, 3), done: false }] },
      { id: uid(), name: 'Physics Club', role: 'Member', color: 'society',
        tasks: [{ id: uid(), title: 'Seminar slides', due: addDays(t, 6), done: false }] },
    ],
    events: [
      { id: uid(), title: 'Quantum Mechanics lecture', date: t, start: '10:00', end: '11:00', category: 'class', done: false },
      { id: uid(), title: 'DBMS lab', date: t, start: '12:00', end: '14:00', category: 'class', done: false },
    ],
    semesters: [{ id: uid(), name: 'Year 1', sgpa: 6.2, credits: 44 }],
    checkins: [],
    messages: [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seed(), ...JSON.parse(raw) }
  } catch {}
  return seed()
}

/** Whole-app state persisted in localStorage. update(fn) takes a draft-returning function. */
export function useStore() {
  const [state, setState] = useState(load)
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])
  const update = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), [])
  const reset = useCallback(() => setState(seed()), [])
  return [state, update, reset]
}
