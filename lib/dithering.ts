import { Color } from './types'
import { findNearestColor } from './quantization'

/**
 * Floyd-Steinberg Dithering
 * Diffuses quantization error to neighboring pixels:
 *       X   7/16
 *  3/16 5/16 1/16
 */
export function floydSteinbergDither(
  imageData: ImageData,
  palette: Color[]
): Uint8Array {
  const { width, height } = imageData
  const indexedPixels = new Uint8Array(width * height)
  
  // Create working copy of image data for error diffusion
  const workingData = new Float32Array(imageData.data.length)
  for (let i = 0; i < imageData.data.length; i++) {
    workingData[i] = imageData.data[i]
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x
      const dataIndex = pixelIndex * 4
      
      // Get current pixel color
      const oldColor: Color = {
        r: Math.round(Math.max(0, Math.min(255, workingData[dataIndex]))),
        g: Math.round(Math.max(0, Math.min(255, workingData[dataIndex + 1]))),
        b: Math.round(Math.max(0, Math.min(255, workingData[dataIndex + 2])))
      }
      
      // Find nearest palette color
      const paletteIndex = findNearestColor(oldColor, palette)
      indexedPixels[pixelIndex] = paletteIndex
      
      const newColor = palette[paletteIndex]
      
      // Calculate quantization error
      const errorR = oldColor.r - newColor.r
      const errorG = oldColor.g - newColor.g
      const errorB = oldColor.b - newColor.b
      
      // Diffuse error to neighboring pixels
      distributeError(workingData, width, height, x + 1, y, errorR, errorG, errorB, 7 / 16)
      distributeError(workingData, width, height, x - 1, y + 1, errorR, errorG, errorB, 3 / 16)
      distributeError(workingData, width, height, x, y + 1, errorR, errorG, errorB, 5 / 16)
      distributeError(workingData, width, height, x + 1, y + 1, errorR, errorG, errorB, 1 / 16)
    }
  }
  
  return indexedPixels
}

function distributeError(
  data: Float32Array,
  width: number,
  height: number,
  x: number,
  y: number,
  errorR: number,
  errorG: number,
  errorB: number,
  factor: number
): void {
  if (x < 0 || x >= width || y < 0 || y >= height) return
  
  const index = (y * width + x) * 4
  data[index] += errorR * factor
  data[index + 1] += errorG * factor
  data[index + 2] += errorB * factor
}
