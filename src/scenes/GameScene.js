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
    this._paused = false
    this._awaitingTriggerTarget = false
    this._triggerCat = null
    this._VacuumClass = Vacuum

    this._drawBackground()
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

    this.events.on('upgradeSelectedCat', () => this._upgradeSelectedCat())
    this.events.on('adoptOutSelectedCat', () => this._adoptOutSelectedCat())
    this.events.on('triggerSelectedCat', () => this._handleTrigger())

    this.events.on('pauseGameRequest', () => {
      if (!this._gameOver && !this._paused) this._pauseGame()
    })

    this.events.on('resumeGame', () => {
      if (this._paused) this._resumeGame()
    })

    this.events.on('waveComplete', () => {
      if (SETTINGS.autoPlay) {
        this.time.delayedCall(1000, () => this._waveManager.startNextWave())
      }
    })

    this.input.keyboard.on('keydown-ESC', () => {
      if (this._gameOver) return
      if (this._paused) {
        this._resumeGame()
      } else {
        this._pauseGame()
      }
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this._paused) return
      if (this._waveManager.betweenWaves) {
        this._waveManager.startNextWave()
      }
    })

    this.input.on('pointerdown', (pointer) => {
      if (this._paused) return

      const x = pointer.x
      const y = pointer.y

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

_drawBackground() {
  const W = GAME.width
  const H = GAME.height

  // Room floor
  this.add.rectangle(W / 2, H / 2, W, H, 0x1A2535).setDepth(-3)

  // Subtle floor pattern — horizontal wood planks
  const g = this.add.graphics()
  g.setDepth(-2)

  for (let y = 60; y < H - 80; y += 32) {
    g.lineStyle(1, 0x243344, 0.6)
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(W, y)
    g.strokePath()
  }

  // Vertical plank breaks every ~120px with slight offset
  for (let x = 0; x < W; x += 120) {
    const offset = Phaser.Math.Between(-8, 8)
    g.lineStyle(1, 0x1E2D3F, 0.4)
    g.beginPath()
    g.moveTo(x, 60 + offset)
    g.lineTo(x, H - 80 + offset)
    g.strokePath()
  }

  // Subtle vignette — darker edges
  const vignette = this.add.graphics().setDepth(-1)
  vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.4, 0.4, 0, 0)
  vignette.fillRect(0, 60, W, 100)
  vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.4, 0.4)
  vignette.fillRect(0, H - 180, W, 100)

  // Decorative elements — cozy living room feel
  // Baseboard along the bottom of the play area
  this.add.rectangle(W / 2, H - 82, W, 6, 0x2D4A6B).setDepth(-1)

  // Baseboard along the top of the play area
  this.add.rectangle(W / 2, 62, W, 4, 0x2D4A6B).setDepth(-1)
}

  _pauseGame() {
    this._paused = true
    this._hud.showPauseMenu()
  }

  _resumeGame() {
    this._paused = false
    this._hud.hidePauseMenu()
  }

  _handleTrigger() {
    const cat = this._selectedCat
    if (!cat || !cat.canTrigger()) return

    if (TARGETED_TRIGGERS.includes(cat.type)) {
      this._awaitingTriggerTarget = true
      this._triggerCat = cat
      this.events.emit('awaitingTriggerTarget', cat)
    } else {
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
    if (this._gameOver || this._paused) return

    for (let i = this.vacuums.length - 1; i >= 0; i--) {
      this.vacuums[i].update(delta)
    }

    for (const cat of this.cats) {
      cat.update(delta)
    }

    this._waveManager.update()
  }

  _spawnScrapText(x, y, amount) {
    const label = this._hud.getScrapQuip(amount)
    const txt = this.add.text(x, y - 20, label, {
      fontSize: '13px',
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