/**
 * Bicubic interpolation for high-quality image resizing
 * Provides much better quality than bilinear interpolation
 */

function cubicInterpolate(p: number[]): number {
  return p[1] + 0.5 * (p[2] - p[0] + (2.0 * p[0] - 5.0 * p[1] + 4.0 * p[2] - p[3] + (3.0 * (p[1] - p[2]) + p[3] - p[0])))
}

function getBicubicPixel(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  channel: number
): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const dx = x - xi
  const dy = y - yi

  const pixels: number[][] = []

  // Get 4x4 neighborhood
  for (let j = -1; j <= 2; j++) {
    const row: number[] = []
    for (let i = -1; i <= 2; i++) {
      const px = Math.max(0, Math.min(width - 1, xi + i))
      const py = Math.max(0, Math.min(height - 1, yi + j))
      const idx = (py * width + px) * 4 + channel
      row.push(data[idx])
    }
    pixels.push(row)
  }

  // Interpolate in x direction
  const cols: number[] = []
  for (let j = 0; j < 4; j++) {
    cols.push(cubicInterpolate([
      pixels[j][0],
      pixels[j][1],
      pixels[j][2],
      pixels[j][3]
    ]))
  }

  // Interpolate in y direction
  return Math.max(0, Math.min(255, cubicInterpolate(cols)))
}

/**
 * Resize image using bicubic interpolation for high quality results
 */
export function resizeImageBicubic(
  sourceData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): Uint8ClampedArray {
  const targetData = new Uint8ClampedArray(targetWidth * targetHeight * 4)
  const xRatio = sourceWidth / targetWidth
  const yRatio = sourceHeight / targetHeight

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio
      const srcY = y * yRatio
      const targetIdx = (y * targetWidth + x) * 4

      // Interpolate each channel (R, G, B)
      for (let c = 0; c < 3; c++) {
        targetData[targetIdx + c] = getBicubicPixel(
          sourceData,
          srcX,
          srcY,
          sourceWidth,
          sourceHeight,
          c
        )
      }

      // Alpha channel
      targetData[targetIdx + 3] = 255
    }
  }

  return targetData
}
