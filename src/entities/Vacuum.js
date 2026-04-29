export default class Vacuum {
  constructor(scene, type, waypoints) {
    this.scene = scene
    this.waypoints = waypoints
    this.waypointIndex = 1
    this.alive = true
    this.reachedEnd = false

    // Stats
    this.hp = 80
    this.maxHp = 80
    this.speed = 80

    // Position starts at first waypoint
    const start = waypoints[0]

    // Graphics
    this.container = scene.add.container(start.x, start.y)

    this.body = scene.add.circle(0, 0, 16, 0xbdbdbd)

    this.hpBarBg = scene.add.rectangle(0, -26, 40, 5, 0x333333)
    this.hpBar = scene.add.rectangle(-20, -26, 40, 5, 0x4caf50).setOrigin(0, 0.5)

    this.label = scene.add.text(0, 0, '🤖', { fontSize: '16px' }).setOrigin(0.5)

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
    const step = (this.speed * delta) / 1000

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
  }

  takeDamage(amount) {
    if (!this.alive) return
    this.hp -= amount
    if (this.hp <= 0) this._die()
  }

  _reachEnd() {
    this.reachedEnd = true
    this.alive = false
    this.scene.events.emit('vacuumReachedEnd', 10)
    this._destroy()
  }

  _die() {
    this.alive = false
    this.scene.events.emit('vacuumKilled', 10, { x: this.container.x, y: this.container.y })
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