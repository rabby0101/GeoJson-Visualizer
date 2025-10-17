import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

const presetColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#a855f7', // violet
]

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="h-9 w-full rounded-md border border-gray-300 flex items-center px-3 gap-2 hover:bg-gray-50"
          >
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm font-mono">{value}</span>
          </button>

          {showPicker && (
            <div className="absolute z-10 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="grid grid-cols-6 gap-2 mb-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onChange(color)
                      setShowPicker(false)
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-16 h-9 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {showPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
