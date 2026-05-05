import * as Phaser from 'phaser'
import { GAME } from '../config/GameConfig.js'
import { roundRect } from '../ui/roundRect.js'

const LEVELS = [
  {
    number: 1,
    name: 'Living Room',
    emoji: '🛋️',
    description: 'Simple layout. Few turns.\nThe first wave of the invasion.',
    available: true,
  },
  {
    number: 2,
    name: 'Kitchen',
    emoji: '🍳',
    description: 'Tighter spaces. Counters\nblock placement.',
    available: false,
  },
  {
    number: 3,
    name: 'Hallway',
    emoji: '🚪',
    description: 'Long and narrow.\nPlacement areas squeezed.',
    available: false,
  },
  {
    number: 4,
    name: 'Bedroom',
    emoji: '🛏️',
    description: 'Multiple entry points.\nThe bed creates awkward zones.',
    available: false,
  },
  {
    number: 5,
    name: 'Backyard',
    emoji: '🌿',
    description: 'Outdoor finale.\nThe most complex layout.',
    available: false,
  },
]

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' })
  }

  create() {
    const W = GAME.width
    const H = GAME.height
    const SCALE = H / 720

    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a16)

    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, W)
      const y = Phaser.Math.Between(0, H)
      this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.1, 0.3))
    }

    this.add.text(W / 2, Math.round(60 * SCALE), 'SELECT LEVEL', {
      fontSize: `${Math.round(36 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(W / 2, Math.round(100 * SCALE), 'The vacuums breach the cat door and push deeper into the home.', {
      fontSize: `${Math.round(14 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#546e7a',
    }).setOrigin(0.5)

    const cardW = Math.round(200 * SCALE)
    const cardH = Math.round(220 * SCALE)
    const spacing = Math.round(20 * SCALE)
    const totalW = LEVELS.length * cardW + (LEVELS.length - 1) * spacing
    const startX = (W - totalW) / 2 + cardW / 2

    LEVELS.forEach((level, i) => {
      const cx = startX + i * (cardW + spacing)
      const cy = H / 2 + Math.round(20 * SCALE)

      const card = roundRect(this, cx, cy, cardW, cardH, 12, level.available ? 0x1a1a2e : 0x0d0d16, level.available)
        .setStrokeStyle(2, level.available ? 0x37474f : 0x1a1a2e)

      if (level.available) {
        card.on('pointerover', () => {
          card.setFillStyle(0x2a2a3e)
          card.setStrokeStyle(2, 0x66bb6a)
        })
        card.on('pointerout', () => {
          card.setFillStyle(0x1a1a2e)
          card.setStrokeStyle(2, 0x37474f)
        })
        card.on('pointerdown', () => {
          this.scene.start('GameScene', { level: level.number })
        })
      }

      this.add.text(cx, cy - Math.round(80 * SCALE), `${level.number}`, {
        fontSize: `${Math.round(48 * SCALE)}px`,
        fontFamily: 'Fredoka One',
        color: level.available ? '#ffffff' : '#263238',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5)

      this.add.text(cx, cy - Math.round(20 * SCALE), level.emoji, {
        fontSize: `${Math.round(40 * SCALE)}px`,
        color: level.available ? '#ffffff' : '#263238',
      }).setOrigin(0.5).setAlpha(level.available ? 1 : 0.3)

      this.add.text(cx, cy + Math.round(30 * SCALE), level.name, {
        fontSize: `${Math.round(16 * SCALE)}px`,
        fontFamily: 'Fredoka One',
        color: level.available ? '#b0bec5' : '#263238',
      }).setOrigin(0.5)

      this.add.text(cx, cy + Math.round(65 * SCALE), level.description, {
        fontSize: `${Math.round(11 * SCALE)}px`,
        fontFamily: 'Fredoka One',
        color: level.available ? '#546e7a' : '#1a2a2e',
        align: 'center',
      }).setOrigin(0.5)

      if (!level.available) {
        roundRect(this, cx, cy - Math.round(80 * SCALE), Math.round(120 * SCALE), Math.round(28 * SCALE), 6, 0x1a1a2e)
          .setStrokeStyle(1, 0x263238)

        this.add.text(cx, cy - Math.round(80 * SCALE), 'COMING SOON', {
          fontSize: `${Math.round(10 * SCALE)}px`,
          fontFamily: 'Fredoka One',
          color: '#37474f',
        }).setOrigin(0.5)
      }
    })

    const backBg = roundRect(this, Math.round(80 * SCALE), H - Math.round(40 * SCALE), Math.round(120 * SCALE), Math.round(36 * SCALE), 8, 0x1a1a2e, true)

    const backTxt = this.add.text(Math.round(80 * SCALE), H - Math.round(40 * SCALE), '← BACK', {
      fontSize: `${Math.round(14 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#78909c',
    }).setOrigin(0.5)

    backBg.on('pointerover', () => backTxt.setColor('#b0bec5'))
    backBg.on('pointerout', () => backTxt.setColor('#78909c'))
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'))
  }
}
