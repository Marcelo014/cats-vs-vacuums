import * as Phaser from 'phaser'
import PathRenderer from '../entities/PathRenderer.js'
import Vacuum from '../entities/Vacuum.js'
import Cat from '../entities/Cat.js'
import HUD from '../ui/HUD.js'
import WaveManager from '../entities/WaveManager.js'
import { TEST_PATH_WAYPOINTS, ECONOMY, DIRT, GAME, CATS } from '../config/GameConfig.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.vacuums = []
    this.cats = []
    this.waypoints = TEST_PATH_WAYPOINTS
    this.scraps = ECONOMY.startingScraps
    this.dirt = DIRT.maxDirt
    this._selectedCat = null
    this._placingCatType = 'kitten'
    this._VacuumClass = Vacuum

    this._pathRenderer = new PathRenderer(this, this.waypoints)
    this._hud = new HUD(this, this.scraps)
    this._waveManager = new WaveManager(this, this.waypoints)

    this.events.on('vacuumKilled', (scrapsEarned, pos) => {
      this.scraps += scrapsEarned
      this._spawnScrapText(pos.x, pos.y, scrapsEarned)
      this.events.emit('scrapsChanged', this.scraps)
    })

    this.events.on('vacuumReachedEnd', (dirtLost) => {
      this.dirt = Math.max(0, this.dirt - dirtLost)
      this.events.emit('dirtChanged', this.dirt)
      this.cameras.main.shake(200, 0.008)
    })

    this.events.on('startNextWave', () => {
      this._waveManager.startNextWave()
    })

    this.events.on('allWavesComplete', () => {
      this.add.text(GAME.width / 2, GAME.height / 2, '🎉 You Win!', {
        fontSize: '64px',
        fontFamily: 'monospace',
        color: '#a5d6a7',
      }).setOrigin(0.5).setDepth(20)
    })

    this.events.on('catClicked', (cat) => {
      this._selectCat(cat)
    })

    this.events.on('catTypeSelected', (type) => {
      this._placingCatType = type
      this._deselectCat()
    })

    this.events.on('upgradeSelectedCat', () => {
      this._upgradeSelectedCat()
    })

    this.events.on('adoptOutSelectedCat', () => {
      this._adoptOutSelectedCat()
    })

    this.input.on('pointerdown', (pointer) => {
      const x = pointer.x
      const y = pointer.y
      const cost = CATS[this._placingCatType].cost

      if (pointer.y > GAME.height - 70) return
      if (pointer.y < 10) return
      if (this._pathRenderer.isOnPath(x, y)) return
      if (this.scraps < cost) return

      for (const cat of this.cats) {
        const dist = Math.hypot(cat.x - x, cat.y - y)
        if (dist < cat.placementRadius + 30) return
      }

      this._deselectCat()
      this.scraps -= cost
      this.events.emit('scrapsChanged', this.scraps)
      new Cat(this, this._placingCatType, x, y)
    })
  }

  _selectCat(cat) {
    this._deselectCat()
    this._selectedCat = cat
    cat.setSelected(true)
    this.events.emit('catSelected', cat)
  }

  _deselectCat() {
    if (this._selectedCat) {
      this._selectedCat.setSelected(false)
      this._selectedCat = null
      this.events.emit('catDeselected')
    }
  }

  _upgradeSelectedCat() {
    if (!this._selectedCat) return
    const upgradeCost = 75
    if (this.scraps < upgradeCost) return
    this.scraps -= upgradeCost
    this.events.emit('scrapsChanged', this.scraps)
    console.log('upgraded cat')
  }

  _adoptOutSelectedCat() {
    if (!this._selectedCat) return
    const refund = Math.floor(this._selectedCat.cost * 0.1)
    this.scraps += refund
    this.events.emit('scrapsChanged', this.scraps)
    this._spawnScrapText(this._selectedCat.x, this._selectedCat.y, refund)
    this._selectedCat.destroy()
    this._selectedCat = null
    this.events.emit('catDeselected')
  }

  update(time, delta) {
    for (let i = this.vacuums.length - 1; i >= 0; i--) {
      this.vacuums[i].update(delta)
    }

    for (const cat of this.cats) {
      cat.update(delta)
    }

    this._waveManager.update()
  }

  _spawnScrapText(x, y, amount) {
    const txt = this.add.text(x, y - 20, `+${amount}💰`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15)

    this.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => txt.destroy(),
    })
  }
}