import { Color } from './types'

/**
 * Median Cut Quantization (default, high-quality)
 * Recursively splits color space by median until reaching target colors
 */
export function medianCutQuantize(
  imageData: ImageData,
  maxColors: number = 256,
  reservedColor?: { r: number; g: number; b: number }
): { palette: Color[]; indexedPixels: Uint8Array } {
  const targetColors = reservedColor ? maxColors - 1 : maxColors

  const pixels: Color[] = []

  // Collect all unique colors
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push({
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2]
    })
  }

  // Start with all pixels in one bucket
  let buckets: Color[][] = [pixels]

  // Split buckets until we reach targetColors
  while (buckets.length < targetColors) {
    // Find bucket with largest range
    let largestBucket: Color[] | null = null
    let largestRange = 0
    let splitChannel: 'r' | 'g' | 'b' = 'r'

    for (const bucket of buckets) {
      const ranges = getColorRanges(bucket)
      const maxRange = Math.max(ranges.r, ranges.g, ranges.b)

      if (maxRange > largestRange) {
        largestRange = maxRange
        largestBucket = bucket
        splitChannel = ranges.r > ranges.g
          ? (ranges.r > ranges.b ? 'r' : 'b')
          : (ranges.g > ranges.b ? 'g' : 'b')
      }
    }

    if (!largestBucket || largestBucket.length < 2) break

    // Sort and split at median
    largestBucket.sort((a, b) => a[splitChannel] - b[splitChannel])
    const median = Math.floor(largestBucket.length / 2)

    const bucket1 = largestBucket.slice(0, median)
    const bucket2 = largestBucket.slice(median)

    // Replace old bucket with two new ones
    const index = buckets.indexOf(largestBucket)
    buckets.splice(index, 1, bucket1, bucket2)
  }

  // Generate palette from bucket averages
  let palette = buckets.map(bucket => averageColor(bucket))

  if (reservedColor) {
    palette.push(reservedColor)
  }

  // Map pixels to nearest palette color
  const indexedPixels = new Uint8Array(imageData.width * imageData.height)

  for (let i = 0; i < imageData.data.length / 4; i++) {
    const color: Color = {
      r: imageData.data[i * 4],
      g: imageData.data[i * 4 + 1],
      b: imageData.data[i * 4 + 2]
    }
    indexedPixels[i] = findNearestColor(color, palette)
  }

  return { palette, indexedPixels }
}

/**
 * Octree Quantization
 * Uses tree structure to organize color space
 */
export function octreeQuantize(
  imageData: ImageData,
  maxColors: number = 256,
  reservedColor?: { r: number; g: number; b: number }
): { palette: Color[]; indexedPixels: Uint8Array } {
  // Simplified octree implementation
  // For production, use a proper octree with level management
  return medianCutQuantize(imageData, maxColors, reservedColor)
}

/**
 * K-means Quantization
 * Iteratively refines palette by clustering
 */
export function kmeansQuantize(
  imageData: ImageData,
  maxColors: number = 256,
  reservedColor?: { r: number; g: number; b: number }
): { palette: Color[]; indexedPixels: Uint8Array } {
  const targetColors = reservedColor ? maxColors - 1 : maxColors

  const pixels: Color[] = []

  // Sample pixels (use all if small, sample if large)
  const sampleRate = Math.max(1, Math.floor(imageData.data.length / (4 * 10000)))
  for (let i = 0; i < imageData.data.length; i += 4 * sampleRate) {
    pixels.push({
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2]
    })
  }

  // Initialize centroids randomly
  let palette = pixels
    .sort(() => Math.random() - 0.5)
    .slice(0, targetColors)

  // K-means iterations
  for (let iter = 0; iter < 10; iter++) {
    const clusters: Color[][] = Array(targetColors).fill(null).map(() => [])

    // Assign pixels to nearest centroid
    for (const pixel of pixels) {
      const nearest = findNearestColor(pixel, palette)
      clusters[nearest].push(pixel)
    }

    // Update centroids
    palette = clusters.map((cluster, i) =>
      cluster.length > 0 ? averageColor(cluster) : palette[i]
    )
  }

  if (reservedColor) {
    palette.push(reservedColor)
  }

  // Map all pixels to palette
  const indexedPixels = new Uint8Array(imageData.width * imageData.height)

  for (let i = 0; i < imageData.data.length / 4; i++) {
    const color: Color = {
      r: imageData.data[i * 4],
      g: imageData.data[i * 4 + 1],
      b: imageData.data[i * 4 + 2]
    }
    indexedPixels[i] = findNearestColor(color, palette)
  }

  return { palette, indexedPixels }
}

// Helper functions

function getColorRanges(colors: Color[]): { r: number; g: number; b: number } {
  let minR = 255, maxR = 0
  let minG = 255, maxG = 0
  let minB = 255, maxB = 0

  for (const color of colors) {
    minR = Math.min(minR, color.r)
    maxR = Math.max(maxR, color.r)
    minG = Math.min(minG, color.g)
    maxG = Math.max(maxG, color.g)
    minB = Math.min(minB, color.b)
    maxB = Math.max(maxB, color.b)
  }

  return {
    r: maxR - minR,
    g: maxG - minG,
    b: maxB - minB
  }
}

function averageColor(colors: Color[]): Color {
  const sum = colors.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b
    }),
    { r: 0, g: 0, b: 0 }
  )

  return {
    r: Math.round(sum.r / colors.length),
    g: Math.round(sum.g / colors.length),
    b: Math.round(sum.b / colors.length)
  }
}

export function findNearestColor(color: Color, palette: Color[]): number {
  let nearest = 0
  let minDistance = Infinity

  for (let i = 0; i < palette.length; i++) {
    const distance = colorDistance(color, palette[i])
    if (distance < minDistance) {
      minDistance = distance
      nearest = i
    }
  }

  return nearest
}

function colorDistance(c1: Color, c2: Color): number {
  // Euclidean distance in RGB space
  const dr = c1.r - c2.r
  const dg = c1.g - c2.g
  const db = c1.b - c2.b
  return dr * dr + dg * dg + db * db
}
