import { CATS } from '../config/GameConfig.js'

export default class Cat {
  constructor(scene, type, x, y) {
    this.scene = scene
    this.type = type
    this.x = x
    this.y = y
    this.alive = true
    this._attackCooldown = 0
    this._target = null
    this.placementRadius = 30

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

    this.container.add([this.rangeCircle, this.body, this.label])

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

  update(delta) {
    if (!this.alive) return

    if (this._attackCooldown > 0) {
      this._attackCooldown -= delta
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
    const idx = this.scene.cats.indexOf(this)
    if (idx !== -1) this.scene.cats.splice(idx, 1)
    this.container.destroy()
  }
}