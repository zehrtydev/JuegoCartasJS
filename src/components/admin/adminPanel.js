import { loginAdmin } from '../../api/adminsApi.js'
import {
  deleteCard,
  getCards,
  patchCard,
  postCard,
  putCard,
} from '../../api/cardsApi.js'

const emptyForm = () => ({
  id: '',
  number: '',
  name: '',
  type: 'Normal',
  imageUrl: '',
  description: '',
  attackName: 'Ataque básico',
  attackDamage: 25,
  defenseName: 'Escudo',
  specialName: 'Poder especial',
  specialDamage: 65,
  cryUrl: '',
  active: true,
})

class AdminPanel extends HTMLElement {
  #admin = null
  #cards = []
  #state = 'idle'
  #message = ''
  #messageType = 'success'
  #editingId = null
  #deleteCandidate = null
  #search = ''

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

  #showMessage(message, type = 'success') {
    this.#message = message
    this.#messageType = type
  }

  async #handleLogin(form) {
    const data = new FormData(form)
    const username = String(data.get('username') || '').trim()
    const password = String(data.get('password') || '')

    if (!username || !password) {
      this.#showMessage('Ingresa usuario y contraseña.', 'error')
      this.#render()
      return
    }

    this.#state = 'loading'
    this.#message = ''
    this.#render()

    try {
      const admin = await loginAdmin(username, password)
      if (!admin) {
        this.#state = 'idle'
        this.#showMessage('Credenciales incorrectas.', 'error')
        this.#render()
        return
      }

      this.#admin = { id: admin.id, username: admin.username }
      await this.#loadCards()
    } catch (error) {
      console.error('Error during admin login:', error)
      this.#state = 'error'
      this.#showMessage('No fue posible conectar con la API.', 'error')
      this.#render()
    }
  }

  async #loadCards() {
    this.#state = 'loading'
    this.#render()

    try {
      this.#cards = await getCards() || []
      this.#state = 'ready'
    } catch (error) {
      console.error('Error loading admin cards:', error)
      this.#state = 'error'
      this.#showMessage('No se pudo cargar el catálogo.', 'error')
    }

    this.#render()
  }

  #cardToForm(card) {
    return {
      id: card.id,
      number: card.number ?? '',
      name: card.name || '',
      type: card.type || card.types?.[0] || 'Normal',
      imageUrl: card.imageUrl || card.image || '',
      description: card.description || '',
      attackName: card.attacks?.[0]?.name || 'Ataque básico',
      attackDamage: card.attacks?.[0]?.baseDamage ?? 25,
      defenseName: card.defense?.name || 'Escudo',
      specialName: card.special?.name || 'Poder especial',
      specialDamage: card.special?.baseDamage ?? 65,
      cryUrl: card.cryUrl || '',
      active: card.active !== false,
    }
  }

  #buildCardPayload(form, currentCard = null) {
    const data = new FormData(form)
    const number = Number(data.get('number'))
    const name = String(data.get('name') || '').trim()
    const type = String(data.get('type') || 'Normal').trim()
    const normalizedType = type.toLowerCase()
    const imageUrl = String(data.get('imageUrl') || '').trim()
    const firstAttackName = String(data.get('attackName') || 'Ataque básico').trim()
    const firstAttackDamage = Number(data.get('attackDamage'))
    const existingAttacks = currentCard?.attacks || []

    return {
      ...(currentCard || {}),
      id: currentCard?.id || `card-${Date.now()}`,
      number,
      name,
      types: [normalizedType],
      type,
      element: normalizedType,
      image: imageUrl,
      imageUrl,
      description: String(data.get('description') || '').trim(),
      hp: 250,
      attacks: [
        { id: existingAttacks[0]?.id || 'attack-01', name: firstAttackName, baseDamage: firstAttackDamage },
        existingAttacks[1] || { id: 'attack-02', name: 'Ataque rápido', baseDamage: 30 },
        existingAttacks[2] || { id: 'attack-03', name: 'Golpe fuerte', baseDamage: 40 },
        existingAttacks[3] || { id: 'attack-04', name: 'Ataque final', baseDamage: 50 },
      ],
      defense: {
        name: String(data.get('defenseName') || 'Escudo').trim(),
        damageReduction: 0.5,
      },
      special: {
        name: String(data.get('specialName') || 'Poder especial').trim(),
        baseDamage: Number(data.get('specialDamage')),
        unlockTurn: 2,
        cooldown: 3,
      },
      sounds: currentCard?.sounds || {
        attack: '/assets/audio/attack.wav',
        defense: '/assets/audio/defense.wav',
        special: '/assets/audio/special.wav',
        defeated: '/assets/audio/defeated.wav',
      },
      cryUrl: String(data.get('cryUrl') || '').trim(),
      active: data.get('active') === 'on',
      createdAt: currentCard?.createdAt || new Date().toISOString(),
    }
  }

  #validatePayload(card) {
    if (!card.name || !Number.isInteger(card.number) || card.number < 1) {
      return 'Nombre y número válido son obligatorios.'
    }
    if (!card.imageUrl) return 'La URL de imagen es obligatoria.'
    if (!Number.isFinite(card.attacks[0].baseDamage) || card.attacks[0].baseDamage < 0) {
      return 'El daño del ataque debe ser un número válido.'
    }
    return ''
  }

  async #handleSave(form) {
    const currentCard = this.#cards.find((card) => card.id === this.#editingId) || null
    const payload = this.#buildCardPayload(form, currentCard)
    const validationMessage = this.#validatePayload(payload)

    if (validationMessage) {
      this.#showMessage(validationMessage, 'error')
      this.#render()
      return
    }

    this.#state = 'saving'
    this.#message = ''
    this.#render()

    try {
      if (currentCard) {
        await putCard(payload, currentCard.id)
        this.#showMessage('Carta reemplazada completamente mediante PUT.')
      } else {
        await postCard(payload)
        this.#showMessage('Carta creada mediante POST.')
      }
      this.#editingId = null
      await this.#loadCards()
    } catch (error) {
      console.error('Error saving card:', error)
      this.#state = 'ready'
      this.#showMessage('La API rechazó el guardado de la carta.', 'error')
      this.#render()
    }
  }

  async #toggleCard(card) {
    this.#state = 'saving'
    this.#message = ''
    this.#render()

    try {
      await patchCard({ active: card.active === false }, card.id)
      this.#showMessage(`Estado actualizado mediante PATCH: ${card.active === false ? 'activa' : 'inactiva'}.`)
      await this.#loadCards()
    } catch (error) {
      console.error('Error patching card:', error)
      this.#state = 'ready'
      this.#showMessage('No fue posible cambiar el estado.', 'error')
      this.#render()
    }
  }

  async #confirmDelete() {
    if (!this.#deleteCandidate) return
    const card = this.#deleteCandidate
    this.#state = 'saving'
    this.#render()

    try {
      await deleteCard(card.id)
      this.#deleteCandidate = null
      this.#editingId = null
      this.#showMessage(`${card.name} fue eliminada mediante DELETE.`)
      await this.#loadCards()
    } catch (error) {
      console.error('Error deleting card:', error)
      this.#state = 'ready'
      this.#showMessage('No fue posible eliminar la carta.', 'error')
      this.#render()
    }
  }

  #renderLogin() {
    const busy = this.#state === 'loading'
    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-lg bg-surface p-2 sm:p-3" aria-labelledby="admin-title">
        <header class="border border-brass/60 bg-arena-deep px-5 py-4 text-center">
          <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">ACCESO PROTEGIDO</p>
          <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream" id="admin-title">ADMINISTRACIÓN DE CARTAS</h1>
        </header>
        <form class="grid gap-4 p-6 sm:p-8" data-admin-login>
          <label class="grid gap-2 font-mono text-xs font-bold text-cream">USUARIO
            <input class="adminInput" name="username" autocomplete="username" required ${busy ? 'disabled' : ''}>
          </label>
          <label class="grid gap-2 font-mono text-xs font-bold text-cream">CONTRASEÑA
            <input class="adminInput" name="password" type="password" autocomplete="current-password" required ${busy ? 'disabled' : ''}>
          </label>
          ${this.#renderMessage()}
          <button class="pixelButton bg-action px-5 py-3 font-mono text-sm font-black tracking-wider text-arena-deep disabled:opacity-40" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'VALIDANDO...' : 'INGRESAR'}</button>
        </form>
      </section>
    `

    this.querySelector('[data-admin-login]').addEventListener('submit', (event) => {
      event.preventDefault()
      void this.#handleLogin(event.currentTarget)
    })
  }

  #renderMessage() {
    if (!this.#message) return ''
    const className = this.#messageType === 'error' ? 'adminMessage--error' : 'adminMessage--success'
    return `<p class="adminMessage ${className}" role="status">${this.#escapeHtml(this.#message)}</p>`
  }

  #renderForm() {
    const card = this.#cards.find((item) => item.id === this.#editingId)
    const value = card ? this.#cardToForm(card) : emptyForm()
    const saving = this.#state === 'saving'

    return `
      <form class="adminCardForm" data-card-form>
        <div class="adminSectionHeading">
          <div><p>${card ? 'OPERACIÓN PUT' : 'OPERACIÓN POST'}</p><h2>${card ? `EDITAR ${this.#escapeHtml(card.name)}` : 'CREAR CARTA'}</h2></div>
          ${card ? '<button class="adminSecondaryButton" type="button" data-cancel-edit>CANCELAR</button>' : ''}
        </div>
        <div class="adminFormGrid">
          <label>NÚMERO<input class="adminInput" name="number" type="number" min="1" value="${this.#escapeHtml(value.number)}" required></label>
          <label>NOMBRE<input class="adminInput" name="name" value="${this.#escapeHtml(value.name)}" required></label>
          <label>TIPO<input class="adminInput" name="type" value="${this.#escapeHtml(value.type)}" required></label>
          <label>URL IMAGEN<input class="adminInput" name="imageUrl" type="url" value="${this.#escapeHtml(value.imageUrl)}" required></label>
          <label class="adminFormGrid__wide">DESCRIPCIÓN<textarea class="adminInput" name="description" rows="2">${this.#escapeHtml(value.description)}</textarea></label>
          <label>ATAQUE PRINCIPAL<input class="adminInput" name="attackName" value="${this.#escapeHtml(value.attackName)}" required></label>
          <label>DAÑO<input class="adminInput" name="attackDamage" type="number" min="0" value="${value.attackDamage}" required></label>
          <label>DEFENSA<input class="adminInput" name="defenseName" value="${this.#escapeHtml(value.defenseName)}" required></label>
          <label>ESPECIAL<input class="adminInput" name="specialName" value="${this.#escapeHtml(value.specialName)}" required></label>
          <label>DAÑO ESPECIAL<input class="adminInput" name="specialDamage" type="number" min="0" value="${value.specialDamage}" required></label>
          <label>URL GRITO<input class="adminInput" name="cryUrl" type="url" value="${this.#escapeHtml(value.cryUrl)}"></label>
          <label class="adminCheckbox"><input name="active" type="checkbox" ${value.active ? 'checked' : ''}> CARTA ACTIVA</label>
        </div>
        <button class="pixelButton bg-action px-5 py-3 font-mono text-sm font-black tracking-wider text-arena-deep disabled:opacity-40" type="submit" ${saving ? 'disabled' : ''}>${saving ? 'GUARDANDO...' : (card ? 'GUARDAR CON PUT' : 'CREAR CON POST')}</button>
      </form>
    `
  }

  #renderCards() {
    const filtered = this.#cards.filter((card) => card.name.toLowerCase().includes(this.#search.toLowerCase()))
    return `
      <section class="adminCatalog" aria-labelledby="catalog-title">
        <div class="adminSectionHeading">
          <div><p>OPERACIÓN GET</p><h2 id="catalog-title">CATÁLOGO · ${this.#cards.length} CARTAS</h2></div>
          <button class="adminSecondaryButton" type="button" data-refresh>ACTUALIZAR</button>
        </div>
        <label class="adminSearch">BUSCAR<input class="adminInput" type="search" value="${this.#escapeHtml(this.#search)}" data-search placeholder="Nombre de la carta"></label>
        <ul class="adminCardList">
          ${filtered.map((card) => `
            <li class="adminCardRow">
              <img src="${this.#escapeHtml(card.imageUrl || card.image)}" alt="" loading="lazy">
              <div><strong>#${this.#escapeHtml(card.number)} ${this.#escapeHtml(card.name)}</strong><span>${this.#escapeHtml(card.type || card.types?.[0] || 'Sin tipo')} · ${card.active === false ? 'INACTIVA' : 'ACTIVA'}</span></div>
              <div class="adminCardActions">
                <button type="button" data-edit="${this.#escapeHtml(card.id)}">EDITAR · PUT</button>
                <button type="button" data-toggle="${this.#escapeHtml(card.id)}">${card.active === false ? 'ACTIVAR' : 'DESACTIVAR'} · PATCH</button>
                <button class="adminDangerButton" type="button" data-delete="${this.#escapeHtml(card.id)}">ELIMINAR</button>
              </div>
            </li>
          `).join('') || '<li class="adminEmpty">No hay coincidencias.</li>'}
        </ul>
      </section>
    `
  }

  #renderDeleteDialog() {
    if (!this.#deleteCandidate) return ''
    return `
      <div class="adminDialogBackdrop" role="presentation">
        <section class="adminDialog pixelFrame" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
          <p class="font-mono text-xs font-bold tracking-wider text-danger">OPERACIÓN DELETE</p>
          <h2 class="mt-2 text-xl font-black text-cream" id="delete-title">¿ELIMINAR ${this.#escapeHtml(this.#deleteCandidate.name)}?</h2>
          <p class="mt-3 text-sm text-muted">Esta acción elimina permanentemente la carta del catálogo.</p>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <button class="adminSecondaryButton" type="button" data-cancel-delete>CANCELAR</button>
            <button class="pixelButton bg-danger px-4 py-3 font-mono text-xs font-black text-cream" type="button" data-confirm-delete>CONFIRMAR DELETE</button>
          </div>
        </section>
      </div>
    `
  }

  #renderDashboard() {
    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-7xl bg-surface p-2 sm:p-3" aria-labelledby="admin-title">
        <header class="adminHeader border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div><p class="font-mono text-xs font-bold tracking-[0.2em] text-action">SESIÓN: ${this.#escapeHtml(this.#admin.username)}</p><h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream" id="admin-title">ADMINISTRACIÓN DE CARTAS</h1></div>
          <button class="adminSecondaryButton" type="button" data-logout>CERRAR SESIÓN</button>
        </header>
        ${this.#renderMessage()}
        <div class="adminDashboard">
          ${this.#renderForm()}
          ${this.#renderCards()}
        </div>
      </section>
      ${this.#renderDeleteDialog()}
    `

    this.querySelector('[data-logout]').addEventListener('click', () => {
      this.#admin = null
      this.#cards = []
      this.#message = ''
      this.#state = 'idle'
      this.#render()
    })
    this.querySelector('[data-card-form]').addEventListener('submit', (event) => {
      event.preventDefault()
      void this.#handleSave(event.currentTarget)
    })
    this.querySelector('[data-cancel-edit]')?.addEventListener('click', () => {
      this.#editingId = null
      this.#render()
    })
    this.querySelector('[data-refresh]').addEventListener('click', () => void this.#loadCards())
    this.querySelector('[data-search]').addEventListener('input', (event) => {
      this.#search = event.target.value
      this.#render()
      this.querySelector('[data-search]')?.focus()
    })
    this.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => {
      this.#editingId = button.dataset.edit
      this.#message = ''
      this.#render()
      this.querySelector('[data-card-form] input')?.focus()
    }))
    this.querySelectorAll('[data-toggle]').forEach((button) => button.addEventListener('click', () => {
      const card = this.#cards.find((item) => item.id === button.dataset.toggle)
      if (card) void this.#toggleCard(card)
    }))
    this.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => {
      this.#deleteCandidate = this.#cards.find((item) => item.id === button.dataset.delete) || null
      this.#render()
      this.querySelector('[data-cancel-delete]')?.focus()
    }))
    this.querySelector('[data-cancel-delete]')?.addEventListener('click', () => {
      this.#deleteCandidate = null
      this.#render()
    })
    this.querySelector('[data-confirm-delete]')?.addEventListener('click', () => void this.#confirmDelete())
  }

  #render() {
    if (!this.#admin) {
      this.#renderLogin()
      return
    }
    this.#renderDashboard()
  }
}

customElements.define('admin-panel', AdminPanel)
