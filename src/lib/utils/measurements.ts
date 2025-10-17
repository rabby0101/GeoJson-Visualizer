import * as turf from '@turf/turf'
import { Position } from 'geojson'

export interface MeasurementResult {
  id: string
  type: 'distance' | 'area' | 'bearing'
  value: number
  coordinates: Position[]
  label: string
  timestamp: number
}

export class MeasurementTools {
  /**
   * Calculate distance between two points
   * @returns Distance in meters
   */
  static calculateDistance(point1: Position, point2: Position): number {
    const from = turf.point(point1)
    const to = turf.point(point2)
    return turf.distance(from, to, { units: 'meters' })
  }

  /**
   * Calculate area of a polygon
   * @returns Area in square meters
   */
  static calculateArea(coordinates: Position[]): number {
    if (coordinates.length < 3) {
      throw new Error('Area calculation requires at least 3 points')
    }

    // Close the polygon if not already closed
    const coords = [...coordinates]
    if (
      coords[0][0] !== coords[coords.length - 1][0] ||
      coords[0][1] !== coords[coords.length - 1][1]
    ) {
      coords.push(coords[0])
    }

    const polygon = turf.polygon([coords])
    return turf.area(polygon)
  }

  /**
   * Calculate bearing between two points
   * @returns Bearing in degrees (0-360)
   */
  static calculateBearing(point1: Position, point2: Position): number {
    const from = turf.point(point1)
    const to = turf.point(point2)
    const bearing = turf.bearing(from, to)
    // Convert to 0-360 range
    return bearing < 0 ? bearing + 360 : bearing
  }

  /**
   * Calculate perimeter of a polygon
   * @returns Perimeter in meters
   */
  static calculatePerimeter(coordinates: Position[]): number {
    if (coordinates.length < 2) {
      throw new Error('Perimeter calculation requires at least 2 points')
    }

    let totalDistance = 0
    for (let i = 0; i < coordinates.length - 1; i++) {
      totalDistance += this.calculateDistance(coordinates[i], coordinates[i + 1])
    }

    // Add distance from last point back to first point
    if (coordinates.length > 2) {
      totalDistance += this.calculateDistance(
        coordinates[coordinates.length - 1],
        coordinates[0]
      )
    }

    return totalDistance
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters.toFixed(2)} m`
    } else if (meters < 100000) {
      return `${(meters / 1000).toFixed(2)} km`
    } else {
      return `${(meters / 1000).toFixed(0)} km`
    }
  }

  /**
   * Format area for display
   */
  static formatArea(squareMeters: number): string {
    if (squareMeters < 10000) {
      return `${squareMeters.toFixed(2)} m²`
    } else if (squareMeters < 1000000) {
      return `${(squareMeters / 10000).toFixed(2)} ha`
    } else {
      return `${(squareMeters / 1000000).toFixed(2)} km²`
    }
  }

  /**
   * Format bearing for display
   */
  static formatBearing(degrees: number): string {
    const cardinalDirections = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ]
    const index = Math.round(degrees / 22.5) % 16
    return `${degrees.toFixed(1)}° (${cardinalDirections[index]})`
  }

  /**
   * Convert distance to different units
   */
  static convertDistance(meters: number, unit: 'm' | 'km' | 'mi' | 'ft'): number {
    switch (unit) {
      case 'm':
        return meters
      case 'km':
        return meters / 1000
      case 'mi':
        return meters / 1609.344
      case 'ft':
        return meters * 3.28084
      default:
        return meters
    }
  }

  /**
   * Convert area to different units
   */
  static convertArea(
    squareMeters: number,
    unit: 'm2' | 'km2' | 'ha' | 'ac' | 'mi2'
  ): number {
    switch (unit) {
      case 'm2':
        return squareMeters
      case 'km2':
        return squareMeters / 1000000
      case 'ha':
        return squareMeters / 10000
      case 'ac':
        return squareMeters / 4046.86
      case 'mi2':
        return squareMeters / 2589988
      default:
        return squareMeters
    }
  }
}
