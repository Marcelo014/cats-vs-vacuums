import * as Phaser from 'phaser'

export function roundRect(scene, x, y, w, h, r, fillColor, interactive = false) {
  const gfx = scene.add.graphics()
  let _fill = fillColor
  let _stroke = null
  let _strokeW = 1
  let _strokeAlpha = 1

  const draw = () => {
    gfx.clear()
    if (_fill !== null && _fill !== undefined) {
      gfx.fillStyle(_fill)
      gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, r)
    }
    if (_stroke !== null) {
      gfx.lineStyle(_strokeW, _stroke, _strokeAlpha)
      gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r)
    }
  }

  draw()

  if (interactive) {
    gfx.setInteractive(
      new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    )
    gfx.input.cursor = 'pointer'
  }

  gfx.setFillStyle = (color) => { _fill = color; draw(); return gfx }
  gfx.setStrokeStyle = (width, color, alpha = 1) => {
    _strokeW = width; _stroke = color; _strokeAlpha = alpha; draw(); return gfx
  }

  return gfx
}
