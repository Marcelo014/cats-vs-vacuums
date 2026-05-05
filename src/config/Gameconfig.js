export const GAME = {
  width:  1920,
  height: 1080,
}

const _S = GAME.width / 1280  // spatial scale factor (1.5 for 1920x1080)

export const DIRT = {
  maxDirt: 100,
  dirtLostPerVacuum: 10,
}

export const ECONOMY = {
  startingScraps: 99999,
}

export const TEST_PATH_WAYPOINTS = [
  { x: 0,                   y: GAME.height * 0.500 },
  { x: GAME.width  * 0.195, y: GAME.height * 0.500 },
  { x: GAME.width  * 0.195, y: GAME.height * 0.278 },
  { x: GAME.width  * 0.469, y: GAME.height * 0.278 },
  { x: GAME.width  * 0.469, y: GAME.height * 0.722 },
  { x: GAME.width  * 0.742, y: GAME.height * 0.722 },
  { x: GAME.width  * 0.742, y: GAME.height * 0.500 },
  { x: GAME.width,          y: GAME.height * 0.500 },
]

export const UPGRADE_COSTS = [75, 125, 200, 350, 500]

export const SETTINGS = {
  musicOn: true,
  sfxOn: true,
  autoPlay: false,
  gameSpeed: 1,
}

export const VACUUMS = {
  zoomba: {
    name: 'Zoomba',
    emoji: '🤖',
    hp: 80,
    speed: Math.round(80 * _S),
    dirtDamage: 10,
    scrapDrop: 10,
    color: 0xbdbdbd,
    radius: Math.round(16 * _S),
  },
  turbo_zoomba: {
    name: 'Turbo Zoomba',
    emoji: '💨',
    hp: 40,
    speed: Math.round(180 * _S),
    dirtDamage: 10,
    scrapDrop: 15,
    color: 0x42a5f5,
    radius: Math.round(14 * _S),
  },
  aquaclean: {
    name: 'Aquaclean',
    emoji: '💧',
    hp: 200,
    speed: Math.round(150 * _S),
    dirtDamage: 15,
    scrapDrop: 20,
    color: 0x26c6da,
    radius: Math.round(18 * _S),
  },
  gulper: {
    name: 'Gulper',
    emoji: '😈',
    hp: 300,
    speed: Math.round(50 * _S),
    dirtDamage: 20,
    scrapDrop: 25,
    spawnsOnDeath: 3,
    color: 0xef5350,
    radius: Math.round(24 * _S),
  },
  phantavac: {
    name: 'Phantavac',
    emoji: '👻',
    hp: 120,
    speed: Math.round(90 * _S),
    dirtDamage: 10,
    scrapDrop: 20,
    immune: ['hairball'],
    color: 0xab47bc,
    radius: Math.round(16 * _S),
  },
  megaclean: {
    name: 'Megaclean',
    emoji: '💀',
    hp: 2000,
    speed: Math.round(20 * _S),
    dirtDamage: 50,
    scrapDrop: 100,
    color: 0xffd700,
    radius: Math.round(40 * _S),
  },
}

export const CATS = {
  kitten: {
    name: 'Kitten',
    emoji: '🐱',
    cost: 50,
    damage: 15,
    range: Math.round(80 * _S),
    fireRate: 600,
    color: 0xf9a825,
    radius: Math.round(18 * _S),
  },
  tabby: {
    name: 'Tabby',
    emoji: '🐈',
    cost: 125,
    damage: 25,
    range: Math.round(110 * _S),
    fireRate: 900,
    color: 0xe67e22,
    radius: Math.round(20 * _S),
  },
  alley_cat: {
    name: 'Alley Cat',
    emoji: '😼',
    cost: 75,
    damage: 10,
    range: Math.round(90 * _S),
    fireRate: 300,
    color: 0x95a5a6,
    radius: Math.round(18 * _S),
  },
  siamese: {
    name: 'Siamese',
    emoji: '🐈',
    cost: 200,
    damage: 30,
    range: Math.round(160 * _S),
    fireRate: 1200,
    color: 0xdce8f0,
    radius: Math.round(22 * _S),
  },
  maine_coon: {
    name: 'Maine Coon',
    emoji: '🦁',
    cost: 225,
    damage: 70,
    range: Math.round(120 * _S),
    fireRate: 2500,
    color: 0x8d6e63,
    radius: Math.round(26 * _S),
  },
  persian: {
    name: 'Persian',
    emoji: '👑',
    cost: 150,
    damage: 8,
    range: Math.round(100 * _S),
    fireRate: 400,
    color: 0xce93d8,
    radius: Math.round(20 * _S),
  },
  bengal: {
    name: 'Bengal',
    emoji: '🐯',
    cost: 250,
    damage: 35,
    range: Math.round(600 * _S),
    fireRate: 1500,
    color: 0xff8f00,
    radius: Math.round(22 * _S),
  },
  ragdoll: {
    name: 'Ragdoll',
    emoji: '💤',
    cost: 175,
    damage: 40,
    range: Math.round(200 * _S),
    fireRate: 2000,
    color: 0xfce4ec,
    radius: Math.round(22 * _S),
  },
  chonk: {
    name: 'Chonk',
    emoji: '🐾',
    cost: 150,
    damage: 50,
    range: Math.round(70 * _S),
    fireRate: 1800,
    color: 0x4db6ac,
    radius: Math.round(30 * _S),
  },
  tuxedo: {
    name: 'Tuxedo Cat',
    emoji: '🎩',
    cost: 300,
    damage: 0,
    range: Math.round(120 * _S),
    fireRate: 0,
    color: 0x424242,
    radius: Math.round(22 * _S),
  },
}
