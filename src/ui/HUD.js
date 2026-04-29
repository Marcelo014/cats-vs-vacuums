import { GAME, DIRT } from '../config/GameConfig.js'

export default class HUD {
  constructor(scene, startingScraps) {
    this.scene = scene
    this.scraps = startingScraps
    this.dirt = DIRT.maxDirt

    this._buildScrapsDisplay()
    this._buildDirtMeter()
    this._buildWaveDisplay()
    this._buildNextWaveButton()
    this._bindEvents()
  }

  _buildScrapsDisplay() {
    const s = this.scene

    s.add.text(20, 20, '💰', { fontSize: '24px' })
      .setScrollFactor(0).setDepth(10)

    this._scrapsText = s.add.text(50, 20, `${this.scraps}`, {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffd54f',
    }).setScrollFactor(0).setDepth(10)
  }

  _buildDirtMeter() {
    const s = this.scene
    const W = GAME.width

    s.add.text(W / 2 - 120, 14, '🏠 DIRT METER', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#a5d6a7',
    }).setScrollFactor(0).setDepth(10)

    s.add.rectangle(W / 2, 34, 240, 14, 0x333333)
      .setScrollFactor(0).setDepth(10)

    this._dirtBar = s.add.rectangle(W / 2 - 120, 34, 240, 14, 0x66bb6a)
      .setScrollFactor(0).setDepth(11).setOrigin(0, 0.5)

    this._dirtPct = s.add.text(W / 2, 34, '100%', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(12).setOrigin(0.5)
  }

  _buildWaveDisplay() {
    const s = this.scene
    const W = GAME.width

    this._waveText = s.add.text(W - 20, 20, 'Wave 0 / 0', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#b0bec5',
    }).setScrollFactor(0).setDepth(10).setOrigin(1, 0)
  }

  _buildNextWaveButton() {
    const s = this.scene
    const W = GAME.width
    const H = GAME.height

    this._btnBg = s.add.rectangle(W - 100, H - 40, 160, 44, 0x1b5e20)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })

    this._btnText = s.add.text(W - 100, H - 40, '▶ NEXT WAVE', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#a5d6a7',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

    this._btnBg.on('pointerover', () => {
      this._btnBg.setFillStyle(0x2e7d32)
      this._btnText.setColor('#ffffff')
    })
    this._btnBg.on('pointerout', () => {
      this._btnBg.setFillStyle(0x1b5e20)
      this._btnText.setColor('#a5d6a7')
    })
    this._btnBg.on('pointerdown', () => {
      s.events.emit('startNextWave')
    })
  }

  _bindEvents() {
    this.scene.events.on('scrapsChanged', (scraps) => {
      this.scraps = scraps
      this._scrapsText.setText(`${scraps}`)
      this._scrapsText.setColor(scraps < 50 ? '#ef5350' : '#ffd54f')
    })

    this.scene.events.on('dirtChanged', (dirt) => {
      this.dirt = dirt
      const ratio = Math.max(0, dirt / DIRT.maxDirt)
      this._dirtBar.width = 240 * ratio
      this._dirtBar.setFillStyle(
        ratio > 0.6 ? 0x66bb6a :
        ratio > 0.3 ? 0xff9800 : 0xef5350
      )
      this._dirtPct.setText(`${Math.round(ratio * 100)}%`)
    })

    this.scene.events.on('waveStarted', (wave, total) => {
      this._waveText.setText(`Wave ${wave} / ${total}`)
      this._btnBg.setVisible(false)
      this._btnText.setVisible(false)
    })

    this.scene.events.on('waveComplete', (wave, total) => {
      this._waveText.setText(`Wave ${wave} / ${total}`)
      this._btnBg.setVisible(true)
      this._btnText.setVisible(true)
    })
  }
}