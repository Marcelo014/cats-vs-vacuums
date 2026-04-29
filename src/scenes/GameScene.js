import * as Phaser from 'phaser'
import PathRenderer from '../entities/PathRenderer.js'
import Vacuum from '../entities/Vacuum.js'
import Cat from '../entities/Cat.js'
import HUD from '../ui/HUD.js'
import WaveManager from '../entities/WaveManager.js'
import { TEST_PATH_WAYPOINTS, ECONOMY, DIRT, GAME, CATS, SETTINGS } from '../config/GameConfig.js'

const TARGETED_TRIGGERS = ['siamese', 'ragdoll', 'chonk']

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
    this._gameOver = false
    this._awaitingTriggerTarget = false
    this._triggerCat = null
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
      if (this.dirt <= 0) this._triggerLose()
    })

    this.events.on('startNextWave', () => {
      this._waveManager.startNextWave()
    })

    this.events.on('allWavesComplete', () => {
      this._triggerWin()
    })

    this.events.on('catClicked', (cat) => {
      if (this._awaitingTriggerTarget) {
        this.events.emit('triggerTargetCancelled')
        this._awaitingTriggerTarget = false
        this._triggerCat = null
        return
      }
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

    this.events.on('triggerSelectedCat', () => {
      this._handleTrigger()
    })

    this.events.on('waveComplete', () => {
      if (SETTINGS.autoPlay) {
        this.time.delayedCall(1000, () => {
          this._waveManager.startNextWave()
        })
      }
    })

    this.input.on('pointerdown', (pointer) => {
      const x = pointer.x
      const y = pointer.y

      // Handle trigger target click
      if (this._awaitingTriggerTarget) {
        this._triggerCat.activateTrigger(x, y)
        this._awaitingTriggerTarget = false
        this._triggerCat = null
        this.events.emit('triggerTargetCancelled')
        return
      }

      const cost = CATS[this._placingCatType].cost
      const newRadius = CATS[this._placingCatType].radius

      if (pointer.y > GAME.height - 70) return
      if (pointer.y < 10) return
      if (this._pathRenderer.isOnPath(x, y)) return
      if (this.scraps < cost) return

      for (const cat of this.cats) {
        const dist = Math.hypot(cat.x - x, cat.y - y)
        if (dist < cat.placementRadius + newRadius) return
      }

      this._deselectCat()
      this.scraps -= cost
      this.events.emit('scrapsChanged', this.scraps)
      new Cat(this, this._placingCatType, x, y)
    })
  }

  _handleTrigger() {
    const cat = this._selectedCat
    if (!cat || !cat.canTrigger()) return

    if (TARGETED_TRIGGERS.includes(cat.type)) {
      // Need a map click — enter targeting mode
      this._awaitingTriggerTarget = true
      this._triggerCat = cat
      this.events.emit('awaitingTriggerTarget', cat)
    } else {
      // No target needed — fire immediately
      cat.activateTrigger()
    }
  }

  _triggerWin() {
    if (this._gameOver) return
    this._gameOver = true
    this.time.delayedCall(1000, () => {
      this.scene.start('ResultScene', { result: 'win', scraps: this.scraps })
    })
  }

  _triggerLose() {
    if (this._gameOver) return
    this._gameOver = true
    this.cameras.main.shake(500, 0.02)
    this.time.delayedCall(2000, () => {
      this.scene.start('ResultScene', { result: 'lose', scraps: this.scraps })
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
    const cat = this._selectedCat
    if (!cat) return
    const cost = cat.upgradeCost
    if (!cost) return
    if (this.scraps < cost) return
    this.scraps -= cost
    this.events.emit('scrapsChanged', this.scraps)
    cat.upgrade()
    this.events.emit('catSelected', cat)
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
    if (this._gameOver) return

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