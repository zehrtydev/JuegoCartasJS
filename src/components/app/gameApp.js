const viewLabels = {
  pool: 'Elige tu equipo',
  team: 'Construye tu equipo',
  arena: 'Arena de batalla',
  result: 'Resultado',
  history: 'Historial',
  leaderboard: 'Ranking',
}

class GameApp extends HTMLElement {
  #currentView = 'home'

  connectedCallback() {
    this.addEventListener('navigate', this.#handleNavigation)
    this.addEventListener('register-player', this.#handleRegisterPlayer)
    this.#render()
  }

  disconnectedCallback() {
    this.removeEventListener('navigate', this.#handleNavigation)
    this.removeEventListener('register-player', this.#handleRegisterPlayer)
  }

  #handleNavigation = (event) => {
    this.#currentView = event.detail.view
    this.#render()
  }

  #handleRegisterPlayer = (event) => {
    this.dispatchEvent(new CustomEvent('player-registration-requested', {
      detail: event.detail,
    }))
  }

  #render() {
    this.replaceChildren()

    const header = document.createElement('app-header')
    header.setAttribute('active-view', this.#currentView)
    this.append(header)

    const main = document.createElement('main')
    main.className = this.#currentView === 'home'
      ? 'min-h-[calc(100vh-92px)] w-full'
      : 'mx-auto min-h-[calc(100vh-92px)] w-full max-w-6xl px-5 py-8 sm:py-12'
    main.append(this.#createView())
    this.append(main)
  }

  #createView() {
    if (this.#currentView === 'home') {
      const register = document.createElement('player-register')
      register.players = []
      return register
    }

    if (this.#currentView === 'pool') {
      const pool = document.createElement('pool-grid')
      pool.cards = []
      return pool
    }

    if (this.#currentView === 'team') {
      const teamBuilder = document.createElement('team-builder')
      teamBuilder.cards = []
      return teamBuilder
    }

    if (this.#currentView === 'arena') {
      const arena = document.createElement('battle-arena')
      arena.battle = null
      return arena
    }

    if (this.#currentView === 'history') {
      const history = document.createElement('match-history')
      history.records = []
      return history
    }

    if (this.#currentView === 'leaderboard') {
      const leaderboard = document.createElement('leaderboard-view')
      leaderboard.players = []
      return leaderboard
    }

    const section = document.createElement('section')
    section.className = 'pixelFrame mx-auto max-w-2xl bg-surface p-8 text-center sm:p-12'
    section.innerHTML = `
      <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">CARD BATTLE ARENA</p>
      <h1 class="mt-3 text-3xl font-black text-cream sm:text-4xl">${viewLabels[this.#currentView] || 'Pantalla no disponible'}</h1>
      <p class="mt-4 text-muted">Esta vista ya forma parte de la navegación. Su contenido funcional se implementará en su bloque correspondiente.</p>
      <button class="pixelButton mt-8 bg-action px-5 py-3 font-mono text-sm font-black tracking-wide text-arena-deep transition hover:bg-[#ffda68] focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-surface" type="button" data-view="home">VOLVER AL INICIO</button>
    `
    section.querySelector('[data-view]').addEventListener('click', () => {
      this.#currentView = 'home'
      this.#render()
    })
    return section
  }
}

customElements.define('game-app', GameApp)
