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
