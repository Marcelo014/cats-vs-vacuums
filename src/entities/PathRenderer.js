import { GAME } from '../config/GameConfig.js'

const _S = GAME.width / 1280

export default class PathRenderer {
  constructor(scene, waypoints, pathWidth = Math.round(60 * _S)) {
    this.scene = scene
    this.waypoints = waypoints
    this.pathWidth = pathWidth

    this._draw()
  }

  _draw() {
    const g = this.scene.add.graphics()
    g.setDepth(-1)

    g.lineStyle(this.pathWidth, 0x5d4037, 1)
    g.beginPath()
    g.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      g.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    g.strokePath()

    g.lineStyle(this.pathWidth - Math.round(10 * _S), 0x795548, 0.6)
    g.beginPath()
    g.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      g.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    g.strokePath()

    const start = this.waypoints[0]
    const end = this.waypoints[this.waypoints.length - 1]

    this.scene.add.text(start.x + Math.round(10 * _S), start.y - Math.round(40 * _S), '▶ ENTRY', {
      fontSize: `${Math.round(12 * _S)}px`,
      color: '#ef9a9a',
      fontFamily: 'Fredoka One',
    })

    this.scene.add.text(end.x - Math.round(100 * _S), end.y - Math.round(40 * _S), '🏁 DIRTY AREA', {
      fontSize: `${Math.round(12 * _S)}px`,
      color: '#a5d6a7',
      fontFamily: 'Fredoka One',
    })
  }

  isOnPath(x, y, minDistance = null) {
    const threshold = minDistance ?? (this.pathWidth / 2 + 10)
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const a = this.waypoints[i]
      const b = this.waypoints[i + 1]
      if (this._pointToSegmentDist(x, y, a.x, a.y, b.x, b.y) < threshold) {
        return true
      }
    }
    return false
  }

  _pointToSegmentDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax
    const dy = by - ay
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.hypot(px - ax, py - ay)
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
  }
}
