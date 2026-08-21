class BattleResult extends HTMLElement {
  #result = null

  set result(value) {
    this.#result = value
    if (this.isConnected) this.#render()
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    const won = this.#result?.winner === 'player'
    const title = won ? '¡VICTORIA!' : 'DERROTA'
    const detail = won
      ? `Has recibido ${this.#result?.pointsAwarded ?? 50} puntos.`
      : `Has recibido ${this.#result?.pointsAwarded ?? 10} puntos por participar.`
    const persistenceMessage = this.#result?.persisted
      ? 'Resultado y estadísticas guardados.'
      : 'El combate terminó, pero no fue posible guardar el resultado.'

    this.innerHTML = `
      <section class="battleResult ${won ? 'battleResult--victory' : 'battleResult--defeat'} pixelFrame arenaStage mx-auto max-w-2xl bg-surface p-2 sm:p-3" aria-labelledby="result-title">
        <header class="border border-brass/60 bg-arena-deep px-5 py-4 text-center sm:px-7">
          <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">COMBATE FINALIZADO</p>
          <h1 class="mt-1 text-3xl font-black tracking-[0.06em] ${won ? 'text-success' : 'text-danger'}" id="result-title">${title}</h1>
        </header>
        <div class="p-8 text-center sm:p-10">
          <p class="font-mono text-lg font-bold text-cream">${detail}</p>
          <p class="mt-3 text-sm text-muted">${persistenceMessage}</p>
          <button class="pixelButton mt-8 w-full bg-action px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-arena-deep hover:bg-[#ffda68]" type="button" data-view="home">VOLVER AL INICIO</button>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <button class="pixelButton w-full bg-panel px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-cream hover:bg-brass/20" type="button" data-view="history">HISTORIAL</button>
            <button class="pixelButton w-full bg-panel px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-cream hover:bg-brass/20" type="button" data-view="leaderboard">RANKING</button>
          </div>
        </div>
      </section>
    `

    this.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('navigate', {
          bubbles: true,
          detail: { view: button.dataset.view },
        }))
      })
    })
  }
}

customElements.define('battle-result', BattleResult)
