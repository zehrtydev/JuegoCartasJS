class PoolGrid extends HTMLElement {
  #cards = []

  set cards(value) {
    this.#cards = Array.isArray(value) ? value : []
    if (this.isConnected) this.#render()
  }

  get cards() {
    return this.#cards
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-6xl bg-surface p-2 sm:p-3" aria-labelledby="pool-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">PREPARACIÓN DE BATALLA</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="pool-title">ELIGE TU EQUIPO</h1>
          </div>
          <p class="border border-brass bg-surface px-3 py-2 font-mono text-xs font-bold tracking-wider text-cream">SELECCIONADOS: <span class="text-action">0 / 5</span></p>
        </header>
        <div class="p-6 sm:p-10">
          <div class="border border-dashed border-brass bg-arena-deep/50 p-6 text-center sm:p-10" role="status">
            <span class="captureSeal mx-auto scale-125" aria-hidden="true"></span>
            <h2 class="mt-5 text-xl font-black tracking-wide text-cream">EL POOL AÚN NO ESTÁ DISPONIBLE</h2>
            <p class="mx-auto mt-3 max-w-xl leading-7 text-muted">No hay cartas activas cargadas desde la API local. Cuando el catálogo esté disponible, aquí aparecerán las cartas para escoger cinco Pokémon diferentes.</p>
          </div>
          <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5" aria-hidden="true">
            ${Array.from({ length: 5 }, () => '<div class="cardBack aspect-[3/4]"><span class="captureSeal scale-75"></span></div>').join('')}
          </div>
          <button class="pixelButton mt-7 w-full bg-action px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-arena-deep opacity-40" type="button" disabled>CONSTRUIR EQUIPO</button>
        </div>
      </section>
    `
  }
}

customElements.define('pool-grid', PoolGrid)
