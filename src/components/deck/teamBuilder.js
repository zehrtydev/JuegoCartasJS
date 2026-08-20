class TeamBuilder extends HTMLElement {
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

  #escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    })[character])
  }

  #moveCard(index, direction) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= this.#cards.length) return

    const cards = [...this.#cards]
    ;[cards[index], cards[targetIndex]] = [cards[targetIndex], cards[index]]
    this.#cards = cards
    this.#render()
  }

  #renderCard(card, index) {
    const imageUrl = this.#escapeHtml(card.imageUrl || card.image)
    const name = this.#escapeHtml(card.name || 'Pokémon')

    return `
      <li class="border border-brass bg-arena-deep/50 p-3">
        <p class="font-mono text-xs font-bold tracking-wider text-action">POSICIÓN ${index + 1}</p>
        <img src="${imageUrl}" alt="${name}" class="mt-3 aspect-square w-full object-contain" />
        <p class="mt-2 truncate text-center font-mono text-xs font-bold text-cream">${name}</p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button class="border border-brass px-2 py-2 font-mono text-xs font-bold text-cream disabled:opacity-40" type="button" data-move="-1" data-index="${index}" ${index === 0 ? 'disabled' : ''} aria-label="Mover ${name} a la izquierda">←</button>
          <button class="border border-brass px-2 py-2 font-mono text-xs font-bold text-cream disabled:opacity-40" type="button" data-move="1" data-index="${index}" ${index === this.#cards.length - 1 ? 'disabled' : ''} aria-label="Mover ${name} a la derecha">→</button>
        </div>
      </li>
    `
  }

  #render() {
    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-6xl bg-surface p-2 sm:p-3" aria-labelledby="team-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">PREPARACIÓN DE BATALLA</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="team-title">CONSTRUYE TU EQUIPO</h1>
          </div>
          <p class="border border-brass bg-surface px-3 py-2 font-mono text-xs font-bold tracking-wider text-cream">EQUIPO: <span class="text-action">${this.#cards.length} / 5</span></p>
        </header>
        <div class="p-6 sm:p-10">
          <p class="mx-auto max-w-2xl text-center leading-7 text-muted">Define el orden de tus cinco Pokémon. El primer integrante será el que entre a la arena y los relevos seguirán esta posición.</p>
          <ol class="mt-8 grid gap-4 sm:grid-cols-5" aria-label="Orden de combate del equipo">
            ${this.#cards.map((card, index) => this.#renderCard(card, index)).join('')}
          </ol>
          <div class="mt-8 border border-dashed border-brass bg-arena-deep/50 p-5 text-center" role="status">
            <p class="font-mono text-sm font-bold tracking-wide text-cream">${this.#cards.length === 5 ? 'ORDENA TU EQUIPO Y CONFIRMA' : 'PRIMERO DEBES SELECCIONAR CINCO CARTAS'}</p>
            <p class="mt-2 text-sm leading-6 text-muted">El primer Pokémon será el activo inicial; los demás entrarán como relevo en este orden.</p>
          </div>
          <div class="mt-7 grid gap-3 sm:grid-cols-2">
            <button class="border-2 border-brass bg-surface px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-cream transition hover:border-action focus:outline-none focus:ring-2 focus:ring-action" type="button" data-view="pool">VOLVER AL POOL</button>
            <button class="pixelButton bg-action px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-arena-deep disabled:opacity-40" type="button" data-confirm ${this.#cards.length === 5 ? '' : 'disabled'}>CONFIRMAR EQUIPO</button>
          </div>
        </div>
      </section>
    `

    this.querySelector('[data-view]').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('navigate', {
        bubbles: true,
        detail: { view: 'pool' },
      }))
    })

    this.querySelectorAll('[data-move]').forEach((button) => {
      button.addEventListener('click', () => {
        this.#moveCard(Number(button.dataset.index), Number(button.dataset.move))
      })
    })

    this.querySelector('[data-confirm]')?.addEventListener('click', () => {
      if (this.#cards.length !== 5) return
      this.dispatchEvent(new CustomEvent('team-confirmed', {
        bubbles: true,
        detail: { cards: this.#cards },
      }))
    })
  }
}

customElements.define('team-builder', TeamBuilder)
