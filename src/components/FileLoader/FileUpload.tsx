import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Link as LinkIcon } from 'lucide-react'
import { GeoJSONParser } from '@/lib/parser/geojson-parser'
import { useGeoJSONStore } from '@/store/geojson-store'
import { StatisticsAnalyzer } from '@/lib/analyzer/statistics'
import { CRSUtils } from '@/lib/utils/crs-utils'

export function FileUpload() {
  const { addLayer, setStatistics } = useGeoJSONStore()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          // Check file size and show warnings
          const fileSizeMB = file.size / (1024 * 1024)
          const fileSizeFormatted = fileSizeMB.toFixed(2)

          // Show warning for large files
          if (fileSizeMB > 50) {
            const proceed = confirm(
              `⚠️ Large File Warning\n\n` +
                `File size: ${fileSizeFormatted} MB\n\n` +
                `This file is very large and may cause performance issues or browser crashes.\n\n` +
                `Recommendations:\n` +
                `• Files over 50 MB may be slow to load\n` +
                `• Consider simplifying the geometry\n` +
                `• Or split into multiple smaller files\n\n` +
                `Do you want to continue loading this file?`
            )
            if (!proceed) {
              return
            }
          } else if (fileSizeMB > 10) {
            const proceed = confirm(
              `⚠️ Large File Notice\n\n` +
                `File size: ${fileSizeFormatted} MB\n\n` +
                `This file may take a moment to load and render.\n` +
                `Performance optimizations will be automatically applied.\n\n` +
                `Continue loading?`
            )
            if (!proceed) {
              return
            }
          }

          // Show loading indicator for large files
          if (fileSizeMB > 5) {
            console.log(`Loading ${fileSizeFormatted} MB file...`)
          }

          const geojson = await GeoJSONParser.parse(file)
          const validation = GeoJSONParser.validate(geojson)

          if (!validation.valid) {
            alert(`Invalid GeoJSON: ${validation.errors[0]?.message}`)
            return
          }

          const featureCollection = GeoJSONParser.toFeatureCollection(geojson)

          // Show feature count warning for very large datasets
          const featureCount = featureCollection.features.length
          if (featureCount > 10000) {
            const proceed = confirm(
              `⚠️ Large Dataset Warning\n\n` +
                `Feature count: ${featureCount.toLocaleString()} features\n\n` +
                `This dataset contains a large number of features.\n` +
                `Automatic optimizations enabled:\n` +
                `• Point clustering (for ${featureCount.toLocaleString()}+ points)\n` +
                `• Virtual scrolling (for lists/tables)\n` +
                `• Debounced filtering\n\n` +
                `Performance may vary depending on your device.\n\n` +
                `Continue loading?`
            )
            if (!proceed) {
              return
            }
          } else if (featureCount > 5000) {
            console.info(
              `Loading ${featureCount.toLocaleString()} features with automatic optimizations...`
            )
          }

          // Detect CRS
          const crsInfo = CRSUtils.detectCRS(geojson)

          // Validate coordinates
          const coordinateValidation = CRSUtils.validateCoordinates(featureCollection)

          // Check for projection issues
          const projectionCheck = CRSUtils.detectProjectionIssues(featureCollection)

          // Show warnings if any
          const allWarnings = [
            ...crsInfo.warnings,
            ...coordinateValidation.errors,
            ...projectionCheck.suggestions,
          ]

          if (allWarnings.length > 0) {
            const warningMessage = [
              'Coordinate System Warnings:',
              '',
              ...allWarnings.slice(0, 5).map((w, i) => `${i + 1}. ${w}`),
              allWarnings.length > 5 ? `... and ${allWarnings.length - 5} more warnings` : '',
            ]
              .filter(Boolean)
              .join('\n')

            console.warn('CRS/Coordinate warnings:', allWarnings)

            if (projectionCheck.likelyIssue || !crsInfo.isValid || coordinateValidation.outOfBoundsCount > 0) {
              if (!confirm(`${warningMessage}\n\nDo you want to continue loading this file?`)) {
                return
              }
            } else {
              // Just log minor warnings without blocking
              console.info('CRS Info:', crsInfo)
            }
          }

          // Add as layer
          const layer = {
            id: crypto.randomUUID(),
            name: file.name,
            data: featureCollection,
            visible: true,
            opacity: 1,
            style: {
              color: '#3388ff',
              fillColor: '#3b82f6',
              weight: 2,
              fillOpacity: 0.2,
              opacity: 1,
              dashArray: undefined,
              markerType: 'circle' as const,
              markerRadius: 8,
              markerColor: '#1e40af',
              markerFillColor: '#3b82f6',
              markerFillOpacity: 0.6,
              markerWeight: 2,
              markerOpacity: 1,
            },
            zIndex: 1,
            crsInfo,
            coordinateValidation,
          }

          addLayer(layer)

          // Calculate statistics
          const stats = StatisticsAnalyzer.analyze(featureCollection)
          setStatistics(stats)
        } catch (error) {
          console.error('Error loading file:', error)
          alert(`Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    },
    [addLayer, setStatistics]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json', '.geojson'],
      'application/geo+json': ['.geojson'],
    },
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-sm text-gray-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop GeoJSON files here
            </p>
            <p className="text-xs text-gray-500">or click to browse</p>
          </>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Sample Data</h3>
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors flex items-center gap-2">
            <File className="h-4 w-4 text-gray-500" />
            World Countries
          </button>
          <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors flex items-center gap-2">
            <File className="h-4 w-4 text-gray-500" />
            US States
          </button>
          <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors flex items-center gap-2">
            <File className="h-4 w-4 text-gray-500" />
            Major Cities
          </button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Load from URL</h3>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Enter GeoJSON URL..."
            className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="px-4 py-2 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Load
          </button>
        </div>
      </div>
    </div>
  )
}
