"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function HelpModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="border-2 h-9 w-9 md:h-10 md:w-10 bg-transparent">
          <Info className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[85vh] overflow-y-auto border-2">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Info className="h-5 w-5 md:h-6 md:w-6" />
            USER GUIDE - GSPALLETTEFORGE
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Convert images to 8-bit indexed BMP format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 text-xs md:text-sm">
          {/* Normal Mode */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              NORMAL MODE - Standard Conversion
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li className="font-semibold">Select "NORMAL" mode in the top switch</li>
              <li>
                <span className="font-semibold">Upload your file:</span>
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                  <li>Single image: PNG, JPEG, BMP, GIF, WEBP, TGA (max 10MB)</li>
                  <li>ZIP file: Multiple images (max 50MB)</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold">Configure settings in SETTINGS:</span>
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                  <li>
                    <strong>Max Pixel Dimension:</strong> Maximum size (adjusted to 16px multiple)
                  </li>
                  <li>
                    <strong>Resize Quality:</strong> Progressive (recommended), Lanczos, Bicubic, Hermite
                  </li>
                  <li>
                    <strong>Quantization:</strong> Algorithm to reduce to 256 colors (Median Cut, Octree, K-means)
                  </li>
                  <li>
                    <strong>Floyd-Steinberg Dither:</strong> Smooths color transitions
                  </li>
                  <li>
                    <strong>Unsharp Mask:</strong> Reduces edge blurring (experimental)
                  </li>
                </ul>
              </li>
              <li className="font-semibold">Press "CONVERT TO BMP" to process</li>
              <li>
                <span className="font-semibold">Download your result:</span>
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                  <li>Single image: Download .bmp file</li>
                  <li>Multiple images: Download .zip with all conversions</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Transparent Mode */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              TRANSPARENT MODE - With Reserved Color
            </h3>
            <p className="text-muted-foreground italic">Ideal for game textures (e.g. Valve VTF/TGA format)</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li className="font-semibold">Activate "TRANSPARENT" mode in the top switch</li>
              <li>
                <span className="font-semibold">Upload ONE single image</span>
                <span className="text-muted-foreground"> (ZIP files not allowed in this mode)</span>
              </li>
              <li>
                <span className="font-semibold">Define the reserved color (index 255):</span>
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                  <li>
                    <strong>Option A:</strong> Click the color box to choose manually (RGB/HEX)
                  </li>
                  <li>
                    <strong>Option B:</strong> Click "Pick from image" and select a color from the preview
                  </li>
                  <li>
                    <strong>Default value:</strong> 0, 0, 255 (pure blue - Valve standard)
                  </li>
                  <li>
                    <strong>Reset:</strong> Button to return to official Valve color
                  </li>
                </ul>
              </li>
              <li className="font-semibold">Configure processing settings (same as normal mode)</li>
              <li className="font-semibold">Press "CONVERT TO BMP"</li>
              <li className="text-muted-foreground">
                Palette will have 255 optimized colors + your reserved color at index 255
              </li>
            </ol>
          </section>

          {/* Batch Processing */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              BATCH PROCESSING (ZIP)
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                <span className="font-semibold">Prepare your ZIP file:</span>
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                  <li>Include all images to convert (PNG, JPEG, BMP, GIF, WEBP, TGA)</li>
                  <li>Can be in subfolders (automatically detected)</li>
                  <li>Maximum size: 50MB</li>
                </ul>
              </li>
              <li className="font-semibold">Upload the .zip file (normal mode only)</li>
              <li className="text-muted-foreground">Preview will show the largest image from ZIP</li>
              <li className="font-semibold">Configure settings (will apply to ALL images)</li>
              <li className="font-semibold">Press "CONVERT TO BMP"</li>
              <li className="text-muted-foreground">All images will be processed with a progress bar</li>
              <li className="font-semibold">Download the resulting ZIP with all conversions</li>
            </ol>
          </section>

          {/* Technical Specs */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              TECHNICAL SPECIFICATIONS
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>
                <strong>Output format:</strong> BMP v3 (Windows Bitmap)
              </li>
              <li>
                <strong>Color depth:</strong> 8 bits (256 indexed colors)
              </li>
              <li>
                <strong>Resizing:</strong> Adjusted to 16px multiples with grid snapping
              </li>
              <li>
                <strong>Quantization algorithms:</strong> Median Cut, Octree, K-means
              </li>
              <li>
                <strong>Dithering:</strong> Floyd-Steinberg (optional)
              </li>
              <li>
                <strong>Interpolation:</strong> Progressive (multi-step), Lanczos, Bicubic, Hermite
              </li>
              <li>
                <strong>Quality:</strong> Lossless after quantization
              </li>
            </ul>
          </section>

          {/* Tips */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              TIPS AND BEST PRACTICES
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>
                <strong>For game textures:</strong> Use transparent mode with pure blue (0,0,255)
              </li>
              <li>
                <strong>For photographs:</strong> Enable dithering to smooth gradients
              </li>
              <li>
                <strong>For pixel art:</strong> Disable dithering and use Median Cut
              </li>
              <li>
                <strong>For maximum quality:</strong> Progressive + Dithering + size 512px or larger
              </li>
              <li>
                <strong>For speed:</strong> Hermite + no dithering
              </li>
              <li>
                <strong>Blurred edges:</strong> Enable unsharp mask (may increase artifacts)
              </li>
              <li>
                <strong>Flat colors:</strong> K-means works best for limited palettes
              </li>
            </ul>
          </section>

          {/* Supported Formats */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              SUPPORTED FORMATS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-1">Input:</p>
                <ul className="list-disc list-inside ml-2 text-muted-foreground">
                  <li>PNG (with/without transparency)</li>
                  <li>JPEG / JPG</li>
                  <li>BMP (all variants)</li>
                  <li>GIF (animated → first frame)</li>
                  <li>WEBP</li>
                  <li>TGA (Targa)</li>
                  <li>ZIP (multiple images)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Output:</p>
                <ul className="list-disc list-inside ml-2 text-muted-foreground">
                  <li>BMP v3 (8-bit indexed)</li>
                  <li>256 color palette</li>
                  <li>Uncompressed</li>
                  <li>Bottom-up encoding</li>
                  <li>Row padding (4-byte multiple)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="space-y-2">
            <h3 className="text-base md:text-lg font-bold text-foreground border-b-2 border-primary pb-1">
              TROUBLESHOOTING
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
              <li>
                <strong>Very pixelated image:</strong> Try Progressive or Lanczos
              </li>
              <li>
                <strong>Incorrect colors:</strong> Change quantization algorithm
              </li>
              <li>
                <strong>File too large:</strong> Reduce max size to 256px
              </li>
              <li>
                <strong>ZIP not working:</strong> Verify it contains valid images
              </li>
              <li>
                <strong>Color picker not responding:</strong> Click "Pick from image" first
              </li>
              <li>
                <strong>Blurry edges:</strong> Disable unsharp mask
              </li>
            </ul>
          </section>
        </div>

        <div className="flex justify-end pt-3 md:pt-4 border-t-2">
          <Button onClick={() => setOpen(false)} className="font-bold text-sm md:text-base">
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
