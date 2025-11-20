/**
 * Enhanced Lanczos resampling for highest quality image resizing
 * Optimized with better kernel and edge handling
 */

function lanczosKernel(x: number, a: number = 3): number {
  if (x === 0) return 1
  if (Math.abs(x) >= a) return 0
  
  const piX = Math.PI * x
  const piXOverA = piX / a
  
  return (Math.sin(piX) / piX) * (Math.sin(piXOverA) / piXOverA)
}

/**
 * Get pixel value using optimized Lanczos interpolation
 */
function getLanczosPixel(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  channel: number,
  a: number = 3
): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  
  let sum = 0
  let weightSum = 0
  
  // Sample a×a neighborhood with optimized bounds
  const xStart = Math.max(0, xi - a + 1)
  const xEnd = Math.min(width - 1, xi + a)
  const yStart = Math.max(0, yi - a + 1)
  const yEnd = Math.min(height - 1, yi + a)
  
  for (let j = yStart; j <= yEnd; j++) {
    const dy = y - j
    const yWeight = lanczosKernel(dy, a)
    
    for (let i = xStart; i <= xEnd; i++) {
      const dx = x - i
      const xWeight = lanczosKernel(dx, a)
      const weight = xWeight * yWeight
      
      if (weight !== 0) {
        const idx = (j * width + i) * 4 + channel
        const pixelValue = data[idx]
        
        sum += pixelValue * weight
        weightSum += weight
      }
    }
  }
  
  return weightSum > 0 ? Math.max(0, Math.min(255, Math.round(sum / weightSum))) : 0
}

/**
 * Resize image using enhanced Lanczos resampling - highest quality available
 */
export function resizeImageLanczos(
  sourceData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): Uint8ClampedArray {
  const targetData = new Uint8ClampedArray(targetWidth * targetHeight * 4)
  const xRatio = (sourceWidth - 1) / targetWidth
  const yRatio = (sourceHeight - 1) / targetHeight
  
  // Use Lanczos-3 for best quality
  const a = 3
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio
      const srcY = y * yRatio
      const targetIdx = (y * targetWidth + x) * 4
      
      // Interpolate each channel (R, G, B)
      for (let c = 0; c < 3; c++) {
        targetData[targetIdx + c] = getLanczosPixel(
          sourceData,
          srcX,
          srcY,
          sourceWidth,
          sourceHeight,
          c,
          a
        )
      }
      
      // Alpha channel - preserve or set to opaque
      const alphaValue = getLanczosPixel(sourceData, srcX, srcY, sourceWidth, sourceHeight, 3, a)
      targetData[targetIdx + 3] = alphaValue
    }
  }
  
  return targetData
}
