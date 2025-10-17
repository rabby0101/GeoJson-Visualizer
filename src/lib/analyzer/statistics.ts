import { FeatureCollection } from 'geojson'
import * as turf from '@turf/turf'
import { StatisticsResult, PropertyStatistics, BoundingBox } from '@/types'

export class StatisticsAnalyzer {
  static analyze(geojson: FeatureCollection): StatisticsResult {
    const geometryTypes: Record<string, number> = {}
    const propertyMap = new Map<string, any[]>()
    let totalArea = 0
    let totalLength = 0

    // Collect statistics
    geojson.features.forEach((feature) => {
      // Count geometry types
      const geomType = feature.geometry?.type || 'null'
      geometryTypes[geomType] = (geometryTypes[geomType] || 0) + 1

      // Calculate measurements
      try {
        if (feature.geometry?.type.includes('Polygon')) {
          totalArea += turf.area(feature) / 1_000_000 // Convert to sq km
        }
        if (
          feature.geometry?.type === 'LineString' ||
          feature.geometry?.type === 'MultiLineString'
        ) {
          totalLength += turf.length(feature, { units: 'kilometers' })
        }
      } catch (error) {
        console.warn('Error calculating measurements:', error)
      }

      // Collect property values
      if (feature.properties) {
        Object.entries(feature.properties).forEach(([key, value]) => {
          if (!propertyMap.has(key)) {
            propertyMap.set(key, [])
          }
          propertyMap.get(key)!.push(value)
        })
      }
    })

    // Calculate bounds
    let bounds: BoundingBox
    try {
      const bbox = turf.bbox(geojson)
      bounds = {
        minLng: bbox[0],
        minLat: bbox[1],
        maxLng: bbox[2],
        maxLat: bbox[3],
      }
    } catch {
      bounds = { minLng: 0, minLat: 0, maxLng: 0, maxLat: 0 }
    }

    // Analyze properties
    const properties: PropertyStatistics[] = []
    propertyMap.forEach((values, name) => {
      properties.push(this.analyzeProperty(name, values))
    })

    return {
      featureCount: geojson.features.length,
      geometryTypes,
      bounds,
      properties,
      totalArea: totalArea > 0 ? totalArea : undefined,
      totalLength: totalLength > 0 ? totalLength : undefined,
    }
  }

  private static analyzeProperty(name: string, values: any[]): PropertyStatistics {
    const types = new Set(values.map((v) => (v === null ? 'null' : typeof v)))
    const uniqueValues = new Set(values.filter((v) => v !== null))
    const nullCount = values.filter((v) => v === null).length

    const stat: PropertyStatistics = {
      name,
      type: types.size === 1 ? (Array.from(types)[0] as any) : 'mixed',
      uniqueValues: uniqueValues.size,
      nullCount,
    }

    // Numeric statistics
    if (stat.type === 'number') {
      const numbers = values.filter((v) => typeof v === 'number') as number[]
      if (numbers.length > 0) {
        stat.min = Math.min(...numbers)
        stat.max = Math.max(...numbers)
        stat.mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
        stat.median = this.calculateMedian(numbers)
      }
    }

    // String statistics
    if (stat.type === 'string') {
      const counts = new Map<string, number>()
      values.forEach((v) => {
        if (typeof v === 'string') {
          counts.set(v, (counts.get(v) || 0) + 1)
        }
      })
      stat.topValues = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([value, count]) => ({ value, count }))
    }

    return stat
  }

  private static calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }
}
