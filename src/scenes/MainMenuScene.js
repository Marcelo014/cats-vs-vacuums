import * as Phaser from 'phaser'
import { GAME } from '../config/GameConfig.js'

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' })
  }

  create() {
    const W = GAME.width
    const H = GAME.height

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a16)

    // Star field
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W)
      const y = Phaser.Math.Between(0, H)
      const r = Phaser.Math.FloatBetween(0.5, 2)
      this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.1, 0.4))
    }

    // Cat watching from the right
    const catWatcher = this.add.text(W - 120, H - 140, '😾', {
      fontSize: '64px',
    }).setOrigin(0.5)

    // Zoomba slowly crossing the screen
    const zoomba = this.add.circle(-30, H - 90, 20, 0xbdbdbd)
    const zoombaLabel = this.add.text(-30, H - 90, '🤖', {
      fontSize: '24px',
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

    // Cat head tracks the zoomba
    this.tweens.add({
      targets: catWatcher,
      x: W - 160,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Title
    this.add.text(W / 2, 160, 'CATS', {
      fontSize: '110px',
      fontFamily: 'monospace',
      color: '#f9a825',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(W / 2, 270, 'VS', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(W / 2, 350, 'VACUUMS', {
      fontSize: '110px',
      fontFamily: 'monospace',
      color: '#90caf9',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(W / 2, 450, 'Defend the dirt. Protect the mess. Never surrender.', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#78909c',
    }).setOrigin(0.5)

    // Play button
    this._makeButton(W / 2, 530, '▶  PLAY', '#a5d6a7', 0x1b5e20, () => {
      this.scene.start('GameScene')
    })

    // How to play button
    this._makeButton(W / 2, 590, '?  HOW TO PLAY', '#b0bec5', 0x1a237e, () => {
      this._showHowToPlay()
    })

    // Version tag
    this.add.text(W - 12, H - 12, 'v0.1 — Week 1 Build', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#37474f',
    }).setOrigin(1, 1)
  }

  _makeButton(x, y, label, textColor, bgColor, onClick) {
    const bg = this.add.rectangle(x, y, 260, 44, bgColor)
      .setInteractive({ useHandCursor: true })

    const txt = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: textColor,
    }).setOrigin(0.5)

    bg.on('pointerover', () => txt.setScale(1.05))
    bg.on('pointerout', () => txt.setScale(1))
    bg.on('pointerdown', onClick)
  }

  _showHowToPlay() {
    const W = GAME.width
    const H = GAME.height

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8)
      .setInteractive()

    const panel = this.add.rectangle(W / 2, H / 2, 620, 420, 0x0d0d1a)
      .setStrokeStyle(2, 0x37474f)

    this.add.text(W / 2, H / 2 - 180, 'HOW TO PLAY', {
      fontSize: '24px',
      fontFamily: 'monospace',
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
      '',
      'Tip: Place Persians to slow vacuums, Bengals for long range damage.',
    ]

    this.add.text(W / 2 - 270, H / 2 - 130, lines.join('\n\n'), {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#b0bec5',
      lineSpacing: 2,
      wordWrap: { width: 540 },
    })

    const closeBtn = this.add.text(W / 2, H / 2 + 185, '[ CLOSE ]', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const cleanup = () => {
      [overlay, panel, closeBtn].forEach(o => o.destroy())
      this.children.list
        .filter(c => c._howToPlay)
        .forEach(c => c.destroy())
    }

    closeBtn.on('pointerdown', cleanup)
    overlay.on('pointerdown', cleanup)
  }
}