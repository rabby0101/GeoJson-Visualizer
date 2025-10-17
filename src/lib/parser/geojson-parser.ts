import { Feature, FeatureCollection, GeoJSON, Geometry } from 'geojson'
import { ValidationResult, ValidationError, ValidationWarning } from '@/types'

export class GeoJSONParser {
  /**
   * Parse GeoJSON from file or string
   */
  static async parse(input: File | string): Promise<GeoJSON> {
    try {
      let jsonString: string

      if (input instanceof File) {
        jsonString = await input.text()
      } else {
        jsonString = input
      }

      const parsed = JSON.parse(jsonString)
      return parsed as GeoJSON
    } catch (error) {
      throw new Error(
        `Failed to parse GeoJSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate GeoJSON structure
   */
  static validate(geojson: unknown): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Type check
    if (!geojson || typeof geojson !== 'object') {
      errors.push({
        message: 'GeoJSON must be an object',
        code: 'INVALID_TYPE',
      })
      return { valid: false, errors, warnings }
    }

    const obj = geojson as any

    // Check for type property
    if (!obj.type) {
      errors.push({
        message: 'Missing required "type" property',
        code: 'MISSING_TYPE',
      })
      return { valid: false, errors, warnings }
    }

    // Validate based on type
    switch (obj.type) {
      case 'FeatureCollection':
        this.validateFeatureCollection(obj, errors, warnings)
        break
      case 'Feature':
        this.validateFeature(obj, errors, warnings)
        break
      case 'Point':
      case 'LineString':
      case 'Polygon':
      case 'MultiPoint':
      case 'MultiLineString':
      case 'MultiPolygon':
      case 'GeometryCollection':
        this.validateGeometry(obj, errors, warnings)
        break
      default:
        errors.push({
          message: `Invalid GeoJSON type: ${obj.type}`,
          code: 'INVALID_GEOJSON_TYPE',
        })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Convert any GeoJSON to FeatureCollection
   */
  static toFeatureCollection(geojson: GeoJSON): FeatureCollection {
    if (geojson.type === 'FeatureCollection') {
      return geojson as FeatureCollection
    }

    if (geojson.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geojson as Feature],
      }
    }

    // If it's a geometry, wrap it in a feature
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: geojson as Geometry,
          properties: {},
        },
      ],
    }
  }

  private static validateFeatureCollection(
    fc: any,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!Array.isArray(fc.features)) {
      errors.push({
        message: 'FeatureCollection must have a "features" array',
        code: 'MISSING_FEATURES',
      })
      return
    }

    fc.features.forEach((feature: any, index: number) => {
      if (feature.type !== 'Feature') {
        errors.push({
          message: `Feature at index ${index} has invalid type`,
          path: `features[${index}]`,
          code: 'INVALID_FEATURE_TYPE',
        })
      }
      this.validateFeature(feature, errors, warnings, `features[${index}]`)
    })
  }

  private static validateFeature(
    feature: any,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    path: string = ''
  ): void {
    if (!feature.geometry && feature.geometry !== null) {
      errors.push({
        message: 'Feature must have a geometry property',
        path,
        code: 'MISSING_GEOMETRY',
      })
      return
    }

    if (feature.geometry === null) {
      warnings.push({
        message: 'Feature has null geometry',
        path,
      })
      return
    }

    this.validateGeometry(feature.geometry, errors, warnings, `${path}.geometry`)
  }

  private static validateGeometry(
    geometry: any,
    errors: ValidationError[],
    _warnings: ValidationWarning[],
    path: string = ''
  ): void {
    if (geometry.type === 'GeometryCollection') {
      if (!Array.isArray(geometry.geometries)) {
        errors.push({
          message: 'GeometryCollection must have geometries array',
          path,
          code: 'MISSING_GEOMETRIES',
        })
      }
      return
    }

    if (!geometry.coordinates) {
      errors.push({
        message: 'Geometry must have coordinates',
        path,
        code: 'MISSING_COORDINATES',
      })
      return
    }

    if (!Array.isArray(geometry.coordinates)) {
      errors.push({
        message: 'Coordinates must be an array',
        path,
        code: 'INVALID_COORDINATES',
      })
    }
  }
}
