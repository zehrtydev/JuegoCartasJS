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

let homeThemeAudio = null
let isHomeThemeActive = false
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
 * Inicia la reproducción en bucle del tema principal (pokemon-theme.mp3)
 * para la pantalla de inicio. Si el navegador bloquea el autoplay,
 * se engancha al primer gesto del usuario (click, toque o tecla) para
 * iniciar la reproducción automáticamente sin errores.
 */
export function playHomeThemeMusic(volume = 0.35) {
  if (typeof Audio === 'undefined') return

  isHomeThemeActive = true

  if (!homeThemeAudio) {
    homeThemeAudio = new Audio('/assets/audio/pokemon-theme.mp3')
    homeThemeAudio.loop = true
  }

  homeThemeAudio.volume = volume

  // Si ya está reproduciéndose, no reiniciar
  if (!homeThemeAudio.paused) return

  const playPromise = homeThemeAudio.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay bloqueado por el navegador: esperar a la primera interacción del usuario
      if (!gestureListener && typeof window !== 'undefined') {
        gestureListener = () => {
          cleanupGestureListener()
          if (isHomeThemeActive && homeThemeAudio && homeThemeAudio.paused) {
            homeThemeAudio.play().catch(() => {})
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
 * Detiene la música de inicio de forma limpia y reinicia su posición.
 */
export function stopHomeThemeMusic() {
  isHomeThemeActive = false
  cleanupGestureListener()

  if (homeThemeAudio) {
    homeThemeAudio.pause()
    homeThemeAudio.currentTime = 0
  }
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


