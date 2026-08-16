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
    const type = this.#getType(card)
    const typeClass = this.#getTypeClass(card)
    const name = this.#escapeHtml(card.name || 'Pokémon sin nombre')
    const number = this.#escapeHtml(card.number || card.pokedexNumber || '---')
    const hp = this.#escapeHtml(card.hp ?? card.health ?? 250)

    return `
      <li>
        <button class="poolCard ${isSelected ? 'poolCard--selected' : ''}" type="button" data-card-id="${this.#escapeHtml(cardId)}" aria-pressed="${isSelected}" aria-label="${isSelected ? 'Quitar' : 'Seleccionar'} a ${name}">
          <span class="poolCard__topline"><span>#${number}</span><span class="poolCard__selectMark">${isSelected ? '✓' : '+'}</span></span>
          <span class="poolCard__sprite poolCard__sprite--${typeClass}" aria-hidden="true"></span>
          <span class="poolCard__name">${name}</span>
          <span class="poolCard__details"><span class="poolCard__type poolCard__type--${typeClass}">${this.#escapeHtml(type)}</span><span>HP ${hp}</span></span>
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
        <i class="poolTeamSlot__sprite poolCard__sprite poolCard__sprite--${this.#getTypeClass(card)}" aria-hidden="true"></i>
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
      <section class="poolScene" aria-labelledby="pool-title">
        <div class="poolDraftConsole">
          <div class="poolDraftConsole__content">
            <header class="poolDraftConsole__header">
              <div>
                <p>PREPARACIÓN DE BATALLA</p>
                <h1 id="pool-title">ELIGE TU EQUIPO</h1>
              </div>
              <p class="poolCounter" aria-live="polite">SELECCIONADOS: <strong>${selectedCards.length} / 5</strong></p>
            </header>
            <div class="poolDraftConsole__cards">
              ${hasCards ? `
                <div class="poolCarousel">
                  <button class="poolCarouselButton poolCarouselButton--previous" type="button" data-page-direction="-1" ${this.#currentPage === 0 ? 'disabled' : ''} aria-label="Ver las cuatro cartas anteriores">←</button>
                  <ul class="poolCardGrid">${visibleCards.map((card) => this.#renderCard(card)).join('')}</ul>
                  <button class="poolCarouselButton poolCarouselButton--next" type="button" data-page-direction="1" ${this.#currentPage === pageCount - 1 ? 'disabled' : ''} aria-label="Ver las cuatro cartas siguientes">→</button>
                  <p class="poolCarouselStatus" aria-live="polite">${firstCardIndex + 1}–${Math.min(firstCardIndex + 4, cards.length)} / ${cards.length}</p>
                </div>
              ` : `
                <ui-state state="empty" title="EL POOL AÚN NO ESTÁ DISPONIBLE" message="No hay cartas activas cargadas desde la API local. Cuando el catálogo esté disponible, aquí aparecerán las cartas para escoger cinco Pokémon diferentes."></ui-state>
              `}
            </div>
            <ol class="poolTeamSlots" aria-label="Cartas seleccionadas para el equipo">
              ${Array.from({ length: 5 }, (_, index) => this.#renderTeamSlot(selectedCards[index], index)).join('')}
            </ol>
            <button class="poolBuildButton" type="button" ${selectionReady ? '' : 'disabled'}>CONSTRUIR EQUIPO</button>
          </div>
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
