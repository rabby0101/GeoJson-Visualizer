# GeoJSON Visualizer - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Core Modules](#core-modules)
6. [Features](#features)
7. [Implementation Guide](#implementation-guide)
8. [API Reference](#api-reference)
9. [GeoJSON Specification](#geojson-specification)
10. [Analysis Algorithms](#analysis-algorithms)
11. [Development Guidelines](#development-guidelines)
12. [Deployment](#deployment)

---

## Project Overview

### Description
GeoJSON Visualizer is a comprehensive web application for visualizing, analyzing, and manipulating GeoJSON data. It provides an interactive map interface with powerful analysis tools, making it easy to explore spatial data.

### Key Capabilities
- **Visualization**: Interactive map display for all GeoJSON geometry types
- **Analysis**: Spatial calculations, measurements, and statistics
- **Customization**: Style editor with advanced visualization options
- **Export**: Multiple output formats (GeoJSON, KML, CSV, PNG)
- **Data Management**: Search, filter, and query spatial features

### Target Users
- GIS professionals
- Web developers working with spatial data
- Data analysts and researchers
- Urban planners and environmental scientists
- Anyone working with geographic data

---

## Technology Stack

### Core Technologies
```
Frontend Framework:      React 18.x + TypeScript 5.x
Build Tool:             Vite 5.x
Package Manager:        npm/pnpm
```

### Key Libraries

#### Mapping & Spatial
```
Leaflet:                ^1.9.4      - Interactive mapping library
React-Leaflet:          ^4.2.1      - React bindings for Leaflet
Turf.js:                ^7.0.0      - Spatial analysis and calculations
Proj4js:                ^2.9.0      - Coordinate system transformations
```

#### UI & Styling
```
Tailwind CSS:           ^3.4.0      - Utility-first CSS framework
shadcn/ui:              latest      - High-quality React components
Lucide React:           ^0.300.0    - Icon library
Radix UI:               ^1.0.0      - Accessible component primitives
```

#### Data Handling
```
React-Dropzone:         ^14.2.3     - Drag & drop file uploads
Papa Parse:             ^5.4.1      - CSV parsing and export
Recharts:               ^2.10.0     - Data visualization charts
Zustand:                ^4.4.7      - State management
```

#### Development Tools
```
Vitest:                 ^1.0.4      - Unit testing framework
React Testing Library:  ^14.1.2     - Component testing
Playwright:             ^1.40.0     - E2E testing
ESLint:                 ^8.56.0     - Code linting
Prettier:               ^3.1.1      - Code formatting
```

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  Map Layer   │  │  Data Layer  │      │
│  │              │  │              │  │              │      │
│  │ - Panels     │  │ - Leaflet    │  │ - Store      │      │
│  │ - Controls   │  │ - Layers     │  │ - Parser     │      │
│  │ - Modals     │  │ - Popups     │  │ - Validator  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │            Core Services Layer                      │     │
│  │                                                      │     │
│  │  - File Loader    - Analyzer      - Exporter       │     │
│  │  - Style Manager  - Query Engine  - Transformer    │     │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App
├── Header (Logo, Actions, Settings)
├── MainLayout
│   ├── Sidebar (Collapsible)
│   │   ├── FileLoader
│   │   ├── LayerManager
│   │   └── StyleEditor
│   ├── MapContainer
│   │   ├── BaseMap (Leaflet)
│   │   ├── GeoJSONLayers
│   │   ├── Controls
│   │   │   ├── ZoomControl
│   │   │   ├── LayersControl
│   │   │   ├── MeasurementTools
│   │   │   └── SearchControl
│   │   └── Popups/Tooltips
│   └── RightPanel (Resizable)
│       ├── FeaturePanel
│       ├── AnalysisPanel
│       └── DataTable
└── Footer (Stats, Coordinates, CRS Info)
```

### Data Flow

```
File Upload/URL → Parser → Validator → Store → Map Renderer
                                      ↓
                                  Analyzer → Analysis Results
                                      ↓
                                 Exporter → Output Files
```

---

## Project Structure

```
geojson-visualizer/
├── public/
│   ├── sample-data/           # Sample GeoJSON files
│   │   ├── countries.geojson
│   │   ├── cities.geojson
│   │   └── routes.geojson
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Map/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── GeoJSONLayer.tsx
│   │   │   ├── BaseMapSelector.tsx
│   │   │   ├── MeasurementControl.tsx
│   │   │   ├── DrawControl.tsx
│   │   │   └── MapControls.tsx
│   │   │
│   │   ├── FileLoader/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── DropZone.tsx
│   │   │   ├── URLLoader.tsx
│   │   │   └── SampleDataLoader.tsx
│   │   │
│   │   ├── FeaturePanel/
│   │   │   ├── FeatureList.tsx
│   │   │   ├── FeatureDetails.tsx
│   │   │   └── PropertyTable.tsx
│   │   │
│   │   ├── AnalysisPanel/
│   │   │   ├── StatisticsView.tsx
│   │   │   ├── MeasurementResults.tsx
│   │   │   ├── SpatialQuery.tsx
│   │   │   └── ValidationReport.tsx
│   │   │
│   │   ├── StyleEditor/
│   │   │   ├── StylePanel.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── SymbolSelector.tsx
│   │   │   └── ChoroplethEditor.tsx
│   │   │
│   │   ├── DataTable/
│   │   │   ├── AttributeTable.tsx
│   │   │   ├── TableToolbar.tsx
│   │   │   └── ColumnFilters.tsx
│   │   │
│   │   ├── LayerManager/
│   │   │   ├── LayerList.tsx
│   │   │   ├── LayerControls.tsx
│   │   │   └── LayerSettings.tsx
│   │   │
│   │   ├── Export/
│   │   │   ├── ExportDialog.tsx
│   │   │   └── FormatSelector.tsx
│   │   │
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── MainLayout.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── parser/
│   │   │   ├── geojson-parser.ts
│   │   │   ├── validator.ts
│   │   │   └── schema.ts
│   │   │
│   │   ├── analyzer/
│   │   │   ├── statistics.ts
│   │   │   ├── measurements.ts
│   │   │   ├── spatial-queries.ts
│   │   │   └── topology.ts
│   │   │
│   │   ├── exporter/
│   │   │   ├── geojson-exporter.ts
│   │   │   ├── kml-exporter.ts
│   │   │   ├── csv-exporter.ts
│   │   │   └── image-exporter.ts
│   │   │
│   │   ├── style/
│   │   │   ├── style-manager.ts
│   │   │   ├── choropleth.ts
│   │   │   └── clustering.ts
│   │   │
│   │   └── utils/
│   │       ├── coordinates.ts
│   │       ├── geometry-helpers.ts
│   │       ├── file-helpers.ts
│   │       └── formatters.ts
│   │
│   ├── hooks/
│   │   ├── useGeoJSON.ts
│   │   ├── useMapControls.ts
│   │   ├── useAnalysis.ts
│   │   ├── useFeatureSelection.ts
│   │   └── useExport.ts
│   │
│   ├── store/
│   │   ├── geojson-store.ts
│   │   ├── map-store.ts
│   │   ├── ui-store.ts
│   │   └── settings-store.ts
│   │
│   ├── types/
│   │   ├── geojson.ts
│   │   ├── layer.ts
│   │   ├── style.ts
│   │   ├── analysis.ts
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│   ├── unit/
│   │   ├── parser.test.ts
│   │   ├── validator.test.ts
│   │   └── analyzer.test.ts
│   ├── integration/
│   │   └── file-loading.test.tsx
│   └── e2e/
│       └── user-flow.spec.ts
│
├── .env.example
├── .gitignore
├── claude.md              # This file
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## Core Modules

### 1. GeoJSON Parser & Validator

**Location**: `src/lib/parser/`

**Purpose**: Parse, validate, and normalize GeoJSON data

#### Key Functions

```typescript
// geojson-parser.ts
export class GeoJSONParser {
  /**
   * Parse GeoJSON from file or string
   */
  static parse(input: File | string): Promise<GeoJSONData>

  /**
   * Validate GeoJSON structure
   */
  static validate(geojson: unknown): ValidationResult

  /**
   * Extract feature collection from various GeoJSON types
   */
  static toFeatureCollection(geojson: GeoJSON): FeatureCollection

  /**
   * Get geometry types present in the data
   */
  static getGeometryTypes(geojson: FeatureCollection): GeometryType[]
}
```

#### Validation Rules
- Valid JSON syntax
- Compliant with RFC 7946 (GeoJSON specification)
- Valid geometry types
- Proper coordinate arrays
- Valid CRS (if specified)
- Property validation

### 2. Analysis Engine

**Location**: `src/lib/analyzer/`

**Purpose**: Perform spatial analysis and calculations

#### Statistics Module (`statistics.ts`)

```typescript
export interface StatisticsResult {
  featureCount: number
  geometryTypes: Record<GeometryType, number>
  bounds: BoundingBox
  properties: PropertyStatistics[]
  crs: string
}

export class StatisticsAnalyzer {
  static analyze(geojson: FeatureCollection): StatisticsResult
  static getPropertyStats(features: Feature[], propertyName: string): PropertyStat
  static calculateBounds(geojson: FeatureCollection): BoundingBox
}
```

#### Measurements Module (`measurements.ts`)

```typescript
export class MeasurementTools {
  /**
   * Calculate area of polygon in square meters
   */
  static calculateArea(feature: Feature<Polygon>): number

  /**
   * Calculate length of LineString in meters
   */
  static calculateLength(feature: Feature<LineString>): number

  /**
   * Calculate perimeter of Polygon in meters
   */
  static calculatePerimeter(feature: Feature<Polygon>): number

  /**
   * Calculate distance between two points in meters
   */
  static calculateDistance(point1: Position, point2: Position): number

  /**
   * Calculate bearing between two points in degrees
   */
  static calculateBearing(point1: Position, point2: Position): number

  /**
   * Calculate centroid of geometry
   */
  static calculateCentroid(feature: Feature): Position
}
```

#### Spatial Query Module (`spatial-queries.ts`)

```typescript
export class SpatialQuery {
  /**
   * Find features within a bounding box
   */
  static withinBounds(features: Feature[], bounds: BBox): Feature[]

  /**
   * Find features intersecting with geometry
   */
  static intersects(features: Feature[], geometry: Geometry): Feature[]

  /**
   * Find features within distance of a point
   */
  static buffer(feature: Feature, distance: number): Feature<Polygon>

  /**
   * Find nearest features to a point
   */
  static nearest(features: Feature[], point: Position, limit: number): Feature[]
}
```

### 3. Style Manager

**Location**: `src/lib/style/`

**Purpose**: Manage feature styling and visualization

#### Style Types

```typescript
export interface FeatureStyle {
  color?: string           // Fill color
  fillColor?: string       // Fill color (alternative)
  fillOpacity?: number     // Fill opacity (0-1)
  weight?: number          // Stroke weight
  opacity?: number         // Stroke opacity (0-1)
  dashArray?: string       // Stroke dash pattern
  lineCap?: string         // Line cap style
  lineJoin?: string        // Line join style
}

export interface StyleRule {
  property: string         // Property to style by
  type: 'categorical' | 'continuous' | 'gradient'
  mapping: Record<string, FeatureStyle> | GradientMapping
}
```

#### Choropleth Mapping

```typescript
export class ChoroplethStyler {
  /**
   * Create color scale based on property values
   */
  static createScale(
    features: Feature[],
    property: string,
    colorScheme: ColorScheme
  ): StyleRule

  /**
   * Get style for feature based on property value
   */
  static getStyle(feature: Feature, rule: StyleRule): FeatureStyle
}
```

### 4. Export System

**Location**: `src/lib/exporter/`

**Purpose**: Export data in various formats

#### Exporters

```typescript
// GeoJSON Exporter
export class GeoJSONExporter {
  static export(data: FeatureCollection, options?: ExportOptions): string
  static download(data: FeatureCollection, filename: string): void
}

// KML Exporter
export class KMLExporter {
  static toKML(geojson: FeatureCollection): string
  static download(geojson: FeatureCollection, filename: string): void
}

// CSV Exporter
export class CSVExporter {
  static toCSV(features: Feature[], options?: CSVOptions): string
  static download(features: Feature[], filename: string): void
}

// Image Exporter
export class ImageExporter {
  static captureMap(mapElement: HTMLElement): Promise<Blob>
  static download(mapElement: HTMLElement, filename: string): Promise<void>
}
```

---

## Features

### File Loading

#### Supported Input Methods
1. **File Upload**: Click to browse or select files
2. **Drag & Drop**: Drag files onto the drop zone
3. **URL Loading**: Load from remote URLs
4. **Sample Data**: Pre-loaded example datasets
5. **Paste JSON**: Direct JSON input

#### Supported File Types
- `.geojson` - GeoJSON files
- `.json` - JSON files containing GeoJSON
- `.kml` - KML files (auto-converted)
- `.zip` - Compressed GeoJSON files

### Map Visualization

#### Base Layers
- OpenStreetMap (default)
- OpenStreetMap HOT
- Satellite imagery
- Terrain maps
- CartoDB Positron
- CartoDB Dark Matter

#### Geometry Rendering
All GeoJSON geometry types are supported:

1. **Point**: Rendered as markers with customizable icons
2. **MultiPoint**: Multiple point markers
3. **LineString**: Rendered as polylines with customizable style
4. **MultiLineString**: Multiple polylines
5. **Polygon**: Rendered with fill and stroke
6. **MultiPolygon**: Multiple polygons
7. **GeometryCollection**: Mixed geometry types

#### Interactive Features
- Click to select features
- Hover for tooltips
- Pan and zoom
- Zoom to layer extent
- Zoom to feature
- Minimap overview
- Scale control
- Attribution

### Analysis Tools

#### Basic Statistics
- Feature count
- Geometry type distribution
- Bounding box coordinates
- Coordinate reference system
- Property list with types

#### Measurements
- **Area**: Calculate polygon area (sq km, sq mi, hectares, acres)
- **Length**: Calculate line length (km, miles, meters, feet)
- **Perimeter**: Calculate polygon perimeter
- **Distance**: Measure between two points
- **Bearing**: Calculate direction between points

#### Property Analysis
- Min, max, average for numerical properties
- Unique value counts for categorical properties
- Null/missing value detection
- Data type identification

#### Spatial Analysis
- Buffer generation
- Centroid calculation
- Bounding box extraction
- Convex hull
- Nearest neighbor search
- Spatial intersection
- Point in polygon

#### Validation
- GeoJSON schema validation
- Geometry validation
- Topology checks (self-intersection, duplicates)
- CRS validation

### Styling & Visualization

#### Basic Styling
- Fill color with opacity
- Stroke color and width
- Marker icon and size
- Label display

#### Advanced Visualization

**Choropleth Mapping**
- Color features based on property values
- Built-in color schemes (sequential, diverging, qualitative)
- Custom color ramps
- Classification methods (equal interval, quantile, natural breaks)

**Point Clustering**
- Cluster dense point data
- Configurable cluster radius
- Custom cluster icons
- Automatic decluttering

**Heatmap**
- Intensity-based visualization
- Configurable radius and blur
- Custom color gradients

**Categorical Styling**
- Style by categorical property
- Custom color mapping
- Legend generation

### Data Management

#### Feature List
- Sortable list of all features
- Search by properties
- Filter by geometry type
- Filter by property values
- Select/deselect features

#### Attribute Table
- Tabular view of feature properties
- Sortable columns
- Filterable rows
- Export to CSV
- Select features from table

#### Layer Management
- Multiple layer support
- Layer visibility toggle
- Layer ordering (z-index)
- Layer opacity control
- Layer-specific styling

### Measurement Tools

#### Interactive Tools
- **Distance Tool**: Click to measure distance between points
- **Area Tool**: Draw polygon to measure area
- **Bearing Tool**: Calculate bearing between two points

#### Results Display
- Multiple units (metric and imperial)
- Persistent measurements
- Clear all measurements
- Export measurement results

### Export Capabilities

#### Export Formats

**GeoJSON**
- Export full dataset
- Export filtered features
- Export selected features
- Pretty-print or minified

**KML/KMZ**
- Convert to KML format
- Include styles
- Compressed KMZ option

**CSV**
- Export attribute table
- Include/exclude geometry
- Custom delimiter
- Select columns

**Image**
- PNG format
- Current map view
- High resolution option
- Include legend

---

## Implementation Guide

### Phase 1: Project Setup

#### Step 1: Initialize Project

```bash
# Create Vite + React + TypeScript project
npm create vite@latest geojson-visualizer -- --template react-ts
cd geojson-visualizer
npm install

# Install dependencies
npm install leaflet react-leaflet @turf/turf proj4
npm install -D @types/leaflet @types/geojson

# Install UI libraries
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Install additional libraries
npm install zustand react-dropzone papaparse recharts
npm install -D @types/papaparse

# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event happy-dom
```

#### Step 2: Configure Tailwind

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Step 3: Set Up Project Structure

```bash
# Create directory structure
mkdir -p src/{components,lib,hooks,store,types}
mkdir -p src/components/{Map,FileLoader,FeaturePanel,AnalysisPanel,StyleEditor,DataTable,LayerManager,Export,Layout,ui}
mkdir -p src/lib/{parser,analyzer,exporter,style,utils}
mkdir -p tests/{unit,integration,e2e}
mkdir -p public/sample-data
```

### Phase 2: Core Implementation

#### GeoJSON Parser

```typescript
// src/lib/parser/geojson-parser.ts
import { Feature, FeatureCollection, GeoJSON, Geometry } from 'geojson'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  message: string
  path?: string
  code: string
}

export class GeoJSONParser {
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
      throw new Error(`Failed to parse GeoJSON: ${error.message}`)
    }
  }

  static validate(geojson: unknown): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Type check
    if (!geojson || typeof geojson !== 'object') {
      errors.push({
        message: 'GeoJSON must be an object',
        code: 'INVALID_TYPE'
      })
      return { valid: false, errors, warnings }
    }

    const obj = geojson as any

    // Check for type property
    if (!obj.type) {
      errors.push({
        message: 'Missing required "type" property',
        code: 'MISSING_TYPE'
      })
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
          code: 'INVALID_GEOJSON_TYPE'
        })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  static toFeatureCollection(geojson: GeoJSON): FeatureCollection {
    if (geojson.type === 'FeatureCollection') {
      return geojson as FeatureCollection
    }

    if (geojson.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [geojson as Feature]
      }
    }

    // If it's a geometry, wrap it in a feature
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: geojson as Geometry,
        properties: {}
      }]
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
        code: 'MISSING_FEATURES'
      })
      return
    }

    fc.features.forEach((feature: any, index: number) => {
      if (feature.type !== 'Feature') {
        errors.push({
          message: `Feature at index ${index} has invalid type`,
          path: `features[${index}]`,
          code: 'INVALID_FEATURE_TYPE'
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
    if (!feature.geometry) {
      warnings.push({
        message: 'Feature has null geometry',
        path
      })
      return
    }

    this.validateGeometry(feature.geometry, errors, warnings, `${path}.geometry`)
  }

  private static validateGeometry(
    geometry: any,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    path: string = ''
  ): void {
    if (!geometry.coordinates && geometry.type !== 'GeometryCollection') {
      errors.push({
        message: 'Geometry must have coordinates',
        path,
        code: 'MISSING_COORDINATES'
      })
      return
    }

    // Validate coordinate arrays
    // (Implementation details...)
  }
}
```

#### Analysis Engine

```typescript
// src/lib/analyzer/statistics.ts
import { FeatureCollection, Feature } from 'geojson'
import * as turf from '@turf/turf'

export interface StatisticsResult {
  featureCount: number
  geometryTypes: Record<string, number>
  bounds: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }
  properties: PropertyStatistics[]
  totalArea?: number  // in sq km
  totalLength?: number  // in km
}

export interface PropertyStatistics {
  name: string
  type: 'string' | 'number' | 'boolean' | 'null' | 'mixed'
  uniqueValues: number
  nullCount: number
  // For numbers
  min?: number
  max?: number
  mean?: number
  median?: number
  // For strings
  topValues?: Array<{ value: string; count: number }>
}

export class StatisticsAnalyzer {
  static analyze(geojson: FeatureCollection): StatisticsResult {
    const geometryTypes: Record<string, number> = {}
    const propertyMap = new Map<string, any[]>()
    let totalArea = 0
    let totalLength = 0

    // Collect statistics
    geojson.features.forEach(feature => {
      // Count geometry types
      const geomType = feature.geometry?.type || 'null'
      geometryTypes[geomType] = (geometryTypes[geomType] || 0) + 1

      // Calculate measurements
      if (feature.geometry?.type.includes('Polygon')) {
        totalArea += turf.area(feature) / 1_000_000 // Convert to sq km
      }
      if (feature.geometry?.type.includes('LineString')) {
        totalLength += turf.length(feature, { units: 'kilometers' })
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
    const bounds = turf.bbox(geojson)

    // Analyze properties
    const properties: PropertyStatistics[] = []
    propertyMap.forEach((values, name) => {
      properties.push(this.analyzeProperty(name, values))
    })

    return {
      featureCount: geojson.features.length,
      geometryTypes,
      bounds: {
        minLng: bounds[0],
        minLat: bounds[1],
        maxLng: bounds[2],
        maxLat: bounds[3]
      },
      properties,
      totalArea: totalArea > 0 ? totalArea : undefined,
      totalLength: totalLength > 0 ? totalLength : undefined
    }
  }

  private static analyzeProperty(name: string, values: any[]): PropertyStatistics {
    const types = new Set(values.map(v => v === null ? 'null' : typeof v))
    const uniqueValues = new Set(values.filter(v => v !== null))
    const nullCount = values.filter(v => v === null).length

    const stat: PropertyStatistics = {
      name,
      type: types.size === 1 ? Array.from(types)[0] as any : 'mixed',
      uniqueValues: uniqueValues.size,
      nullCount
    }

    // Numeric statistics
    if (stat.type === 'number') {
      const numbers = values.filter(v => typeof v === 'number') as number[]
      stat.min = Math.min(...numbers)
      stat.max = Math.max(...numbers)
      stat.mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
      stat.median = this.calculateMedian(numbers)
    }

    // String statistics
    if (stat.type === 'string') {
      const counts = new Map<string, number>()
      values.forEach(v => {
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
```

#### Map Component

```typescript
// src/components/Map/MapContainer.tsx
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { FeatureCollection } from 'geojson'
import 'leaflet/dist/leaflet.css'

interface MapContainerProps {
  geojson?: FeatureCollection
  onFeatureClick?: (feature: Feature) => void
}

function MapContent({ geojson, onFeatureClick }: MapContainerProps) {
  const map = useMap()

  useEffect(() => {
    if (geojson && geojson.features.length > 0) {
      // Fit bounds to data
      const layer = L.geoJSON(geojson)
      map.fitBounds(layer.getBounds(), { padding: [50, 50] })
    }
  }, [geojson, map])

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geojson && (
        <GeoJSON
          data={geojson}
          onEachFeature={(feature, layer) => {
            layer.on('click', () => {
              onFeatureClick?.(feature)
            })

            // Add popup
            if (feature.properties) {
              const props = Object.entries(feature.properties)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br/>')
              layer.bindPopup(props)
            }
          }}
        />
      )}
    </>
  )
}

export function GeoJSONMap({ geojson, onFeatureClick }: MapContainerProps) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        className="h-full w-full"
        zoomControl={false}
      >
        <MapContent geojson={geojson} onFeatureClick={onFeatureClick} />
      </MapContainer>
    </div>
  )
}
```

### Phase 3: Advanced Features

(Continue with implementation details for remaining features...)

---

## API Reference

### Parser API

```typescript
GeoJSONParser.parse(input: File | string): Promise<GeoJSON>
GeoJSONParser.validate(geojson: unknown): ValidationResult
GeoJSONParser.toFeatureCollection(geojson: GeoJSON): FeatureCollection
```

### Analyzer API

```typescript
StatisticsAnalyzer.analyze(geojson: FeatureCollection): StatisticsResult
MeasurementTools.calculateArea(feature: Feature<Polygon>): number
MeasurementTools.calculateLength(feature: Feature<LineString>): number
MeasurementTools.calculateDistance(point1: Position, point2: Position): number
```

### Exporter API

```typescript
GeoJSONExporter.export(data: FeatureCollection, options?: ExportOptions): string
KMLExporter.toKML(geojson: FeatureCollection): string
CSVExporter.toCSV(features: Feature[], options?: CSVOptions): string
ImageExporter.captureMap(mapElement: HTMLElement): Promise<Blob>
```

---

## GeoJSON Specification

### RFC 7946 Overview

GeoJSON is a format for encoding geographic data structures using JSON. The specification defines several types of JSON objects and the manner in which they are combined to represent data about geographic features.

### Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [125.6, 10.1]
      },
      "properties": {
        "name": "Example Point"
      }
    }
  ]
}
```

### Geometry Types

#### Point
```json
{
  "type": "Point",
  "coordinates": [100.0, 0.0]
}
```

#### LineString
```json
{
  "type": "LineString",
  "coordinates": [
    [100.0, 0.0],
    [101.0, 1.0]
  ]
}
```

#### Polygon
```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [100.0, 0.0],
      [101.0, 0.0],
      [101.0, 1.0],
      [100.0, 1.0],
      [100.0, 0.0]
    ]
  ]
}
```

#### MultiPoint, MultiLineString, MultiPolygon
Similar structures with additional nesting.

#### GeometryCollection
```json
{
  "type": "GeometryCollection",
  "geometries": [
    {
      "type": "Point",
      "coordinates": [100.0, 0.0]
    },
    {
      "type": "LineString",
      "coordinates": [
        [101.0, 0.0],
        [102.0, 1.0]
      ]
    }
  ]
}
```

### Coordinate Reference System

RFC 7946 mandates WGS84 (EPSG:4326) as the default CRS:
- Longitude, Latitude order
- Values in decimal degrees
- Optional elevation as third coordinate

---

## Analysis Algorithms

### Area Calculation

Uses Turf.js `area()` function which implements the geodesic area algorithm:

```typescript
// Returns area in square meters
const area = turf.area(polygon)

// Convert to other units
const sqKm = area / 1_000_000
const sqMiles = area / 2_589_988
const hectares = area / 10_000
const acres = area / 4_046.86
```

### Distance Calculation

Haversine formula for great-circle distance:

```typescript
function haversineDistance(point1: Position, point2: Position): number {
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2

  const R = 6371e3 // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}
```

### Bearing Calculation

```typescript
function calculateBearing(point1: Position, point2: Position): number {
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2

  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)

  const θ = Math.atan2(y, x)
  const bearing = (θ * 180 / Math.PI + 360) % 360

  return bearing
}
```

### Choropleth Classification

**Equal Interval**: Divide the range into equal-sized classes
```typescript
function equalInterval(values: number[], classes: number): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const interval = (max - min) / classes
  return Array.from({ length: classes }, (_, i) => min + (i + 1) * interval)
}
```

**Quantile**: Equal number of features in each class
```typescript
function quantile(values: number[], classes: number): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const breaks = []
  for (let i = 1; i < classes; i++) {
    const index = Math.floor(sorted.length * i / classes)
    breaks.push(sorted[index])
  }
  breaks.push(sorted[sorted.length - 1])
  return breaks
}
```

---

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Prefer composition over inheritance
- Write self-documenting code with clear names

### Component Guidelines

- Keep components small and focused
- Use props for configuration, context for shared state
- Implement proper TypeScript interfaces for all props
- Add JSDoc comments for complex components
- Extract reusable logic into custom hooks

### Testing Strategy

**Unit Tests**: Test individual functions and utilities
```typescript
describe('GeoJSONParser', () => {
  it('should parse valid GeoJSON', async () => {
    const geojson = '{"type":"Point","coordinates":[0,0]}'
    const result = await GeoJSONParser.parse(geojson)
    expect(result.type).toBe('Point')
  })
})
```

**Integration Tests**: Test component interactions
**E2E Tests**: Test complete user workflows

### Performance Considerations

- Use React.memo for expensive components
- Implement virtual scrolling for large data tables
- Lazy load components when appropriate
- Debounce search and filter operations
- Use Web Workers for heavy computations
- Implement data pagination for large datasets

### Accessibility

- Use semantic HTML elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Provide text alternatives for visual content

---

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
npm run build
npm run deploy  # If configured with gh-pages
```

### Environment Variables

Create `.env` file:
```
VITE_MAPBOX_TOKEN=your_token_here
VITE_API_URL=https://api.example.com
```

Access in code:
```typescript
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
```

---

## Contributing

### Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch
5. Make your changes
6. Run tests: `npm test`
7. Submit a pull request

### Commit Guidelines

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

---

## Roadmap

### Version 1.0
- ✅ Basic file loading
- ✅ Map visualization
- ✅ Feature display
- ✅ Basic analysis
- ✅ Export functionality

### Version 1.1
- 🔄 Advanced styling
- 🔄 Choropleth mapping
- 🔄 Point clustering
- 🔄 Measurement tools

### Version 2.0
- 📋 Multi-file support
- 📋 Comparison mode
- 📋 Advanced spatial queries
- 📋 Custom projections
- 📋 3D visualization

### Version 3.0
- 📋 Collaborative editing
- 📋 Real-time synchronization
- 📋 Plugin system
- 📋 API integration

---

## License

MIT License - See LICENSE file for details

---

## Support

- Documentation: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/geojson-visualizer/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/geojson-visualizer/discussions)

---

**Last Updated**: 2025-10-16
**Version**: 1.0.0
**Maintainers**: [Your Name]
