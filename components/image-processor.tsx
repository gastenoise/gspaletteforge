"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Settings2, Download, ZoomIn, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ImagePreview } from "@/components/image-preview-with-picker"
import { ColorPicker } from "@/components/color-picker"
import { processImage, processZipFile, extractLargestImageFromZip } from "@/lib/image-processor"
import type { ProcessingOptions, ProcessingResult } from "@/lib/types"
import JSZip from "jszip"

export function ImageProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [zipPreviewData, setZipPreviewData] = useState<{ file: File; count: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"original" | "processed">("original")
  const [mode, setMode] = useState<"normal" | "transparent">("normal")
  const [transparentColor, setTransparentColor] = useState({ r: 0, g: 0, b: 255 })
  const [isPickingColor, setIsPickingColor] = useState(false)

  const [options, setOptions] = useState<ProcessingOptions>({
    maxSize: 256,
    quantization: "median-cut",
    dithering: true,
    interpolation: "progressive",
    sharpening: false,
    transparentMode: false,
    transparentColor: undefined,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      transparentMode: mode === "transparent",
      transparentColor: mode === "transparent" ? transparentColor : undefined,
    }))
  }, [mode, transparentColor])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      const isMultiple = selectedFiles.length > 1
      const firstFile = selectedFiles[0]
      const isZip = firstFile.type.includes("zip") || firstFile.name.endsWith(".zip")

      if ((isZip || isMultiple) && mode === "transparent") {
        setError("In transparent mode only single images can be uploaded")
        return
      }

      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/tga",
        "image/x-tga",
        "application/zip",
        "application/x-zip-compressed",
      ]
      const validExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tga", ".zip"]

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        if (!validTypes.includes(file.type) && !validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
          setError("Invalid file type. Please upload PNG, JPG, BMP, GIF, WEBP, TGA, or ZIP")
          return
        }

        const maxSize = isZip ? 50 : 10
        if (file.size > maxSize * 1024 * 1024) {
          setError(`File too large: ${file.name}. Maximum size: ${maxSize}MB`)
          return
        }
      }

      if (isMultiple) {
        const multiFileMarker = new File([], `__MULTI__${selectedFiles.length}`, { type: "application/x-multi-files" })
        setFile(multiFileMarker)
        ;(window as any).__multiFileSelection = Array.from(selectedFiles)

        let largestFile = selectedFiles[0]
        let largestSize = 0

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const img = new Image()
          const url = URL.createObjectURL(file)

          await new Promise<void>((resolve) => {
            img.onload = () => {
              const size = img.width * img.height
              if (size > largestSize) {
                largestSize = size
                largestFile = file
              }
              URL.revokeObjectURL(url)
              resolve()
            }
            img.onerror = () => {
              URL.revokeObjectURL(url)
              resolve()
            }
            img.src = url
          })
        }

        setZipPreviewData({ file: largestFile, count: selectedFiles.length })
      } else if (isZip) {
        setFile(firstFile)
        try {
          const { largestImage, totalImages } = await extractLargestImageFromZip(firstFile)
          setZipPreviewData({ file: largestImage, count: totalImages })
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error processing ZIP")
        }
      } else {
        setFile(firstFile)
        setZipPreviewData(null)
      }

      setError(null)
      setResults([])
      setActiveTab("original")
      setIsPickingColor(false)
    },
    [mode],
  )

  const handleProcess = useCallback(async () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResults([])

    try {
      const isZip = file.type.includes("zip") || file.name.endsWith(".zip")
      const isMulti = file.name.startsWith("__MULTI__")

      if (isMulti) {
        const files = (window as any).__multiFileSelection as File[]
        if (!files || files.length === 0) {
          throw new Error("No selected files found")
        }

        const results: ProcessingResult[] = []
        const progressPerImage = 90 / files.length

        for (let i = 0; i < files.length; i++) {
          const imageFile = files[i]

          const result = await processImage(imageFile, options, (imageProgress) => {
            const totalProgress = i * progressPerImage + (imageProgress * progressPerImage) / 100
            setProgress(Math.round(totalProgress))
          })

          results.push(result)
        }

        setResults(results)
        setProgress(100)
      } else if (isZip) {
        const zipResults = await processZipFile(file, options, (progress) => {
          setProgress(progress)
        })
        setResults(zipResults)
      } else {
        const result = await processImage(file, options, (progress) => {
          setProgress(progress)
        })
        setResults([result])
      }
      setActiveTab("processed")
      setIsPickingColor(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing")
    } finally {
      setIsProcessing(false)
    }
  }, [file, options])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles && droppedFiles.length > 0) {
        const event = { target: { files: droppedFiles } } as any
        handleFileSelect(event)
      }
    },
    [handleFileSelect],
  )

  const handleColorPicked = useCallback((color: { r: number; g: number; b: number }) => {
    setTransparentColor(color)
    setIsPickingColor(false)
  }, [])

  const handleStartPickingColor = useCallback(() => {
    setIsPickingColor(true)
    setActiveTab("original")
  }, [])

  const handleDownload = useCallback(async () => {
    if (results.length === 0) return

    try {
      if (results.length === 1) {
        const result = results[0]
        const response = await fetch(result.bmpUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const zip = new JSZip()

        for (const result of results) {
          const response = await fetch(result.bmpUrl)
          const blob = await response.blob()
          zip.file(result.filename, blob)
        }

        const zipBlob = await zip.generateAsync({ type: "blob" })
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = "converted_images.zip"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("[v0] Error downloading files:", error)
      setError("Error downloading files")
    }
  }, [results])

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <div className="space-y-4 md:space-y-6">
        <Card className="p-4 md:p-6 border-2 border-border">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
            <Upload className="h-4 w-4 md:h-5 md:w-5" />
            INPUT FILE
          </h2>

          <div className="mb-3 md:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-muted/30 border-2 border-border">
            <div>
              <Label className="text-xs md:text-sm font-bold">MODE</Label>
              <p className="text-xs text-muted-foreground">
                {mode === "normal" ? "Standard conversion" : "With reserved color"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">NORMAL</span>
              <Switch
                checked={mode === "transparent"}
                onCheckedChange={(checked) => {
                  setMode(checked ? "transparent" : "normal")
                  if (checked && file && (file.type.includes("zip") || file.name.endsWith(".zip"))) {
                    setFile(null)
                    setZipPreviewData(null)
                    setResults([])
                    setError("In transparent mode only single images can be uploaded")
                  }
                  setIsPickingColor(false)
                }}
              />
              <span className="text-xs font-bold text-foreground">TRANSPARENT</span>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-border bg-muted/50 p-6 md:p-8 text-center cursor-pointer hover:bg-muted/70 transition-colors"
          >
            <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-muted-foreground" />
            <p className="text-xs md:text-sm font-bold text-foreground mb-2 break-words">
              {file
                ? file.name.startsWith("__MULTI__")
                  ? `${file.name.split("__")[2]} FILES SELECTED`
                  : file.name
                : "CLICK OR DROP IMAGE"}
            </p>
            <p className="text-xs text-muted-foreground">
              {mode === "transparent"
                ? "PNG, JPEG, BMP, GIF, WEBP, TGA • MAX 10MB"
                : "PNG, JPEG, BMP, GIF, WEBP, TGA, ZIP • MAX 10MB (50MB for ZIP)"}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === "transparent" ? "image/*" : "image/*,.zip"}
            onChange={handleFileSelect}
            className="hidden"
            multiple={mode !== "transparent"}
          />
        </Card>

        <Card className="p-4 md:p-6 border-2 border-border">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
            <Settings2 className="h-4 w-4 md:h-5 md:w-5" />
            SETTINGS
          </h2>

          <div className="space-y-4">
            {mode === "transparent" && file && (
              <div className="space-y-2 p-3 bg-primary/5 border-2 border-primary rounded">
                <Label className="text-xs md:text-sm font-bold text-foreground">RESERVED COLOR (LAST IN PALETTE)</Label>
                <p className="text-xs text-muted-foreground mb-2">This color will be index 255 in the palette</p>
                <ColorPicker
                  color={transparentColor}
                  onChange={setTransparentColor}
                  originalFile={file}
                  isPickingColor={isPickingColor}
                  onPickingChange={handleStartPickingColor}
                  onStopPicking={() => setIsPickingColor(false)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxSize" className="text-sm md:text-base font-bold">
                  MAX PIXEL DIMENSION
                </Label>
                <Select
                  value={options.maxSize.toString()}
                  onValueChange={(value) => setOptions((prev) => ({ ...prev, maxSize: Number.parseInt(value) }))}
                >
                  <SelectTrigger id="maxSize" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256px</SelectItem>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interpolation" className="text-sm md:text-base font-bold">
                  RESIZE QUALITY
                </Label>
                <Select
                  value={options.interpolation}
                  onValueChange={(value: any) => setOptions((prev) => ({ ...prev, interpolation: value }))}
                >
                  <SelectTrigger id="interpolation" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progressive">PROGRESSIVE ⭐</SelectItem>
                    <SelectItem value="lanczos">LANCZOS</SelectItem>
                    <SelectItem value="bicubic">BICUBIC</SelectItem>
                    <SelectItem value="hermite">HERMITE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantization" className="text-sm md:text-base font-bold">
                  QUANTIZATION
                </Label>
                <Select
                  value={options.quantization}
                  onValueChange={(value: any) => setOptions((prev) => ({ ...prev, quantization: value }))}
                >
                  <SelectTrigger id="quantization" className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="median-cut">MEDIAN CUT</SelectItem>
                    <SelectItem value="octree">OCTREE</SelectItem>
                    <SelectItem value="k-means">K-MEANS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dithering" className="text-sm md:text-base font-bold">
                    FLOYD-STEINBERG DITHER
                  </Label>
                </div>
                <Switch
                  id="dithering"
                  checked={options.dithering}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, dithering: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sharpening" className="text-sm md:text-base font-bold">
                    UNSHARP MASK
                  </Label>
                  <p className="text-xs text-muted-foreground">Reduces edge blurring</p>
                </div>
                <Switch
                  id="sharpening"
                  checked={options.sharpening}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, sharpening: checked }))}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleProcess}
            disabled={!file || isProcessing || (mode === "transparent" && isPickingColor)}
            className="w-full mt-4 md:mt-6 font-bold border-2 border-primary-foreground text-sm md:text-base"
            size="lg"
          >
            {isProcessing ? "PROCESSING..." : "CONVERT TO BMP"}
          </Button>

          {isProcessing && (
            <div className="mt-4">
              <Progress value={progress} className="h-3 border-2 border-border" />
              <p className="text-xs text-center mt-2 text-muted-foreground">{progress}% COMPLETE</p>
            </div>
          )}
        </Card>

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertDescription className="font-bold">{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <Card className="p-4 md:p-6 border-2 border-primary bg-primary/5">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
              <Info className="h-4 w-4 md:h-5 md:w-5" />
              OUTPUT INFO
            </h2>
            {results.length === 1 ? (
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FILENAME:</span>
                  <span className="font-bold text-foreground">{results[0].filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DIMENSIONS:</span>
                  <span className="font-bold text-foreground">
                    {results[0].width}×{results[0].height}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COLORS:</span>
                  <span className="font-bold text-foreground">{results[0].colorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SIZE:</span>
                  <span className="font-bold text-foreground">{(results[0].fileSize / 1024).toFixed(2)}KB</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IMAGES PROCESSED:</span>
                  <span className="font-bold text-foreground">{results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TOTAL SIZE:</span>
                  <span className="font-bold text-foreground">
                    {(results.reduce((sum, r) => sum + r.fileSize, 0) / 1024).toFixed(2)}KB
                  </span>
                </div>
              </div>
            )}
            <Button
              onClick={handleDownload}
              className="w-full mt-4 font-bold border-2 border-primary-foreground text-sm md:text-base"
              variant="default"
            >
              <Download className="mr-2 h-4 w-4" />
              {results.length === 1 ? "DOWNLOAD BMP" : `DOWNLOAD ${results.length} IMAGES`}
            </Button>
          </Card>
        )}
      </div>

      <div>
        <Card className="p-4 md:p-6 border-2 border-border lg:sticky lg:top-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-foreground">
            <ZoomIn className="h-4 w-4 md:h-5 md:w-5" />
            PREVIEW
          </h2>

          {file || results.length > 0 ? (
            <ImagePreview
              originalFile={file}
              zipPreviewData={zipPreviewData}
              processedResults={results}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              transparentMode={mode === "transparent"}
              isPickingColor={isPickingColor}
              onColorPicked={handleColorPicked}
            />
          ) : (
            <div className="aspect-square border-4 border-dashed border-border bg-muted/30 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ZoomIn className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm md:text-base font-bold">NO IMAGE LOADED</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
