import { ProcessingOptions, ProcessingResult, Color } from './types'
import { medianCutQuantize, octreeQuantize, kmeansQuantize } from './quantization'
import { floydSteinbergDither } from './dithering'
import { generateBMP } from './bmp-generator'
import { calculateResizedDimensions } from './resize'
import { resizeImageBicubic } from './resize-bicubic'
import { resizeImageLanczos } from './resize-lanczos'
import { resizeImageHermite } from './resize-hermite'
import { resizeImageProgressive } from './resize-pica'

declare const JSZip: any

// Load JSZip dynamically
async function loadJSZip() {
  if (typeof (window as any).JSZip === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
    document.head.appendChild(script)
    await new Promise((resolve) => {
      script.onload = resolve
    })
  }
  return (window as any).JSZip
}

/**
 * Main image processing pipeline
 * Coordinates: load → resize → quantize → dither → BMP generation
 * 
 * Enhanced error handling and validation for production
 */
export async function processImage(
  file: File,
  options: ProcessingOptions,
  onProgress: (progress: number) => void
): Promise<ProcessingResult> {
  try {
    onProgress(10)

    if (!file || file.size === 0) {
      throw new Error('Archivo inválido o vacío')
    }

    // Load image from file
    const imageData = await loadImageData(file)
    onProgress(20)
    
    if (imageData.width === 0 || imageData.height === 0) {
      throw new Error('Dimensiones de imagen inválidas')
    }

    // Calculate resize dimensions
    const { width, height } = calculateResizedDimensions(
      imageData.width,
      imageData.height,
      options.maxSize
    )
    onProgress(30)

    const resizedData = await resizeImageData(
      imageData, 
      width, 
      height, 
      options.interpolation,
      options.sharpening || false
    )
    onProgress(50)

    const { palette, indexedPixels } = quantizeImage(
      resizedData,
      options.quantization,
      options.transparentMode ? options.transparentColor : undefined
    )
    onProgress(70)
    
    if (palette.length === 0) {
      throw new Error('Error en cuantización: paleta vacía')
    }

    // Apply dithering if enabled
    let finalIndexedPixels = indexedPixels
    if (options.dithering) {
      finalIndexedPixels = floydSteinbergDither(resizedData, palette)
    }
    onProgress(85)

    // Generate BMP file
    const bmpBlob = generateBMP(width, height, palette, finalIndexedPixels)
    onProgress(95)

    // Create URLs for download and preview
    const bmpUrl = URL.createObjectURL(bmpBlob)
    const previewUrl = await createPreviewUrl(width, height, palette, finalIndexedPixels)
    
    onProgress(100)

    return {
      bmpUrl,
      previewUrl,
      filename: file.name.replace(/\.[^/.]+$/, '') + '.bmp',
      width,
      height,
      colorCount: palette.length,
      fileSize: bmpBlob.size,
      originalFilename: file.name
    }
  } catch (error) {
    console.error('[v0] Error processing image:', error)
    throw error
  }
}

export async function processZipFile(
  file: File,
  options: ProcessingOptions,
  onProgress: (progress: number) => void
): Promise<ProcessingResult[]> {
  const JSZipClass = await loadJSZip()
  const zip = new JSZipClass()
  
  onProgress(5)
  
  // Load ZIP file
  const zipData = await zip.loadAsync(file)
  onProgress(10)
  
  const imageFiles: Array<{ name: string; data: Blob }> = []
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tga']
  
  for (const [filename, zipEntry] of Object.entries(zipData.files)) {
    const entry = zipEntry as any
    if (!entry.dir) {
      const lowerName = filename.toLowerCase()
      if (validExtensions.some(ext => lowerName.endsWith(ext))) {
        const blob = await entry.async('blob')
        imageFiles.push({ name: filename, data: blob })
      }
    }
  }
  
  if (imageFiles.length === 0) {
    throw new Error('No se encontraron imágenes válidas en el archivo ZIP')
  }
  
  onProgress(20)
  
  // Process each image
  const results: ProcessingResult[] = []
  const progressPerImage = 70 / imageFiles.length
  
  for (let i = 0; i < imageFiles.length; i++) {
    const { name, data } = imageFiles[i]
    const imageFile = new File([data], name, { type: data.type })
    
    const result = await processImage(
      imageFile,
      options,
      (imageProgress) => {
        const totalProgress = 20 + (i * progressPerImage) + (imageProgress * progressPerImage / 100)
        onProgress(Math.round(totalProgress))
      }
    )
    
    results.push(result)
  }
  
  onProgress(100)
  
  return results
}

/**
 * Load image from File and extract ImageData
 * Enhanced error handling
 */
async function loadImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const timeout = setTimeout(() => {
      reject(new Error('Tiempo de carga agotado (timeout)'))
    }, 30000) // 30 second timeout
    
    img.onload = () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d', {
          willReadFrequently: true,
          alpha: true
        })
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        ctx.imageSmoothingEnabled = false // No smoothing when loading original
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        URL.revokeObjectURL(img.src)
        resolve(imageData)
      } catch (error) {
        URL.revokeObjectURL(img.src)
        reject(error)
      }
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(img.src)
      reject(new Error('Error al cargar la imagen. Verifica que el formato sea válido.'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

async function resizeImageData(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  interpolation: ProcessingOptions['interpolation'] = 'progressive',
  sharpening: boolean = false
): Promise<ImageData> {
  let resizedData: Uint8ClampedArray
  
  switch (interpolation) {
    case 'progressive':
      resizedData = await resizeImageProgressive(
        imageData.data,
        imageData.width,
        imageData.height,
        targetWidth,
        targetHeight,
        sharpening
      )
      break
    case 'lanczos':
      resizedData = resizeImageLanczos(
        imageData.data,
        imageData.width,
        imageData.height,
        targetWidth,
        targetHeight
      )
      break
    case 'hermite':
      resizedData = resizeImageHermite(
        imageData.data,
        imageData.width,
        imageData.height,
        targetWidth,
        targetHeight
      )
      break
    case 'bicubic':
      resizedData = resizeImageBicubic(
        imageData.data,
        imageData.width,
        imageData.height,
        targetWidth,
        targetHeight
      )
      break
    default:
      resizedData = await resizeImageProgressive(
        imageData.data,
        imageData.width,
        imageData.height,
        targetWidth,
        targetHeight,
        sharpening
      )
      break
  }
  
  return new ImageData(resizedData, targetWidth, targetHeight)
}

function quantizeImage(
  imageData: ImageData,
  algorithm: ProcessingOptions['quantization'],
  reservedColor?: { r: number; g: number; b: number }
): { palette: Color[]; indexedPixels: Uint8Array } {
  switch (algorithm) {
    case 'median-cut':
      return medianCutQuantize(imageData, 256, reservedColor)
    case 'octree':
      return octreeQuantize(imageData, 256, reservedColor)
    case 'k-means':
      return kmeansQuantize(imageData, 256, reservedColor)
    default:
      return medianCutQuantize(imageData, 256, reservedColor)
  }
}

async function createPreviewUrl(
  width: number,
  height: number,
  palette: Color[],
  indexedPixels: Uint8Array
): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  
  const imageData = ctx.createImageData(width, height)
  
  for (let i = 0; i < indexedPixels.length; i++) {
    const colorIndex = indexedPixels[i]
    const color = palette[colorIndex]
    const pixelIndex = i * 4
    imageData.data[pixelIndex] = color.r
    imageData.data[pixelIndex + 1] = color.g
    imageData.data[pixelIndex + 2] = color.b
    imageData.data[pixelIndex + 3] = 255
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob))
      } else {
        reject(new Error('Failed to create preview'))
      }
    })
  })
}

export async function extractLargestImageFromZip(
  file: File
): Promise<{ largestImage: File; totalImages: number }> {
  const JSZipClass = await loadJSZip()
  const zip = new JSZipClass()
  
  const zipData = await zip.loadAsync(file)
  
  const imageFiles: Array<{ name: string; data: Blob; size: number }> = []
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tga']
  
  for (const [filename, zipEntry] of Object.entries(zipData.files)) {
    const entry = zipEntry as any
    if (!entry.dir) {
      const lowerName = filename.toLowerCase()
      if (validExtensions.some(ext => lowerName.endsWith(ext))) {
        const blob = await entry.async('blob')
        const dimensions = await getImageDimensions(blob)
        const size = dimensions.width * dimensions.height
        imageFiles.push({ name: filename, data: blob, size })
      }
    }
  }
  
  if (imageFiles.length === 0) {
    throw new Error('No se encontraron imágenes válidas en el archivo ZIP')
  }
  
  imageFiles.sort((a, b) => b.size - a.size)
  const largest = imageFiles[0]
  
  const imageFile = new File([largest.data], largest.name, { type: largest.data.type || 'image/png' })
  
  return {
    largestImage: imageFile,
    totalImages: imageFiles.length
  }
}

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(blob)
  })
}
