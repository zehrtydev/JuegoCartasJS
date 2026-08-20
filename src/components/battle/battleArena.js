class BattleArena extends HTMLElement {
  #battle = null
  #effect = null

  set battle(value) {
    this.#battle = value
    if (this.isConnected) this.#render()
  }

  get battle() {
    return this.#battle
  }

  set effect(value) {
    this.#effect = value
    if (this.isConnected) this.#render()
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

  #dispatchAction(action, attackId = null) {
    this.dispatchEvent(new CustomEvent('battle-action', {
      bubbles: true,
      detail: { action, attackId }
    }))
  }

  #renderCardImage(card) {
    if (!card) return '<div class="cardBack mx-auto mt-4 max-w-[12rem]" aria-hidden="true"><span class="captureSeal scale-90"></span></div>'
    return `
      <div class="mx-auto mt-4 max-w-[12rem] aspect-square flex items-center justify-center">
        <img src="${this.#escapeHtml(card.imageUrl || card.image)}" alt="${this.#escapeHtml(card.name)}" class="w-full h-full object-contain drop-shadow-lg" />
      </div>
    `
  }

  #renderTeamCard(card) {
    const imageUrl = card.imageUrl || card.image
    const stateClass = card.defeated ? 'opacity-30 grayscale' : ''
    const label = `${card.name}${card.defeated ? ' derrotado' : `, ${Math.max(0, card.hp)} PS`}`

    return `
      <li class="border border-brass/60 bg-arena-deep/50 p-1 ${stateClass}" aria-label="${this.#escapeHtml(label)}">
        <img src="${this.#escapeHtml(imageUrl)}" alt="${this.#escapeHtml(card.name)}" class="aspect-square w-full object-contain" />
      </li>
    `
  }

  #getHealthPercent(card) {
    return Math.max(0, Math.min(100, Math.round((Number(card?.hp || 0) / 250) * 100)))
  }

  #renderHealth(card, owner) {
    const hp = card ? Math.max(0, card.hp) : 0
    const percent = this.#getHealthPercent(card)
    const stateClass = percent <= 25 ? 'healthBar--critical' : (percent <= 55 ? 'healthBar--warning' : '')
    return `
      <div class="healthStatus">
        <div class="healthStatus__labels"><span>HP ${owner}</span><strong>${card ? hp : '—'} / 250</strong></div>
        <div class="healthBar ${stateClass}" role="progressbar" aria-label="Vida de ${this.#escapeHtml(card?.name || owner)}" aria-valuemin="0" aria-valuemax="250" aria-valuenow="${hp}">
          <span style="width: ${percent}%"></span>
        </div>
        ${card?.isDefending ? `<p class="defenseBadge" role="status">◆ DEFENSA ACTIVA · PRÓXIMO DAÑO -50%</p>` : ''}
      </div>
    `
  }

  #getSpecialState(card) {
    const cooldown = Number(card?.specialCooldown || 0)
    const turnCount = Number(card?.turnCount || 0)
    const unlockTurn = Number(card?.special?.unlockTurn ?? 2)
    if (cooldown > 0) return { locked: true, label: `COOLDOWN: ${cooldown} TURNO${cooldown === 1 ? '' : 'S'}` }
    if (turnCount < unlockTurn) {
      const remaining = unlockTurn - turnCount
      return { locked: true, label: `SE HABILITA EN ${remaining} TURNO${remaining === 1 ? '' : 'S'}` }
    }
    return { locked: false, label: 'DISPONIBLE' }
  }

  #effectClass(owner) {
    if (!this.#effect) return ''
    const attacker = this.#effect.actor
    const defender = attacker === 'player' ? 'machine' : 'player'
    if (owner === attacker && this.#effect.action === 'defend') return 'battleCard--defending'
    if (owner === attacker) return this.#effect.action === 'special' ? 'battleCard--special' : 'battleCard--attacking'
    if (owner === defender && this.#effect.isKo) return 'battleCard--defeated'
    if (owner === defender && this.#effect.action !== 'defend') return 'battleCard--damaged'
    return ''
  }

  #render() {
    if (!this.#battle) {
      this.innerHTML = `
        <section class="pixelFrame arenaStage mx-auto max-w-6xl bg-surface p-2 sm:p-3" aria-labelledby="arena-title">
          <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
            <div>
              <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">COMBATE POR TURNOS</p>
              <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="arena-title">ARENA DE BATALLA</h1>
            </div>
          </header>
          <div class="border-t-2 border-brass bg-arena-deep p-4 text-center" role="status">
            <p class="font-mono text-sm font-bold tracking-wide text-action">LA ARENA SE ACTIVARÁ CUANDO EXISTA UN EQUIPO CONFIRMADO</p>
          </div>
        </section>
      `
      return
    }

    const player = this.#battle.activePlayerCard
    const machine = this.#battle.activeMachineCard
    const isPlayerTurn = this.#battle.currentTurn === 'player'
    const isFinished = this.#battle.battleFinished
    const specialState = this.#getSpecialState(player)

    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-6xl bg-surface p-2 sm:p-3" aria-labelledby="arena-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">COMBATE POR TURNOS</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="arena-title">ARENA DE BATALLA</h1>
          </div>
          <p class="border border-brass bg-surface px-3 py-2 font-mono text-xs font-bold tracking-wider text-cream">TURNO: <span class="text-muted">${isPlayerTurn ? 'TUYO' : 'DEL BOT'}</span></p>
        </header>
        <div class="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div class="p-6 sm:p-8">
            <div class="grid gap-4 sm:grid-cols-2">
              <article class="battleCard ${this.#effectClass('machine')} border border-danger/70 bg-arena-deep/50 p-4" aria-label="Pokémon activo del bot">
                <div class="flex items-center justify-between gap-3 font-mono text-xs font-bold tracking-wider">
                  <span class="text-danger">BOT · ACTIVO</span>
                  <span class="text-muted">${machine ? this.#escapeHtml(machine.name) : 'SIN REVELAR'}</span>
                </div>
                ${this.#renderCardImage(machine)}
                ${this.#renderHealth(machine, 'BOT')}
              </article>
              <article class="battleCard ${this.#effectClass('player')} border border-success/70 bg-arena-deep/50 p-4" aria-label="Pokémon activo del jugador">
                <div class="flex items-center justify-between gap-3 font-mono text-xs font-bold tracking-wider">
                  <span class="text-success">TÚ · ACTIVO</span>
                  <span class="text-muted">${player ? this.#escapeHtml(player.name) : 'SIN SELECCIÓN'}</span>
                </div>
                ${this.#renderCardImage(player)}
                ${this.#renderHealth(player, 'JUGADOR')}
              </article>
            </div>
            <section class="mt-5 border border-brass bg-arena-deep/50 p-4" aria-labelledby="actions-title">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="font-mono text-xs font-bold tracking-[0.18em] text-cream" id="actions-title">ACCIONES DE COMBATE</h2>
                <span class="font-mono text-xs text-muted">${isFinished ? 'PARTIDA TERMINADA' : (isPlayerTurn ? 'TU TURNO' : 'ESPERANDO AL BOT...')}</span>
              </div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                ${player ? player.attacks.slice(0, 4).map((attack, index) => `
                  <button class="action-btn border border-brass bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-cream transition hover:bg-brass/20 focus:outline-none focus:ring-2 disabled:opacity-40" type="button" data-action="attack" data-attack-id="${index}" ${!isPlayerTurn || isFinished ? 'disabled' : ''}>
                    ${this.#escapeHtml(attack.name)}
                    <span class="mt-1 block font-normal text-muted">Daño: ${attack.baseDamage}</span>
                  </button>
                `).join('') : ''}
                <button class="action-btn border border-defense bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-cream transition hover:bg-defense/20 focus:outline-none focus:ring-2 disabled:opacity-40" type="button" data-action="defend" ${!isPlayerTurn || isFinished ? 'disabled' : ''}>DEFENSA<span class="mt-1 block font-normal text-muted">${player?.defense?.name || 'Bloqueo'}</span></button>
                <button class="action-btn border border-action bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-cream transition hover:bg-action/20 focus:outline-none focus:ring-2 disabled:opacity-40" type="button" data-action="special" ${!isPlayerTurn || isFinished || specialState.locked ? 'disabled' : ''}>ESPECIAL<span class="mt-1 block font-normal text-muted">${player?.special?.name || 'Ataque Especial'} · ${specialState.label}</span></button>
              </div>
            </section>
          </div>
          <aside class="border-t-2 border-brass bg-panel p-6 sm:p-8 lg:border-t-0 lg:border-l-2" aria-labelledby="log-title">
            <h2 class="font-mono text-sm font-black tracking-wider text-cream" id="log-title">REGISTRO DE BATALLA</h2>
            <div class="mt-4 border border-dashed border-brass bg-arena-deep/50 p-5 max-h-64 overflow-y-auto flex flex-col-reverse" role="status">
              ${this.#battle.log.length === 0 ? `
                <div class="w-full text-center py-4"><span class="captureSeal mx-auto scale-90 inline-block" aria-hidden="true"></span>
                <p class="mt-4 text-center text-sm leading-6 text-muted">El registro mostrará aquí cada ataque, defensa, modificador de tipo, KO y relevo.</p></div>
              ` : `
                <ul class="space-y-2 text-sm text-cream font-mono">
                  ${this.#battle.log.map(msg => `<li>> ${this.#escapeHtml(msg)}</li>`).join('')}
                </ul>
              `}
            </div>
            <div class="mt-6">
              <p class="font-mono text-xs font-bold tracking-wider text-cream">EQUIPOS RESTANTES</p>
              <p class="text-xs text-muted mt-2">Jugador:</p>
              <ul class="mt-1 grid grid-cols-5 gap-2" aria-label="Cartas restantes del jugador">
                ${this.#battle.playerDeck.map((card) => this.#renderTeamCard(card)).join('')}
              </ul>
              <p class="text-xs text-muted mt-2">Máquina:</p>
              <ul class="mt-1 grid grid-cols-5 gap-2" aria-label="Cartas restantes de la máquina">
                ${this.#battle.machineDeck.map((card) => this.#renderTeamCard(card)).join('')}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    `

    this.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action
        const attackId = btn.dataset.attackId
        this.#dispatchAction(action, attackId)
      })
    })
  }
}

customElements.define('battle-arena', BattleArena)
