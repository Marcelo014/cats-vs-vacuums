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

this.events.on('pauseGameRequest', () => {
  if (!this._gameOver && !this._paused) this._pauseGame()
})

    this.events.on('waveComplete', () => {
      if (SETTINGS.autoPlay) {
        this.time.delayedCall(1000, () => {
          this._waveManager.startNextWave()
        })
      }
    })

    // ESC to pause
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._gameOver) return
      if (this._paused) {
        this._resumeGame()
      } else {
        this._pauseGame()
      }
    })

    // SPACE to start next wave
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

  // -----------------------------------------------------------
  // Pause system
  // -----------------------------------------------------------

  _pauseGame() {
    this._paused = true

    // Dim overlay
    this._pauseOverlay = this.add.rectangle(
      GAME.width / 2, GAME.height / 2,
      GAME.width, GAME.height,
      0x000000, 0.7
    ).setScrollFactor(0).setDepth(40)

    // Panel
    this._pausePanel = this.add.rectangle(
      GAME.width / 2, GAME.height / 2,
      360, 380, 0x0d0d1a
    ).setScrollFactor(0).setDepth(41).setStrokeStyle(2, 0x37474f)

    // Title
    this._pauseTitle = this.add.text(GAME.width / 2, GAME.height / 2 - 150, '⏸  PAUSED', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffd54f',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5)

    const items = [this._pauseOverlay, this._pausePanel, this._pauseTitle]

    // Resume
    items.push(...this._makePauseButton(
      GAME.width / 2, GAME.height / 2 - 80,
      '▶  RESUME', '#a5d6a7', 0x1b5e20,
      () => this._resumeGame()
    ))

    // Restart
    items.push(...this._makePauseButton(
      GAME.width / 2, GAME.height / 2 - 20,
      '↺  RESTART', '#90caf9', 0x1a237e,
      () => {
        this._clearPauseMenu()
        this.scene.restart()
      }
    ))

    // Sound toggle
    const soundLabel = () => `🔊 SFX: ${SETTINGS.sfxOn ? 'ON' : 'OFF'}`
    const soundBtn = this._makePauseButton(
      GAME.width / 2, GAME.height / 2 + 40,
      soundLabel(), '#b0bec5', 0x263238,
      () => {
        SETTINGS.sfxOn = !SETTINGS.sfxOn
        soundTxt.setText(soundLabel())
      }
    )
    const soundTxt = soundBtn[1]
    items.push(...soundBtn)

    // Music toggle
    const musicLabel = () => `🎵 Music: ${SETTINGS.musicOn ? 'ON' : 'OFF'}`
    const musicBtn = this._makePauseButton(
      GAME.width / 2, GAME.height / 2 + 100,
      musicLabel(), '#b0bec5', 0x263238,
      () => {
        SETTINGS.musicOn = !SETTINGS.musicOn
        musicTxt.setText(musicLabel())
      }
    )
    const musicTxt = musicBtn[1]
    items.push(...musicBtn)

    // Main menu
    items.push(...this._makePauseButton(
      GAME.width / 2, GAME.height / 2 + 160,
      '⬅  MAIN MENU', '#ef9a9a', 0x4e342e,
      () => this._confirmQuit()
    ))

    this._pauseItems = items
  }

  _resumeGame() {
    this._paused = false
    this._clearPauseMenu()
  }

  _clearPauseMenu() {
    if (this._pauseItems) {
      this._pauseItems.forEach(i => i.destroy())
      this._pauseItems = null
    }
  }

  _makePauseButton(x, y, label, textColor, bgColor, onClick) {
    const bg = this.add.rectangle(x, y, 280, 44, bgColor)
      .setScrollFactor(0).setDepth(42).setInteractive({ useHandCursor: true })

    const txt = this.add.text(x, y, label, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: textColor,
    }).setScrollFactor(0).setDepth(43).setOrigin(0.5)

    bg.on('pointerover', () => txt.setScale(1.05))
    bg.on('pointerout', () => txt.setScale(1))
    bg.on('pointerdown', onClick)

    return [bg, txt]
  }

  _confirmQuit() {
    // Clear pause menu first
    this._clearPauseMenu()

    const W = GAME.width
    const H = GAME.height

    const items = []

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(50)
    items.push(overlay)

    const panel = this.add.rectangle(W / 2, H / 2, 360, 220, 0x0d0d1a)
      .setScrollFactor(0).setDepth(51).setStrokeStyle(2, 0x4e342e)
    items.push(panel)

    items.push(this.add.text(W / 2, H / 2 - 70, '⚠️  QUIT GAME?', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5))

    items.push(this.add.text(W / 2, H / 2 - 20, 'Your progress will be lost.', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#546e7a',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5))

    const cleanup = () => items.forEach(i => i.destroy())

    // Confirm
    const yesBg = this.add.rectangle(W / 2 - 80, H / 2 + 50, 130, 40, 0x4e342e)
      .setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true })
    const yesTxt = this.add.text(W / 2 - 80, H / 2 + 50, 'YES, QUIT', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setScrollFactor(0).setDepth(53).setOrigin(0.5)
    items.push(yesBg, yesTxt)

    yesBg.on('pointerdown', () => {
      cleanup()
      this.scene.start('MainMenuScene')
    })

    // Cancel
    const noBg = this.add.rectangle(W / 2 + 80, H / 2 + 50, 130, 40, 0x1b5e20)
      .setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true })
    const noTxt = this.add.text(W / 2 + 80, H / 2 + 50, 'KEEP PLAYING', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#a5d6a7',
    }).setScrollFactor(0).setDepth(53).setOrigin(0.5)
    items.push(noBg, noTxt)

    noBg.on('pointerdown', () => {
      cleanup()
      this._pauseGame()
    })
  }

  // -----------------------------------------------------------
  // Rest of GameScene unchanged
  // -----------------------------------------------------------

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