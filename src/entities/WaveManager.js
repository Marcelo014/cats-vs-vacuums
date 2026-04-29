export default class WaveManager {
  constructor(scene, waypoints) {
    this.scene = scene
    this.waypoints = waypoints
    this.currentWave = 0
    this.active = false
    this.betweenWaves = true
    this._pendingSpawns = 0

    this.waves = [
      // Wave 1 — Zoombas only, slow intro
      [{ type: 'zoomba', count: 5, interval: 1200 }],
      // Wave 2 — More Zoombas
      [{ type: 'zoomba', count: 8, interval: 1000 }],
      // Wave 3 — First Turbo Zoombas
      [{ type: 'zoomba', count: 6, interval: 900 }, { type: 'turbo_zoomba', count: 3, interval: 800 }],
      // Wave 4 — First Aquaclean
      [{ type: 'zoomba', count: 6, interval: 900 }, { type: 'aquaclean', count: 2, interval: 2000 }],
      // Wave 5 — Mixed
      [{ type: 'turbo_zoomba', count: 6, interval: 700 }, { type: 'aquaclean', count: 2, interval: 1800 }],
      // Wave 6 — First Gulper
      [{ type: 'zoomba', count: 8, interval: 800 }, { type: 'gulper', count: 1, interval: 3000 }],
      // Wave 7 — First Phantavac
      [{ type: 'turbo_zoomba', count: 6, interval: 700 }, { type: 'phantavac', count: 3, interval: 1500 }],
      // Wave 8 — Heavy mix
      [{ type: 'aquaclean', count: 3, interval: 1800 }, { type: 'gulper', count: 2, interval: 2500 }, { type: 'phantavac', count: 2, interval: 1500 }],
      // Wave 9 — Everything
      [{ type: 'turbo_zoomba', count: 8, interval: 600 }, { type: 'phantavac', count: 4, interval: 1200 }, { type: 'gulper', count: 2, interval: 2000 }],
      // Wave 10 — Megaclean boss wave
      [{ type: 'zoomba', count: 5, interval: 800 }, { type: 'megaclean', count: 1, interval: 0 }],
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

    for (const group of waveDef) {
      this._pendingSpawns += group.count
    }

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