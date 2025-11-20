export interface ProcessingOptions {
  maxSize: 256 | 512 | 1024
  quantization: 'median-cut' | 'octree' | 'k-means'
  dithering: boolean
  interpolation?: 'progressive' | 'lanczos' | 'bicubic' | 'hermite'
  sharpening?: boolean
  transparentMode?: boolean
  transparentColor?: { r: number; g: number; b: number }
}

export interface ProcessingResult {
  bmpUrl: string
  previewUrl: string
  filename: string
  width: number
  height: number
  colorCount: number
  fileSize: number
  originalFilename?: string
}

export interface Color {
  r: number
  g: number
  b: number
}
