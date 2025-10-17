import { FeatureCollection, Position } from 'geojson'

export interface CRSInfo {
  name: string
  epsgCode?: string
  isWGS84: boolean
  isValid: boolean
  warnings: string[]
}

export class CRSUtils {
  /**
   * Detect CRS from GeoJSON
   * RFC 7946 mandates WGS84, but older GeoJSON may have CRS objects
   */
  static detectCRS(geojson: any): CRSInfo {
    const warnings: string[] = []

    // RFC 7946 mandates WGS84
    let name = 'WGS 84'
    let epsgCode = 'EPSG:4326'
    let isWGS84 = true
    let isValid = true

    // Check for deprecated CRS object (pre-RFC 7946)
    if (geojson.crs) {
      warnings.push(
        'CRS object detected. Note: RFC 7946 removes CRS support. GeoJSON should use WGS84 (EPSG:4326).'
      )

      // Try to parse CRS
      if (geojson.crs.type === 'name' && geojson.crs.properties?.name) {
        const crsName = geojson.crs.properties.name
        name = crsName
        isWGS84 = crsName.includes('4326') || crsName.includes('WGS84')

        // Extract EPSG code if present
        const epsgMatch = crsName.match(/EPSG[:/](\d+)/i)
        if (epsgMatch) {
          epsgCode = `EPSG:${epsgMatch[1]}`
        }

        if (!isWGS84) {
          warnings.push(
            `Non-WGS84 CRS detected: ${name}. This may cause display issues as the map expects WGS84 coordinates.`
          )
          isValid = false
        }
      }
    }

    return {
      name,
      epsgCode,
      isWGS84,
      isValid,
      warnings,
    }
  }

  /**
   * Validate that coordinates are within WGS84 bounds
   * Longitude: -180 to 180
   * Latitude: -90 to 90
   */
  static validateCoordinates(geojson: FeatureCollection): {
    valid: boolean
    errors: string[]
    outOfBoundsCount: number
  } {
    const errors: string[] = []
    let outOfBoundsCount = 0

    const checkCoordinate = (coord: Position, featureIndex: number) => {
      const [lng, lat] = coord

      if (lng < -180 || lng > 180) {
        outOfBoundsCount++
        if (errors.length < 5) {
          // Limit error messages
          errors.push(
            `Feature ${featureIndex}: Longitude ${lng} is out of valid range [-180, 180]`
          )
        }
      }

      if (lat < -90 || lat > 90) {
        outOfBoundsCount++
        if (errors.length < 5) {
          errors.push(
            `Feature ${featureIndex}: Latitude ${lat} is out of valid range [-90, 90]`
          )
        }
      }
    }

    const checkGeometry = (geometry: any, featureIndex: number) => {
      if (!geometry || !geometry.coordinates) return

      const { type, coordinates } = geometry

      switch (type) {
        case 'Point':
          checkCoordinate(coordinates, featureIndex)
          break

        case 'LineString':
        case 'MultiPoint':
          coordinates.forEach((coord: Position) => checkCoordinate(coord, featureIndex))
          break

        case 'Polygon':
        case 'MultiLineString':
          coordinates.forEach((ring: Position[]) => {
            ring.forEach((coord: Position) => checkCoordinate(coord, featureIndex))
          })
          break

        case 'MultiPolygon':
          coordinates.forEach((polygon: Position[][]) => {
            polygon.forEach((ring: Position[]) => {
              ring.forEach((coord: Position) => checkCoordinate(coord, featureIndex))
            })
          })
          break

        case 'GeometryCollection':
          geometry.geometries.forEach((geom: any) => checkGeometry(geom, featureIndex))
          break
      }
    }

    geojson.features.forEach((feature, index) => {
      if (feature.geometry) {
        checkGeometry(feature.geometry, index)
      }
    })

    if (outOfBoundsCount > 5) {
      errors.push(`... and ${outOfBoundsCount - 5} more coordinate errors`)
    }

    return {
      valid: errors.length === 0,
      errors,
      outOfBoundsCount,
    }
  }

  /**
   * Check if coordinates might be in a different projection
   * This is a heuristic check, not definitive
   */
  static detectProjectionIssues(geojson: FeatureCollection): {
    likelyIssue: boolean
    suggestions: string[]
  } {
    const suggestions: string[] = []
    let likelyIssue = false

    // Get all coordinates
    const allCoords: Position[] = []
    geojson.features.forEach((feature) => {
      if (feature.geometry) {
        this.extractCoordinates(feature.geometry, allCoords)
      }
    })

    if (allCoords.length === 0) {
      return { likelyIssue: false, suggestions: [] }
    }

    // Check if all coordinates are very large (e.g., UTM or Web Mercator)
    const allLarge = allCoords.every(([lng, lat]) =>
      Math.abs(lng) > 180 || Math.abs(lat) > 90
    )

    if (allLarge) {
      likelyIssue = true
      suggestions.push(
        'Coordinates appear to be in a projected coordinate system (e.g., UTM, Web Mercator).',
        'GeoJSON requires WGS84 (EPSG:4326) coordinates in decimal degrees.',
        'Please reproject your data to WGS84 before loading.'
      )
    }

    // Check if coordinates are suspiciously small (might be in wrong order)
    const allSmall = allCoords.every(([lng, lat]) =>
      Math.abs(lng) < 1 && Math.abs(lat) < 1
    )

    if (allSmall && !likelyIssue) {
      suggestions.push(
        'Coordinates are very close to [0, 0]. This might indicate an issue with the data.'
      )
    }

    // Check if lat/lng might be swapped
    const possiblySwapped = allCoords.some(([lng, lat]) =>
      Math.abs(lat) > 90 && Math.abs(lng) <= 90
    )

    if (possiblySwapped && !likelyIssue) {
      likelyIssue = true
      suggestions.push(
        'Some coordinates have latitude values > 90° but longitude values within range.',
        'Your latitude and longitude values might be swapped.',
        'GeoJSON coordinates should be in [longitude, latitude] order.'
      )
    }

    return { likelyIssue, suggestions }
  }

  private static extractCoordinates(geometry: any, result: Position[]): void {
    if (!geometry || !geometry.coordinates) return

    const { type, coordinates } = geometry

    switch (type) {
      case 'Point':
        result.push(coordinates)
        break

      case 'LineString':
      case 'MultiPoint':
        result.push(...coordinates)
        break

      case 'Polygon':
      case 'MultiLineString':
        coordinates.forEach((ring: Position[]) => result.push(...ring))
        break

      case 'MultiPolygon':
        coordinates.forEach((polygon: Position[][]) => {
          polygon.forEach((ring: Position[]) => result.push(...ring))
        })
        break

      case 'GeometryCollection':
        geometry.geometries.forEach((geom: any) => this.extractCoordinates(geom, result))
        break
    }
  }

  /**
   * Format CRS information for display
   */
  static formatCRSDisplay(crsInfo: CRSInfo): string {
    if (crsInfo.epsgCode) {
      return `${crsInfo.name} (${crsInfo.epsgCode})`
    }
    return crsInfo.name
  }

  /**
   * Get a user-friendly description of WGS84
   */
  static getWGS84Description(): string {
    return 'World Geodetic System 1984 - Standard for GeoJSON (RFC 7946). Coordinates in decimal degrees.'
  }
}
