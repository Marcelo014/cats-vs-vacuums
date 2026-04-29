export default class PathRenderer {
  constructor(scene, waypoints, pathWidth = 60) {
    this.scene = scene
    this.waypoints = waypoints
    this.pathWidth = pathWidth

    this._draw()
  }

  _draw() {
    const g = this.scene.add.graphics()
    g.setDepth(-1)

    // Path base
    g.lineStyle(this.pathWidth, 0x5d4037, 1)
    g.beginPath()
    g.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      g.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    g.strokePath()

    // Path highlight
    g.lineStyle(this.pathWidth - 10, 0x795548, 0.6)
    g.beginPath()
    g.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      g.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    g.strokePath()

    // Entry and exit labels
    const start = this.waypoints[0]
    const end = this.waypoints[this.waypoints.length - 1]

    this.scene.add.text(start.x + 10, start.y - 40, '▶ ENTRY', {
      fontSize: '12px',
      color: '#ef9a9a',
      fontFamily: 'monospace',
    })

    this.scene.add.text(end.x - 100, end.y - 40, '🏁 DIRTY AREA', {
      fontSize: '12px',
      color: '#a5d6a7',
      fontFamily: 'monospace',
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