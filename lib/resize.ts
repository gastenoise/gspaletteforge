/**
 * Calculate resized dimensions following the specification:
 * - Scale uniformly so larger side ≤ maxSize
 * - Snap both dimensions to nearest multiple of 16
 * - If rounding up exceeds maxSize, use floor for that dimension
 * - Minimum dimension is 16
 */
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  // Determine scaling factor
  const largerSide = Math.max(originalWidth, originalHeight)
  const scale = maxSize / largerSide
  
  // Scale both dimensions
  let width = (scale < 1) ? (originalWidth * scale) : originalWidth;
  let height = (scale < 1) ? (originalHeight * scale) : originalHeight;
  
  // Snap to nearest multiple of 16
  width = snapToMultiple16(width, maxSize)
  height = snapToMultiple16(height, maxSize)
  
  // Ensure minimum dimension
  width = Math.max(16, width)
  height = Math.max(16, height)
  
  return { width, height }
}

/**
 * Snap dimension to nearest multiple of 16
 * If rounding up would exceed maxSize, use floor instead
 */
function snapToMultiple16(dimension: number, maxSize: number): number {
  const rounded = Math.round(dimension / 16) * 16
  
  if (rounded > maxSize) {
    return Math.floor(dimension / 16) * 16
  }
  
  return rounded
}
