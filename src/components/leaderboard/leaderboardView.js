class LeaderboardView extends HTMLElement {
  #players = []
  #state = 'empty'

  set players(value) {
    this.#players = Array.isArray(value) ? value : []
    if (this.isConnected) this.#render()
  }

  get players() {
    return this.#players
  }

  set state(value) {
    this.#state = value
    if (this.isConnected) this.#render()
  }

  get state() {
    return this.#state
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-4xl bg-surface p-2 sm:p-3" aria-labelledby="leaderboard-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">CLASIFICACIÓN DE ARENA</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="leaderboard-title">RANKING DE ENTRENADORES</h1>
          </div>
          <span class="captureSeal" aria-hidden="true"></span>
        </header>
        <div class="p-6 sm:p-10">
          <ui-state state="empty" title="EL RANKING AÚN ESTÁ VACÍO" message="Los entrenadores aparecerán aquí al terminar partidas. El orden será por puntos, después por victorias y por la partida más reciente."></ui-state>
          <button class="pixelButton mt-7 w-full bg-action px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-arena-deep transition hover:bg-[#ffda68] focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-surface" type="button" data-view="home">VOLVER AL INICIO</button>
        </div>
      </section>
    `

    const state = this.querySelector('ui-state')
    state.state = this.#state
    state.addEventListener('retry-requested', () => {
      this.dispatchEvent(new CustomEvent('retry-leaderboard-requested', { bubbles: true }))
    })

    this.querySelector('[data-view]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('navigate', {
        bubbles: true,
        detail: { view: 'home' },
      }))
    })
  }
}

customElements.define('leaderboard-view', LeaderboardView)
