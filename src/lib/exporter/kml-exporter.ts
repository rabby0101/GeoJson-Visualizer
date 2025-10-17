import { FeatureCollection, Feature, Geometry, Position } from 'geojson'

export class KMLExporter {
  /**
   * Convert GeoJSON FeatureCollection to KML string
   */
  static toKML(geojson: FeatureCollection): string {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>GeoJSON Export</name>
    <description>Exported from GeoJSON Visualizer</description>`

    const kmlFooter = `
  </Document>
</kml>`

    const placemarks = geojson.features
      .map((feature) => this.featureToPlacemark(feature))
      .join('\n')

    return `${kmlHeader}\n${placemarks}${kmlFooter}`
  }

  /**
   * Download KML file
   */
  static download(geojson: FeatureCollection, filename: string = 'export.kml'): void {
    const content = this.toKML(geojson)
    const blob = new Blob([content], { type: 'application/vnd.google-earth.kml+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Convert a GeoJSON Feature to KML Placemark
   */
  private static featureToPlacemark(feature: Feature): string {
    const name = this.getFeatureName(feature)
    const description = this.getFeatureDescription(feature)
    const geometry = feature.geometry ? this.geometryToKML(feature.geometry) : ''

    return `
    <Placemark>
      <name>${this.escapeXML(name)}</name>
      <description>${this.escapeXML(description)}</description>
      ${geometry}
    </Placemark>`
  }

  /**
   * Get feature name from properties
   */
  private static getFeatureName(feature: Feature): string {
    if (!feature.properties) return 'Unnamed Feature'

    const nameProps = ['name', 'Name', 'NAME', 'title', 'Title']
    for (const prop of nameProps) {
      if (feature.properties[prop]) {
        return String(feature.properties[prop])
      }
    }

    return 'Unnamed Feature'
  }

  /**
   * Get feature description from properties
   */
  private static getFeatureDescription(feature: Feature): string {
    if (!feature.properties) return ''

    return Object.entries(feature.properties)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  /**
   * Convert GeoJSON geometry to KML geometry
   */
  private static geometryToKML(geometry: Geometry): string {
    switch (geometry.type) {
      case 'Point':
        return this.pointToKML(geometry.coordinates as Position)
      case 'LineString':
        return this.lineStringToKML(geometry.coordinates as Position[])
      case 'Polygon':
        return this.polygonToKML(geometry.coordinates as Position[][])
      case 'MultiPoint':
        return this.multiPointToKML(geometry.coordinates as Position[])
      case 'MultiLineString':
        return this.multiLineStringToKML(geometry.coordinates as Position[][])
      case 'MultiPolygon':
        return this.multiPolygonToKML(geometry.coordinates as Position[][][])
      case 'GeometryCollection':
        return geometry.geometries
          .map((geom) => this.geometryToKML(geom))
          .join('\n')
      default:
        return ''
    }
  }

  /**
   * Convert Point to KML
   */
  private static pointToKML(coordinates: Position): string {
    const [lng, lat, alt = 0] = coordinates
    return `<Point><coordinates>${lng},${lat},${alt}</coordinates></Point>`
  }

  /**
   * Convert LineString to KML
   */
  private static lineStringToKML(coordinates: Position[]): string {
    const coords = coordinates
      .map(([lng, lat, alt = 0]) => `${lng},${lat},${alt}`)
      .join(' ')
    return `<LineString><coordinates>${coords}</coordinates></LineString>`
  }

  /**
   * Convert Polygon to KML
   */
  private static polygonToKML(coordinates: Position[][]): string {
    const [outer, ...inner] = coordinates

    const outerBoundary = `
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${outer.map(([lng, lat, alt = 0]) => `${lng},${lat},${alt}`).join(' ')}</coordinates>
          </LinearRing>
        </outerBoundaryIs>`

    const innerBoundaries = inner
      .map(
        (ring) => `
        <innerBoundaryIs>
          <LinearRing>
            <coordinates>${ring.map(([lng, lat, alt = 0]) => `${lng},${lat},${alt}`).join(' ')}</coordinates>
          </LinearRing>
        </innerBoundaryIs>`
      )
      .join('')

    return `<Polygon>${outerBoundary}${innerBoundaries}
      </Polygon>`
  }

  /**
   * Convert MultiPoint to KML
   */
  private static multiPointToKML(coordinates: Position[]): string {
    return `<MultiGeometry>\n${coordinates.map((coord) => this.pointToKML(coord)).join('\n')}\n</MultiGeometry>`
  }

  /**
   * Convert MultiLineString to KML
   */
  private static multiLineStringToKML(coordinates: Position[][]): string {
    return `<MultiGeometry>\n${coordinates.map((line) => this.lineStringToKML(line)).join('\n')}\n</MultiGeometry>`
  }

  /**
   * Convert MultiPolygon to KML
   */
  private static multiPolygonToKML(coordinates: Position[][][]): string {
    return `<MultiGeometry>\n${coordinates.map((poly) => this.polygonToKML(poly)).join('\n')}\n</MultiGeometry>`
  }

  /**
   * Escape XML special characters
   */
  private static escapeXML(text: string): string {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}
