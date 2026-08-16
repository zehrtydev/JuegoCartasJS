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
      <section class="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1.15fr_0.85fr]" aria-labelledby="welcome-title">
        <div class="p-7 sm:p-10">
          <p class="text-sm font-bold tracking-[0.2em] text-amber-300">ARENA DE ENTRENADORES</p>
          <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-100 sm:text-5xl" id="welcome-title">Elige tu próximo combate.</h1>
          <p class="mt-5 max-w-xl text-base leading-7 text-slate-300">Escribe un alias para continuar o elige un perfil existente.</p>
          <form class="mt-8 max-w-lg" novalidate>
            <label class="block text-sm font-bold text-slate-100" for="player-alias">Tu alias</label>
            <input class="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30" id="player-alias" name="alias" type="text" autocomplete="nickname" maxlength="24" placeholder="Ej. Entrenador Azul" required aria-describedby="alias-help" />
            <p class="mt-2 text-sm text-slate-400" id="alias-help">Debe ser único. Máximo 24 caracteres.</p>
            <button class="mt-5 w-full rounded-lg bg-amber-300 px-5 py-3 font-bold text-slate-950 transition enabled:hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:ring-offset-2 focus:ring-offset-slate-900" type="submit" disabled>Continuar / crear perfil</button>
          </form>
        </div>
        <aside class="border-t border-slate-700 bg-slate-950/50 p-7 sm:p-10 lg:border-t-0 lg:border-l" aria-labelledby="profiles-title">
          <h2 class="text-lg font-black text-slate-100" id="profiles-title">Perfiles existentes</h2>
          <div class="mt-4" data-profiles></div>
        </aside>
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
      container.innerHTML = '<p class="rounded-lg border border-dashed border-slate-700 p-4 text-sm leading-6 text-slate-400">Aún no hay perfiles disponibles. Crea el primero para empezar.</p>'
      return
    }

    container.innerHTML = `<ul class="space-y-3">${this.#players.map((player) => `
      <li><button class="w-full rounded-lg border border-slate-700 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300" type="button" data-player-id="${player.id}"><span class="block font-bold text-slate-100">${player.alias}</span><span class="text-sm text-amber-300">${player.points} pts</span></button></li>
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
