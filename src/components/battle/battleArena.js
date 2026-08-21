import { getTypeBadgeInfo } from '../../utils/typeEffectiveness.js';

class BattleArena extends HTMLElement {
  #battle = null
  #effect = null
  #effectTimer = null

  set battle(value) {
    this.#battle = value
    if (this.isConnected) this.#render()
  }

  get battle() {
    return this.#battle
  }

  set effect(value) {
    this.#effect = value
    clearTimeout(this.#effectTimer)
    if (value) {
      this.#effectTimer = setTimeout(() => {
        this.#effect = null
        if (this.isConnected) this.#render()
      }, 700)
    }
    if (this.isConnected) this.#render()
  }

  connectedCallback() {
    this.#render()
  }

  disconnectedCallback() {
    clearTimeout(this.#effectTimer)
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

  #renderCardImage(card) {
    if (!card) return '<div class="cardBack mx-auto mt-4 max-w-[12rem]" aria-hidden="true"><span class="captureSeal scale-90"></span></div>'
    const spriteUrl = this.#getSpriteUrl(card)
    const scale = this.#getSpriteScale(card) * 1.5
    return `
      <div class="mx-auto mt-4 max-w-[12rem] aspect-square flex items-center justify-center">
        <img src="${this.#escapeHtml(spriteUrl)}" alt="${this.#escapeHtml(card.name)}" class="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] pixel-sprite" style="transform: scale(${scale})" />
      </div>
    `
  }

  #renderTeamCard(card, isPlayerTeam, isActiveCard, isPlayerTurn, isFinished) {
    const imageUrl = card.imageUrl || card.image
    const stateClass = card.defeated ? 'opacity-30 grayscale' : (isActiveCard ? 'ring-2 ring-action/80 bg-action/10' : '')
    const label = `${card.name}${card.defeated ? ' derrotado' : `, ${Math.max(0, card.hp)} PS`}`

    const canSwitch = isPlayerTeam && !card.defeated && !isActiveCard && isPlayerTurn && !isFinished
    const tag = canSwitch ? 'button' : 'div'
    const buttonProps = canSwitch ? `type="button" class="action-btn w-full block transition hover:bg-brass/20 cursor-pointer" data-action="switch" data-attack-id="${card.id}"` : 'class="w-full h-full block"'
    const hoverTitle = canSwitch ? `title="Cambiar a ${this.#escapeHtml(card.name)}"` : ''

    return `
      <li class="border border-brass/60 bg-arena-deep/50 p-1 flex flex-col ${stateClass} ${canSwitch ? 'hover:border-brass' : ''}" aria-label="${this.#escapeHtml(label)}" ${hoverTitle}>
        <${tag} ${buttonProps}>
          <img src="${this.#escapeHtml(imageUrl)}" alt="${this.#escapeHtml(card.name)}" class="aspect-square w-full object-contain ${canSwitch ? 'hover:scale-105 transition-transform' : ''}" />
          ${canSwitch ? `<span class="block mt-1 bg-brass text-cream font-mono text-[0.6rem] font-bold py-0.5 rounded text-center w-full uppercase shadow">Cambiar</span>` : ''}
        </${tag}>
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
    const specialUses = Number(card?.special?.currentUses ?? 2)
    if (specialUses <= 0) return { locked: true, label: 'SIN USOS' }
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
    const card = owner === 'player' ? this.#battle?.activePlayerCard : this.#battle?.activeMachineCard

    if (owner === attacker && this.#effect.action === 'defend') return 'battleCard--defending'
    if (owner === attacker) return this.#effect.action === 'special' ? 'battleCard--special' : 'battleCard--attacking'
    if (owner === defender && this.#effect.isKo && card?.defeated) return 'battleCard--defeated'
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
    const specialUses = player?.special?.currentUses ?? 2
    const hasSpecialUses = specialUses > 0

    const specialBadge = machine && player?.special
      ? getTypeBadgeInfo(player.special.type || player.type || 'Normal', machine.type || 'Normal')
      : null
    const specialEffectivenessTag = specialBadge && specialBadge.multiplier !== 1
      ? `<span class="${specialBadge.cssClass}"> · ${specialBadge.label}</span>`
      : ''

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
                  <span class="text-muted">${machine ? this.#escapeHtml(machine.name) : 'SIN REVELAR'} ${machine?.type ? `<span class="text-action text-[0.7rem] uppercase">[${this.#escapeHtml(machine.type)}]</span>` : ''}</span>
                </div>
                ${this.#renderCardImage(machine)}
                ${this.#renderHealth(machine, 'BOT')}
              </article>
              <article class="battleCard ${this.#effectClass('player')} border border-success/70 bg-arena-deep/50 p-4" aria-label="Pokémon activo del jugador">
                <div class="flex items-center justify-between gap-3 font-mono text-xs font-bold tracking-wider">
                  <span class="text-success">TÚ · ACTIVO</span>
                  <span class="text-muted">${player ? this.#escapeHtml(player.name) : 'SIN SELECCIÓN'} ${player?.type ? `<span class="text-action text-[0.7rem] uppercase">[${this.#escapeHtml(player.type)}]</span>` : ''}</span>
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
                ${player ? player.attacks.slice(0, 4).map((attack, index) => {
                  const uses = attack.currentUses ?? 5
                  const hasUses = uses > 0
                  const badge = machine ? getTypeBadgeInfo(attack.type || player.type || 'Normal', machine.type || 'Normal') : null
                  const effectivenessTag = badge && badge.multiplier !== 1 ? `<span class="${badge.cssClass}"> · ${badge.label}</span>` : ''
                  return `
                    <button class="action-btn border border-brass bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-cream transition hover:bg-brass/20 focus:outline-none focus:ring-2 disabled:opacity-40" type="button" data-action="attack" data-attack-id="${index}" ${!isPlayerTurn || isFinished || !hasUses ? 'disabled' : ''}>
                      <div class="flex items-center justify-between gap-2">
                        <span>${this.#escapeHtml(attack.name)}</span>
                        <span class="text-[0.68rem] px-1.5 py-0.5 rounded border ${hasUses ? 'border-brass/60 text-action' : 'border-danger/60 text-danger'}">${hasUses ? `USOS: ${uses}/5` : 'SIN USOS'}</span>
                      </div>
                      <div class="mt-1 flex flex-wrap items-center gap-1.5 font-normal text-muted">
                        <span>Daño: ${attack.baseDamage}</span>
                        ${effectivenessTag}
                      </div>
                    </button>
                  `
                }).join('') : ''}
                <button class="action-btn border border-defense bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-cream transition hover:bg-defense/20 focus:outline-none focus:ring-2 disabled:opacity-40" type="button" data-action="defend" ${!isPlayerTurn || isFinished ? 'disabled' : ''}>
                  <div class="flex items-center justify-between gap-2">
                    <span>DEFENSA</span>
                    <span class="text-[0.68rem] px-1.5 py-0.5 rounded border border-defense/60 text-[#68d391]">ILIMITADA</span>
                  </div>
                  <span class="mt-1 block font-normal text-muted">${player?.defense?.name || 'Bloqueo'} (-50% daño)</span>
                </button>
                <button class="action-btn border border-action bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-cream transition hover:bg-action/20 focus:outline-none focus:ring-2 disabled:opacity-40" type="button" data-action="special" ${!isPlayerTurn || isFinished || specialState.locked || !hasSpecialUses ? 'disabled' : ''}>
                  <div class="flex items-center justify-between gap-2">
                    <span>ESPECIAL: ${this.#escapeHtml(player?.special?.name || 'Ataque Especial')}</span>
                    <span class="text-[0.68rem] px-1.5 py-0.5 rounded border ${hasSpecialUses ? 'border-action/60 text-action' : 'border-danger/60 text-danger'}">${hasSpecialUses ? `USOS: ${specialUses}/2` : 'SIN USOS'}</span>
                  </div>
                  <div class="mt-1 flex flex-wrap items-center gap-1.5 font-normal text-muted">
                    <span>${!hasSpecialUses ? 'SIN USOS' : specialState.label}</span>
                    ${specialEffectivenessTag}
                  </div>
                </button>
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
                ${this.#battle.playerDeck.map((card) => this.#renderTeamCard(card, true, card.id === player?.id, isPlayerTurn, isFinished)).join('')}
              </ul>
              <p class="text-xs text-muted mt-2">Máquina:</p>
              <ul class="mt-1 grid grid-cols-5 gap-2" aria-label="Cartas restantes de la máquina">
                ${this.#battle.machineDeck.map((card) => this.#renderTeamCard(card, false, card.id === machine?.id, isPlayerTurn, isFinished)).join('')}
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

