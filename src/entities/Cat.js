import * as Phaser from 'phaser'
import { CATS, UPGRADE_COSTS, SETTINGS } from '../config/GameConfig.js'

const CAT_SPRITES = {
  kitten: 'cat_kitten',
}

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
    this._tuxedoBuffed = false
    this._basefireRate = null
    this._tuxedoPulseActive = false
    this.triggerReady = false
    this._triggerCooldown = 0
    this._lastSnapAngle = 0

    const config = CATS[type]
    this.name = config.name
    this.emoji = config.emoji
    this.cost = config.cost
    this.damage = config.damage
    this.range = config.range
    this.fireRate = config.fireRate
    this.color = config.color
    this.radius = config.radius
    this.placementRadius = this.radius

    this.spriteKey = CAT_SPRITES[type] || null

    // Graphics
    this.container = scene.add.container(x, y)

    this.rangeCircle = scene.add.circle(0, 0, this.range, 0xffffff, 0.06)
    this.rangeCircle.setStrokeStyle(1, 0xffffff, 0.2)
    this.rangeCircle.setVisible(false)

    if (this.spriteKey && scene.textures.exists(this.spriteKey)) {
      this.body = scene.add.image(0, 0, this.spriteKey)
      this.body.setDisplaySize(this.radius * 2, this.radius * 2)
    } else {
      this.body = scene.add.circle(0, 0, this.radius, this.color)
      this.body.setStrokeStyle(2, 0xffffff, 0.4)
      this.label = scene.add.text(0, 0, this.emoji, {
        fontSize: `${this.radius}px`
      }).setOrigin(0.5)
    }

    this.levelText = scene.add.text(0, this.radius + 6, '', {
      fontSize: '10px',
      fontFamily: 'Fredoka One',
      color: '#ffffff',
    }).setOrigin(0.5, 0)

    const containerItems = [this.rangeCircle, this.body]
    if (this.label) containerItems.push(this.label)
    containerItems.push(this.levelText)
    this.container.add(containerItems)

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
        this.triggerReady = true
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

    this.scene.events.emit('catSelected', this)
  }

  update(delta) {
    if (!this.alive) return

    const scaledDelta = delta * SETTINGS.gameSpeed

    if (this._attackCooldown > 0) {
      this._attackCooldown -= scaledDelta
    }

    if (this._triggerCooldown > 0) {
      this._triggerCooldown -= scaledDelta
    }

    if (this.type === 'tuxedo') {
      this._applyTuxedoBuff()
      return
    }

    if (this.type === 'persian') {
      this._applyPersianSlow()
    }

    if (this.type === 'alley_cat') {
      this._applyAlleyCatBonus()
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
        vacuum.applySlow(0.4, 500)
        vacuum.body.setFillStyle(0xce93d8)
      }
    }
  }

  _applyAlleyCatBonus() {
    let nearbyCount = 0
    for (const cat of this.scene.cats) {
      if (cat === this) continue
      if (cat.type !== 'alley_cat') continue
      if (Math.hypot(cat.x - this.x, cat.y - this.y) <= 120) nearbyCount++
    }
    this._alleyCatBonus = 1 + nearbyCount * 0.15
  }

  _applyTuxedoBuff() {
    const buffRange = this.level >= 5 ? 9999 : this.range

    for (const cat of this.scene.cats) {
      if (cat === this) continue
      if (!cat.alive) continue
      const dist = Math.hypot(cat.x - this.x, cat.y - this.y)
      if (dist <= buffRange) {
        if (!cat._tuxedoBuffed) {
          cat._tuxedoBuffed = true
          cat._basefireRate = cat._basefireRate || cat.fireRate
          cat.fireRate = Math.round(cat._basefireRate * 0.75)
        }
      } else {
        if (cat._tuxedoBuffed) {
          cat._tuxedoBuffed = false
          cat.fireRate = cat._basefireRate || cat.fireRate
        }
      }
    }

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
    // Snap to face target when attacking
    if (this.spriteKey) {
      const dx = target.container.x - this.x
      const dy = target.container.y - this.y
      const angle = Math.atan2(dy, dx)
      const snapAngle = Math.round((angle - Math.PI / 2) / (Math.PI / 4)) * (Math.PI / 4)
      if (snapAngle !== this._lastSnapAngle) {
        this._lastSnapAngle = snapAngle
        this.body.setRotation(snapAngle)
      }
    }

    const bonusMultiplier = this._alleyCatBonus || 1
    const finalDamage = Math.round(this.damage * bonusMultiplier)

    if (this.type === 'chonk') {
      this._chonkAOE(finalDamage)
    } else if (this.type === 'ragdoll') {
      this._ragdollBoomerang(finalDamage)
    } else {
      target.takeDamage(finalDamage)
      this._spawnProjectile(target)
    }

    this.scene.tweens.add({
      targets: this.body,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
    })
  }

  _spawnProjectile(target) {
    const proj = this.scene.add.circle(this.x, this.y, 4, this.color, 0.9)
    this.scene.tweens.add({
      targets: proj,
      x: target.container.x,
      y: target.container.y,
      duration: 150,
      onComplete: () => proj.destroy(),
    })
  }

  _chonkAOE() {
    const shockwave = this.scene.add.circle(this.x, this.y, this.range, this.color, 0.3)
    this.scene.tweens.add({
      targets: shockwave,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => shockwave.destroy(),
    })

    for (const vacuum of this.scene.vacuums) {
      if (!vacuum.alive) continue
      if (vacuum.distanceTo(this.x, this.y) <= this.range) {
        vacuum.takeDamage(this.damage)
      }
    }
  }

  _ragdollBoomerang(finalDamage) {
    const target = this._target
    if (!target) return

    const dist = Math.hypot(target.container.x - this.x, target.container.y - this.y)
    const distBonus = Math.min(2.0, 1 + dist / 400)
    const boostedDamage = Math.round(finalDamage * distBonus)

    const arc = this.scene.add.circle(this.x, this.y, this.radius, this.color, 0.8)
    const midX = (this.x + target.container.x) / 2
    const midY = Math.min(this.y, target.container.y) - 80

    this.scene.tweens.add({
      targets: arc,
      x: midX,
      y: midY,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: arc,
          x: target.container.x,
          y: target.container.y,
          duration: 180,
          ease: 'Quad.easeIn',
          onComplete: () => {
            for (const vacuum of this.scene.vacuums) {
              if (!vacuum.alive) continue
              if (vacuum.distanceTo(target.container.x, target.container.y) <= 60) {
                vacuum.takeDamage(boostedDamage)
              }
            }
            this.scene.tweens.add({
              targets: arc,
              x: this.x,
              y: this.y,
              duration: 250,
              ease: 'Quad.easeOut',
              onComplete: () => arc.destroy(),
            })
          }
        })
      }
    })
  }

  canTrigger() {
    return this.level >= 5 && this._triggerCooldown <= 0 && this._hasTrigger()
  }

  _hasTrigger() {
    return ['kitten', 'persian', 'siamese', 'bengal', 'ragdoll', 'chonk'].includes(this.type)
  }

  activateTrigger(targetX = null, targetY = null) {
    if (!this.canTrigger()) return

    switch (this.type) {
      case 'kitten': this._triggerKitten(); break
      case 'persian': this._triggerPersian(); break
      case 'siamese': this._triggerSiamese(targetX, targetY); break
      case 'bengal': this._triggerBengal(); break
      case 'ragdoll': this._triggerRagdoll(targetX, targetY); break
      case 'chonk': this._triggerChonk(targetX, targetY); break
    }

    this._triggerCooldown = 15000
    this.scene.events.emit('catSelected', this)
  }

  _triggerKitten() {
    const kittens = this.scene.cats.filter(c => c.type === 'kitten' && c.level >= 5).slice(0, 10)
    kittens.forEach(k => {
      const originalFireRate = k.fireRate
      k.fireRate = 80
      this.scene.tweens.add({
        targets: k.body,
        alpha: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 7,
      })
      this.scene.time.delayedCall(3000, () => {
        k.fireRate = originalFireRate
      })
    })
    this._showTriggerText(this.x, this.y, '⚡ RAPID SWIPE!')
  }

  _triggerPersian() {
    const shield = this.scene.add.rectangle(
      this.scene.waypoints[Math.floor(this.scene.waypoints.length / 2)].x,
      this.scene.waypoints[Math.floor(this.scene.waypoints.length / 2)].y,
      20, 80, 0xce93d8, 0.7
    ).setDepth(5)

    this.scene.time.addEvent({
      delay: 300,
      repeat: 16,
      callback: () => {
        for (const vacuum of this.scene.vacuums) {
          if (!vacuum.alive) continue
          if (vacuum.distanceTo(shield.x, shield.y) <= 60) {
            vacuum.takeDamage(this.damage * 2)
          }
        }
      }
    })

    this.scene.time.delayedCall(5000, () => shield.destroy())
    this._showTriggerText(this.x, this.y, '🛡️ SHIELD WALL!')
  }

  _triggerSiamese(tx, ty) {
    if (tx === null) return
    const ball = this.scene.add.circle(tx, ty, 12, 0xdce8f0, 0.9).setDepth(5)
    const startWp = this.scene.waypoints[0]

    this.scene.tweens.add({
      targets: ball,
      x: startWp.x,
      y: startWp.y,
      duration: 3000,
      ease: 'Linear',
      onUpdate: () => {
        for (const vacuum of this.scene.vacuums) {
          if (!vacuum.alive) continue
          if (vacuum.distanceTo(ball.x, ball.y) <= 30) {
            vacuum.container.x = ball.x
            vacuum.container.y = ball.y
            vacuum.takeDamage(5)
          }
        }
      },
      onComplete: () => ball.destroy(),
    })
    this._showTriggerText(this.x, this.y, '🎱 STICKY HAIRBALL!')
  }

  _triggerBengal() {
    const originalFireRate = this.fireRate
    const originalDamage = this.damage
    this.fireRate = Math.round(this.fireRate * 0.25)
    this.damage = Math.round(this.damage * 2)

    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 75,
    })

    this.scene.time.delayedCall(15000, () => {
      this.fireRate = originalFireRate
      this.damage = originalDamage
    })
    this._showTriggerText(this.x, this.y, '🔥 SPEED FRENZY!')
  }

  _triggerRagdoll(tx, ty) {
    if (tx === null) return
    const arc = this.scene.add.circle(this.x, this.y, this.radius * 1.5, this.color, 0.9)
    const midX = (this.x + tx) / 2
    const midY = Math.min(this.y, ty) - 150

    this.scene.tweens.add({
      targets: arc,
      x: midX,
      y: midY,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: arc,
          x: tx,
          y: ty,
          duration: 250,
          ease: 'Quad.easeIn',
          onComplete: () => {
            for (const vacuum of this.scene.vacuums) {
              if (!vacuum.alive) continue
              if (vacuum.distanceTo(tx, ty) <= 120) {
                vacuum.takeDamage(this.damage * 3)
              }
            }
            this.scene.tweens.add({
              targets: arc,
              x: this.x,
              y: this.y,
              duration: 300,
              onComplete: () => arc.destroy(),
            })
          }
        })
      }
    })
    this._showTriggerText(this.x, this.y, '🌙 MEGA ARC!')
  }

  _triggerChonk(tx, ty) {
    if (tx === null) return
    const shadow = this.scene.add.ellipse(tx, ty, 60, 30, 0x000000, 0.4).setDepth(4)
    const bomb = this.scene.add.text(tx, ty - 300, '🐾', {
      fontSize: '48px'
    }).setOrigin(0.5).setDepth(6)

    this.scene.tweens.add({
      targets: bomb,
      y: ty,
      duration: 600,
      ease: 'Quad.easeIn',
      onComplete: () => {
        bomb.destroy()
        shadow.destroy()
        this.scene.cameras.main.shake(400, 0.015)

        const blast = this.scene.add.circle(tx, ty, 100, this.color, 0.4).setDepth(5)
        this.scene.tweens.add({
          targets: blast,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 500,
          onComplete: () => blast.destroy(),
        })

        for (const vacuum of this.scene.vacuums) {
          if (!vacuum.alive) continue
          if (vacuum.distanceTo(tx, ty) <= 100) {
            vacuum.takeDamage(this.damage * 4)
            vacuum.applySlow(0.1, 3000)
          }
        }
      }
    })
    this._showTriggerText(this.x, this.y, '💥 BOMB DROP!')
  }

  _showTriggerText(x, y, msg) {
    const txt = this.scene.add.text(x, y - 40, msg, {
      fontSize: '16px',
      fontFamily: 'Fredoka One',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20)

    this.scene.tweens.add({
      targets: txt,
      y: y - 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => txt.destroy(),
    })
  }

  setSelected(selected) {
    this.selected = selected
    this.rangeCircle.setVisible(selected)

    if (this.body.setStrokeStyle) {
      this.body.setStrokeStyle(2, selected ? 0x00ff88 : 0xffffff, selected ? 1 : 0.4)
    } else {
      if (selected) {
        this.body.setTint(0x00ff88)
      } else {
        this.body.clearTint()
      }
    }
  }

  destroy() {
    this.alive = false
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