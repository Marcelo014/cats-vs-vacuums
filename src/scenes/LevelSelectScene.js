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

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a16)

    // Star field
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, W)
      const y = Phaser.Math.Between(0, H)
      this.add.circle(x, y, Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.1, 0.3))
    }

    // Title
    this.add.text(W / 2, 60, 'SELECT LEVEL', {
      fontSize: '36px',
      fontFamily: 'Fredoka One',
      color: '#ffd54f',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(W / 2, 100, 'The vacuums breach the cat door and push deeper into the home.', {
      fontSize: '14px',
      fontFamily: 'Fredoka One',
      color: '#546e7a',
    }).setOrigin(0.5)

    // Level cards
    const cardW = 200
    const cardH = 220
    const spacing = 20
    const totalW = LEVELS.length * cardW + (LEVELS.length - 1) * spacing
    const startX = (W - totalW) / 2 + cardW / 2

    LEVELS.forEach((level, i) => {
      const cx = startX + i * (cardW + spacing)
      const cy = H / 2 + 20

      // Card background
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

      // Level number
      this.add.text(cx, cy - 80, `${level.number}`, {
        fontSize: '48px',
        fontFamily: 'Fredoka One',
        color: level.available ? '#ffffff' : '#263238',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5)

      // Emoji
      this.add.text(cx, cy - 20, level.emoji, {
        fontSize: '40px',
        color: level.available ? '#ffffff' : '#263238',
      }).setOrigin(0.5).setAlpha(level.available ? 1 : 0.3)

      // Level name
      this.add.text(cx, cy + 30, level.name, {
        fontSize: '16px',
        fontFamily: 'Fredoka One',
        color: level.available ? '#b0bec5' : '#263238',
      }).setOrigin(0.5)

      // Description
      this.add.text(cx, cy + 65, level.description, {
        fontSize: '11px',
        fontFamily: 'Fredoka One',
        color: level.available ? '#546e7a' : '#1a2a2e',
        align: 'center',
      }).setOrigin(0.5)

      // Coming soon badge
      if (!level.available) {
        roundRect(this, cx, cy - 80, 120, 28, 6, 0x1a1a2e)
          .setStrokeStyle(1, 0x263238)

        this.add.text(cx, cy - 80, 'COMING SOON', {
          fontSize: '10px',
          fontFamily: 'Fredoka One',
          color: '#37474f',
        }).setOrigin(0.5)
      }
    })

    // Back button
    const backBg = roundRect(this, 80, H - 40, 120, 36, 8, 0x1a1a2e, true)

    const backTxt = this.add.text(80, H - 40, '← BACK', {
      fontSize: '14px',
      fontFamily: 'Fredoka One',
      color: '#78909c',
    }).setOrigin(0.5)

    backBg.on('pointerover', () => backTxt.setColor('#b0bec5'))
    backBg.on('pointerout', () => backTxt.setColor('#78909c'))
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'))
  }
}