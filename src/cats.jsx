// Hand-drawn style cats & doodles, inspired by the o'feeling bakery look.
// Everything is inline SVG so it stays crisp and animates smoothly.

const INK = '#2B3A55'
const RED = '#C8373F'
const BLUE = '#A8C3DF'
const BLUSH = '#F4B6B8'

const stroke = { stroke: INK, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

function Eyes({ mood }) {
  if (mood === 'sleepy' || mood === 'calm') {
    return (
      <g {...stroke} fill="none">
        <path d="M44 57 Q48 60 52 57" />
        <path d="M68 57 Q72 60 76 57" />
      </g>
    )
  }
  if (mood === 'happy' || mood === 'excited') {
    return (
      <g {...stroke} fill="none">
        <path d="M44 58 Q48 53 52 58" />
        <path d="M68 58 Q72 53 76 58" />
      </g>
    )
  }
  return (
    <g className="cat-blink" fill={INK}>
      <ellipse cx="48" cy="57" rx="2.8" ry="3.6" />
      <ellipse cx="72" cy="57" rx="2.8" ry="3.6" />
      {mood === 'sad' && (
        <path d="M76 62 q2 4 0 6 q-2 -2 0 -6z" fill={BLUE} stroke="none" />
      )}
    </g>
  )
}

function Mouth({ mood }) {
  if (mood === 'sad') return <path {...stroke} fill="none" d="M55 67 Q60 63 65 67" />
  if (mood === 'excited')
    return <path {...stroke} fill={RED} d="M55 63 Q60 71 65 63 Z" />
  return <path {...stroke} fill="none" d="M55 63 Q57.5 66.5 60 63 Q62.5 66.5 65 63" />
}

/**
 * <Cat /> — the mascot.
 * hat: 'chef' | 'apple' | 'party' | none ; scarf: bool ; mood: neutral|happy|sleepy|sad|excited|calm
 * holding: optional doodle key drawn in front of the paws
 */
export function Cat({ size = 120, hat = 'chef', scarf = true, mood = 'neutral', holding, wave = false, className = '' }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={`cat ${className}`} aria-hidden="true">
      {/* tail */}
      <path className="cat-tail" {...stroke} fill="#fff" d="M80 104 C98 104 104 88 94 80 C92 78 88 80 90 83 C96 90 92 98 80 98" />
      {/* body */}
      <path {...stroke} fill="#fff" d="M40 72 C33 86 34 102 42 108 L78 108 C86 102 87 86 80 72 Z" />
      <ellipse {...stroke} fill="#fff" cx="50" cy="108" rx="8" ry="4.5" />
      <ellipse {...stroke} fill="#fff" cx="70" cy="108" rx="8" ry="4.5" />
      {/* arm */}
      {wave ? (
        <path className="cat-wave" {...stroke} fill="#fff" d="M80 80 C90 74 94 64 90 60 C87 58 84 62 84 66 C82 72 78 76 76 78" />
      ) : (
        <path {...stroke} fill="none" d="M52 88 Q54 96 50 100" />
      )}
      {/* head */}
      <path {...stroke} fill="#fff" d="M30 52 C28 41 29 31 32 23 L43 33 C51 30 69 30 77 33 L88 23 C91 31 92 41 90 52 C92 69 78 78 60 78 C42 78 28 69 30 52 Z" />
      <ellipse cx="42" cy="64" rx="4.5" ry="2.6" fill={BLUSH} opacity=".85" />
      <ellipse cx="78" cy="64" rx="4.5" ry="2.6" fill={BLUSH} opacity=".85" />
      <Eyes mood={mood} />
      <path d="M58 60.5 L62 60.5 L60 62.5 Z" fill={INK} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      <Mouth mood={mood} />
      {/* whiskers */}
      <g {...stroke} strokeWidth="1.6" fill="none">
        <path d="M30 58 L22 56" /><path d="M30 62 L22 63" />
        <path d="M90 58 L98 56" /><path d="M90 62 L98 63" />
      </g>
      {/* scarf */}
      {scarf && (
        <g>
          <path {...stroke} fill={RED} d="M38 73 Q60 84 82 73 L83 79 Q60 91 37 79 Z" />
          <path {...stroke} fill={RED} d="M66 82 L72 96 L78 92 L72 81" />
        </g>
      )}
      {/* hats */}
      {hat === 'chef' && (
        <g>
          <path {...stroke} fill={BLUE} d="M42 33 C33 24 41 11 51 17 C55 7 69 7 71 17 C81 11 89 24 78 33 Z" />
          <path {...stroke} fill={BLUE} d="M42 33 Q60 29 78 33 L77 38 Q60 34 43 38 Z" />
        </g>
      )}
      {hat === 'apple' && (
        <g>
          <circle {...stroke} fill={RED} cx="77" cy="25" r="7.5" />
          <path {...stroke} fill="none" d="M77 18 Q78 13 81 12" />
          <path {...stroke} fill="#8DB580" d="M79 16 Q86 12 88 17 Q82 19 79 16Z" strokeWidth="1.8" />
        </g>
      )}
      {hat === 'party' && (
        <g>
          <path {...stroke} fill={BLUE} d="M66 30 L78 6 L86 30 Z" />
          <path {...stroke} fill="none" d="M70 22 L82 22 M73 15 L80 15" stroke={RED} />
          <circle cx="78" cy="5" r="3.5" fill={RED} />
        </g>
      )}
      {holding && <g transform="translate(34 78) scale(.42)">{DOODLES[holding]}</g>}
    </svg>
  )
}

const DOODLES = {
  cake: (
    <g {...stroke}>
      <rect x="10" y="44" width="80" height="44" rx="10" fill="#fff" />
      <path d="M10 60 Q30 70 50 60 Q70 70 90 60" fill="none" stroke={BLUE} strokeWidth="5" />
      <rect x="46" y="18" width="8" height="26" rx="3" fill={BLUE} />
      <path d="M50 4 Q56 12 50 16 Q44 12 50 4Z" fill="#F2C14E" />
      <circle cx="30" cy="40" r="7" fill={RED} />
    </g>
  ),
  book: (
    <g {...stroke}>
      <path d="M10 20 Q30 12 50 22 L50 90 Q30 80 10 88 Z" fill="#fff" />
      <path d="M90 20 Q70 12 50 22 L50 90 Q70 80 90 88 Z" fill={BLUE} />
      <path d="M20 40 L40 44 M20 54 L40 58 M60 44 L80 40 M60 58 L80 54" fill="none" />
    </g>
  ),
  coffee: (
    <g {...stroke}>
      <path d="M16 40 L76 40 L70 88 Q46 96 22 88 Z" fill="#fff" />
      <path d="M76 50 Q94 50 90 64 Q86 76 72 72" fill="none" />
      <path d="M34 28 Q30 18 36 10 M50 28 Q46 18 52 10" fill="none" />
    </g>
  ),
  heart: (
    <path {...stroke} fill={RED} d="M50 88 C10 60 8 30 30 22 C42 18 50 30 50 34 C50 30 58 18 70 22 C92 30 90 60 50 88 Z" />
  ),
  apple: (
    <g {...stroke}>
      <circle cx="50" cy="56" r="32" fill={RED} />
      <path d="M50 24 Q52 10 60 8" fill="none" />
      <path d="M56 18 Q74 6 80 18 Q66 26 56 18Z" fill="#8DB580" />
    </g>
  ),
  calendar: (
    <g {...stroke}>
      <rect x="10" y="20" width="80" height="70" rx="10" fill="#fff" />
      <path d="M10 40 L90 40" /><path d="M30 12 L30 28 M70 12 L70 28" />
      <rect x="10" y="20" width="80" height="20" rx="10" fill={RED} />
      <circle cx="32" cy="58" r="4" fill={INK} /><circle cx="50" cy="58" r="4" fill={INK} />
      <circle cx="68" cy="74" r="7" fill={BLUE} />
    </g>
  ),
  star: (
    <path {...stroke} fill="#F2C14E" d="M50 10 L60 38 L90 38 L66 56 L76 86 L50 68 L24 86 L34 56 L10 38 L40 38 Z" />
  ),
  croissant: (
    <g {...stroke} fill="#F2C98A">
      <path d="M12 64 Q20 30 50 28 Q80 30 88 64 Q70 56 50 58 Q30 56 12 64Z" />
      <path d="M36 32 Q40 48 38 58 M64 32 Q60 48 62 58" fill="none" />
    </g>
  ),
}

export function Doodle({ name, size = 28, className = '', style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} style={style} aria-hidden="true">
      {DOODLES[name]}
    </svg>
  )
}

/** Tiny sparkle / cross marks scattered like the reference poster. */
export function Sparkle({ size = 14, style }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} style={style} className="sparkle" aria-hidden="true">
      <path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
