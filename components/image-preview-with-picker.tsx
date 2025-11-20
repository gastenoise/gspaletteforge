'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { ProcessingResult } from '@/lib/types'

interface ImagePreviewProps {
  originalFile: File | null
  zipPreviewData?: { file: File; count: number } | null
  processedResults: ProcessingResult[]
  activeTab: 'original' | 'processed'
  onTabChange: (tab: 'original' | 'processed') => void
  transparentMode?: boolean
  isPickingColor?: boolean
  onColorPicked?: (color: { r: number; g: number; b: number }) => void
}

export function ImagePreview({ 
  originalFile, 
  zipPreviewData,
  processedResults, 
  activeTab, 
  onTabChange,
  transparentMode = false,
  isPickingColor = false,
  onColorPicked
}: ImagePreviewProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const largestResult = processedResults.length > 0 
    ? processedResults.reduce((largest, current) => 
        (current.width * current.height > largest.width * largest.height) ? current : largest
      )
    : null

  useEffect(() => {
    const fileToPreview = zipPreviewData?.file || originalFile
    
    if (fileToPreview) {
      const url = URL.createObjectURL(fileToPreview)
      setOriginalUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setOriginalUrl(null)
    }
  }, [originalFile, zipPreviewData])

  // Force tab to original when in transparent mode and picking color
  useEffect(() => {
    if (transparentMode && isPickingColor && activeTab !== 'original') {
      onTabChange('original')
    }
  }, [transparentMode, isPickingColor, activeTab, onTabChange])

  // Load image to canvas when picking color
  useEffect(() => {
    if (isPickingColor && originalUrl && imgRef.current && canvasRef.current) {
      const img = imgRef.current
      const canvas = canvasRef.current
      const container = containerRef.current
      
      if (img.complete && img.naturalWidth > 0) {
        setupCanvas()
      } else {
        img.onload = setupCanvas
      }
      
      function setupCanvas() {
        if (!img || !canvas || !container) return
        
        const rect = img.getBoundingClientRect()
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(img, 0, 0)
        }
      }
    }
  }, [isPickingColor, originalUrl])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingColor || !canvasRef.current || !onColorPicked) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    const pixel = ctx.getImageData(x, y, 1, 1).data
    onColorPicked({ r: pixel[0], g: pixel[1], b: pixel[2] })
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'original' | 'processed')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 border-2">
          <TabsTrigger value="original" className="font-bold" disabled={!originalUrl}>
            ORIGINAL
          </TabsTrigger>
          <TabsTrigger 
            value="processed" 
            className="font-bold" 
            disabled={!largestResult || (transparentMode && isPickingColor)}
          >
            PROCESSED
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="original" className="mt-4">
          {originalUrl && (
            <>
              <div 
                ref={containerRef}
                className="border-4 border-border bg-muted/30 p-4 overflow-auto max-h-[600px] relative"
              >
                <div 
                  className="crt-effect mx-auto relative"
                  style={{ width: `${zoom}%` }}
                >
                  <img
                    ref={imgRef}
                    src={originalUrl || "/placeholder.svg"}
                    alt="Original"
                    className="w-full h-auto block"
                  />
                  {isPickingColor && (
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="absolute top-0 left-0 cursor-crosshair"
                    />
                  )}
                </div>
              </div>
              {zipPreviewData && zipPreviewData.count > 1 && (
                <div className="mt-3 p-3 bg-muted/50 border-2 border-border text-center">
                  <p className="text-xs font-bold text-foreground">
                    Mostrando la imagen más grande del ZIP
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{zipPreviewData.count - 1} imagen{zipPreviewData.count - 1 !== 1 ? 'es' : ''} adicional{zipPreviewData.count - 1 !== 1 ? 'es' : ''} será{zipPreviewData.count - 1 !== 1 ? 'n' : ''} procesada{zipPreviewData.count - 1 !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="processed" className="mt-4">
          {largestResult && (
            <>
              <div className="border-4 border-border bg-muted/30 p-4 overflow-auto max-h-[600px]">
                <div 
                  className="crt-effect mx-auto"
                  style={{ width: `${zoom}%` }}
                >
                  <img
                    src={largestResult.previewUrl || "/placeholder.svg"}
                    alt="Processed"
                    className="pixelated w-full h-auto"
                  />
                </div>
              </div>
              {processedResults.length > 1 && (
                <div className="mt-3 p-3 bg-muted/50 border-2 border-border text-center">
                  <p className="text-xs font-bold text-foreground">
                    Mostrando la imagen más grande procesada
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{processedResults.length - 1} imagen{processedResults.length - 1 !== 1 ? 'es' : ''} adicional{processedResults.length - 1 !== 1 ? 'es' : ''} también {processedResults.length - 1 !== 1 ? 'fueron procesadas' : 'fue procesada'}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-bold text-foreground">ZOOM</span>
          <span className="text-muted-foreground">{zoom}%</span>
        </div>
        <Slider
          value={[zoom]}
          onValueChange={([value]) => setZoom(value)}
          min={25}
          max={400}
          step={25}
          className="cursor-pointer"
          disabled={isPickingColor}
        />
      </div>
    </div>
  )
}
