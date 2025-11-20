# GSPALLETEFORGE - 8-bit BMP Converter

Convert modern images to retro 8-bit indexed BMP files with customizable quantization and dithering.

## Features

- **Image Processing**: Convert PNG, JPEG, GIF, and WebP to 8-bit indexed BMP
- **Smart Resizing**: Automatically resize to 256/512/1024px with 16px grid snapping
- **Color Quantization**: Choose from three algorithms:
  - Median Cut (default, high quality)
  - Octree (fast, tree-based)
  - K-means (iterative clustering)
- **Floyd-Steinberg Dithering**: Optional error diffusion for smoother gradients
- **Real-time Preview**: Compare original vs. processed with zoom controls
- **Retro UI**: Pixel-perfect design inspired by classic pixel art tools

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/gspalleteforge.git
cd gspalleteforge
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Image**: Click or drag-and-drop an image (max 10MB)
2. **Configure Settings**:
   - Max pixel dimension: 256, 512, or 1024px
   - Quantization algorithm: Median Cut, Octree, or K-means
   - Dithering: Toggle Floyd-Steinberg on/off
3. **Convert**: Click "CONVERT TO BMP"
4. **Preview**: Compare original and processed images with zoom
5. **Download**: Save your 8-bit BMP file

## Technical Implementation

### Resize Algorithm

Images are resized to ensure the larger dimension ≤ selected max size:
- Scale uniformly based on larger dimension
- Snap both width and height to nearest multiple of 16
- If rounding up exceeds max, use floor for that dimension
- Minimum dimension: 16px

### BMP Generation

Produces valid BMP v3 files:
- **Header**: 14-byte file header
- **DIB Header**: 40-byte BITMAPINFOHEADER
- **Color Table**: 256 colors × 4 bytes (RGBQUAD format: B,G,R,Reserved)
- **Pixel Data**: 8-bit indexes, row-padded to 4-byte alignment, bottom-up

### Quantization Algorithms

**Median Cut** (default):
- Recursively splits color space by median
- High quality with good color distribution
- O(n log n) complexity

**Octree**:
- Tree-based color organization
- Fast processing for large images
- Balanced quality/speed tradeoff

**K-means**:
- Iterative centroid refinement
- 10 iterations for convergence
- Best for images with distinct color regions

### Dithering

Floyd-Steinberg error diffusion:
\`\`\`
       X   7/16
  3/16 5/16 1/16
\`\`\`
Spreads quantization error to neighboring pixels for smoother gradients.

## File Structure

\`\`\`
gspalleteforge/
├── app/
│   ├── layout.tsx          # Root layout with retro theme
│   ├── page.tsx            # Main page component
│   └── globals.css         # Retro pixel studio theme
├── components/
│   ├── image-processor.tsx # Main processing UI
│   ├── image-preview.tsx   # Preview with zoom controls
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── image-processor.ts  # Main processing pipeline
│   ├── resize.ts           # Dimension calculation
│   ├── quantization.ts     # Color quantization algorithms
│   ├── dithering.ts        # Floyd-Steinberg dithering
│   └── bmp-generator.ts    # BMP file generation
└── README.md
\`\`\`

## Implementation Checklist

- [x] File upload with drag-and-drop
- [x] Image validation (type, size)
- [x] Settings UI (max size, quantization, dithering)
- [x] Resize algorithm with 16px snapping
- [x] Median Cut quantization
- [x] Octree quantization (simplified)
- [x] K-means quantization
- [x] Floyd-Steinberg dithering
- [x] BMP v3 file generation
- [x] Preview with original/processed tabs
- [x] Zoom controls (25%-400%)
- [x] Progress indicator
- [x] Error handling
- [x] Download functionality
- [x] Retro pixel studio theme
- [x] Multiple file and ZIP support
- [x] Transparent mode with reserved color
- [x] Advanced resize quality options

## Future Enhancements

### Web Workers

For non-blocking processing of large images:

\`\`\`typescript
// lib/worker.ts
self.onmessage = async (e: MessageEvent) => {
  const { imageData, options } = e.data
  
  // Process image
  const result = await processImage(imageData, options, (progress) => {
    self.postMessage({ type: 'progress', progress })
  })
  
  self.postMessage({ type: 'complete', result })
}
\`\`\`

## Security Considerations

- File type validation via MIME type and magic bytes
- 10MB file size limit on client (50MB for ZIP)
- Sanitized filenames for downloads
- No server-side processing in current version (all client-side)
- Future: implement server-side scanning, rate limiting, and temp file cleanup

## License

MIT

## Credits

Built with:
- Vercel's V0
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Radix UI

Created by Gastón Urgorri - [@gastenoise](https://github.com/gastenoise)
