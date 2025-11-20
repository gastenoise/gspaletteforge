/**
 * Hermite interpolation for high-quality image resizing
 * Good balance between quality and performance
 */

function hermite(t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return 2 * t3 - 3 * t2 + 1
}

/**
 * Get pixel value using Hermite interpolation
 */
function getHermitePixel(
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
  
  // Get 2x2 neighborhood
  const x0 = Math.max(0, Math.min(width - 1, xi))
  const x1 = Math.max(0, Math.min(width - 1, xi + 1))
  const y0 = Math.max(0, Math.min(height - 1, yi))
  const y1 = Math.max(0, Math.min(height - 1, yi + 1))
  
  // Get pixel values
  const p00 = data[(y0 * width + x0) * 4 + channel]
  const p10 = data[(y0 * width + x1) * 4 + channel]
  const p01 = data[(y1 * width + x0) * 4 + channel]
  const p11 = data[(y1 * width + x1) * 4 + channel]
  
  // Hermite interpolation
  const wx = hermite(dx)
  const wy = hermite(dy)
  
  const top = p00 * (1 - wx) + p10 * wx
  const bottom = p01 * (1 - wx) + p11 * wx
  
  return top * (1 - wy) + bottom * wy
}

/**
 * Resize image using Hermite interpolation
 */
export function resizeImageHermite(
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
        targetData[targetIdx + c] = getHermitePixel(
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
