import * as Phaser from 'phaser'
import MainMenuScene from './scenes/MainMenuScene.js'
import GameScene from './scenes/GameScene.js'
import ResultScene from './scenes/ResultScene.js'

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scene: [MainMenuScene, GameScene, ResultScene],
}

new Phaser.Game(config)