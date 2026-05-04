import * as Phaser from 'phaser'
import { VACUUMS, SETTINGS } from '../config/GameConfig.js'

const VACUUM_SPRITES = {
  zoomba: 'vacuum_zoomba',
}

export default class Vacuum {
  constructor(scene, type, waypoints) {
    this.scene = scene
    this.waypoints = waypoints
    this.waypointIndex = 1
    this.alive = true
    this.reachedEnd = false
    this.type = type
    this.slowMultiplier = 1.0

    const config = VACUUMS[type]
    this.name = config.name
    this.emoji = config.emoji
    this.hp = config.hp
    this.maxHp = config.hp
    this.speed = config.speed
    this.dirtDamage = config.dirtDamage
    this.scrapDrop = config.scrapDrop
    this.color = config.color
    this.radius = config.radius
    this.immune = config.immune || []
    this.spawnsOnDeath = config.spawnsOnDeath || 0

    this.spriteKey = VACUUM_SPRITES[type] || null

    const start = waypoints[0]
    this.container = scene.add.container(start.x, start.y)

    if (this.spriteKey && scene.textures.exists(this.spriteKey)) {
      this.body = scene.add.image(0, 0, this.spriteKey)
      this.body.setDisplaySize(this.radius * 2, this.radius * 2)
    } else {
      this.body = scene.add.circle(0, 0, this.radius, this.color)
      this.label = scene.add.text(0, 0, this.emoji, {
        fontSize: `${this.radius}px`
      }).setOrigin(0.5)
    }

    this.hpBarBg = scene.add.rectangle(0, -this.radius - 8, 40, 5, 0x333333)
    this.hpBar = scene.add.rectangle(-20, -this.radius - 8, 40, 5, 0x4caf50).setOrigin(0, 0.5)

    const containerItems = [this.body]
    if (this.label) containerItems.push(this.label)
    containerItems.push(this.hpBarBg, this.hpBar)
    this.container.add(containerItems)

    scene.vacuums.push(this)
  }

  update(delta) {
    if (!this.alive || this.reachedEnd) return

    const scaledDelta = delta * SETTINGS.gameSpeed

    const target = this.waypoints[this.waypointIndex]
    if (!target) {
      this._reachEnd()
      return
    }

    const dx = target.x - this.container.x
    const dy = target.y - this.container.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const effectiveSpeed = this.speed * this.slowMultiplier
    const step = (effectiveSpeed * scaledDelta) / 1000

    if (dist <= step) {
      this.container.x = target.x
      this.container.y = target.y
      this.waypointIndex++
      if (this.waypointIndex >= this.waypoints.length) {
        this._reachEnd()
      }
    } else {
      this.container.x += (dx / dist) * step
      this.container.y += (dy / dist) * step
    }

    const ratio = this.hp / this.maxHp
    this.hpBar.width = 40 * ratio
    this.hpBar.setFillStyle(
      ratio > 0.5 ? 0x4caf50 :
      ratio > 0.25 ? 0xff9800 : 0xf44336
    )

    if (this.spriteKey) {
      const angle = Math.atan2(dy, dx)
      this.body.setRotation(angle)
    }
  }

  takeDamage(amount, attackType = null) {
    if (!this.alive) return

    if (attackType && this.immune.includes(attackType)) {
      this.scene.tweens.add({
        targets: this.body,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
      })
      return
    }

    this.hp -= amount

    const dmgTxt = this.scene.add.text(
      this.container.x + Phaser.Math.Between(-10, 10),
      this.container.y - this.radius,
      `-${amount}`,
      {
        fontSize: '12px',
        fontFamily: 'Fredoka One',
        color: '#ff5252',
        stroke: '#000000',
        strokeThickness: 2,
      }
    ).setDepth(20).setOrigin(0.5)

    this.scene.tweens.add({
      targets: dmgTxt,
      y: dmgTxt.y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => dmgTxt.destroy(),
    })

    this.scene.tweens.add({
      targets: this.body,
      alpha: 0.4,
      duration: 60,
      yoyo: true,
    })

    if (this.hp <= 0) this._die()
  }

  applySlow(multiplier, duration) {
    this.slowMultiplier = Math.min(this.slowMultiplier, multiplier)
    this.scene.time.delayedCall(duration, () => {
      this.slowMultiplier = 1.0
      if (!this.spriteKey) {
        this.body.setFillStyle(this.color)
      }
    })
  }

  _reachEnd() {
    this.reachedEnd = true
    this.alive = false
    this.scene.events.emit('vacuumReachedEnd', this.dirtDamage)
    this._destroy()
  }

  _die() {
    this.alive = false

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const particle = this.scene.add.circle(
        this.container.x,
        this.container.y,
        4, this.color, 1
      ).setDepth(15)

      this.scene.tweens.add({
        targets: particle,
        x: this.container.x + Math.cos(angle) * 40,
        y: this.container.y + Math.sin(angle) * 40,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      })
    }

    if (this.spawnsOnDeath > 0) {
      for (let i = 0; i < this.spawnsOnDeath; i++) {
        this.scene.time.delayedCall(i * 200, () => {
          const mini = new Vacuum(this.scene, 'zoomba', this.waypoints)
          mini.waypointIndex = this.waypointIndex
          mini.container.x = this.container.x
          mini.container.y = this.container.y
          mini.container.setScale(0.6)
          mini.scrapDrop = 5
        })
      }
    }

    this.scene.events.emit('vacuumKilled', this.scrapDrop, {
      x: this.container.x,
      y: this.container.y,
    })

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => this._destroy(),
    })
  }

  _destroy() {
    const idx = this.scene.vacuums.indexOf(this)
    if (idx !== -1) this.scene.vacuums.splice(idx, 1)
    this.container.destroy()
  }

  distanceTo(x, y) {
    const dx = this.container.x - x
    const dy = this.container.y - y
    return Math.sqrt(dx * dx + dy * dy)
  }

  get progress() {
    return this.waypointIndex / this.waypoints.length
  }
}