"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import type { ProcessingResult } from "@/lib/types"

interface ImagePreviewProps {
  originalFile: File | null
  zipPreviewData?: { file: File; count: number } | null
  processedResults: ProcessingResult[]
  activeTab: "original" | "processed"
  onTabChange: (tab: "original" | "processed") => void
  transparentMode?: boolean
  isPickingColor?: boolean
}

export function ImagePreview({
  originalFile,
  zipPreviewData,
  processedResults,
  activeTab,
  onTabChange,
  transparentMode = false,
  isPickingColor = false,
}: ImagePreviewProps) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const largestResult =
    processedResults.length > 0
      ? processedResults.reduce((largest, current) =>
          current.width * current.height > largest.width * largest.height ? current : largest,
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

  useEffect(() => {
    if (transparentMode && isPickingColor && activeTab !== "original") {
      onTabChange("original")
    }
  }, [transparentMode, isPickingColor, activeTab, onTabChange])

  return (
    <div className="space-y-3 md:space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as "original" | "processed")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 border-2">
          <TabsTrigger value="original" className="font-bold text-xs md:text-sm" disabled={!originalUrl}>
            ORIGINAL
          </TabsTrigger>
          <TabsTrigger
            value="processed"
            className="font-bold text-xs md:text-sm"
            disabled={!largestResult || (transparentMode && isPickingColor)}
          >
            PROCESSED
          </TabsTrigger>
        </TabsList>

        <TabsContent value="original" className="mt-3 md:mt-4">
          {originalUrl && (
            <>
              <div className="border-4 border-border bg-muted/30 p-2 md:p-4 overflow-auto max-h-[400px] md:max-h-[600px] relative">
                <div
                  className="crt-effect mx-auto"
                  style={{
                    width: `${zoom}%`,
                    cursor: isPickingColor ? "crosshair" : "default",
                  }}
                >
                  <img ref={imgRef} src={originalUrl || "/placeholder.svg"} alt="Original" className="w-full h-auto" />
                  {isPickingColor && (
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                      style={{ cursor: "crosshair" }}
                    />
                  )}
                </div>
              </div>
              {zipPreviewData && zipPreviewData.count > 1 && (
                <div className="mt-2 md:mt-3 p-2 md:p-3 bg-muted/50 border-2 border-border text-center">
                  <p className="text-xs font-bold text-foreground">Displaying the largest image from the ZIP</p>
                  <p className="text-xs text-muted-foreground mt-1">+{zipPreviewData.count - 1} additional image{zipPreviewData.count - 1 !== 1 ? "s" : ""} will be processed</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="processed" className="mt-3 md:mt-4">
          {largestResult && (
            <>
              <div className="border-4 border-border bg-muted/30 p-2 md:p-4 overflow-auto max-h-[400px] md:max-h-[600px]">
                <div className="crt-effect mx-auto" style={{ width: `${zoom}%` }}>
                  <img
                    src={largestResult.previewUrl || "/placeholder.svg"}
                    alt="Processed"
                    className="pixelated w-full h-auto"
                  />
                </div>
              </div>
              {processedResults.length > 1 && (
                <div className="mt-2 md:mt-3 p-2 md:p-3 bg-muted/50 border-2 border-border text-center">
                  <p className="text-xs font-bold text-foreground">Displaying the largest processed image</p>
                  <p className="text-xs text-muted-foreground mt-1">+{processedResults.length - 1} additional image{processedResults.length - 1 !== 1 ? "s" : ""} {processedResults.length - 1 !== 1 ? "processed" : "processed"}</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <div className="flex justify-between text-xs md:text-sm">
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
        />
      </div>
    </div>
  )
}
