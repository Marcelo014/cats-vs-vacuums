import { CATS, UPGRADE_COSTS, SETTINGS } from '../config/GameConfig.js'

export default class Cat {
  constructor(scene, type, x, y) {
    this.scene = scene
    this.type = type
    this.x = x
    this.y = y
    this.alive = true
    this._attackCooldown = 0
    this._target = null
    this.level = 0

    // Load stats from config
    const config = CATS[type]
    this.name = config.name
    this.emoji = config.emoji
    this.cost = config.cost
    this.damage = config.damage
    this.range = config.range
    this.fireRate = config.fireRate
    this.color = config.color
    this.radius = config.radius

    // Placement radius is just the cat's own circle size
    // Cats can be placed anywhere as long as their circles don't overlap
    this.placementRadius = this.radius

    // Graphics
    this.container = scene.add.container(x, y)

    this.rangeCircle = scene.add.circle(0, 0, this.range, 0xffffff, 0.06)
    this.rangeCircle.setStrokeStyle(1, 0xffffff, 0.2)
    this.rangeCircle.setVisible(false)

    this.body = scene.add.circle(0, 0, this.radius, this.color)
    this.body.setStrokeStyle(2, 0xffffff, 0.4)

    this.label = scene.add.text(0, 0, this.emoji, {
      fontSize: `${this.radius}px`
    }).setOrigin(0.5)

    this.levelText = scene.add.text(0, this.radius + 6, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0)

    this.container.add([this.rangeCircle, this.body, this.label, this.levelText])

    this.body.setInteractive({ useHandCursor: true })
    this.body.on('pointerover', () => this.rangeCircle.setVisible(true))
    this.body.on('pointerout', () => {
      if (!this.selected) this.rangeCircle.setVisible(false)
    })
    this.body.on('pointerdown', (pointer) => {
      pointer.event.stopPropagation()
      scene.events.emit('catClicked', this)
    })

    scene.cats.push(this)
  }

  get upgradeCost() {
    if (this.level >= 5) return null
    if (this.type === 'tuxedo' && this.level === 4) return 1000
    return UPGRADE_COSTS[this.level]
  }

  upgrade() {
    if (this.level >= 5) return

    this.level++

    switch (this.level) {
      case 1:
        this.fireRate = Math.max(100, Math.round(this.fireRate * 0.85))
        break
      case 2:
        this.damage = Math.round(this.damage * 1.3)
        break
      case 3:
        this.range = Math.round(this.range * 1.2)
        this.rangeCircle.setRadius(this.range)
        break
      case 4:
        this.damage = Math.round(this.damage * 1.5)
        break
      case 5:
        this.fireRate = Math.max(100, Math.round(this.fireRate * 0.7))
        this.damage = Math.round(this.damage * 1.5)
        break
    }

    this.levelText.setText('★'.repeat(this.level))
    this.levelText.setColor(this.level >= 4 ? '#ffd700' : '#ffffff')

    const burst = this.scene.add.circle(this.x, this.y, this.radius * 2, 0xffd700, 0.5)
    this.scene.tweens.add({
      targets: burst,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => burst.destroy(),
    })
  }

  update(delta) {
    if (!this.alive) return

    // Scale delta by game speed
    const scaledDelta = delta * SETTINGS.gameSpeed

    if (this._attackCooldown > 0) {
      this._attackCooldown -= scaledDelta
    }

    // Tuxedo — buff adjacent cats instead of attacking
    if (this.type === 'tuxedo') {
      this._applyTuxedoBuff()
      return
    }

    // Persian — apply slow aura to vacuums in range
    if (this.type === 'persian') {
      this._applyPersianSlow()
    }

    if (!this._target || !this._target.alive) {
      this._target = this._findTarget()
    }

    if (this._target && this._attackCooldown <= 0) {
      if (this._target.distanceTo(this.x, this.y) <= this.range) {
        this._attack(this._target)
        this._attackCooldown = this.fireRate
      } else {
        this._target = null
      }
    }
  }

  _applyPersianSlow() {
    for (const vacuum of this.scene.vacuums) {
      if (!vacuum.alive) continue
      if (vacuum.distanceTo(this.x, this.y) <= this.range) {
        // Slow to 40% speed, refreshes every frame
        vacuum.applySlow(0.4, 500)

        // Subtle purple tint on slowed vacuums
        vacuum.body.setFillStyle(0xce93d8)
      }
    }
  }

  _applyTuxedoBuff() {
    // Buff range scales with level — Level 5 is map-wide
    const buffRange = this.level >= 5 ? 9999 : this.range

    for (const cat of this.scene.cats) {
      if (cat === this) continue
      if (!cat.alive) continue
      const dist = Math.hypot(cat.x - this.x, cat.y - this.y)
      if (dist <= buffRange) {
        // Apply a 25% fire rate boost — refreshes every frame
        // We do this by temporarily reducing the attack cooldown
        if (!cat._tuxedoBuffed) {
          cat._tuxedoBuffed = true
          cat._basefireRate = cat._basefireRate || cat.fireRate
          cat.fireRate = Math.round(cat._basefireRate * 0.75)
        }
      } else {
        // Out of range — remove buff
        if (cat._tuxedoBuffed) {
          cat._tuxedoBuffed = false
          cat.fireRate = cat._basefireRate || cat.fireRate
        }
      }
    }

    // Visual — subtle golden pulse on tuxedo
    if (!this._tuxedoPulseActive) {
      this._tuxedoPulseActive = true
      this.scene.tweens.add({
        targets: this.body,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1,
      })
    }
  }

  _findTarget() {
    let best = null
    let bestProgress = -1

    for (const vacuum of this.scene.vacuums) {
      if (!vacuum.alive) continue
      if (vacuum.distanceTo(this.x, this.y) > this.range) continue
      if (vacuum.progress > bestProgress) {
        bestProgress = vacuum.progress
        best = vacuum
      }
    }
    return best
  }

  _attack(target) {
    target.takeDamage(this.damage)

    this.scene.tweens.add({
      targets: this.body,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
    })

    const proj = this.scene.add.circle(this.x, this.y, 4, this.color, 0.9)
    this.scene.tweens.add({
      targets: proj,
      x: target.container.x,
      y: target.container.y,
      duration: 150,
      onComplete: () => proj.destroy(),
    })
  }

  setSelected(selected) {
    this.selected = selected
    this.rangeCircle.setVisible(selected)
    this.body.setStrokeStyle(2, selected ? 0x00ff88 : 0xffffff, selected ? 1 : 0.4)
  }

  destroy() {
    this.alive = false
    // Remove tuxedo buff if this was a tuxedo
    if (this.type === 'tuxedo') {
      for (const cat of this.scene.cats) {
        if (cat._tuxedoBuffed) {
          cat._tuxedoBuffed = false
          cat.fireRate = cat._basefireRate || cat.fireRate
        }
      }
    }
    const idx = this.scene.cats.indexOf(this)
    if (idx !== -1) this.scene.cats.splice(idx, 1)
    this.container.destroy()
  }
}