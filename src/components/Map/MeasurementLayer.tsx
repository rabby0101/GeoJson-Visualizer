import { useEffect } from 'react'
import { Polyline, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import { useGeoJSONStore } from '@/store/geojson-store'
import L from 'leaflet'

export function MeasurementLayer() {
  const map = useMap()
  const {
    measurementMode,
    currentMeasurementPoints,
    measurements,
    addMeasurementPoint,
    completeMeasurement,
    clearCurrentMeasurement,
  } = useGeoJSONStore()

  useEffect(() => {
    if (!measurementMode) return

    let clickTimeout: NodeJS.Timeout | null = null
    let isDoubleClick = false

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Stop propagation to prevent feature clicks
      L.DomEvent.stopPropagation(e)

      // Clear any pending single click
      if (clickTimeout) {
        clearTimeout(clickTimeout)
      }

      // Delay the click to see if it's a double-click
      clickTimeout = setTimeout(() => {
        if (!isDoubleClick) {
          const point: [number, number] = [e.latlng.lng, e.latlng.lat]
          addMeasurementPoint(point)

          // Auto-complete for bearing (2 points)
          if (measurementMode === 'bearing' && currentMeasurementPoints.length === 1) {
            setTimeout(() => {
              completeMeasurement()
            }, 100)
          }
        }
        isDoubleClick = false
      }, 250)
    }

    const handleMapDblClick = (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e)
      e.originalEvent.preventDefault()

      isDoubleClick = true

      // Clear the pending single click
      if (clickTimeout) {
        clearTimeout(clickTimeout)
        clickTimeout = null
      }

      console.log('Double-click detected, completing measurement. Points:', currentMeasurementPoints.length)

      // Complete measurement on double click
      if (currentMeasurementPoints.length >= 2) {
        completeMeasurement()
      } else {
        console.log('Not enough points to complete measurement')
      }
    }

    // Add event listeners
    map.on('click', handleMapClick)
    map.on('dblclick', handleMapDblClick)

    // Disable double-click zoom while measuring
    map.doubleClickZoom.disable()

    // Change cursor
    map.getContainer().style.cursor = 'crosshair'

    return () => {
      if (clickTimeout) clearTimeout(clickTimeout)
      map.off('click', handleMapClick)
      map.off('dblclick', handleMapDblClick)
      map.doubleClickZoom.enable()
      map.getContainer().style.cursor = ''
    }
  }, [
    measurementMode,
    currentMeasurementPoints,
    map,
    addMeasurementPoint,
    completeMeasurement,
  ])

  // Clear measurement when Escape is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && measurementMode) {
        clearCurrentMeasurement()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [measurementMode, clearCurrentMeasurement])

  // Render current measurement being drawn
  const renderCurrentMeasurement = () => {
    if (currentMeasurementPoints.length === 0) return null

    const latLngs = currentMeasurementPoints.map((p) => [p[1], p[0]] as [number, number])

    if (measurementMode === 'distance' || measurementMode === 'bearing') {
      return (
        <>
          <Polyline
            positions={latLngs}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              dashArray: '10, 10',
            }}
          />
          {latLngs.map((pos, idx) => (
            <Marker
              key={`current-${idx}`}
              position={pos}
              icon={L.divIcon({
                className: 'measurement-marker',
                html: `<div style="background: #3b82f6; width: 10px; height: 10px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              })}
            />
          ))}
        </>
      )
    }

    if (measurementMode === 'area' && latLngs.length >= 2) {
      return (
        <>
          <Polygon
            positions={latLngs}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 3,
              dashArray: '10, 10',
            }}
          />
          {latLngs.map((pos, idx) => (
            <Marker
              key={`current-${idx}`}
              position={pos}
              icon={L.divIcon({
                className: 'measurement-marker',
                html: `<div style="background: #3b82f6; width: 10px; height: 10px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              })}
            />
          ))}
        </>
      )
    }

    return null
  }

  // Render completed measurements
  const renderCompletedMeasurements = () => {
    return measurements.map((measurement) => {
      const latLngs = measurement.coordinates.map(
        (p) => [p[1], p[0]] as [number, number]
      )

      if (measurement.type === 'distance' || measurement.type === 'bearing') {
        const midPoint = latLngs[Math.floor(latLngs.length / 2)]

        return (
          <div key={measurement.id}>
            <Polyline
              positions={latLngs}
              pathOptions={{
                color: '#10b981',
                weight: 2,
              }}
            />
            <Marker
              position={midPoint}
              icon={L.divIcon({
                className: 'measurement-label',
                html: `<div style="background: white; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 12px; font-weight: 600; white-space: nowrap;">${measurement.label}</div>`,
                iconAnchor: [0, 0],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold capitalize">{measurement.type}</div>
                  <div className="text-gray-600">{measurement.label}</div>
                </div>
              </Popup>
            </Marker>
          </div>
        )
      }

      if (measurement.type === 'area') {
        // Calculate centroid for label placement
        const centroid = latLngs.reduce(
          (acc, pos) => [acc[0] + pos[0], acc[1] + pos[1]],
          [0, 0]
        )
        centroid[0] /= latLngs.length
        centroid[1] /= latLngs.length

        return (
          <div key={measurement.id}>
            <Polygon
              positions={latLngs}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.2,
                weight: 2,
              }}
            />
            <Marker
              position={centroid as [number, number]}
              icon={L.divIcon({
                className: 'measurement-label',
                html: `<div style="background: white; padding: 4px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 12px; font-weight: 600; white-space: nowrap;">${measurement.label}</div>`,
                iconAnchor: [0, 0],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">Area</div>
                  <div className="text-gray-600">{measurement.label}</div>
                </div>
              </Popup>
            </Marker>
          </div>
        )
      }

      return null
    })
  }

  return (
    <>
      {renderCurrentMeasurement()}
      {renderCompletedMeasurements()}
    </>
  )
}
