import * as Phaser from 'phaser'
import { GAME } from '../config/GameConfig.js'
import { roundRect } from '../ui/roundRect.js'

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' })
  }

  init(data) {
    this.result = data.result
    this.scraps = data.scraps || 0
  }

  create() {
    const W = GAME.width
    const H = GAME.height
    const SCALE = H / 720
    const win = this.result === 'win'

    this.add.rectangle(W / 2, H / 2, W, H, win ? 0x0a1f0a : 0x1f0a0a)

    this.add.text(W / 2, H / 2 - Math.round(160 * SCALE), win ? '🎉' : '💀', {
      fontSize: `${Math.round(100 * SCALE)}px`,
    }).setOrigin(0.5)

    this.add.text(W / 2, H / 2 - Math.round(60 * SCALE), win ? 'THE DIRT IS SAFE!' : 'SQUEAKY CLEAN...', {
      fontSize: `${Math.round(48 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: win ? '#a5d6a7' : '#ef9a9a',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(W / 2, H / 2 + Math.round(10 * SCALE), win
      ? 'You defended every wave. The vacuums are defeated.'
      : 'The vacuums cleaned everything. Not a speck of dirt remains.', {
      fontSize: `${Math.round(18 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#78909c',
      align: 'center',
    }).setOrigin(0.5)

    this.add.text(W / 2, H / 2 + Math.round(60 * SCALE), `Scraps remaining: ${this.scraps} 💰`, {
      fontSize: `${Math.round(20 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#ffd54f',
    }).setOrigin(0.5)

    const playBg = roundRect(this, W / 2, H / 2 + Math.round(140 * SCALE), Math.round(240 * SCALE), Math.round(48 * SCALE), 8, 0x1b5e20, true)

    const playTxt = this.add.text(W / 2, H / 2 + Math.round(140 * SCALE), '▶  PLAY AGAIN', {
      fontSize: `${Math.round(20 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#a5d6a7',
    }).setOrigin(0.5)

    playBg.on('pointerover', () => playBg.setFillStyle(0x2e7d32))
    playBg.on('pointerout', () => playBg.setFillStyle(0x1b5e20))
    playBg.on('pointerdown', () => this.scene.start('GameScene'))

    const menuBg = roundRect(this, W / 2, H / 2 + Math.round(200 * SCALE), Math.round(240 * SCALE), Math.round(40 * SCALE), 8, 0x1a1a2e, true)

    const menuTxt = this.add.text(W / 2, H / 2 + Math.round(200 * SCALE), '← MAIN MENU', {
      fontSize: `${Math.round(16 * SCALE)}px`,
      fontFamily: 'Fredoka One',
      color: '#78909c',
    }).setOrigin(0.5)

    menuBg.on('pointerdown', () => this.scene.start('MainMenuScene'))
  }
}
