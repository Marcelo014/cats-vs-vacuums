import * as Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.add.text(640, 360, 'Game Scene Works', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#a5d6a7',
    }).setOrigin(0.5)
  }

  update(time, delta) {
    // main game loop — runs every frame
  }
}