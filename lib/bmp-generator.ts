import { Color } from './types'

/**
 * Generate a valid BMP v3 file with 8-bit indexed color
 * 
 * Structure:
 * - BMP File Header (14 bytes)
 * - DIB Header / BITMAPINFOHEADER (40 bytes)
 * - Color Table (1024 bytes for 256 colors × 4 bytes RGBQUAD)
 * - Pixel Data (row-padded, bottom-up)
 * 
 * Enhanced validation and error handling for production
 */
export function generateBMP(
  width: number,
  height: number,
  palette: Color[],
  indexedPixels: Uint8Array
): Blob {
  if (width <= 0 || height <= 0) {
    throw new Error('Invalid dimensions: width and height must be positive')
  }
  if (palette.length === 0 || palette.length > 256) {
    throw new Error('Invalid palette: must contain 1-256 colors')
  }
  if (indexedPixels.length !== width * height) {
    throw new Error('Invalid pixel data: length must match width × height')
  }
  
  // Ensure palette has exactly 256 colors (pad if necessary)
  const fullPalette = [...palette]
  while (fullPalette.length < 256) {
    fullPalette.push({ r: 0, g: 0, b: 0 })
  }
  
  for (let i = 0; i < indexedPixels.length; i++) {
    if (indexedPixels[i] >= palette.length) {
      console.warn(`[v0] Pixel ${i} has invalid index ${indexedPixels[i]}, clamping to ${palette.length - 1}`)
      indexedPixels[i] = palette.length - 1
    }
  }
  
  // Calculate row padding (rows must be multiple of 4 bytes)
  const rowSize = width
  const paddedRowSize = Math.ceil(rowSize / 4) * 4
  const padding = paddedRowSize - rowSize
  
  // Calculate file size
  const pixelDataSize = paddedRowSize * height
  const colorTableSize = 256 * 4 // 256 colors × 4 bytes (RGBQUAD)
  const dibHeaderSize = 40
  const fileHeaderSize = 14
  const fileSize = fileHeaderSize + dibHeaderSize + colorTableSize + pixelDataSize
  
  // Create buffer
  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)
  let offset = 0
  
  // === BMP File Header (14 bytes) ===
  view.setUint8(offset++, 0x42) // 'B'
  view.setUint8(offset++, 0x4D) // 'M'
  view.setUint32(offset, fileSize, true); offset += 4 // File size
  view.setUint16(offset, 0, true); offset += 2 // Reserved
  view.setUint16(offset, 0, true); offset += 2 // Reserved
  view.setUint32(offset, fileHeaderSize + dibHeaderSize + colorTableSize, true); offset += 4 // Pixel data offset
  
  // === DIB Header / BITMAPINFOHEADER (40 bytes) ===
  view.setUint32(offset, dibHeaderSize, true); offset += 4 // Header size
  view.setInt32(offset, width, true); offset += 4 // Width
  view.setInt32(offset, height, true); offset += 4 // Height (positive = bottom-up)
  view.setUint16(offset, 1, true); offset += 2 // Color planes
  view.setUint16(offset, 8, true); offset += 2 // Bits per pixel (8-bit indexed)
  view.setUint32(offset, 0, true); offset += 4 // Compression (0 = none)
  view.setUint32(offset, pixelDataSize, true); offset += 4 // Image size
  view.setInt32(offset, 2835, true); offset += 4 // X pixels per meter (~72 DPI)
  view.setInt32(offset, 2835, true); offset += 4 // Y pixels per meter
  view.setUint32(offset, 256, true); offset += 4 // Colors in palette
  view.setUint32(offset, 0, true); offset += 4 // Important colors (0 = all)
  
  // === Color Table (1024 bytes) ===
  for (const color of fullPalette) {
    const r = Math.max(0, Math.min(255, Math.round(color.r)))
    const g = Math.max(0, Math.min(255, Math.round(color.g)))
    const b = Math.max(0, Math.min(255, Math.round(color.b)))
    
    view.setUint8(offset++, b) // Blue
    view.setUint8(offset++, g) // Green
    view.setUint8(offset++, r) // Red
    view.setUint8(offset++, 0) // Reserved
  }
  
  // === Pixel Data (bottom-up, row-padded) ===
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x
      view.setUint8(offset++, indexedPixels[pixelIndex])
    }
    // Add row padding
    for (let p = 0; p < padding; p++) {
      view.setUint8(offset++, 0)
    }
  }
  
  return new Blob([buffer], { type: 'image/bmp' })
}
