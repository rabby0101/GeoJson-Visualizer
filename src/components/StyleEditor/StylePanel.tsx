import { useState, useEffect } from 'react'
import { useGeoJSONStore } from '@/store/geojson-store'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ColorPicker } from './ColorPicker'
import { Paintbrush, Layers as LayersIcon } from 'lucide-react'
import { LayerStyle } from '@/types'

export function StylePanel() {
  const { layers, updateLayer } = useGeoJSONStore()
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

  // Auto-select first layer when layers change
  useEffect(() => {
    if (layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(layers[0].id)
    }
  }, [layers, selectedLayerId])

  const selectedLayer = layers.find((l) => l.id === selectedLayerId)

  if (layers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Paintbrush className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No layers available</p>
        <p className="text-xs mt-1">Upload a GeoJSON file to start styling</p>
      </div>
    )
  }

  const handleStyleChange = (updates: Partial<LayerStyle>) => {
    if (selectedLayerId) {
      updateLayer(selectedLayerId, {
        style: {
          ...selectedLayer?.style,
          ...updates,
        },
      })
    }
  }

  const currentStyle = selectedLayer?.style || {}

  return (
    <div className="space-y-6">
      {/* Layer Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <LayersIcon className="h-4 w-4" />
          Select Layer
        </Label>
        <Select
          value={selectedLayerId || ''}
          onChange={(e) => setSelectedLayerId(e.target.value)}
        >
          {layers.map((layer) => (
            <option key={layer.id} value={layer.id}>
              {layer.name}
            </option>
          ))}
        </Select>
      </div>

      {selectedLayer && (
        <>
          <div className="border-t pt-4" />

          {/* Fill Color */}
          <ColorPicker
            label="Fill Color"
            value={currentStyle.fillColor || '#3b82f6'}
            onChange={(color) => handleStyleChange({ fillColor: color })}
          />

          {/* Fill Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fill Opacity</Label>
              <span className="text-xs text-gray-500 font-mono">
                {((currentStyle.fillOpacity ?? 0.2) * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={currentStyle.fillOpacity ?? 0.2}
              onValueChange={(value) => handleStyleChange({ fillOpacity: value })}
            />
          </div>

          {/* Stroke Color */}
          <ColorPicker
            label="Stroke Color"
            value={currentStyle.color || '#1e40af'}
            onChange={(color) => handleStyleChange({ color })}
          />

          {/* Stroke Weight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stroke Weight</Label>
              <span className="text-xs text-gray-500 font-mono">
                {currentStyle.weight ?? 2}px
              </span>
            </div>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={currentStyle.weight ?? 2}
              onValueChange={(value) => handleStyleChange({ weight: value })}
            />
          </div>

          {/* Stroke Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stroke Opacity</Label>
              <span className="text-xs text-gray-500 font-mono">
                {((currentStyle.opacity ?? 1) * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={currentStyle.opacity ?? 1}
              onValueChange={(value) => handleStyleChange({ opacity: value })}
            />
          </div>

          {/* Dash Array */}
          <div className="space-y-2">
            <Label>Stroke Style</Label>
            <Select
              value={currentStyle.dashArray || ''}
              onChange={(e) => handleStyleChange({ dashArray: e.target.value || undefined })}
            >
              <option value="">Solid</option>
              <option value="5, 5">Dashed</option>
              <option value="1, 5">Dotted</option>
              <option value="10, 5, 2, 5">Dash-Dot</option>
              <option value="10, 5, 2, 5, 2, 5">Dash-Dot-Dot</option>
            </Select>
          </div>

          {/* Style Presets */}
          <div className="border-t pt-4">
            <Label className="mb-3 block">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  handleStyleChange({
                    fillColor: '#3b82f6',
                    color: '#1e40af',
                    fillOpacity: 0.2,
                    weight: 2,
                    opacity: 1,
                    dashArray: undefined,
                  })
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Default Blue
              </button>
              <button
                onClick={() =>
                  handleStyleChange({
                    fillColor: '#10b981',
                    color: '#059669',
                    fillOpacity: 0.3,
                    weight: 2,
                    opacity: 1,
                    dashArray: undefined,
                  })
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Green
              </button>
              <button
                onClick={() =>
                  handleStyleChange({
                    fillColor: '#ef4444',
                    color: '#dc2626',
                    fillOpacity: 0.3,
                    weight: 2,
                    opacity: 1,
                    dashArray: undefined,
                  })
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Red Alert
              </button>
              <button
                onClick={() =>
                  handleStyleChange({
                    fillColor: '#f59e0b',
                    color: '#d97706',
                    fillOpacity: 0.25,
                    weight: 3,
                    opacity: 1,
                    dashArray: undefined,
                  })
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Yellow Warning
              </button>
              <button
                onClick={() =>
                  handleStyleChange({
                    fillColor: '#8b5cf6',
                    color: '#7c3aed',
                    fillOpacity: 0.2,
                    weight: 2,
                    opacity: 0.8,
                    dashArray: '5, 5',
                  })
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Purple Dashed
              </button>
              <button
                onClick={() =>
                  handleStyleChange({
                    fillColor: 'transparent',
                    color: '#374151',
                    fillOpacity: 0,
                    weight: 3,
                    opacity: 1,
                    dashArray: undefined,
                  })
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Outline Only
              </button>
            </div>
          </div>

          {/* Layer Info */}
          <div className="border-t pt-4 space-y-1">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Features:</span>{' '}
              {selectedLayer.data.features.length}
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Z-Index:</span> {selectedLayer.zIndex}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
