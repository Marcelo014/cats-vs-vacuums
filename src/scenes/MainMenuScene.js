import * as Phaser from 'phaser'
import { GAME } from '../config/GameConfig.js'
import { roundRect } from '../ui/roundRect.js'

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' })
  }

  create() {
    const W = GAME.width
    const H = GAME.height
    const SCALE = H / 720

    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a16)

    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W)
      const y = Phaser.Math.Between(0, H)
      const r = Phaser.Math.FloatBetween(0.5, 2)
      this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.1, 0.4))
    }

    const catWatcher = this.add.text(W - Math.round(120 * SCALE), H - Math.round(140 * SCALE), '😾', {
      fontSize: `${Math.round(64 * SCALE)}px`,
    }).setOrigin(0.5)

    const zoombaR = Math.round(20 * SCALE)
    const zoomba = this.add.circle(-30, H - Math.round(90 * SCALE), zoombaR, 0xbdbdbd)
    const zoombaLabel = this.add.text(-30, H - Math.round(90 * SCALE), '🤖', {
      fontSize: `${Math.round(24 * SCALE)}px`,
    }).setOrigin(0.5)

    this.tweens.add({
      targets: [zoomba, zoombaLabel],
      x: W + 60,
      duration: 8000,
      repeat: -1,
      delay: 1000,
      onRepeat: () => {
        zoomba.setX(-30)
        zoombaLabel.setX(-30)
      },
    })

    this.tweens.add({
      targets: catWatcher,
      x: W - Math.round(160 * SCALE),
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.add.text(W / 2, H * 0.222, 'CATS', {
      fontSize: `${Math.round(110 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#f9a825',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.375, 'VS', {
      fontSize: `${Math.round(48 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.486, 'VACUUMS', {
      fontSize: `${Math.round(110 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#90caf9',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.625, 'Defend the dirt. Protect the mess. Never surrender.', {
      fontSize: `${Math.round(18 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#78909c',
    }).setOrigin(0.5)

    this._makeButton(W / 2, H * 0.736, '▶  PLAY', '#a5d6a7', 0x1b5e20, SCALE, () => {
      this.scene.start('LevelSelectScene')
    })

    this._makeButton(W / 2, H * 0.819, '?  HOW TO PLAY', '#b0bec5', 0x1a237e, SCALE, () => {
      this._showHowToPlay(W, H, SCALE)
    })

    this.add.text(W - Math.round(12 * SCALE), H - Math.round(12 * SCALE), 'v0.1 — Week 1 Build', {
      fontSize: `${Math.round(10 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#37474f',
    }).setOrigin(1, 1)
  }

  _makeButton(x, y, label, textColor, bgColor, SCALE, onClick) {
    const bg = roundRect(this, x, y, Math.round(260 * SCALE), Math.round(44 * SCALE), 8, bgColor, true)

    const txt = this.add.text(x, y, label, {
      fontSize: `${Math.round(18 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: textColor,
    }).setOrigin(0.5)

    bg.on('pointerover', () => txt.setScale(1.05))
    bg.on('pointerout', () => txt.setScale(1))
    bg.on('pointerdown', onClick)
  }

  _showHowToPlay(W, H, SCALE) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8)
      .setInteractive()

    const panel = roundRect(this, W / 2, H / 2, Math.round(620 * SCALE), Math.round(420 * SCALE), 16, 0x0d0d1a)
      .setStrokeStyle(2, 0x37474f)

    this.add.text(W / 2, H / 2 - Math.round(180 * SCALE), 'HOW TO PLAY', {
      fontSize: `${Math.round(24 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#ffd54f',
    }).setOrigin(0.5)

    const lines = [
      '🐱  Click a cat in the bottom panel then click the map to place it.',
      '💰  Scraps are earned by destroying vacuums — spend them on cats & upgrades.',
      '🏠  Protect the DIRT METER. Vacuums reaching the end reduce it.',
      '⭐  Click a placed cat to select it, then upgrade it for scraps.',
      '▶   Press NEXT WAVE to start each wave.',
      '❌  You cannot place cats on the vacuum path.',
      '🏠  Adopt out a cat to remove it and recover 10% of its cost.',
      '⚡  Level 5 cats unlock a TRIGGERABLE special ability.',
      '',
      'Tip: Place Persians to slow vacuums, Bengals for long range damage.',
    ]

    this.add.text(W / 2 - Math.round(270 * SCALE), H / 2 - Math.round(130 * SCALE), lines.join('\n\n'), {
      fontSize: `${Math.round(13 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#b0bec5',
      lineSpacing: 2,
      wordWrap: { width: Math.round(540 * SCALE) },
    })

    const closeBtn = this.add.text(W / 2, H / 2 + Math.round(185 * SCALE), '[ CLOSE ]', {
      fontSize: `${Math.round(18 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#ef9a9a',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const cleanup = () => {
      overlay.destroy()
      panel.destroy()
      closeBtn.destroy()
    }

    closeBtn.on('pointerdown', cleanup)
    overlay.on('pointerdown', cleanup)
  }
}
