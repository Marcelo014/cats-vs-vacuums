import * as Phaser from 'phaser'
import { GAME } from '../config/GameConfig.js'

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
    const win = this.result === 'win'

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, win ? 0x0a1f0a : 0x1f0a0a)

    // Big emoji
    this.add.text(W / 2, H / 2 - 160, win ? '🎉' : '💀', {
      fontSize: '100px',
    }).setOrigin(0.5)

    // Title
    this.add.text(W / 2, H / 2 - 60, win ? 'THE DIRT IS SAFE!' : 'SQUEAKY CLEAN...', {
      fontSize: '48px',
      fontFamily: 'Fredoka One',
      color: win ? '#a5d6a7' : '#ef9a9a',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    // Subtitle
    this.add.text(W / 2, H / 2 + 10, win
      ? 'You defended every wave. The vacuums are defeated.'
      : 'The vacuums cleaned everything. Not a speck of dirt remains.', {
      fontSize: '18px',
      fontFamily: 'Fredoka One',
      color: '#78909c',
      align: 'center',
    }).setOrigin(0.5)

    // Scraps remaining
    this.add.text(W / 2, H / 2 + 60, `Scraps remaining: ${this.scraps} 💰`, {
      fontSize: '20px',
      fontFamily: 'Fredoka One',
      color: '#ffd54f',
    }).setOrigin(0.5)

    // Play again button
    const playBg = this.add.rectangle(W / 2, H / 2 + 140, 240, 48, 0x1b5e20)
      .setInteractive({ useHandCursor: true })

    const playTxt = this.add.text(W / 2, H / 2 + 140, '▶  PLAY AGAIN', {
      fontSize: '20px',
      fontFamily: 'Fredoka One',
      color: '#a5d6a7',
    }).setOrigin(0.5)

    playBg.on('pointerover', () => playBg.setFillStyle(0x2e7d32))
    playBg.on('pointerout', () => playBg.setFillStyle(0x1b5e20))
    playBg.on('pointerdown', () => this.scene.start('GameScene'))

    // Main menu button
    const menuBg = this.add.rectangle(W / 2, H / 2 + 200, 240, 40, 0x1a1a2e)
      .setInteractive({ useHandCursor: true })

    const menuTxt = this.add.text(W / 2, H / 2 + 200, '← MAIN MENU', {
      fontSize: '16px',
      fontFamily: 'Fredoka One',
      color: '#78909c',
    }).setOrigin(0.5)

    menuBg.on('pointerdown', () => this.scene.start('MainMenuScene'))
  }
}