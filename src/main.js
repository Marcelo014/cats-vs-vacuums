import * as Phaser from 'phaser'
import PreloadScene from './scenes/PreloadScene.js'
import MainMenuScene from './scenes/MainMenuScene.js'
import LevelSelectScene from './scenes/LevelSelectScene.js'
import GameScene from './scenes/GameScene.js'
import ResultScene from './scenes/ResultScene.js'

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scene: [PreloadScene, MainMenuScene, LevelSelectScene, GameScene, ResultScene],
}

new Phaser.Game(config)