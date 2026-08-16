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
    main.className = 'mx-auto min-h-[calc(100vh-101px)] w-full max-w-6xl px-5 py-10 sm:py-16'
    main.append(this.#createView())
    this.append(main)
  }

  #createView() {
    if (this.#currentView === 'home') {
      const register = document.createElement('player-register')
      register.players = []
      return register
    }

    const section = document.createElement('section')
    section.className = 'mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl shadow-slate-950/40 sm:p-12'
    section.innerHTML = `
      <p class="text-sm font-bold tracking-[0.2em] text-amber-300">CARD BATTLE ARENA</p>
      <h1 class="mt-3 text-3xl font-black text-slate-100 sm:text-4xl">${viewLabels[this.#currentView] || 'Pantalla no disponible'}</h1>
      <p class="mt-4 text-slate-300">Esta vista ya forma parte de la navegación. Su contenido funcional se implementará en su bloque correspondiente.</p>
      <button class="mt-8 rounded-lg bg-amber-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:ring-offset-2 focus:ring-offset-slate-900" type="button" data-view="home">Volver al inicio</button>
    `
    section.querySelector('[data-view]').addEventListener('click', () => {
      this.#currentView = 'home'
      this.#render()
    })
    return section
  }
}

customElements.define('game-app', GameApp)
