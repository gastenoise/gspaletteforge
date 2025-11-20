/**
 * Nearest-neighbor resize - Preserves exact colors, no blending
 * Best for pixel art and when you want to preserve color fidelity
 */

export async function resizeImageNearest(
  sourceData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): Promise<Uint8ClampedArray> {
  const result = new Uint8ClampedArray(targetWidth * targetHeight * 4)
  
  const xRatio = sourceWidth / targetWidth
  const yRatio = sourceHeight / targetHeight
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      // Find nearest source pixel
      const srcX = Math.floor(x * xRatio)
      const srcY = Math.floor(y * yRatio)
      
      const srcIndex = (srcY * sourceWidth + srcX) * 4
      const dstIndex = (y * targetWidth + x) * 4
      
      // Copy pixel exactly - no blending
      result[dstIndex] = sourceData[srcIndex]
      result[dstIndex + 1] = sourceData[srcIndex + 1]
      result[dstIndex + 2] = sourceData[srcIndex + 2]
      result[dstIndex + 3] = sourceData[srcIndex + 3]
    }
  }
  
  return result
}
