import { VACUUMS } from '../config/GameConfig.js'

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

    const start = waypoints[0]

    this.container = scene.add.container(start.x, start.y)

    this.body = scene.add.circle(0, 0, this.radius, this.color)

    this.hpBarBg = scene.add.rectangle(0, -this.radius - 8, 40, 5, 0x333333)
    this.hpBar = scene.add.rectangle(-20, -this.radius - 8, 40, 5, 0x4caf50).setOrigin(0, 0.5)

    this.label = scene.add.text(0, 0, this.emoji, {
      fontSize: `${this.radius}px`
    }).setOrigin(0.5)

    this.container.add([this.body, this.hpBarBg, this.hpBar, this.label])

    scene.vacuums.push(this)
  }

  update(delta) {
    if (!this.alive || this.reachedEnd) return

    const target = this.waypoints[this.waypointIndex]
    if (!target) {
      this._reachEnd()
      return
    }

    const dx = target.x - this.container.x
    const dy = target.y - this.container.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const effectiveSpeed = this.speed * this.slowMultiplier
    const step = (effectiveSpeed * delta) / 1000

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

    // Update hp bar
    const ratio = this.hp / this.maxHp
    this.hpBar.width = 40 * ratio
    this.hpBar.setFillStyle(
      ratio > 0.5 ? 0x4caf50 :
      ratio > 0.25 ? 0xff9800 : 0xf44336
    )
  }

  takeDamage(amount, attackType = null) {
    if (!this.alive) return

    // Immunity check
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

    // Gulper spawns mini zoombas on death
    if (this.spawnsOnDeath > 0) {
      for (let i = 0; i < this.spawnsOnDeath; i++) {
        this.scene.time.delayedCall(i * 200, () => {
          const mini = new Vacuum(this.scene, 'zoomba', this.waypoints)
          // Snap mini to gulper's current position on the path
          mini.waypointIndex = this.waypointIndex
          mini.container.x = this.container.x
          mini.container.y = this.container.y
          // Scale them down so they look like minis
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