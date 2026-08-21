class PoolGrid extends HTMLElement {
  #cards = []
  #currentPage = 0
  #selectedCardIds = [] // Array instead of Set to preserve order
  #state = 'empty'
  #dragSourceIndex = null

  set cards(value) {
    this.#cards = Array.isArray(value) ? value : []
    this.#selectedCardIds = this.#selectedCardIds.filter((cardId) => this.#cards.some(({ id }) => String(id) === cardId))
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
    const scales = {
      1: 1.32, 4: 1.34, 6: 1.02, 7: 1.5, 9: 1.08,
      25: 1.2, 26: 1.16, 39: 1.34, 52: 1.35, 54: 1.42,
      59: 1.05, 94: 1.14, 104: 1.22, 130: 1.02, 131: 1.08,
      136: 1.2, 143: 1.02, 149: 1.02, 150: 1.08, 151: 1.3,
    }

    return scales[Number(card.number)] || 1.15
  }

  #toggleCard(cardId) {
    const index = this.#selectedCardIds.indexOf(cardId)
    if (index !== -1) {
      this.#selectedCardIds.splice(index, 1)
    } else if (this.#selectedCardIds.length < 5) {
      this.#selectedCardIds.push(cardId)
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
    return this.#selectedCardIds
      .map((id) => this.#cards.find((card) => String(card.id) === id))
      .filter(Boolean)
  }

  #getPageCount() {
    return Math.ceil(Math.min(this.#cards.length, 20) / 3)
  }

  #changePage(direction) {
    const nextPage = this.#currentPage + direction
    if (nextPage < 0 || nextPage >= this.#getPageCount()) return
    this.#currentPage = nextPage
    this.#render()
  }

  #moveCard(index, direction) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= this.#selectedCardIds.length) return
    const ids = [...this.#selectedCardIds]
    ;[ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]]
    this.#selectedCardIds = ids
    this.#render()
  }

  #handleDrop(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    const ids = [...this.#selectedCardIds]
    const [moved] = ids.splice(fromIndex, 1)
    ids.splice(toIndex, 0, moved)
    this.#selectedCardIds = ids
    this.#render()
  }

  #renderCard(card) {
    const cardId = String(card.id)
    const isSelected = this.#selectedCardIds.includes(cardId)
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

    const name = this.#escapeHtml(card.name)
    const isFirst = index === 0
    const isLast = index === this.#selectedCardIds.length - 1

    return `
      <li class="poolTeamSlot poolTeamSlot--filled" draggable="true" data-slot-index="${index}" aria-label="Espacio ${index + 1}: ${name}">
        <span class="poolTeamSlot__position">${index + 1}</span>
        <i class="poolTeamSlot__sprite poolCard__sprite poolCard__sprite--${this.#getTypeClass(card)}" style="--sprite-scale: ${this.#getSpriteScale(card) * 1.3}" aria-hidden="true">
          <img src="${this.#escapeHtml(this.#getSpriteUrl(card))}" alt="" />
        </i>
        <strong class="poolTeamSlot__name">${name}</strong>
        <span class="poolTeamSlot__arrows">
          <button class="poolTeamSlot__arrowBtn" type="button" data-move-dir="-1" data-move-index="${index}" ${isFirst ? 'disabled' : ''} aria-label="Mover ${name} arriba" title="Subir">▲</button>
          <button class="poolTeamSlot__arrowBtn" type="button" data-move-dir="1" data-move-index="${index}" ${isLast ? 'disabled' : ''} aria-label="Mover ${name} abajo" title="Bajar">▼</button>
        </span>
      </li>
    `
  }

  #render() {
    const cards = this.#cards.slice(0, 20)
    const selectedCards = this.#getSelectedCards()
    const hasCards = cards.length > 0
    const selectionReady = selectedCards.length === 5
    const pageCount = this.#getPageCount()
    const firstCardIndex = this.#currentPage * 3
    const visibleCards = cards.slice(firstCardIndex, firstCardIndex + 3)

    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-6xl bg-surface p-2 sm:p-3" aria-labelledby="pool-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">PREPARACIÓN DE BATALLA</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="pool-title">ELIGE TU EQUIPO</h1>
          </div>
          <div class="flex items-center gap-4">
            <span class="border border-brass/60 bg-arena-deep/60 px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-cream">
              SELECCIONADOS: <strong class="text-action">${selectedCards.length} / 5</strong>
            </span>
            <span class="captureSeal" aria-hidden="true"></span>
          </div>
        </header>
        
        <div class="p-6 sm:p-10">
          <div class="grid lg:grid-cols-[1fr_320px] gap-10">
            <div>
              <p class="mb-5 text-sm text-muted">Selecciona cinco Pokémon del catálogo para formar tu equipo.</p>
              ${hasCards ? `
                <div class="poolCarousel w-full max-w-3xl mx-auto">
                  <button class="poolCarouselButton poolCarouselButton--previous" type="button" data-page-direction="-1" ${this.#currentPage === 0 ? 'disabled' : ''} aria-label="Ver las tres cartas anteriores">←</button>
                  <ul class="poolCardGrid">${visibleCards.map((card) => this.#renderCard(card)).join('')}</ul>
                  <button class="poolCarouselButton poolCarouselButton--next" type="button" data-page-direction="1" ${this.#currentPage === pageCount - 1 ? 'disabled' : ''} aria-label="Ver las tres cartas siguientes">→</button>
                  <p class="poolCarouselStatus" aria-live="polite">${firstCardIndex + 1}–${Math.min(firstCardIndex + 3, cards.length)} / ${cards.length}</p>
                </div>
              ` : `
                <ui-state state="empty" title="EL POOL AÚN NO ESTÁ DISPONIBLE" message="No hay cartas activas cargadas desde la API local. Cuando el catálogo esté disponible, aquí aparecerán las cartas para escoger cinco Pokémon diferentes."></ui-state>
              `}
            </div>
            
            <aside aria-label="Cartas seleccionadas para el equipo">
              <p class="mb-5 text-sm text-muted">Ordena tu equipo. El Pokémon #1 será el activo inicial.</p>
              <h2 class="hidden font-mono text-xs font-bold tracking-wider text-muted sm:block mb-2">TU EQUIPO</h2>
              <ol class="poolTeamSlots space-y-2 mb-6">
                ${Array.from({ length: 5 }, (_, index) => this.#renderTeamSlot(selectedCards[index], index)).join('')}
              </ol>
              <button class="pixelButton w-full bg-action px-5 py-3 font-mono text-sm font-black tracking-[0.12em] text-arena-deep transition hover:bg-[#ffda68] focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-action" type="button" data-confirm ${selectionReady ? '' : 'disabled'}>CONFIRMAR EQUIPO</button>
            </aside>
          </div>
        </div>
      </section>
    `

    // --- Event Listeners ---

    const state = this.querySelector('ui-state')
    state?.addEventListener('retry-requested', () => {
      this.dispatchEvent(new CustomEvent('retry-cards-requested', { bubbles: true }))
    })

    // Card selection toggle
    this.querySelectorAll('[data-card-id]').forEach((button) => {
      button.addEventListener('click', () => this.#toggleCard(button.dataset.cardId))
    })

    // Carousel pagination
    this.querySelectorAll('[data-page-direction]').forEach((button) => {
      button.addEventListener('click', () => this.#changePage(Number(button.dataset.pageDirection)))
    })

    // Arrow reorder buttons
    this.querySelectorAll('[data-move-dir]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation()
        this.#moveCard(Number(button.dataset.moveIndex), Number(button.dataset.moveDir))
      })
    })

    // Drag & Drop
    this.querySelectorAll('[data-slot-index]').forEach((slot) => {
      slot.addEventListener('dragstart', (e) => {
        this.#dragSourceIndex = Number(slot.dataset.slotIndex)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', slot.dataset.slotIndex)
        slot.classList.add('poolTeamSlot--dragging')
      })

      slot.addEventListener('dragend', () => {
        this.#dragSourceIndex = null
        slot.classList.remove('poolTeamSlot--dragging')
        this.querySelectorAll('.poolTeamSlot--dragover').forEach((el) => el.classList.remove('poolTeamSlot--dragover'))
      })

      slot.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        // Visual feedback
        this.querySelectorAll('.poolTeamSlot--dragover').forEach((el) => el.classList.remove('poolTeamSlot--dragover'))
        slot.classList.add('poolTeamSlot--dragover')
      })

      slot.addEventListener('dragleave', () => {
        slot.classList.remove('poolTeamSlot--dragover')
      })

      slot.addEventListener('drop', (e) => {
        e.preventDefault()
        slot.classList.remove('poolTeamSlot--dragover')
        const toIndex = Number(slot.dataset.slotIndex)
        if (this.#dragSourceIndex !== null) {
          this.#handleDrop(this.#dragSourceIndex, toIndex)
        }
      })
    })

    // Confirm team (goes directly to combat)
    this.querySelector('[data-confirm]')?.addEventListener('click', () => {
      if (!selectionReady) return
      this.dispatchEvent(new CustomEvent('team-confirmed', {
        bubbles: true,
        detail: { cards: selectedCards },
      }))
    })
  }
}

customElements.define('pool-grid', PoolGrid)
