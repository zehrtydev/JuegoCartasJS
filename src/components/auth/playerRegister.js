class PlayerRegister extends HTMLElement {
  #players = []

  set players(value) {
    this.#players = Array.isArray(value) ? value : []
    if (this.isConnected) this.#render()
  }

  get players() {
    return this.#players
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    this.innerHTML = `
      <section class="mx-auto max-w-6xl" aria-labelledby="welcome-title">
        <div class="pixelFrame arenaStage bg-surface p-2 sm:p-3">
          <div class="relative border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
            <div class="absolute left-4 top-1/2 hidden -translate-y-1/2 sm:block" aria-hidden="true"><div class="stadiumLights">${'<span></span>'.repeat(8)}</div></div>
            <div class="absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block" aria-hidden="true"><div class="stadiumLights">${'<span></span>'.repeat(8)}</div></div>
            <div class="flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-bold tracking-wider text-muted">
              <span class="flex items-center gap-2"><span class="captureSeal scale-75" aria-hidden="true"></span>ARENA DE ENTRENADORES</span>
              <span class="text-action">EQUIPO: 5 CARTAS · COMBATE POR TURNOS</span>
            </div>
          </div>
          <div class="grid lg:grid-cols-[1.25fr_0.75fr]">
        <div class="p-7 sm:p-10">
          <div class="flex items-center gap-4">
            <span class="trainerPortrait shrink-0" aria-hidden="true"></span>
            <div>
              <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">REGISTRO DE ENTRENADOR</p>
              <h1 class="mt-2 text-4xl font-black tracking-[0.04em] text-cream sm:text-5xl" id="welcome-title">ENTRA A LA ARENA.</h1>
            </div>
          </div>
          <p class="mt-5 max-w-xl text-base leading-7 text-muted">Escribe un alias para continuar o elige un perfil existente.</p>
          <form class="mt-8 max-w-lg" novalidate>
            <label class="block font-mono text-xs font-bold tracking-wider text-cream" for="player-alias">TU ALIAS</label>
            <input class="mt-2 w-full border-2 border-brass bg-arena-deep px-4 py-3 font-mono text-cream outline-none placeholder:text-muted/60 focus:border-action focus:ring-2 focus:ring-action/30" id="player-alias" name="alias" type="text" autocomplete="nickname" maxlength="24" placeholder="Ej. Entrenador Rojo" required aria-describedby="alias-help" />
            <p class="mt-2 text-sm text-muted" id="alias-help">Debe ser único. Máximo 24 caracteres.</p>
            <button class="pixelButton mt-5 w-full bg-action px-5 py-3 font-mono text-base font-black tracking-[0.12em] text-arena-deep transition enabled:hover:bg-[#ffda68] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-surface" type="submit" disabled>EMPEZAR COMBATE</button>
          </form>
        </div>
        <aside class="border-t-2 border-brass bg-panel p-7 sm:p-10 lg:border-t-0 lg:border-l-2" aria-labelledby="profiles-title">
          <h2 class="font-mono text-sm font-black tracking-wider text-cream" id="profiles-title">PERFILES EXISTENTES</h2>
          <div class="mt-4" data-profiles></div>
        </aside>
          </div>
          <div class="grid grid-cols-5 gap-2 border-t-2 border-brass bg-arena-deep p-4" aria-label="Cinco espacios de cartas para tu futuro equipo">
            ${Array.from({ length: 5 }, () => '<div class="cardBack aspect-[3/4]" aria-hidden="true"><span class="captureSeal scale-75"></span></div>').join('')}
          </div>
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
  }

  #renderProfiles(container) {
    if (this.#players.length === 0) {
      container.innerHTML = '<p class="border border-dashed border-brass/70 bg-arena-deep/40 p-4 text-sm leading-6 text-muted">Aún no hay perfiles disponibles. Crea el primero para empezar.</p>'
      return
    }

    container.innerHTML = `<ul class="space-y-3">${this.#players.map((player) => `
      <li><button class="w-full border border-brass/70 bg-arena-deep/40 px-4 py-3 text-left transition hover:border-action hover:bg-arena-deep focus:outline-none focus:ring-2 focus:ring-action" type="button" data-player-id="${player.id}"><span class="block font-mono font-bold text-cream">${player.alias}</span><span class="font-mono text-sm text-action">${player.points} pts</span></button></li>
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
