# GeoJSON Visualizer

A comprehensive web application for visualizing, analyzing, and manipulating GeoJSON data with an interactive map interface and powerful analysis tools.

## Features

- **Interactive Map Visualization**: Display all GeoJSON geometry types on an interactive Leaflet map
- **File Loading**: Upload files, drag & drop, load from URLs, or use sample datasets
- **Spatial Analysis**: Calculate areas, distances, perimeters, and more
- **Property Statistics**: Analyze feature properties with min, max, mean, and distribution
- **Styling**: Customize colors, symbols, and create choropleth maps
- **Data Management**: Search, filter, and query features
- **Export**: Export to GeoJSON, KML, CSV, or save map as image
- **Measurement Tools**: Interactive distance and area measurement
- **Layer Management**: Handle multiple layers with full control

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Development

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Core libraries (parser, analyzer, exporter)
├── hooks/         # Custom React hooks
├── store/         # State management
└── types/         # TypeScript type definitions
```

## Documentation

For comprehensive documentation, see [claude.md](./claude.md)

## Demo
![ScreenRecording2025-10-17at18 00 40-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/3a9798fd-c7ef-4fcd-b31d-71daa9e5a737)



## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Mapping**: Leaflet + React-Leaflet
- **Spatial Analysis**: Turf.js
- **UI**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **Testing**: Vitest + React Testing Library

## License

MIT License

## Contributing

Contributions are welcome! Please read the documentation in claude.md for development guidelines.
