import { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import * as turf from '@turf/turf'

export type SpatialRelation =
  | 'intersects'
  | 'contains'
  | 'within'
  | 'overlaps'
  | 'touches'
  | 'crosses'
  | 'disjoint'

export interface QueryOptions {
  relation: SpatialRelation
  geometry: Geometry
  buffer?: number // Buffer distance in meters
}

export interface NearestOptions {
  point: Position
  limit?: number
  maxDistance?: number // Maximum distance in meters
}

export class SpatialQuery {
  /**
   * Query features based on spatial relationship with geometry
   */
  static query(features: Feature[], options: QueryOptions): Feature[] {
    const { relation, geometry, buffer } = options
    let queryGeometry = turf.feature(geometry)

    // Apply buffer if specified
    if (buffer && buffer > 0) {
      const buffered = turf.buffer(queryGeometry, buffer / 1000, { units: 'kilometers' })
      if (buffered) {
        queryGeometry = buffered
      }
    }

    return features.filter((feature) => {
      if (!feature.geometry) return false

      const featureGeom = turf.feature(feature.geometry)

      switch (relation) {
        case 'intersects':
          return this.intersects(featureGeom, queryGeometry)

        case 'contains':
          return this.contains(queryGeometry, featureGeom)

        case 'within':
          return this.within(featureGeom, queryGeometry)

        case 'overlaps':
          return this.overlaps(featureGeom, queryGeometry)

        case 'touches':
          return this.touches(featureGeom, queryGeometry)

        case 'crosses':
          return this.crosses(featureGeom, queryGeometry)

        case 'disjoint':
          return this.disjoint(featureGeom, queryGeometry)

        default:
          return false
      }
    })
  }

  /**
   * Find features within a bounding box
   */
  static withinBounds(
    features: Feature[],
    bounds: [number, number, number, number]
  ): Feature[] {
    const bbox = turf.bboxPolygon(bounds)

    return features.filter((feature) => {
      if (!feature.geometry) return false
      try {
        return turf.booleanWithin(feature, bbox) || turf.booleanIntersects(feature, bbox)
      } catch {
        return false
      }
    })
  }

  /**
   * Find features within distance of a point
   */
  static buffer(point: Position, distance: number): Feature | null {
    try {
      const pt = turf.point(point)
      const buffered = turf.buffer(pt, distance / 1000, { units: 'kilometers' })
      return buffered || null
    } catch {
      return null
    }
  }

  /**
   * Find nearest features to a point
   */
  static nearest(features: Feature[], options: NearestOptions): Feature[] {
    const { point, limit = 10, maxDistance } = options

    // Calculate distances
    const withDistances = features
      .filter((f) => f.geometry)
      .map((feature) => {
        try {
          // Get centroid for non-point features
          let featurePoint: Position
          if (feature.geometry!.type === 'Point') {
            featurePoint = (feature.geometry as any).coordinates
          } else {
            const center = turf.centroid(feature)
            featurePoint = center.geometry.coordinates
          }

          const distance = turf.distance(point, featurePoint, { units: 'meters' })
          return { feature, distance }
        } catch {
          return { feature, distance: Infinity }
        }
      })
      .filter((item) => {
        if (maxDistance === undefined) return true
        return item.distance <= maxDistance
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    return withDistances.map((item) => item.feature)
  }

  /**
   * Select features by attribute query
   */
  static queryByAttribute(
    features: Feature[],
    property: string,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith',
    value: any
  ): Feature[] {
    return features.filter((feature) => {
      const propValue = feature.properties?.[property]

      if (propValue === undefined || propValue === null) return false

      switch (operator) {
        case '=':
          return propValue === value
        case '!=':
          return propValue !== value
        case '>':
          return propValue > value
        case '<':
          return propValue < value
        case '>=':
          return propValue >= value
        case '<=':
          return propValue <= value
        case 'contains':
          return String(propValue).toLowerCase().includes(String(value).toLowerCase())
        case 'startsWith':
          return String(propValue).toLowerCase().startsWith(String(value).toLowerCase())
        case 'endsWith':
          return String(propValue).toLowerCase().endsWith(String(value).toLowerCase())
        default:
          return false
      }
    })
  }

  /**
   * Get features by ID
   */
  static getById(features: Feature[], id: string | number): Feature | undefined {
    return features.find((f) => f.id === id)
  }

  /**
   * Get features by IDs
   */
  static getByIds(features: Feature[], ids: Array<string | number>): Feature[] {
    const idSet = new Set(ids)
    return features.filter((f) => f.id !== undefined && idSet.has(f.id))
  }

  // Private helper methods for spatial relations

  private static intersects(feature1: Feature, feature2: Feature): boolean {
    try {
      return turf.booleanIntersects(feature1, feature2)
    } catch {
      return false
    }
  }

  private static contains(container: Feature, contained: Feature): boolean {
    try {
      return turf.booleanContains(container, contained)
    } catch {
      return false
    }
  }

  private static within(feature: Feature, container: Feature): boolean {
    try {
      return turf.booleanWithin(feature, container)
    } catch {
      return false
    }
  }

  private static overlaps(feature1: Feature, feature2: Feature): boolean {
    try {
      return turf.booleanOverlap(feature1, feature2)
    } catch {
      return false
    }
  }

  private static touches(feature1: Feature, feature2: Feature): boolean {
    try {
      // Turf doesn't have booleanTouches, so we check if they intersect but don't overlap
      const intersects = turf.booleanIntersects(feature1, feature2)
      if (!intersects) return false

      // If they overlap, they don't just touch
      try {
        const overlaps = turf.booleanOverlap(feature1, feature2)
        return !overlaps
      } catch {
        return intersects
      }
    } catch {
      return false
    }
  }

  private static crosses(feature1: Feature, feature2: Feature): boolean {
    try {
      return turf.booleanCrosses(feature1, feature2)
    } catch {
      return false
    }
  }

  private static disjoint(feature1: Feature, feature2: Feature): boolean {
    try {
      return turf.booleanDisjoint(feature1, feature2)
    } catch {
      return false
    }
  }

  /**
   * Calculate centroid of features
   */
  static centroid(feature: Feature): Position | null {
    try {
      if (!feature.geometry) return null
      const center = turf.centroid(feature)
      return center.geometry.coordinates
    } catch {
      return null
    }
  }

  /**
   * Get bounding box of features
   */
  static getBounds(features: Feature[]): [number, number, number, number] | null {
    try {
      const collection: FeatureCollection = {
        type: 'FeatureCollection',
        features: features.filter((f) => f.geometry),
      }

      if (collection.features.length === 0) return null

      return turf.bbox(collection) as [number, number, number, number]
    } catch {
      return null
    }
  }

  /**
   * Get convex hull of features
   */
  static convexHull(features: Feature[]): Feature | null {
    try {
      const collection: FeatureCollection = {
        type: 'FeatureCollection',
        features: features.filter((f) => f.geometry),
      }

      if (collection.features.length === 0) return null

      return turf.convex(collection)
    } catch {
      return null
    }
  }

  /**
   * Union of polygons
   */
  static union(features: Feature[]): Feature | null {
    try {
      const polygons = features.filter(
        (f) =>
          f.geometry &&
          (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
      ) as Feature[]

      if (polygons.length === 0) return null
      if (polygons.length === 1) return polygons[0]

      let result = polygons[0]
      for (let i = 1; i < polygons.length; i++) {
        const unionResult = turf.union(turf.featureCollection([result, polygons[i]]) as any)
        if (unionResult) {
          result = unionResult
        }
      }

      return result
    } catch {
      return null
    }
  }

  /**
   * Intersection of polygons
   */
  static intersection(feature1: Feature, feature2: Feature): Feature | null {
    try {
      return turf.intersect(turf.featureCollection([feature1, feature2]) as any)
    } catch {
      return null
    }
  }

  /**
   * Difference of polygons (feature1 - feature2)
   */
  static difference(feature1: Feature, feature2: Feature): Feature | null {
    try {
      return turf.difference(turf.featureCollection([feature1, feature2]) as any)
    } catch {
      return null
    }
  }
}
