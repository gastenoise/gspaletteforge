/**
 * Progressive high-quality resizing with color preservation
 * Uses downsampling in steps with optional sharpening
 */

export async function resizeImageProgressive(
  sourceData: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  enableSharpening: boolean = false
): Promise<Uint8ClampedArray> {
  // Create source canvas
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = sourceWidth
  sourceCanvas.height = sourceHeight
  const sourceCtx = sourceCanvas.getContext('2d', { 
    willReadFrequently: true,
    alpha: true 
  })
  if (!sourceCtx) throw new Error('Failed to get source canvas context')
  
  const sourceImageData = new ImageData(sourceData, sourceWidth, sourceHeight)
  sourceCtx.putImageData(sourceImageData, 0, 0)
  
  const scaleRatio = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
  
  // For large downscaling, use progressive steps
  if (scaleRatio < 0.5) {
    let currentCanvas = sourceCanvas
    let currentWidth = sourceWidth
    let currentHeight = sourceHeight
    
    // Downsample in steps no larger than 0.5x at a time
    while (currentWidth > targetWidth * 1.5 || currentHeight > targetHeight * 1.5) {
      const stepWidth = Math.max(targetWidth, Math.floor(currentWidth * 0.5))
      const stepHeight = Math.max(targetHeight, Math.floor(currentHeight * 0.5))
      
      const stepCanvas = document.createElement('canvas')
      stepCanvas.width = stepWidth
      stepCanvas.height = stepHeight
      const stepCtx = stepCanvas.getContext('2d', {
        willReadFrequently: true,
        alpha: true
      })
      if (!stepCtx) throw new Error('Failed to get step canvas context')
      
      // Configure for highest quality
      stepCtx.imageSmoothingEnabled = true
      stepCtx.imageSmoothingQuality = 'high'
      
      stepCtx.drawImage(currentCanvas, 0, 0, stepWidth, stepHeight)
      
      if (enableSharpening) {
        const imageData = stepCtx.getImageData(0, 0, stepWidth, stepHeight)
        sharpenImageData(imageData)
        stepCtx.putImageData(imageData, 0, 0)
      }
      
      currentCanvas = stepCanvas
      currentWidth = stepWidth
      currentHeight = stepHeight
    }
    
    // Final step to exact target size
    const targetCanvas = document.createElement('canvas')
    targetCanvas.width = targetWidth
    targetCanvas.height = targetHeight
    const targetCtx = targetCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: true
    })
    if (!targetCtx) throw new Error('Failed to get target canvas context')
    
    targetCtx.imageSmoothingEnabled = true
    targetCtx.imageSmoothingQuality = 'high'
    targetCtx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight)
    
    if (enableSharpening) {
      const resultImageData = targetCtx.getImageData(0, 0, targetWidth, targetHeight)
      sharpenImageData(resultImageData)
      targetCtx.putImageData(resultImageData, 0, 0)
      return resultImageData.data
    } else {
      const resultImageData = targetCtx.getImageData(0, 0, targetWidth, targetHeight)
      return resultImageData.data
    }
  } else {
    // Single step for upscaling or small downscaling
    const targetCanvas = document.createElement('canvas')
    targetCanvas.width = targetWidth
    targetCanvas.height = targetHeight
    const targetCtx = targetCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: true
    })
    if (!targetCtx) throw new Error('Failed to get target canvas context')
    
    targetCtx.imageSmoothingEnabled = true
    targetCtx.imageSmoothingQuality = 'high'
    targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight)
    
    const resultImageData = targetCtx.getImageData(0, 0, targetWidth, targetHeight)
    return resultImageData.data
  }
}

/**
 * Apply unsharp mask to reduce blur and preserve edges
 */
function sharpenImageData(imageData: ImageData): void {
  const { data, width, height } = imageData
  const original = new Uint8ClampedArray(data)
  
  // Sharpening kernel (unsharp mask)
  const sharpenAmount = 0.3
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      for (let c = 0; c < 3; c++) {
        // Get neighboring pixels
        const center = original[idx + c]
        const top = original[((y - 1) * width + x) * 4 + c]
        const bottom = original[((y + 1) * width + x) * 4 + c]
        const left = original[(y * width + (x - 1)) * 4 + c]
        const right = original[(y * width + (x + 1)) * 4 + c]
        
        // Average of neighbors
        const blur = (top + bottom + left + right) / 4
        
        // Sharpen: original + amount * (original - blur)
        const sharpened = center + sharpenAmount * (center - blur)
        
        data[idx + c] = Math.max(0, Math.min(255, sharpened))
      }
    }
  }
}
