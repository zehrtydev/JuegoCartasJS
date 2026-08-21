const eventSounds = {
  attack: '/assets/audio/attack.wav',
  defend: '/assets/audio/defense.wav',
  defense: '/assets/audio/defense.wav',
  special: '/assets/audio/special.wav',
  defeated: '/assets/audio/defeated.wav',
  victory: '/assets/audio/victory.wav',
  defeat: '/assets/audio/defeat.wav',
}

function normalizeAction(action) {
  if (String(action).startsWith('attack-')) return 'attack'
  return action
}

function playUrl(url, volume = 0.45) {
  if (!url || typeof Audio === 'undefined') return
  const audio = new Audio(url)
  audio.volume = volume
  audio.play().catch(() => {
    // Algunos navegadores bloquean audio hasta la primera interacción; el juego
    // continúa normalmente y volverá a intentarlo en la siguiente acción.
  })
}

const bgmTracks = {
  home: '/assets/audio/pokemon-theme.mp3',
  pool: '/assets/audio/pokemon-win2.mp3',
  team: '/assets/audio/pokemon-win2.mp3',
  arena: '/assets/audio/pokemon-battle.mp3',
  'result-win': '/assets/audio/pokemon-win.mp3',
  'result-loss': '/assets/audio/pokemon-low-health.mp3',
  history: '/assets/audio/pokemon-historico.mp3',
  leaderboard: '/assets/audio/pokemon-theme-ranking.mp3',
}

/**
 * Reproduce el efecto de inicio de batalla (one-shot, no loop)
 * al mismo tiempo que el BGM de arena.
 */
export function playBattleIntro(volume = 0.45) {
  playUrl('/assets/audio/pokemon-start-battle.mp3', volume)
}

let currentBgmAudio = null
let currentBgmView = null
let gestureListener = null

function cleanupGestureListener() {
  if (gestureListener && typeof window !== 'undefined') {
    window.removeEventListener('pointerdown', gestureListener)
    window.removeEventListener('keydown', gestureListener)
    window.removeEventListener('click', gestureListener)
    gestureListener = null
  }
}

/**
 * Reproduce la música de fondo correspondiente al módulo o vista dada.
 * Si ya se encuentra reproduciendo la misma pista, se mantiene sin cortes.
 * Si se cambia de vista, detiene la anterior e inicia la nueva en bucle.
 */
export function playViewBgm(view, volume = 0.32) {
  if (typeof Audio === 'undefined') return

  const trackUrl = bgmTracks[view]
  if (!trackUrl) {
    stopBgm()
    return
  }

  // Si ya está sonando la misma vista/pista activa, continuar
  if (currentBgmView === view && currentBgmAudio && !currentBgmAudio.paused) {
    return
  }

  // Detener cualquier pista previa
  if (currentBgmAudio) {
    currentBgmAudio.pause()
    currentBgmAudio.currentTime = 0
  }

  currentBgmView = view
  currentBgmAudio = new Audio(trackUrl)
  currentBgmAudio.loop = true
  currentBgmAudio.volume = volume

  const playPromise = currentBgmAudio.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Manejo de restricción de Autoplay del navegador
      if (!gestureListener && typeof window !== 'undefined') {
        gestureListener = () => {
          cleanupGestureListener()
          if (currentBgmAudio && currentBgmAudio.paused) {
            currentBgmAudio.play().catch(() => {})
          }
        }
        window.addEventListener('pointerdown', gestureListener, { once: true })
        window.addEventListener('keydown', gestureListener, { once: true })
        window.addEventListener('click', gestureListener, { once: true })
      }
    })
  }
}

/**
 * Detiene cualquier música de fondo activa de forma limpia.
 */
export function stopBgm() {
  currentBgmView = null
  cleanupGestureListener()

  if (currentBgmAudio) {
    currentBgmAudio.pause()
    currentBgmAudio.currentTime = 0
    currentBgmAudio = null
  }
}

/**
 * Alias de compatibilidad para el tema de inicio.
 */
export function playHomeThemeMusic(volume = 0.35) {
  playViewBgm('home', volume)
}

export function stopHomeThemeMusic() {
  stopBgm()
}

/**
 * Reproduce un efecto local por acción y, cuando existe, el grito específico
 * del Pokémon. Nunca bloquea el turno ni la persistencia si el audio falla.
 */
export function playBattleAudio(action, card = null) {
  const normalized = normalizeAction(action)
  playUrl(eventSounds[normalized], normalized === 'victory' || normalized === 'defeat' ? 0.6 : 0.38)

  if (card?.cryUrl && ['attack', 'special', 'defeated'].includes(normalized)) {
    setTimeout(() => playUrl(card.cryUrl, 0.28), normalized === 'defeated' ? 0 : 90)
  }
}


