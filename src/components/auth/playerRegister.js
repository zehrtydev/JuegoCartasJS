class PlayerRegister extends HTMLElement {
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
      <section class="pixelFrame mx-auto max-w-5xl bg-surface p-4 sm:p-6" aria-labelledby="welcome-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7 mb-6">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">BIENVENIDO AL TORNEO</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="welcome-title">REGISTRO DE ENTRENADOR</h1>
          </div>
        </header>

        <div class="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div class="border border-brass/60 bg-arena-deep p-6">
            <h2 class="font-mono text-sm font-bold tracking-wider text-cream mb-4">NUEVO PERFIL</h2>
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <figure class="flex-shrink-0 w-28 h-28 border-2 border-brass/40 bg-surface p-2 flex items-center justify-center" aria-label="Silueta de entrenador">
                <img class="w-full h-full object-contain pixelated" src="/assets/images/ui/trainerSilhouette.png" alt="" />
              </figure>
              <form class="flex-grow w-full" novalidate>
                <label class="block font-mono text-xs font-bold tracking-wider text-action mb-2" for="player-alias">TU ALIAS</label>
                <input class="w-full border border-brass bg-surface px-4 py-2 font-mono text-sm font-bold text-cream placeholder-muted focus:outline-none focus:ring-2 focus:ring-action transition" id="player-alias" name="alias" type="text" autocomplete="nickname" maxlength="24" placeholder="Escribe tu alias..." required aria-describedby="alias-help" />
                <p class="mt-2 font-mono text-[0.65rem] text-muted" id="alias-help">Alias único · máximo 24 caracteres</p>
                <button class="action-btn mt-4 w-full border border-success bg-surface px-4 py-3 font-mono text-xs font-bold text-cream transition hover:bg-success/20 focus:outline-none focus:ring-2 disabled:opacity-40 disabled:hover:bg-surface" type="submit" disabled>EMPEZAR COMBATE</button>
              </form>
            </div>
          </div>
          
          <aside class="border border-brass/60 bg-panel p-6 flex flex-col" aria-labelledby="profiles-title">
            <h2 class="font-mono text-sm font-bold tracking-wider text-cream mb-4" id="profiles-title">PERFILES EXISTENTES</h2>
            <div class="flex-grow overflow-y-auto pr-2" data-profiles></div>
          </aside>
        </div>
      </section>
    `

    const input = this.querySelector('#player-alias')
    const submitButton = this.querySelector('button[type="submit"]')
    const form = this.querySelector('form')
    const profiles = this.querySelector('[data-profiles]')

    this.#renderProfiles(profiles)
    input.addEventListener('input', () => {
      submitButton.disabled = !input.value.trim()
    })
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      const alias = input.value.trim()
      if (!alias) return
      this.dispatchEvent(new CustomEvent('register-player', {
        bubbles: true,
        detail: { alias },
      }))
    })
    profiles.querySelector('ui-state')?.addEventListener('retry-requested', () => {
      this.dispatchEvent(new CustomEvent('retry-players-requested', { bubbles: true }))
    })
  }

  #renderProfiles(container) {
    if (this.#players.length === 0) {
      if (this.#state === 'empty') {
        container.innerHTML = '<p class="sr-only">Aún no hay perfiles disponibles. Crea el primero para empezar.</p>'
        return
      }
      container.innerHTML = '<ui-state variant="parchment" state="empty" title="AÚN NO HAY PERFILES" message="Crea el primero para empezar."></ui-state>'
      const state = container.querySelector('ui-state')
      state.state = this.#state
      return
    }

    container.innerHTML = `<ul class="space-y-3">${this.#players.map((player) => `
      <li>
        <button class="w-full flex items-center justify-between border border-brass bg-surface px-4 py-3 transition hover:bg-brass/20 focus:outline-none focus:ring-2 focus:ring-action" type="button" data-player-id="${player.id}">
          <span class="font-mono font-black text-cream">${player.nickname || player.alias || 'ENTRENADOR'}</span>
          <span class="font-mono text-xs font-bold text-success">${player.points || 0} pts</span>
        </button>
      </li>
    `).join('')}</ul>`

    container.querySelectorAll('[data-player-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const player = this.#players.find(({ id }) => String(id) === button.dataset.playerId)
        this.dispatchEvent(new CustomEvent('select-player', { bubbles: true, detail: { player } }))
      })
    })
  }
}

customElements.define('player-register', PlayerRegister)
