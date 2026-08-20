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
      <section class="registrationScene" aria-labelledby="welcome-title">
        <div class="registrationScene__shade" aria-hidden="true"></div>
        <div class="registrationLayout">
          <div class="trainerConsole">
            <div class="trainerConsole__content">
              <figure class="trainerSpriteFrame" aria-label="Silueta de entrenador">
                <img src="/assets/images/ui/trainerSilhouette.png" alt="" />
              </figure>
              <div class="trainerConsole__formColumn">
                <h1 class="trainerConsole__title" id="welcome-title">REGISTRO DE ENTRENADOR</h1>
                <form class="trainerForm" novalidate>
                  <label class="trainerLabel" for="player-alias">TU ALIAS</label>
                  <input class="trainerInput" id="player-alias" name="alias" type="text" autocomplete="nickname" maxlength="24" placeholder="Escribe tu alias..." required aria-describedby="alias-help" />
                  <p class="trainerHelp" id="alias-help">Alias único · máximo 24 caracteres</p>
                  <button class="gameStartButton" type="submit" disabled>EMPEZAR COMBATE</button>
                </form>
              </div>
            </div>
          </div>
          <aside class="profileLedger" aria-labelledby="profiles-title">
            <div class="profileLedger__tab">
              <h2 id="profiles-title">PERFILES EXISTENTES</h2>
            </div>
            <div class="profileLedger__page" data-profiles></div>
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

    container.innerHTML = `<ul class="profileList space-y-3">${this.#players.map((player) => `
      <li><button class="profileSelectButton w-full border-2 border-[#7d6338] bg-[#e8d29d] px-4 py-3 text-left text-[#302417] shadow-[3px_3px_0_#765529] transition hover:bg-[#f4e2b5] focus:outline-none focus:ring-4 focus:ring-action" type="button" data-player-id="${player.id}"><span class="profileAlias block font-mono font-black">${player.nickname || player.alias || 'ENTRENADOR'}</span><span class="profilePoints font-mono text-sm font-bold text-[#456431]">${player.points || 0} pts</span></button></li>
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
