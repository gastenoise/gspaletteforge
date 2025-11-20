"use client"

import { useRef } from "react"
import { Pipette, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  color: { r: number; g: number; b: number }
  onChange: (color: { r: number; g: number; b: number }) => void
  originalFile: File | null
  isPickingColor: boolean
  onPickingChange: () => void
  onStopPicking: () => void
}

const VALVE_BLUE = { r: 0, g: 0, b: 255 }

export function ColorPicker({
  color,
  onChange,
  originalFile,
  isPickingColor,
  onPickingChange,
  onStopPicking,
}: ColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const hexColor = rgbToHex(color.r, color.g, color.b)

  const handleColorBoxClick = () => {
    if (!isPickingColor) {
      colorInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs font-bold">RGB</Label>
            <div className="grid grid-cols-3 gap-1">
              <Input
                type="number"
                min="0"
                max="255"
                value={color.r}
                onChange={(e) =>
                  onChange({ ...color, r: Math.min(255, Math.max(0, Number.parseInt(e.target.value) || 0)) })
                }
                className="h-8 text-xs border-2 text-center"
                disabled={isPickingColor}
              />
              <Input
                type="number"
                min="0"
                max="255"
                value={color.g}
                onChange={(e) =>
                  onChange({ ...color, g: Math.min(255, Math.max(0, Number.parseInt(e.target.value) || 0)) })
                }
                className="h-8 text-xs border-2 text-center"
                disabled={isPickingColor}
              />
              <Input
                type="number"
                min="0"
                max="255"
                value={color.b}
                onChange={(e) =>
                  onChange({ ...color, b: Math.min(255, Math.max(0, Number.parseInt(e.target.value) || 0)) })
                }
                className="h-8 text-xs border-2 text-center"
                disabled={isPickingColor}
              />
            </div>
          </div>

          <div>
            <div
              onClick={handleColorBoxClick}
              className="w-16 h-16 border-2 border-border rounded cursor-pointer hover:border-primary transition-colors"
              style={{ backgroundColor: hexColor }}
              title="Click para elegir color"
            />
            <input
              ref={colorInputRef}
              type="color"
              value={hexColor}
              onChange={(e) => {
                const rgb = hexToRgb(e.target.value)
                if (rgb) onChange(rgb)
              }}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold">HEX</Label>
          <Input
            type="text"
            value={hexColor}
            onChange={(e) => {
              const rgb = hexToRgb(e.target.value)
              if (rgb) onChange(rgb)
            }}
            className="h-8 text-xs border-2 font-mono uppercase"
            disabled={isPickingColor}
            maxLength={7}
          />
        </div>
      </div>

      {originalFile && (
        <Button
          type="button"
          variant={isPickingColor ? "default" : "outline"}
          size="sm"
          onClick={isPickingColor ? onStopPicking : onPickingChange}
          className="w-full border-2 text-xs font-bold"
        >
          <Pipette className="w-3 h-3 mr-2" />
          {isPickingColor ? "PICKING COLOR..." : "PICK FROM IMAGE"}
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange(VALVE_BLUE)}
        className="w-full border-2 text-xs font-bold"
        disabled={isPickingColor}
      >
        <RotateCcw className="w-3 h-3 mr-2" />
        RESET TO VALVE (0 0 255)
      </Button>
    </div>
  )
}
