class UiState extends HTMLElement {
  #state = 'empty'

  set state(value) {
    this.#state = ['loading', 'empty', 'error'].includes(value) ? value : 'empty'
    if (this.isConnected) this.#render()
  }

  get state() {
    return this.#state
  }

  connectedCallback() {
    this.#state = this.getAttribute('state') || this.#state
    this.#render()
  }

  #render() {
    const parchmentVariant = this.getAttribute('variant') === 'parchment'
    const title = this.getAttribute('title') || 'SIN DATOS DISPONIBLES'
    const message = this.getAttribute('message') || 'Aún no hay información para mostrar.'
    const content = {
      loading: {
        icon: '<span class="pixelLoader" aria-hidden="true"></span>',
        title: 'CARGANDO DATOS...',
        message: 'La arena está preparando la información.',
      },
      empty: {
        icon: '<span class="captureSeal scale-110" aria-hidden="true"></span>',
        title,
        message,
      },
      error: {
        icon: '<span class="stateErrorMark" aria-hidden="true">!</span>',
        title: 'NO SE PUDO CARGAR LA INFORMACIÓN',
        message: 'Revisa la conexión con la API local e inténtalo de nuevo.',
      },
    }[this.#state]

    this.innerHTML = `
      <div class="uiStatePanel${parchmentVariant ? ' uiStatePanel--parchment' : ''} border border-dashed border-brass bg-arena-deep/50 p-6 text-center sm:p-10" role="${this.#state === 'error' ? 'alert' : 'status'}" aria-live="polite">
        <div class="mx-auto flex w-fit justify-center">${content.icon}</div>
        <h2 class="mt-5 text-xl font-black tracking-wide text-cream">${content.title}</h2>
        <p class="mx-auto mt-3 max-w-xl leading-7 text-muted">${content.message}</p>
        ${this.#state === 'error' ? '<button class="pixelButton mt-6 bg-action px-5 py-3 font-mono text-sm font-black tracking-wide text-arena-deep transition hover:bg-[#ffda68] focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-arena-deep" type="button" data-retry>REINTENTAR</button>' : ''}
      </div>
    `

    this.querySelector('[data-retry]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('retry-requested', { bubbles: true }))
    })
  }
}

customElements.define('ui-state', UiState)
