import * as Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    const W = 1280
    const H = 720

    this.add.rectangle(W / 2, H / 2, 400, 8, 0x1a1a2e)
    const bar = this.add.rectangle(W / 2 - 200, H / 2, 0, 8, 0x66bb6a).setOrigin(0, 0.5)

    this.add.text(W / 2, H / 2 - 30, 'Loading...', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#546e7a',
    }).setOrigin(0.5)

    this.load.on('progress', (value) => {
      bar.width = 400 * value
    })

    // Cat sprites
    this.load.image('cat_kitten', '/assets/sprites/kitten_idle.png')

    // Vacuum sprites
    this.load.image('vacuum_zoomba', '/assets/sprites/zoomba_idle.png')
  }

  create() {
    this.scene.start('MainMenuScene')
  }
}