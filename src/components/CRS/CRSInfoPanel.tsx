import { AlertCircle, CheckCircle, Globe, Info } from 'lucide-react'
import { useGeoJSONStore } from '@/store/geojson-store'
import { CRSUtils } from '@/lib/utils/crs-utils'
import { useState } from 'react'

export function CRSInfoPanel() {
  const { layers } = useGeoJSONStore()
  const [expanded, setExpanded] = useState(false)

  // Get CRS info from active layers
  const activeLayers = layers.filter((l) => l.visible)

  if (activeLayers.length === 0) {
    return null
  }

  // Check if all layers have the same CRS
  const crsInfos = activeLayers
    .map((l) => l.crsInfo)
    .filter((c) => c !== undefined)

  const allWGS84 = crsInfos.every((c) => c?.isWGS84)
  const hasWarnings = crsInfos.some((c) => c?.warnings && c.warnings.length > 0)
  const hasCoordinateErrors = activeLayers.some(
    (l) => l.coordinateValidation && !l.coordinateValidation.valid
  )

  const hasIssues = !allWGS84 || hasWarnings || hasCoordinateErrors

  // Get primary CRS (from first visible layer)
  const primaryCRS = crsInfos[0]

  if (!primaryCRS) {
    return null
  }

  return (
    <div className="bg-white border-t">
      {/* Compact view */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            CRS: {CRSUtils.formatCRSDisplay(primaryCRS)}
          </span>

          {hasIssues && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">Issues detected</span>
            </div>
          )}

          {!hasIssues && allWGS84 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Valid WGS84</span>
            </div>
          )}
        </div>

        <Info className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded view */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t bg-gray-50">
          {/* CRS Information */}
          <div className="pt-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Coordinate Reference System
            </h4>
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Name:</span> {primaryCRS.name}
              </div>
              {primaryCRS.epsgCode && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">EPSG Code:</span> {primaryCRS.epsgCode}
                </div>
              )}
              <div className="text-xs text-gray-600">
                <span className="font-medium">Standard:</span>{' '}
                {primaryCRS.isWGS84 ? (
                  <span className="text-green-600">RFC 7946 Compliant (WGS84)</span>
                ) : (
                  <span className="text-yellow-600">Non-standard CRS</span>
                )}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(hasWarnings || hasCoordinateErrors) && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-yellow-600" />
                Warnings
              </h4>
              <div className="space-y-1">
                {activeLayers.map((layer) => {
                  const layerWarnings = [
                    ...(layer.crsInfo?.warnings || []),
                    ...(layer.coordinateValidation?.errors || []),
                  ]

                  if (layerWarnings.length === 0) return null

                  return (
                    <div key={layer.id} className="text-xs">
                      <div className="font-medium text-gray-700 mb-1">
                        {layer.name}:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-gray-600 ml-2">
                        {layerWarnings.slice(0, 3).map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                        {layerWarnings.length > 3 && (
                          <li className="text-gray-500">
                            ... and {layerWarnings.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Info about WGS84 */}
          {primaryCRS.isWGS84 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                {CRSUtils.getWGS84Description()}
              </p>
            </div>
          )}

          {/* Multiple layers with different CRS */}
          {crsInfos.length > 1 && (
            <div className="pt-2 border-t">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Active Layers ({activeLayers.length})
              </h4>
              <div className="space-y-1">
                {activeLayers.map((layer) => (
                  <div key={layer.id} className="text-xs flex items-center justify-between">
                    <span className="text-gray-600 truncate">{layer.name}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {layer.crsInfo
                        ? layer.crsInfo.epsgCode || layer.crsInfo.name
                        : 'WGS84'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
