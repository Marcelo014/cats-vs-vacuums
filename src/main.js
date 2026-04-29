import * as Phaser from 'phaser'

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scene: {
    create() {
      this.add.text(640, 360, '🐱 Cats vs Vacuums', {
        fontSize: '48px',
        fontFamily: 'monospace',
        color: '#a5d6a7',
      }).setOrigin(0.5)
    }
  }
}

new Phaser.Game(config)