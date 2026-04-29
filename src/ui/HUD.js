import { GAME, DIRT, SETTINGS } from '../config/GameConfig.js'

const CAT_PANEL = [
  { type: 'kitten',     label: '🐱 Kitten',    cost: 50,  color: '#f9a825' },
  { type: 'tabby',      label: '🐈 Tabby',      cost: 125, color: '#e67e22' },
  { type: 'alley_cat',  label: '😼 Alley',      cost: 75,  color: '#95a5a6' },
  { type: 'siamese',    label: '🐈 Siamese',    cost: 200, color: '#ecf0f1' },
  { type: 'maine_coon', label: '🦁 M.Coon',     cost: 225, color: '#8d6e63' },
  { type: 'persian',    label: '👑 Persian',    cost: 150, color: '#ce93d8' },
  { type: 'bengal',     label: '🐯 Bengal',     cost: 250, color: '#ff8f00' },
  { type: 'ragdoll',    label: '💤 Ragdoll',    cost: 175, color: '#fce4ec' },
  { type: 'chonk',      label: '🐾 Chonk',      cost: 150, color: '#4db6ac' },
  { type: 'tuxedo',     label: '🎩 Tuxedo',     cost: 300, color: '#90a4ae' },
]

export default class HUD {
  constructor(scene, startingScraps) {
    this.scene = scene
    this.scraps = startingScraps
    this.dirt = DIRT.maxDirt
    this._selectedBtn = null

    this._buildScrapsDisplay()
    this._buildDirtMeter()
    this._buildWaveDisplay()
    this._buildNextWaveButton()
    this._buildSpeedControl()
    this._buildSettingsButton()
    this._buildCatPanel()
    this._buildSelectedCatPanel()
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

    this._btnBg = s.add.rectangle(W - 90, H - 36, 140, 40, 0x1b5e20)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })

    this._btnText = s.add.text(W - 90, H - 36, '▶ NEXT WAVE', {
      fontSize: '13px',
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
      this.scene.events.emit('startNextWave')
    })
  }

  _buildSpeedControl() {
    const s = this.scene
    const W = GAME.width
    const H = GAME.height

    // Label
    s.add.text(W - 260, H - 50, '⚡ SPEED', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#78909c',
    }).setScrollFactor(0).setDepth(10)

    const speeds = [
      { label: '1x', value: 1 },
      { label: '3x', value: 3 },
      { label: '5x', value: 5 },
    ]

    this._speedBtns = []

    speeds.forEach((spd, i) => {
      const bx = W - 255 + i * 40
      const by = H - 30

      const bg = s.add.rectangle(bx, by, 34, 22, spd.value === 1 ? 0x1b5e20 : 0x1a1a2e)
        .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })

      const txt = s.add.text(bx, by, spd.label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: spd.value === 1 ? '#a5d6a7' : '#546e7a',
      }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

      bg.on('pointerdown', () => {
        SETTINGS.gameSpeed = spd.value
        // Update button styles
        this._speedBtns.forEach((btn, j) => {
          btn.bg.setFillStyle(speeds[j].value === spd.value ? 0x1b5e20 : 0x1a1a2e)
          btn.txt.setColor(speeds[j].value === spd.value ? '#a5d6a7' : '#546e7a')
        })
      })

      this._speedBtns.push({ bg, txt })
    })
  }

  _buildSettingsButton() {
    const s = this.scene
    const H = GAME.height

    const bg = s.add.rectangle(22, H - 36, 36, 36, 0x1a1a2e)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })

    s.add.text(22, H - 36, '⚙️', {
      fontSize: '18px',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

    bg.on('pointerdown', () => this._showSettings())
  }

  _showSettings() {
    const s = this.scene
    const W = GAME.width
    const H = GAME.height

    const overlay = s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(50).setInteractive()

    const panel = s.add.rectangle(W / 2, H / 2, 400, 320, 0x0d0d1a)
      .setScrollFactor(0).setDepth(51).setStrokeStyle(2, 0x37474f)

    const title = s.add.text(W / 2, H / 2 - 130, '⚙️  SETTINGS', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ffd54f',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5)

    const items = []

    // Music toggle
    const musicTxt = s.add.text(W / 2 - 160, H / 2 - 70, `🎵 Music: ${SETTINGS.musicOn ? 'ON' : 'OFF'}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: SETTINGS.musicOn ? '#a5d6a7' : '#ef5350',
    }).setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true })

    musicTxt.on('pointerdown', () => {
      SETTINGS.musicOn = !SETTINGS.musicOn
      musicTxt.setText(`🎵 Music: ${SETTINGS.musicOn ? 'ON' : 'OFF'}`)
      musicTxt.setColor(SETTINGS.musicOn ? '#a5d6a7' : '#ef5350')
    })

    // SFX toggle
    const sfxTxt = s.add.text(W / 2 - 160, H / 2 - 30, `🔊 SFX: ${SETTINGS.sfxOn ? 'ON' : 'OFF'}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: SETTINGS.sfxOn ? '#a5d6a7' : '#ef5350',
    }).setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true })

    sfxTxt.on('pointerdown', () => {
      SETTINGS.sfxOn = !SETTINGS.sfxOn
      sfxTxt.setText(`🔊 SFX: ${SETTINGS.sfxOn ? 'ON' : 'OFF'}`)
      sfxTxt.setColor(SETTINGS.sfxOn ? '#a5d6a7' : '#ef5350')
    })

    // Auto play toggle
    const autoTxt = s.add.text(W / 2 - 160, H / 2 + 10, `⏭️  Auto Wave: ${SETTINGS.autoPlay ? 'ON' : 'OFF'}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: SETTINGS.autoPlay ? '#a5d6a7' : '#ef5350',
    }).setScrollFactor(0).setDepth(52).setInteractive({ useHandCursor: true })

    autoTxt.on('pointerdown', () => {
      SETTINGS.autoPlay = !SETTINGS.autoPlay
      autoTxt.setText(`⏭️  Auto Wave: ${SETTINGS.autoPlay ? 'ON' : 'OFF'}`)
      autoTxt.setColor(SETTINGS.autoPlay ? '#a5d6a7' : '#ef5350')
    })

    // Note about sound
    s.add.text(W / 2, H / 2 + 60, '(Sound not yet implemented — coming soon)', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#37474f',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5)

    items.push(overlay, panel, title, musicTxt, sfxTxt, autoTxt)

    // Close button
    const closeBtn = s.add.text(W / 2, H / 2 + 110, '[ CLOSE ]', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5).setInteractive({ useHandCursor: true })

    items.push(closeBtn)

    const cleanup = () => items.forEach(o => o.destroy())
    closeBtn.on('pointerdown', cleanup)
    overlay.on('pointerdown', cleanup)
  }

  _buildCatPanel() {
    const s = this.scene
    const W = GAME.width
    const H = GAME.height
    const panelY = H - 36
    const btnW = 88
    const startX = 200

    s.add.rectangle(W / 2, panelY, W, 72, 0x0d0d1a, 0.95)
      .setScrollFactor(0).setDepth(9)

    this._catBtns = []

    CAT_PANEL.forEach((cat, i) => {
      const bx = startX + i * (btnW + 4)
      const btn = s.add.rectangle(bx, panelY, btnW, 64, 0x1a1a2e)
        .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })

      const txt = s.add.text(bx, panelY, `${cat.label}\n${cat.cost}💰`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: cat.color,
        align: 'center',
        lineSpacing: 2,
      }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

      btn.on('pointerover', () => {
        if (this._selectedBtn !== btn) btn.setFillStyle(0x2a2a3e)
      })
      btn.on('pointerout', () => {
        if (this._selectedBtn !== btn) btn.setFillStyle(0x1a1a2e)
      })
      btn.on('pointerdown', () => {
        if (this._selectedBtn) this._selectedBtn.setFillStyle(0x1a1a2e)
        this._selectedBtn = btn
        btn.setFillStyle(0x1b5e20)
        s.events.emit('catTypeSelected', cat.type)
      })

      this._catBtns.push(btn)
    })

    this._selectedBtn = this._catBtns[0]
    this._catBtns[0].setFillStyle(0x1b5e20)
  }

  _buildSelectedCatPanel() {
    const s = this.scene
    const H = GAME.height
    const panelY = H - 36

    s.add.rectangle(90, panelY, 160, 72, 0x0d0d1a, 0.95)
      .setScrollFactor(0).setDepth(9)

    this._selectedCatText = s.add.text(90, panelY - 16, 'Click a cat\nto select', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#78909c',
      align: 'center',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

    this._upgradeBtn = s.add.rectangle(55, panelY + 14, 68, 22, 0x1a237e)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })
      .setVisible(false)

    this._upgradeTxt = s.add.text(55, panelY + 14, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#90caf9',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._upgradeBtn.on('pointerdown', () => {
      s.events.emit('upgradeSelectedCat')
    })

    this._adoptBtn = s.add.rectangle(125, panelY + 14, 68, 22, 0x4e342e)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })
      .setVisible(false)

    this._adoptTxt = s.add.text(125, panelY + 14, '🏠 Adopt', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._adoptBtn.on('pointerdown', () => {
      s.events.emit('adoptOutSelectedCat')
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

      // Pulse dirt meter when critically low
      if (ratio < 0.3 && !this._dirtPulsing) {
        this._dirtPulsing = true
        this.scene.tweens.add({
          targets: this._dirtBar,
          alpha: 0.3,
          duration: 400,
          yoyo: true,
          repeat: -1,
        })
      } else if (ratio >= 0.3 && this._dirtPulsing) {
        this._dirtPulsing = false
        this.scene.tweens.killTweensOf(this._dirtBar)
        this._dirtBar.setAlpha(1)
      }
    })

    this.scene.events.on('waveStarted', (wave, total) => {
      this._waveText.setText(`Wave ${wave} / ${total}`)
      this._btnBg.setVisible(false)
      this._btnText.setVisible(false)

      // Wave announcement
      const announcement = this.scene.add.text(
        GAME.width / 2, GAME.height / 2 - 40,
        `WAVE ${wave}`,
        {
          fontSize: '72px',
          fontFamily: 'monospace',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
        }
      ).setScrollFactor(0).setDepth(30).setOrigin(0.5).setAlpha(0)

      this.scene.tweens.add({
        targets: announcement,
        alpha: 1,
        duration: 300,
        hold: 600,
        yoyo: true,
        onComplete: () => announcement.destroy(),
      })
    })

    this.scene.events.on('waveComplete', (wave, total) => {
      this._waveText.setText(`Wave ${wave} / ${total}`)
      this._btnBg.setVisible(true)
      this._btnText.setVisible(true)
    })

    this.scene.events.on('catSelected', (cat) => {
      const upgCost = cat.upgradeCost
      const stars = cat.level > 0 ? ' ' + '★'.repeat(cat.level) : ''

      this._selectedCatText
        .setText(`${cat.name}${stars}\nDmg:${cat.damage} Rng:${cat.range}`)
        .setColor('#e0e0e0')

      if (upgCost) {
        this._upgradeTxt.setText(`⬆ ${upgCost}💰`)
        this._upgradeTxt.setColor(this.scraps >= upgCost ? '#90caf9' : '#ef5350')
        this._upgradeBtn.setVisible(true)
        this._upgradeTxt.setVisible(true)
      } else {
        this._upgradeTxt.setText('MAX ★★★★★')
        this._upgradeTxt.setColor('#ffd700')
        this._upgradeBtn.setVisible(true)
        this._upgradeTxt.setVisible(true)
      }

      this._adoptBtn.setVisible(true)
      this._adoptTxt.setVisible(true)
    })

    this.scene.events.on('catDeselected', () => {
      this._selectedCatText.setText('Click a cat\nto select').setColor('#78909c')
      this._upgradeBtn.setVisible(false)
      this._upgradeTxt.setVisible(false)
      this._adoptBtn.setVisible(false)
      this._adoptTxt.setVisible(false)
    })
  }
}