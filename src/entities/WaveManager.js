export default class WaveManager {
  constructor(scene, waypoints) {
    this.scene = scene
    this.waypoints = waypoints
    this.currentWave = 0
    this.active = false
    this.betweenWaves = true
    this._pendingSpawns = 0

    // Wave definitions — each wave is an array of groups
    // each group has a vacuum type, count, and ms between spawns
    this.waves = [
      [{ type: 'zoomba', count: 5,  interval: 1200 }],
      [{ type: 'zoomba', count: 8,  interval: 1000 }],
      [{ type: 'zoomba', count: 6,  interval: 900  }, { type: 'zoomba', count: 3, interval: 1500 }],
      [{ type: 'zoomba', count: 10, interval: 800  }],
      [{ type: 'zoomba', count: 12, interval: 700  }],
    ]

    this.totalWaves = this.waves.length
  }

  startNextWave() {
    if (this.active) return
    if (this.currentWave >= this.totalWaves) {
      this.scene.events.emit('allWavesComplete')
      return
    }

    this.active = true
    this.betweenWaves = false
    this._pendingSpawns = 0

    const waveDef = this.waves[this.currentWave]
    this.currentWave++

    this.scene.events.emit('waveStarted', this.currentWave, this.totalWaves)

    // Count total vacuums
    for (const group of waveDef) {
      this._pendingSpawns += group.count
    }

    // Spawn each group with staggered delays
    let globalDelay = 0
    for (const group of waveDef) {
      for (let i = 0; i < group.count; i++) {
        this.scene.time.delayedCall(
          globalDelay + i * group.interval,
          () => {
            this._spawnVacuum(group.type)
            this._pendingSpawns--
          }
        )
      }
      globalDelay += group.count * group.interval + 500
    }
  }

  update() {
    if (this.active && this.scene.vacuums.length === 0 && this._pendingSpawns === 0) {
      this._waveComplete()
    }
  }

  _spawnVacuum(type) {
    const Vacuum = this.scene._VacuumClass
    new Vacuum(this.scene, type, this.waypoints)
  }

  _waveComplete() {
    if (!this.active) return
    this.active = false
    this.betweenWaves = true

    if (this.currentWave >= this.totalWaves) {
      this.scene.events.emit('allWavesComplete')
    } else {
      this.scene.events.emit('waveComplete', this.currentWave, this.totalWaves)
    }
  }
}