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
          const geojson = await GeoJSONParser.parse(file)
          const validation = GeoJSONParser.validate(geojson)

          if (!validation.valid) {
            alert(`Invalid GeoJSON: ${validation.errors[0]?.message}`)
            return
          }

          const featureCollection = GeoJSONParser.toFeatureCollection(geojson)

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
              weight: 2,
              fillOpacity: 0.2,
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
