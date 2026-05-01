import { GAME, DIRT, SETTINGS } from '../config/GameConfig.js'
import * as Phaser from 'phaser'

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

const TARGETED_TRIGGERS = ['siamese', 'ragdoll', 'chonk']

const WAVE_SUBTITLES = [
  'Here they come.',
  'The vacuums are angry.',
  'They brought backup.',
  'More. Always more.',
  'The cats hold the line.',
  'Getting spicy in here.',
  'They want the dirt BAD.',
  'No mercy. No surrender.',
  'The floor shall not be cleaned.',
  'FINAL WAVE. This is it.',
]

const CAT_CHATTER = [
  'This is MY dirt.',
  'Not today, Zoomba.',
  'I\'m watching you 👀',
  'Stay back.',
  'Try me.',
  'The dirt stays.',
  'I will end you.',
  'Nope.',
  '*hissing intensifies*',
  'Come closer. I dare you.',
  'This floor is sacred.',
  'I haven\'t napped yet today and I am ANGRY.',
]

const SCRAP_QUIPS = [
  (n) => `+${n} 💰`,
  (n) => `+${n} 💰`,
  (n) => `+${n} 💰`,
  (n) => `+${n} 💰 Nice.`,
  (n) => `+${n} 💰 Cha-ching!`,
  (n) => `+${n} 💰 Get paid.`,
  (n) => `+${n} scraps!`,
]

export default class HUD {
  constructor(scene, startingScraps) {
    this.scene = scene
    this.scraps = startingScraps
    this.dirt = DIRT.maxDirt
    this._selectedBtn = null
    this._awaitingTriggerTarget = false
    this._triggerCat = null
    this._dirtPulsing = false

    this._buildScrapsDisplay()
    this._buildDirtMeter()
    this._buildWaveDisplay()
    this._buildNextWaveButton()
    this._buildSpeedControl()
    this._buildPauseButton()
    this._buildCatPanel()
    this._buildSelectedCatPanel()
    this._bindEvents()
    this._startCatChatter()
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

    this._dirtLabel = s.add.text(W / 2, 14, '🏠 DIRT METER', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#a5d6a7',
    }).setScrollFactor(0).setDepth(10).setOrigin(0.5, 0)

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
        this._speedBtns.forEach((btn, j) => {
          btn.bg.setFillStyle(speeds[j].value === spd.value ? 0x1b5e20 : 0x1a1a2e)
          btn.txt.setColor(speeds[j].value === spd.value ? '#a5d6a7' : '#546e7a')
        })
      })

      this._speedBtns.push({ bg, txt })
    })
  }

  _buildPauseButton() {
    const s = this.scene
    const W = GAME.width

    const bg = s.add.rectangle(W / 2, 26, 60, 30, 0x1a1a2e)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })

    s.add.text(W / 2, 26, '⏸', {
      fontSize: '18px',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

    bg.on('pointerover', () => bg.setFillStyle(0x2a2a3e))
    bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e))
    bg.on('pointerdown', () => s.events.emit('pauseGameRequest'))
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

    this._selectedCatText = s.add.text(90, panelY - 22, 'Click a cat\nto select', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#78909c',
      align: 'center',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

    this._upgradeBtn = s.add.rectangle(55, panelY + 6, 68, 18, 0x1a237e)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })
      .setVisible(false)

    this._upgradeTxt = s.add.text(55, panelY + 6, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#90caf9',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._upgradeBtn.on('pointerdown', () => s.events.emit('upgradeSelectedCat'))

    this._adoptBtn = s.add.rectangle(125, panelY + 6, 68, 18, 0x4e342e)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })
      .setVisible(false)

    this._adoptTxt = s.add.text(125, panelY + 6, '🏠 Adopt', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._adoptBtn.on('pointerdown', () => s.events.emit('adoptOutSelectedCat'))

    this._triggerBtn = s.add.rectangle(90, panelY + 26, 148, 18, 0x7b1fa2)
      .setScrollFactor(0).setDepth(10).setInteractive({ useHandCursor: true })
      .setVisible(false)

    this._triggerTxt = s.add.text(90, panelY + 26, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ce93d8',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._triggerBtn.on('pointerdown', () => s.events.emit('triggerSelectedCat'))
  }

  // -----------------------------------------------------------
  // Merged pause + settings menu
  // -----------------------------------------------------------

  showPauseMenu() {
    const s = this.scene
    const W = GAME.width
    const H = GAME.height

    this._pauseMenuItems = []

    const overlay = s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(40)
    this._pauseMenuItems.push(overlay)

    const panel = s.add.rectangle(W / 2, H / 2, 380, 480, 0x0d0d1a)
      .setScrollFactor(0).setDepth(41).setStrokeStyle(2, 0x37474f)
    this._pauseMenuItems.push(panel)

    // Cat sitting on top of panel for personality
    const catDeco = s.add.text(W / 2, H / 2 - 230, '😾', {
      fontSize: '36px',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5)
    this._pauseMenuItems.push(catDeco)

    // Bounce the cat
    s.tweens.add({
      targets: catDeco,
      y: H / 2 - 240,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this._pauseMenuItems.push(s.add.text(W / 2, H / 2 - 190, '— PAUSED —', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffd54f',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5))

    this._pauseMenuItems.push(s.add.text(W / 2, H / 2 - 160, 'The dirt awaits your return.', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#546e7a',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5))

    // Resume
    this._pauseMenuItems.push(...this._makePauseBtn(
      W / 2, H / 2 - 100, '▶  RESUME', '#a5d6a7', 0x1b5e20,
      () => s.events.emit('resumeGame')
    ))

    // Restart
    this._pauseMenuItems.push(...this._makePauseBtn(
      W / 2, H / 2 - 44, '↺  RESTART', '#90caf9', 0x1a237e,
      () => {
        this.hidePauseMenu()
        s.scene.restart()
      }
    ))

    // Sound toggle
    const soundLabel = () => `🔊 SFX: ${SETTINGS.sfxOn ? 'ON ✓' : 'OFF ✗'}`
    const [sBg, sTxt] = this._makePauseBtn(
      W / 2, H / 2 + 12, soundLabel(), '#b0bec5', 0x263238,
      () => {
        SETTINGS.sfxOn = !SETTINGS.sfxOn
        sTxt.setText(soundLabel())
      }
    )
    this._pauseMenuItems.push(sBg, sTxt)

    // Music toggle
    const musicLabel = () => `🎵 Music: ${SETTINGS.musicOn ? 'ON ✓' : 'OFF ✗'}`
    const [mBg, mTxt] = this._makePauseBtn(
      W / 2, H / 2 + 68, musicLabel(), '#b0bec5', 0x263238,
      () => {
        SETTINGS.musicOn = !SETTINGS.musicOn
        mTxt.setText(musicLabel())
      }
    )
    this._pauseMenuItems.push(mBg, mTxt)

    // Auto wave toggle
    const autoLabel = () => `⏭️  Auto Wave: ${SETTINGS.autoPlay ? 'ON ✓' : 'OFF ✗'}`
    const [aBg, aTxt] = this._makePauseBtn(
      W / 2, H / 2 + 124, autoLabel(), '#b0bec5', 0x263238,
      () => {
        SETTINGS.autoPlay = !SETTINGS.autoPlay
        aTxt.setText(autoLabel())
      }
    )
    this._pauseMenuItems.push(aBg, aTxt)

    // Main menu
    this._pauseMenuItems.push(...this._makePauseBtn(
      W / 2, H / 2 + 190, '⬅  MAIN MENU', '#ef9a9a', 0x4e342e,
      () => {
        this.hidePauseMenu()
        this._showQuitConfirm()
      }
    ))

    // ESC hint
    this._pauseMenuItems.push(s.add.text(W / 2, H / 2 + 230, 'Press ESC to resume', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#263238',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5))
  }

  hidePauseMenu() {
    if (this._pauseMenuItems) {
      this._pauseMenuItems.forEach(i => i.destroy())
      this._pauseMenuItems = null
    }
  }

  _makePauseBtn(x, y, label, textColor, bgColor, onClick) {
    const s = this.scene
    const bg = s.add.rectangle(x, y, 300, 42, bgColor)
      .setScrollFactor(0).setDepth(42).setInteractive({ useHandCursor: true })

    const txt = s.add.text(x, y, label, {
      fontSize: '15px',
      fontFamily: 'monospace',
      color: textColor,
    }).setScrollFactor(0).setDepth(43).setOrigin(0.5)

    bg.on('pointerover', () => {
      bg.setAlpha(0.8)
      txt.setScale(1.04)
    })
    bg.on('pointerout', () => {
      bg.setAlpha(1)
      txt.setScale(1)
    })
    bg.on('pointerdown', onClick)

    return [bg, txt]
  }

  _showQuitConfirm() {
    const s = this.scene
    const W = GAME.width
    const H = GAME.height
    const items = []

    const overlay = s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(50)
    items.push(overlay)

    const panel = s.add.rectangle(W / 2, H / 2, 380, 240, 0x0d0d1a)
      .setScrollFactor(0).setDepth(51).setStrokeStyle(2, 0x4e342e)
    items.push(panel)

    items.push(s.add.text(W / 2, H / 2 - 80, '😿  ABANDON THE DIRT?', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ef9a9a',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5))

    items.push(s.add.text(W / 2, H / 2 - 40, 'The vacuums will win.\nThe dirt will be lost forever.', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#546e7a',
      align: 'center',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5))

    const cleanup = () => items.forEach(i => i.destroy())

    const [yesBg, yesTxt] = this._makePauseBtn(W / 2 - 85, H / 2 + 50, 'ABANDON', '#ef9a9a', 0x4e342e, () => {
      cleanup()
      s.scene.start('MainMenuScene')
    })
    yesBg.setDepth(52)
    yesTxt.setDepth(53)
    yesBg.width = 140
    items.push(yesBg, yesTxt)

    const [noBg, noTxt] = this._makePauseBtn(W / 2 + 85, H / 2 + 50, 'STAY & FIGHT', '#a5d6a7', 0x1b5e20, () => {
      cleanup()
      this.showPauseMenu()
    })
    noBg.setDepth(52)
    noTxt.setDepth(53)
    noBg.width = 140
    items.push(noBg, noTxt)
  }

  // -----------------------------------------------------------
  // Cat chatter
  // -----------------------------------------------------------

  _startCatChatter() {
    // Every 12-20 seconds, a random placed cat says something
    const scheduleNext = () => {
      const delay = Phaser.Math.Between(12000, 20000)
      this.scene.time.delayedCall(delay, () => {
        if (this.scene.cats && this.scene.cats.length > 0) {
          const cat = this.scene.cats[Phaser.Math.Between(0, this.scene.cats.length - 1)]
          const line = CAT_CHATTER[Phaser.Math.Between(0, CAT_CHATTER.length - 1)]
          this._showSpeechBubble(cat.x, cat.y, line)
        }
        scheduleNext()
      })
    }
    scheduleNext()
  }

  _showSpeechBubble(x, y, text) {
    const s = this.scene
    const bubble = s.add.text(x, y - 40, `💬 ${text}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#1a1a2ecc',
      padding: { x: 6, y: 4 },
    }).setOrigin(0.5, 1).setDepth(18)

    s.tweens.add({
      targets: bubble,
      y: y - 70,
      alpha: 0,
      duration: 2500,
      delay: 1500,
      onComplete: () => bubble.destroy(),
    })
  }

  // -----------------------------------------------------------
  // Scrap quip
  // -----------------------------------------------------------

  getScrapQuip(amount) {
    const quip = SCRAP_QUIPS[Phaser.Math.Between(0, SCRAP_QUIPS.length - 1)]
    return quip(amount)
  }

  // -----------------------------------------------------------
  // Events
  // -----------------------------------------------------------

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

      if (ratio < 0.3 && !this._dirtPulsing) {
        this._dirtPulsing = true
        this._dirtLabel.setText('😱 THE DIRT IS FADING!')
        this._dirtLabel.setColor('#ef5350')
        this.scene.tweens.add({
          targets: this._dirtBar,
          alpha: 0.3,
          duration: 400,
          yoyo: true,
          repeat: -1,
        })
      } else if (ratio >= 0.3 && this._dirtPulsing) {
        this._dirtPulsing = false
        this._dirtLabel.setText('🏠 DIRT METER')
        this._dirtLabel.setColor('#a5d6a7')
        this.scene.tweens.killTweensOf(this._dirtBar)
        this._dirtBar.setAlpha(1)
      }
    })

    this.scene.events.on('waveStarted', (wave, total) => {
      this._waveText.setText(`Wave ${wave} / ${total}`)
      this._btnBg.setVisible(false)
      this._btnText.setVisible(false)

      const subtitle = wave <= WAVE_SUBTITLES.length
        ? WAVE_SUBTITLES[wave - 1]
        : 'The invasion continues...'

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

      const sub = this.scene.add.text(
        GAME.width / 2, GAME.height / 2 + 30,
        subtitle,
        {
          fontSize: '18px',
          fontFamily: 'monospace',
          color: '#b0bec5',
          stroke: '#000000',
          strokeThickness: 3,
        }
      ).setScrollFactor(0).setDepth(30).setOrigin(0.5).setAlpha(0)

      this.scene.tweens.add({
        targets: [announcement, sub],
        alpha: 1,
        duration: 300,
        hold: 800,
        yoyo: true,
        onComplete: () => {
          announcement.destroy()
          sub.destroy()
        },
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
      } else {
        this._upgradeTxt.setText('MAX ★★★★★')
        this._upgradeTxt.setColor('#ffd700')
      }
      this._upgradeBtn.setVisible(true)
      this._upgradeTxt.setVisible(true)
      this._adoptBtn.setVisible(true)
      this._adoptTxt.setVisible(true)

      if (cat.canTrigger()) {
        const cooldownLeft = Math.ceil(cat._triggerCooldown / 1000)
        this._triggerTxt.setText(cooldownLeft > 0 ? `⚡ TRIGGER (${cooldownLeft}s)` : '⚡ TRIGGER!')
        this._triggerTxt.setColor(cat._triggerCooldown <= 0 ? '#ffd700' : '#546e7a')
        this._triggerBtn.setVisible(true)
        this._triggerTxt.setVisible(true)
      } else {
        this._triggerBtn.setVisible(false)
        this._triggerTxt.setVisible(false)
      }
    })

    this.scene.events.on('catDeselected', () => {
      this._selectedCatText.setText('Click a cat\nto select').setColor('#78909c')
      this._upgradeBtn.setVisible(false)
      this._upgradeTxt.setVisible(false)
      this._adoptBtn.setVisible(false)
      this._adoptTxt.setVisible(false)
      this._triggerBtn.setVisible(false)
      this._triggerTxt.setVisible(false)
    })

    this.scene.events.on('awaitingTriggerTarget', () => {
      this._triggerTxt.setText('🎯 Click target on map...')
      this._triggerTxt.setColor('#ff9800')
    })
  }
}