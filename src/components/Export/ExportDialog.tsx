import { useState } from 'react'
import { Download, FileJson, FileText, Image, File } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { useGeoJSONStore } from '../../store/geojson-store'
import { GeoJSONExporter } from '../../lib/exporter/geojson-exporter'
import { KMLExporter } from '../../lib/exporter/kml-exporter'
import { CSVExporter } from '../../lib/exporter/csv-exporter'
import { ImageExporter } from '../../lib/exporter/image-exporter'
import { applyFilters } from '../../lib/utils/filter-helpers'
import { FeatureCollection } from 'geojson'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mapContainer?: HTMLElement | null
}

type ExportFormat = 'geojson' | 'kml' | 'csv' | 'image'

interface ExportOption {
  format: ExportFormat
  label: string
  description: string
  icon: any
  extension: string
}

const exportOptions: ExportOption[] = [
  {
    format: 'geojson',
    label: 'GeoJSON',
    description: 'Export as GeoJSON format (standard geographic data format)',
    icon: FileJson,
    extension: '.geojson',
  },
  {
    format: 'kml',
    label: 'KML',
    description: 'Export as KML format (Google Earth compatible)',
    icon: File,
    extension: '.kml',
  },
  {
    format: 'csv',
    label: 'CSV',
    description: 'Export as CSV table (properties only)',
    icon: FileText,
    extension: '.csv',
  },
  {
    format: 'image',
    label: 'PNG Image',
    description: 'Export map as PNG image',
    icon: Image,
    extension: '.png',
  },
]

export function ExportDialog({ open, onOpenChange, mapContainer }: ExportDialogProps) {
  const { layers, filterCriteria } = useGeoJSONStore()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('geojson')
  const [includeFiltered, setIncludeFiltered] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filename, setFilename] = useState('export')

  // Check if there's data to export
  const hasData = layers.length > 0 && layers.some((layer) => layer.data.features.length > 0)

  // Get data to export
  const getExportData = (): FeatureCollection => {
    // Combine all visible layers
    const allFeatures = layers
      .filter((layer) => layer.visible)
      .flatMap((layer) => layer.data.features)

    let features = allFeatures

    // Apply filters if option is selected
    if (includeFiltered) {
      features = applyFilters(features, filterCriteria)
    }

    return {
      type: 'FeatureCollection',
      features,
    }
  }

  // Get file size estimate
  const getFileSize = (): string => {
    if (!hasData) return '0 B'

    try {
      const data = getExportData()
      if (selectedFormat === 'geojson') {
        return GeoJSONExporter.formatSize(GeoJSONExporter.getSize(data))
      }
      if (selectedFormat === 'kml') {
        const kml = KMLExporter.toKML(data)
        return GeoJSONExporter.formatSize(new Blob([kml]).size)
      }
      if (selectedFormat === 'csv') {
        const csv = CSVExporter.toCSV(data)
        return GeoJSONExporter.formatSize(new Blob([csv]).size)
      }
      return '~1 MB'
    } catch (error) {
      return 'Unknown'
    }
  }

  // Handle export
  const handleExport = async () => {
    if (!hasData) return

    setExporting(true)

    try {
      const data = getExportData()
      const extension = exportOptions.find((opt) => opt.format === selectedFormat)?.extension || ''
      const fullFilename = filename.endsWith(extension) ? filename : `${filename}${extension}`

      switch (selectedFormat) {
        case 'geojson':
          GeoJSONExporter.download(data, fullFilename)
          break

        case 'kml':
          KMLExporter.download(data, fullFilename)
          break

        case 'csv':
          CSVExporter.download(data, fullFilename)
          break

        case 'image':
          if (mapContainer) {
            await ImageExporter.download(mapContainer, fullFilename)
          } else {
            throw new Error('Map container not available')
          }
          break
      }

      // Close dialog after successful export
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  const featureCount = hasData ? getExportData().features.length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Choose a format and export your geographic data
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody>
          {!hasData ? (
            <div className="text-center py-8 text-gray-500">
              <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No data to export. Please load some GeoJSON data first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {exportOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedFormat === option.format
                    return (
                      <button
                        key={option.format}
                        onClick={() => setSelectedFormat(option.format)}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Filename Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filename
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="export"
                  />
                  <span className="text-gray-500 text-sm">
                    {exportOptions.find((opt) => opt.format === selectedFormat)?.extension}
                  </span>
                </div>
              </div>

              {/* Export Options */}
              {selectedFormat !== 'image' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeFiltered"
                    checked={includeFiltered}
                    onChange={(e) => setIncludeFiltered(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeFiltered" className="text-sm text-gray-700">
                    Apply current filters to export
                  </label>
                </div>
              )}

              {/* Export Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Features to export:</span>
                  <span className="font-medium text-gray-900">{featureCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated file size:</span>
                  <span className="font-medium text-gray-900">{getFileSize()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!hasData || exporting}>
            {exporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
