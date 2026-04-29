import * as Phaser from 'phaser'
import PathRenderer from '../entities/PathRenderer.js'
import Vacuum from '../entities/Vacuum.js'
import Cat from '../entities/Cat.js'
import { TEST_PATH_WAYPOINTS } from '../config/GameConfig.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.vacuums = []
    this.cats = []
    this.waypoints = TEST_PATH_WAYPOINTS

    this._pathRenderer = new PathRenderer(this, this.waypoints)

    // Place a test Kitten
    new Cat(this, 'kitten', 250, 300)

    // Spawn a Zoomba every 3 seconds
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => new Vacuum(this, 'zoomba', this.waypoints)
    })
  }

  update(time, delta) {
    for (let i = this.vacuums.length - 1; i >= 0; i--) {
      this.vacuums[i].update(delta)
    }

    for (const cat of this.cats) {
      cat.update(delta)
    }
  }
}