import * as Phaser from 'phaser'
import { GAME, DIRT, SETTINGS } from '../config/GameConfig.js'
import { roundRect } from './roundRect.js'

const CAT_PANEL = [
  { type: 'kitten',     label: '🐱 Kitten',    cost: 50,  color: '#FFD166' },
  { type: 'tabby',      label: '🐈 Tabby',      cost: 125, color: '#FF9A3C' },
  { type: 'alley_cat',  label: '😼 Alley',      cost: 75,  color: '#C8D6E5' },
  { type: 'siamese',    label: '🐈 Siamese',    cost: 200, color: '#FFFFFF' },
  { type: 'maine_coon', label: '🦁 M.Coon',     cost: 225, color: '#C4956A' },
  { type: 'persian',    label: '👑 Persian',    cost: 150, color: '#D9A7FF' },
  { type: 'bengal',     label: '🐯 Bengal',     cost: 250, color: '#FFB347' },
  { type: 'ragdoll',    label: '💤 Ragdoll',    cost: 175, color: '#FFD1DC' },
  { type: 'chonk',      label: '🐾 Chonk',      cost: 150, color: '#7FFFD4' },
  { type: 'tuxedo',     label: '🎩 Tuxedo',     cost: 300, color: '#B8C6DB' },
]

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
  'I haven\'t napped yet and I am ANGRY.',
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

const FONT = 'Fredoka One'
const FONT_BODY = 'Fredoka One'

const W = GAME.width
const H = GAME.height
const SCALE = H / 720
const TOP_H = Math.round(60 * SCALE)
const BOT_H = Math.round(80 * SCALE)
const DIRT_W = Math.round(260 * SCALE)
const DIRT_H = Math.round(16 * SCALE)
const DIRT_Y = Math.round(40 * SCALE)

export default class HUD {
  constructor(scene, startingScraps) {
    this.scene = scene
    this.scraps = startingScraps
    this.dirt = DIRT.maxDirt
    this._selectedBtn = null
    this._dirtPulsing = false

    this._buildTopBar()
    this._buildBottomPanel()
    this._buildSelectedCatPanel()
    this._bindEvents()
    this._startCatChatter()
  }

  // -----------------------------------------------------------
  // TOP BAR
  // -----------------------------------------------------------

  _buildTopBar() {
    const s = this.scene
    const barMid = TOP_H / 2
    const MARGIN = Math.round(20 * SCALE)

    s.add.rectangle(W / 2, barMid, W, TOP_H, 0x1E2A3A, 1)
      .setScrollFactor(0).setDepth(10)

    // --- Scraps (left) ---
    s.add.text(MARGIN, barMid, '💰', { fontSize: `${Math.round(22 * SCALE)}px` })
      .setScrollFactor(0).setDepth(11).setOrigin(0, 0.5)

    this._scrapsText = s.add.text(MARGIN + Math.round(28 * SCALE), barMid, `${this.scraps}`, {
      fontSize: `${Math.round(22 * SCALE)}px`,
      fontFamily: FONT,
      color: '#FFD166',
    }).setScrollFactor(0).setDepth(11).setOrigin(0, 0.5)

    // --- Dirt meter (center) ---
    const dirtX = W / 2

    this._dirtLabel = s.add.text(dirtX, Math.round(10 * SCALE), '🏠 DIRT METER', {
      fontSize: `${Math.round(13 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#7FFFD4',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5, 0)

    this._dirtX = dirtX

    roundRect(s, dirtX, DIRT_Y, DIRT_W, DIRT_H, 8, 0x0D1B2A)
      .setScrollFactor(0).setDepth(11)

    this._dirtColor = 0x56CF7F
    this._dirtGfx = s.add.graphics().setScrollFactor(0).setDepth(12)
    this._drawDirtFill(1)

    this._dirtPct = s.add.text(dirtX, DIRT_Y, '100%', {
      fontSize: `${Math.round(12 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#ffffff',
    }).setScrollFactor(0).setDepth(13).setOrigin(0.5)

    // --- Wave counter (right) ---
    this._waveText = s.add.text(W - MARGIN, barMid, 'Wave 0 / 0', {
      fontSize: `${Math.round(22 * SCALE)}px`,
      fontFamily: FONT,
      color: '#B8C6DB',
    }).setScrollFactor(0).setDepth(11).setOrigin(1, 0.5)

    // --- Pause button ---
    const pauseW = Math.round(44 * SCALE)
    const pauseH = Math.round(36 * SCALE)
    const pauseX = W - Math.round(220 * SCALE)
    const pauseBg = roundRect(s, pauseX, barMid, pauseW, pauseH, 8, 0x2D4A6B, true)
      .setScrollFactor(0).setDepth(11)

    s.add.text(pauseX, barMid, '⏸', { fontSize: `${Math.round(18 * SCALE)}px` })
      .setScrollFactor(0).setDepth(12).setOrigin(0.5)

    pauseBg.on('pointerover', () => pauseBg.setFillStyle(0x3D6A9B))
    pauseBg.on('pointerout', () => pauseBg.setFillStyle(0x2D4A6B))
    pauseBg.on('pointerdown', () => s.events.emit('pauseGameRequest'))
  }

  // -----------------------------------------------------------
  // BOTTOM PANEL
  // -----------------------------------------------------------

  _buildBottomPanel() {
    const s = this.scene
    const panelH = BOT_H
    const panelY = H - panelH / 2

    s.add.rectangle(W / 2, panelY, W, panelH, 0x1E2A3A)
      .setScrollFactor(0).setDepth(9)

    s.add.rectangle(W / 2, H - panelH, W, 2, 0x2D4A6B)
      .setScrollFactor(0).setDepth(9)

    const leftReserve = Math.round(160 * SCALE)
    const rightReserve = Math.round(200 * SCALE)
    const GAP = Math.round(4 * SCALE)
    const usableW = W - leftReserve - rightReserve
    const btnW = Math.floor(usableW / 10) - GAP
    const startX = leftReserve + (usableW - (btnW + GAP) * 10) / 2 + btnW / 2

    this._catBtns = []

    CAT_PANEL.forEach((cat, i) => {
      const bx = startX + i * (btnW + GAP)

      const btn = roundRect(s, bx, panelY, btnW, panelH - Math.round(8 * SCALE), 6, 0x243344, true)
        .setScrollFactor(0).setDepth(10)

      s.add.text(bx, panelY, `${cat.label}\n${cat.cost}💰`, {
        fontSize: `${Math.round(11 * SCALE)}px`,
        fontFamily: FONT_BODY,
        color: cat.color,
        align: 'center',
        lineSpacing: 1,
      }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

      btn.on('pointerover', () => {
        if (this._selectedBtn !== btn) btn.setFillStyle(0x2D4A6B)
      })
      btn.on('pointerout', () => {
        if (this._selectedBtn !== btn) btn.setFillStyle(0x243344)
      })
      btn.on('pointerdown', () => {
        if (this._selectedBtn) this._selectedBtn.setFillStyle(0x243344)
        this._selectedBtn = btn
        btn.setFillStyle(0x2A6B3A)
        s.events.emit('catTypeSelected', cat.type)
      })

      this._catBtns.push(btn)
    })

    this._selectedBtn = this._catBtns[0]
    this._catBtns[0].setFillStyle(0x2A6B3A)

    // --- Speed control ---
    const speedX = W - Math.round(185 * SCALE)
    s.add.text(speedX, H - panelH + Math.round(10 * SCALE), '⚡ SPEED', {
      fontSize: `${Math.round(11 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#7FFFD4',
    }).setScrollFactor(0).setDepth(10).setOrigin(0.5, 0)

    const speeds = [
      { label: 'x1', value: 1 },
      { label: 'x3', value: 3 },
      { label: 'x5', value: 5 },
    ]

    this._speedBtns = []

    speeds.forEach((spd, i) => {
      const bx = speedX - Math.round(28 * SCALE) + i * Math.round(30 * SCALE)
      const by = panelY + Math.round(14 * SCALE)

      const bg = roundRect(s, bx, by, Math.round(26 * SCALE), Math.round(22 * SCALE), 4, spd.value === 1 ? 0x2A6B3A : 0x243344, true)
        .setScrollFactor(0).setDepth(10)

      const txt = s.add.text(bx, by, spd.label, {
        fontSize: `${Math.round(11 * SCALE)}px`,
        fontFamily: FONT_BODY,
        color: spd.value === 1 ? '#7FFFD4' : '#546e7a',
      }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

      bg.on('pointerdown', () => {
        SETTINGS.gameSpeed = spd.value
        this._speedBtns.forEach((btn, j) => {
          btn.bg.setFillStyle(speeds[j].value === spd.value ? 0x2A6B3A : 0x243344)
          btn.txt.setColor(speeds[j].value === spd.value ? '#7FFFD4' : '#546e7a')
        })
      })

      this._speedBtns.push({ bg, txt })
    })

    // --- Next Wave button ---
    const nextX = W - Math.round(70 * SCALE)
    this._btnBg = roundRect(s, nextX, panelY, Math.round(110 * SCALE), panelH - Math.round(12 * SCALE), 8, 0x2A6B3A, true)
      .setScrollFactor(0).setDepth(10)

    this._btnText = s.add.text(nextX, panelY, '▶ NEXT\nWAVE', {
      fontSize: `${Math.round(14 * SCALE)}px`,
      fontFamily: FONT,
      color: '#7FFFD4',
      align: 'center',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5)

    this._btnBg.on('pointerover', () => {
      this._btnBg.setFillStyle(0x3A8B4A)
      this._btnText.setColor('#ffffff')
    })
    this._btnBg.on('pointerout', () => {
      this._btnBg.setFillStyle(0x2A6B3A)
      this._btnText.setColor('#7FFFD4')
    })
    this._btnBg.on('pointerdown', () => {
      this.scene.events.emit('startNextWave')
    })
  }

  // -----------------------------------------------------------
  // SELECTED CAT PANEL (bottom left)
  // -----------------------------------------------------------

  _buildSelectedCatPanel() {
    const s = this.scene
    const panelH = BOT_H
    const panelCenterX = Math.round(80 * SCALE)
    const panelY = H - Math.round(40 * SCALE)

    roundRect(s, panelCenterX, H - panelH / 2, Math.round(150 * SCALE), panelH, 10, 0x243344)
      .setScrollFactor(0).setDepth(9)

    this._selectedCatText = s.add.text(panelCenterX, H - panelH + Math.round(10 * SCALE), 'Select a cat\nto place', {
      fontSize: `${Math.round(12 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#7890A8',
      align: 'center',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5, 0)

    const btnH = Math.round(20 * SCALE)

    this._upgradeBtn = roundRect(s, Math.round(48 * SCALE), panelY + Math.round(8 * SCALE), Math.round(64 * SCALE), btnH, 5, 0x2D4A9B, true)
      .setScrollFactor(0).setDepth(10).setVisible(false)

    this._upgradeTxt = s.add.text(Math.round(48 * SCALE), panelY + Math.round(8 * SCALE), '', {
      fontSize: `${Math.round(10 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#90CAF9',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._upgradeBtn.on('pointerdown', () => s.events.emit('upgradeSelectedCat'))

    this._adoptBtn = roundRect(s, Math.round(116 * SCALE), panelY + Math.round(8 * SCALE), Math.round(64 * SCALE), btnH, 5, 0x6B2A2A, true)
      .setScrollFactor(0).setDepth(10).setVisible(false)

    this._adoptTxt = s.add.text(Math.round(116 * SCALE), panelY + Math.round(8 * SCALE), '🏠 Adopt', {
      fontSize: `${Math.round(10 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#FF9A9A',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._adoptBtn.on('pointerdown', () => s.events.emit('adoptOutSelectedCat'))

    this._triggerBtn = roundRect(s, Math.round(80 * SCALE), panelY + Math.round(30 * SCALE), Math.round(140 * SCALE), btnH, 5, 0x6B2A9B, true)
      .setScrollFactor(0).setDepth(10).setVisible(false)

    this._triggerTxt = s.add.text(Math.round(80 * SCALE), panelY + Math.round(30 * SCALE), '', {
      fontSize: `${Math.round(10 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#D9A7FF',
    }).setScrollFactor(0).setDepth(11).setOrigin(0.5).setVisible(false)

    this._triggerBtn.on('pointerdown', () => s.events.emit('triggerSelectedCat'))
  }

  // -----------------------------------------------------------
  // PAUSE MENU
  // -----------------------------------------------------------

  showPauseMenu() {
    const s = this.scene

    this._pauseMenuItems = []

    const overlay = s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(40)
    this._pauseMenuItems.push(overlay)

    const panel = roundRect(s, W / 2, H / 2, Math.round(400 * SCALE), Math.round(500 * SCALE), 16, 0x1E2A3A)
      .setScrollFactor(0).setDepth(41)
    this._pauseMenuItems.push(panel)

    const catDeco = s.add.text(W / 2, H / 2 - Math.round(240 * SCALE), '😾', {
      fontSize: `${Math.round(40 * SCALE)}px`,
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5)
    this._pauseMenuItems.push(catDeco)

    s.tweens.add({
      targets: catDeco,
      y: H / 2 - Math.round(252 * SCALE),
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this._pauseMenuItems.push(s.add.text(W / 2, H / 2 - Math.round(200 * SCALE), 'PAUSED', {
      fontSize: `${Math.round(36 * SCALE)}px`,
      fontFamily: FONT,
      color: '#FFD166',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5))

    this._pauseMenuItems.push(s.add.text(W / 2, H / 2 - Math.round(165 * SCALE), 'The dirt awaits your return.', {
      fontSize: `${Math.round(14 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#7890A8',
    }).setScrollFactor(0).setDepth(42).setOrigin(0.5))

    this._pauseMenuItems.push(...this._makePauseBtn(
      W / 2, H / 2 - Math.round(110 * SCALE), '▶  RESUME', '#7FFFD4', 0x2A6B3A,
      () => s.events.emit('resumeGame')
    ))

    this._pauseMenuItems.push(...this._makePauseBtn(
      W / 2, H / 2 - Math.round(55 * SCALE), '↺  RESTART', '#90CAF9', 0x2D4A9B,
      () => { this.hidePauseMenu(); s.scene.restart() }
    ))

    const soundLabel = () => `🔊 SFX: ${SETTINGS.sfxOn ? 'ON ✓' : 'OFF ✗'}`
    const [sBg, sTxt] = this._makePauseBtn(
      W / 2, H / 2, soundLabel(), '#C8D6E5', 0x243344,
      () => { SETTINGS.sfxOn = !SETTINGS.sfxOn; sTxt.setText(soundLabel()) }
    )
    this._pauseMenuItems.push(sBg, sTxt)

    const musicLabel = () => `🎵 Music: ${SETTINGS.musicOn ? 'ON ✓' : 'OFF ✗'}`
    const [mBg, mTxt] = this._makePauseBtn(
      W / 2, H / 2 + Math.round(55 * SCALE), musicLabel(), '#C8D6E5', 0x243344,
      () => { SETTINGS.musicOn = !SETTINGS.musicOn; mTxt.setText(musicLabel()) }
    )
    this._pauseMenuItems.push(mBg, mTxt)

    const autoLabel = () => `⏭️  Auto Wave: ${SETTINGS.autoPlay ? 'ON ✓' : 'OFF ✗'}`
    const [aBg, aTxt] = this._makePauseBtn(
      W / 2, H / 2 + Math.round(110 * SCALE), autoLabel(), '#C8D6E5', 0x243344,
      () => { SETTINGS.autoPlay = !SETTINGS.autoPlay; aTxt.setText(autoLabel()) }
    )
    this._pauseMenuItems.push(aBg, aTxt)

    this._pauseMenuItems.push(...this._makePauseBtn(
      W / 2, H / 2 + Math.round(175 * SCALE), '⬅  MAIN MENU', '#FF9A9A', 0x6B2A2A,
      () => { this.hidePauseMenu(); this._showQuitConfirm() }
    ))

    this._pauseMenuItems.push(s.add.text(W / 2, H / 2 + Math.round(225 * SCALE), 'Press ESC to resume', {
      fontSize: `${Math.round(12 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#37474f',
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
    const bg = roundRect(s, x, y, Math.round(320 * SCALE), Math.round(44 * SCALE), 8, bgColor, true)
      .setScrollFactor(0).setDepth(42)

    const txt = s.add.text(x, y, label, {
      fontSize: `${Math.round(16 * SCALE)}px`,
      fontFamily: FONT,
      color: textColor,
    }).setScrollFactor(0).setDepth(43).setOrigin(0.5)

    bg.on('pointerover', () => { bg.setAlpha(0.8); txt.setScale(1.04) })
    bg.on('pointerout', () => { bg.setAlpha(1); txt.setScale(1) })
    bg.on('pointerdown', onClick)

    return [bg, txt]
  }

  _showQuitConfirm() {
    const s = this.scene
    const items = []

    const overlay = s.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(50)
    items.push(overlay)

    const panel = roundRect(s, W / 2, H / 2, Math.round(400 * SCALE), Math.round(260 * SCALE), 16, 0x1E2A3A)
      .setScrollFactor(0).setDepth(51)
    items.push(panel)

    items.push(s.add.text(W / 2, H / 2 - Math.round(90 * SCALE), '😿  ABANDON THE DIRT?', {
      fontSize: `${Math.round(22 * SCALE)}px`,
      fontFamily: FONT,
      color: '#FF9A9A',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5))

    items.push(s.add.text(W / 2, H / 2 - Math.round(45 * SCALE), 'The vacuums will win.\nThe dirt will be lost forever.', {
      fontSize: `${Math.round(14 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#7890A8',
      align: 'center',
    }).setScrollFactor(0).setDepth(52).setOrigin(0.5))

    const cleanup = () => items.forEach(i => i.destroy())

    const yesBg = roundRect(s, W / 2 - Math.round(90 * SCALE), H / 2 + Math.round(50 * SCALE), Math.round(150 * SCALE), Math.round(44 * SCALE), 8, 0x6B2A2A, true)
      .setScrollFactor(0).setDepth(52)
    const yesTxt = s.add.text(W / 2 - Math.round(90 * SCALE), H / 2 + Math.round(50 * SCALE), 'ABANDON', {
      fontSize: `${Math.round(16 * SCALE)}px`, fontFamily: FONT, color: '#FF9A9A',
    }).setScrollFactor(0).setDepth(53).setOrigin(0.5)
    items.push(yesBg, yesTxt)
    yesBg.on('pointerdown', () => { cleanup(); s.scene.start('MainMenuScene') })

    const noBg = roundRect(s, W / 2 + Math.round(90 * SCALE), H / 2 + Math.round(50 * SCALE), Math.round(150 * SCALE), Math.round(44 * SCALE), 8, 0x2A6B3A, true)
      .setScrollFactor(0).setDepth(52)
    const noTxt = s.add.text(W / 2 + Math.round(90 * SCALE), H / 2 + Math.round(50 * SCALE), 'STAY & FIGHT', {
      fontSize: `${Math.round(16 * SCALE)}px`, fontFamily: FONT, color: '#7FFFD4',
    }).setScrollFactor(0).setDepth(53).setOrigin(0.5)
    items.push(noBg, noTxt)
    noBg.on('pointerdown', () => { cleanup(); this.showPauseMenu() })
  }

  // -----------------------------------------------------------
  // Cat chatter
  // -----------------------------------------------------------

  _startCatChatter() {
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
    const yOff = Math.round(40 * SCALE)
    const bubble = s.add.text(x, y - yOff, `💬 ${text}`, {
      fontSize: `${Math.round(12 * SCALE)}px`,
      fontFamily: FONT_BODY,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#1E2A3Acc',
      padding: { x: Math.round(6 * SCALE), y: Math.round(4 * SCALE) },
    }).setOrigin(0.5, 1).setDepth(18)

    s.tweens.add({
      targets: bubble,
      y: y - Math.round(70 * SCALE),
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
      this._scrapsText.setColor(scraps < 50 ? '#FF6B6B' : '#FFD166')
    })

    this.scene.events.on('dirtChanged', (dirt) => {
      this.dirt = dirt
      const ratio = Math.max(0, dirt / DIRT.maxDirt)
      this._dirtColor = ratio > 0.6 ? 0x56CF7F : ratio > 0.3 ? 0xFFAA33 : 0xFF5555
      this._drawDirtFill(ratio)
      this._dirtPct.setText(`${Math.round(ratio * 100)}%`)

      if (ratio < 0.3 && !this._dirtPulsing) {
        this._dirtPulsing = true
        this._dirtLabel.setText('😱 THE DIRT IS FADING!')
        this._dirtLabel.setColor('#FF5555')
        this.scene.tweens.add({
          targets: this._dirtGfx,
          alpha: 0.4,
          duration: 350,
          yoyo: true,
          repeat: -1,
        })
      } else if (ratio >= 0.3 && this._dirtPulsing) {
        this._dirtPulsing = false
        this._dirtLabel.setText('🏠 DIRT METER')
        this._dirtLabel.setColor('#7FFFD4')
        this.scene.tweens.killTweensOf(this._dirtGfx)
        this._dirtGfx.setAlpha(1)
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
        W / 2, H / 2 - Math.round(50 * SCALE),
        `WAVE ${wave}`,
        {
          fontSize: `${Math.round(80 * SCALE)}px`,
          fontFamily: FONT,
          color: '#FFD166',
          stroke: '#000000',
          strokeThickness: 6,
        }
      ).setScrollFactor(0).setDepth(30).setOrigin(0.5).setAlpha(0)

      const sub = this.scene.add.text(
        W / 2, H / 2 + Math.round(40 * SCALE),
        subtitle,
        {
          fontSize: `${Math.round(20 * SCALE)}px`,
          fontFamily: FONT_BODY,
          color: '#B8C6DB',
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
        onComplete: () => { announcement.destroy(); sub.destroy() },
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
        .setText(`${cat.name}${stars}\nDmg: ${cat.damage}  Rng: ${cat.range}`)
        .setColor('#C8D6E5')

      if (upgCost) {
        this._upgradeTxt.setText(`⬆ ${upgCost}💰`)
        this._upgradeTxt.setColor(this.scraps >= upgCost ? '#90CAF9' : '#FF6B6B')
      } else {
        this._upgradeTxt.setText('MAX ★★★★★')
        this._upgradeTxt.setColor('#FFD166')
      }
      this._upgradeBtn.setVisible(true)
      this._upgradeTxt.setVisible(true)
      this._adoptBtn.setVisible(true)
      this._adoptTxt.setVisible(true)

      if (cat.canTrigger()) {
        const cooldownLeft = Math.ceil(cat._triggerCooldown / 1000)
        this._triggerTxt.setText(cooldownLeft > 0 ? `⚡ TRIGGER (${cooldownLeft}s)` : '⚡ TRIGGER!')
        this._triggerTxt.setColor(cat._triggerCooldown <= 0 ? '#FFD166' : '#546e7a')
        this._triggerBtn.setVisible(true)
        this._triggerTxt.setVisible(true)
      } else {
        this._triggerBtn.setVisible(false)
        this._triggerTxt.setVisible(false)
      }
    })

    this.scene.events.on('catDeselected', () => {
      this._selectedCatText.setText('Select a cat\nto place').setColor('#7890A8')
      this._upgradeBtn.setVisible(false)
      this._upgradeTxt.setVisible(false)
      this._adoptBtn.setVisible(false)
      this._adoptTxt.setVisible(false)
      this._triggerBtn.setVisible(false)
      this._triggerTxt.setVisible(false)
    })

    this.scene.events.on('awaitingTriggerTarget', () => {
      this._triggerTxt.setText('🎯 Click target on map...')
      this._triggerTxt.setColor('#FFB347')
    })
  }

  _drawDirtFill(ratio) {
    const w = Math.max(0, DIRT_W * ratio)
    const left = this._dirtX - DIRT_W / 2
    const top = DIRT_Y - DIRT_H / 2
    this._dirtGfx.clear()
    if (w > 1) {
      this._dirtGfx.fillStyle(this._dirtColor)
      this._dirtGfx.fillRoundedRect(left, top, w, DIRT_H, Math.min(8, w / 2))
    }
  }
}
