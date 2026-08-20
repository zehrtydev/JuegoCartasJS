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

  #escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    })[character])
  }

  #getRankedPlayers() {
    return [...this.#players].sort((first, second) => {
      const pointsDifference = Number(second.points || 0) - Number(first.points || 0)
      if (pointsDifference !== 0) return pointsDifference

      const winsDifference = Number(second.wins || 0) - Number(first.wins || 0)
      if (winsDifference !== 0) return winsDifference

      const gamesDifference = Number(second.gamesPlayed || 0) - Number(first.gamesPlayed || 0)
      if (gamesDifference !== 0) return gamesDifference

      return String(first.nickname || first.alias || '').localeCompare(String(second.nickname || second.alias || ''))
    })
  }

  #renderRows() {
    return this.#getRankedPlayers().map((player, index) => {
      const nickname = this.#escapeHtml(player.nickname || player.alias || 'ENTRENADOR')
      const points = Number(player.points || 0)
      const wins = Number(player.wins || 0)
      const losses = Number(player.losses || 0)
      const games = Number(player.gamesPlayed || 0)

      return `
        <li class="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border border-brass/50 bg-arena-deep/50 px-4 py-3 sm:grid-cols-[3rem_1fr_5rem_9rem]">
          <span class="font-mono text-sm font-black text-action">#${index + 1}</span>
          <span class="min-w-0 truncate font-mono text-sm font-bold text-cream">${nickname}</span>
          <span class="font-mono text-sm font-black text-success">${points} PTS</span>
          <span class="hidden font-mono text-xs text-muted sm:block">${wins} V · ${losses} D · ${games} PJ</span>
        </li>
      `
    }).join('')
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
          ${this.#state === 'ready' ? `
            <p class="mb-5 text-sm text-muted">Ordenado por puntos, victorias y partidas jugadas.</p>
            <div class="mb-2 hidden grid-cols-[3rem_1fr_5rem_9rem] gap-3 px-4 font-mono text-xs font-bold tracking-wider text-muted sm:grid">
              <span>POS.</span><span>ENTRENADOR</span><span>PUNTOS</span><span>ESTADÍSTICAS</span>
            </div>
            <ol class="space-y-2" aria-label="Clasificación de entrenadores">${this.#renderRows()}</ol>
          ` : `
            <ui-state state="${this.#state}" title="EL RANKING AÚN ESTÁ VACÍO" message="Termina una partida para aparecer aquí. El ranking se ordena por puntos y victorias."></ui-state>
          `}
          <button class="pixelButton mt-7 w-full bg-action px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-arena-deep transition hover:bg-[#ffda68] focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-surface" type="button" data-view="home">VOLVER AL INICIO</button>
        </div>
      </section>
    `

    const state = this.querySelector('ui-state')
    if (state) state.state = this.#state
    state?.addEventListener('retry-requested', () => {
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
