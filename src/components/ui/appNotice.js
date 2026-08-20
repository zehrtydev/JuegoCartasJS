class AppNotice extends HTMLElement {
  #message = ''

  set message(value) {
    this.#message = String(value || '')
    if (this.isConnected) this.#render()
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    this.replaceChildren()

    const notice = document.createElement('section')
    notice.className = 'fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-start gap-4 border-2 border-action bg-arena-deep p-4 text-cream shadow-2xl sm:left-auto sm:right-6 sm:mx-0'
    notice.setAttribute('role', 'status')
    notice.setAttribute('aria-live', 'polite')

    const message = document.createElement('p')
    message.className = 'flex-1 font-mono text-sm font-bold leading-6'
    message.textContent = this.#message

    const closeButton = document.createElement('button')
    closeButton.className = 'border border-brass px-2 py-1 font-mono text-xs font-bold text-action focus:outline-none focus:ring-2 focus:ring-cream'
    closeButton.type = 'button'
    closeButton.textContent = '×'
    closeButton.setAttribute('aria-label', 'Cerrar mensaje')
    closeButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('notice-dismissed', { bubbles: true }))
    })

    notice.append(message, closeButton)
    this.append(notice)
  }
}

customElements.define('app-notice', AppNotice)
