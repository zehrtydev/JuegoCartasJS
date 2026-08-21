class PoolGrid extends HTMLElement {
  #cards = []
  #currentPage = 0
  #selectedCardIds = new Set()
  #state = 'empty'

  set cards(value) {
    this.#cards = Array.isArray(value) ? value : []
    this.#selectedCardIds = new Set(
      [...this.#selectedCardIds].filter((cardId) => this.#cards.some(({ id }) => String(id) === cardId)),
    )
    this.#currentPage = Math.min(this.#currentPage, Math.max(this.#getPageCount() - 1, 0))
    if (this.isConnected) this.#render()
  }

  get cards() {
    return this.#cards
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

  #getType(card) {
    const type = Array.isArray(card.types) ? card.types[0] : (card.type || card.sprite || 'Normal')
    return String(type)
  }

  #getTypeClass(card) {
    return this.#getType(card).toLocaleLowerCase('es-CO').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '') || 'normal'
  }

  #getSpriteUrl(card) {
    const number = Number(card.number)
    if (Number.isInteger(number) && number > 0) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${number}.png`
    }

    return card.imageUrl || card.image || ''
  }

  #getSpriteScale(card) {
    // Los PNG de PokeAPI no comparten el mismo encuadre visual. Compensamos
    // el espacio transparente de los Pokémon pequeños del pool fijo.
    const scales = {
      1: 1.32, 4: 1.34, 6: 1.02, 7: 1.5, 9: 1.08,
      25: 1.2, 26: 1.16, 39: 1.34, 52: 1.35, 54: 1.42,
      59: 1.05, 94: 1.14, 104: 1.22, 130: 1.02, 131: 1.08,
      136: 1.2, 143: 1.02, 149: 1.02, 150: 1.08, 151: 1.3,
    }

    return scales[Number(card.number)] || 1.15
  }

  #toggleCard(cardId) {
    if (this.#selectedCardIds.has(cardId)) {
      this.#selectedCardIds.delete(cardId)
    } else if (this.#selectedCardIds.size < 5) {
      this.#selectedCardIds.add(cardId)
    } else {
      return
    }

    this.dispatchEvent(new CustomEvent('pool-selection-changed', {
      bubbles: true,
      detail: { selectedCards: this.#getSelectedCards() },
    }))
    this.#render()
  }

  #getSelectedCards() {
    return this.#cards.filter(({ id }) => this.#selectedCardIds.has(String(id)))
  }

  #getPageCount() {
    return Math.ceil(Math.min(this.#cards.length, 20) / 4)
  }

  #changePage(direction) {
    const nextPage = this.#currentPage + direction
    if (nextPage < 0 || nextPage >= this.#getPageCount()) return
    this.#currentPage = nextPage
    this.#render()
  }

  #renderCard(card) {
    const cardId = String(card.id)
    const isSelected = this.#selectedCardIds.has(cardId)
    const name = this.#escapeHtml(card.name || 'Pokémon sin nombre')
    const imageUrl = this.#escapeHtml(card.imageUrl || card.image)

    return `
      <li>
        <button class="poolCard poolCard--fullArt ${isSelected ? 'poolCard--selected' : ''}" type="button" data-card-id="${this.#escapeHtml(cardId)}" aria-pressed="${isSelected}" aria-label="${isSelected ? 'Quitar' : 'Seleccionar'} a ${name}">
          <img src="${imageUrl}" alt="${name}" class="poolCard__image" />
        </button>
      </li>
    `
  }

  #renderTeamSlot(card, index) {
    if (!card) {
      return `<li class="poolTeamSlot" aria-label="Espacio ${index + 1} vacío"><span>${index + 1}</span><i aria-hidden="true"></i></li>`
    }

    return `
      <li class="poolTeamSlot poolTeamSlot--filled" aria-label="Espacio ${index + 1}: ${this.#escapeHtml(card.name)}">
        <span>${index + 1}</span>
        <i class="poolTeamSlot__sprite poolCard__sprite poolCard__sprite--${this.#getTypeClass(card)}" style="--sprite-scale: ${this.#getSpriteScale(card)}" aria-hidden="true">
          <img src="${this.#escapeHtml(this.#getSpriteUrl(card))}" alt="" />
        </i>
        <strong>${this.#escapeHtml(card.name)}</strong>
      </li>
    `
  }

  #render() {
    const cards = this.#cards.slice(0, 20)
    const selectedCards = this.#getSelectedCards()
    const hasCards = cards.length > 0
    const selectionReady = selectedCards.length === 5
    const pageCount = this.#getPageCount()
    const firstCardIndex = this.#currentPage * 4
    const visibleCards = cards.slice(firstCardIndex, firstCardIndex + 4)

    this.innerHTML = `
      <section class="pixelFrame mx-auto max-w-6xl bg-surface p-4 sm:p-6" aria-labelledby="pool-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7 mb-6">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">PREPARACIÓN DE BATALLA</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="pool-title">ELIGE TU EQUIPO</h1>
          </div>
          <div class="border border-brass bg-surface px-4 py-2 font-mono text-sm font-bold tracking-wider text-cream">
            SELECCIONADOS: <strong class="text-action">${selectedCards.length} / 5</strong>
          </div>
        </header>
        
        <div class="grid lg:grid-cols-[1fr_320px] gap-6">
          <div class="border border-brass/60 bg-arena-deep p-4 sm:p-6 relative flex flex-col justify-center min-h-[30rem]">
            ${hasCards ? `
              <div class="poolCarousel w-full max-w-3xl mx-auto">
                <button class="poolCarouselButton poolCarouselButton--previous" type="button" data-page-direction="-1" ${this.#currentPage === 0 ? 'disabled' : ''} aria-label="Ver las cuatro cartas anteriores">←</button>
                <ul class="poolCardGrid">${visibleCards.map((card) => this.#renderCard(card)).join('')}</ul>
                <button class="poolCarouselButton poolCarouselButton--next" type="button" data-page-direction="1" ${this.#currentPage === pageCount - 1 ? 'disabled' : ''} aria-label="Ver las cuatro cartas siguientes">→</button>
                <p class="poolCarouselStatus" aria-live="polite">${firstCardIndex + 1}–${Math.min(firstCardIndex + 4, cards.length)} / ${cards.length}</p>
              </div>
            ` : `
              <ui-state state="empty" title="EL POOL AÚN NO ESTÁ DISPONIBLE" message="No hay cartas activas cargadas desde la API local. Cuando el catálogo esté disponible, aquí aparecerán las cartas para escoger cinco Pokémon diferentes."></ui-state>
            `}
          </div>
          
          <aside class="border-t-2 border-brass bg-panel p-6 lg:border-t-0 lg:border-l-2 flex flex-col" aria-label="Cartas seleccionadas para el equipo">
            <h2 class="font-mono text-sm font-bold tracking-wider text-cream mb-4">TU EQUIPO</h2>
            <ol class="poolTeamSlots flex flex-col gap-3 mb-6 flex-grow">
              ${Array.from({ length: 5 }, (_, index) => this.#renderTeamSlot(selectedCards[index], index)).join('')}
            </ol>
            <button class="poolBuildButton action-btn mt-auto w-full border border-success bg-surface px-4 py-3 font-mono text-sm font-bold text-cream transition hover:bg-success/20 focus:outline-none focus:ring-2 disabled:opacity-40 disabled:hover:bg-surface" type="button" ${selectionReady ? '' : 'disabled'}>CONSTRUIR EQUIPO</button>
          </aside>
        </div>
      </section>
    `

    const state = this.querySelector('ui-state')
    state?.addEventListener('retry-requested', () => {
      this.dispatchEvent(new CustomEvent('retry-cards-requested', { bubbles: true }))
    })

    this.querySelectorAll('[data-card-id]').forEach((button) => {
      button.addEventListener('click', () => this.#toggleCard(button.dataset.cardId))
    })

    this.querySelectorAll('[data-page-direction]').forEach((button) => {
      button.addEventListener('click', () => this.#changePage(Number(button.dataset.pageDirection)))
    })

    this.querySelector('.poolBuildButton')?.addEventListener('click', () => {
      if (!selectionReady) return
      this.dispatchEvent(new CustomEvent('team-selection-confirmed', {
        bubbles: true,
        detail: { selectedCards },
      }))
    })
  }
}

customElements.define('pool-grid', PoolGrid)
