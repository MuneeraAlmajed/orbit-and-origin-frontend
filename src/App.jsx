
import { useState } from 'react'
import { MapContainer, CircleMarker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import './App.css'

import { useHazardsScience } from './features/hazards-science/useHazardsScience'
import HazardsSciencePanel from './features/hazards-science/HazardsSciencePanel'
import HazardsScienceMarkers from './features/hazards-science/HazardsScienceMarkers'

const layers = ['Satellite', 'Elevation', 'Rock Density', 'Slope']

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng)
    },
  })

  return null
}

function App() {
  const hazardsScience = useHazardsScience()

  const [activeLayer, setActiveLayer] = useState('Satellite')

  const [selectedLocation, setSelectedLocation] = useState({
    lat: 18.4,
    lon: 77.7,
  })

  const [markerPosition, setMarkerPosition] = useState([500, 500])

  function handleMapClick(position) {
    setMarkerPosition([position.lat, position.lng])

    setSelectedLocation({
      lat: 18.4 + (500 - position.lat) * 0.001,
      lon: 77.7 + (position.lng - 500) * 0.001,
    })
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">0</div>
          <div>
            <h1>ORBIT & ORIGIN</h1>
            <span>MARS EXPLORATION SYSTEM</span>
          </div>
        </div>

        <div className="mission-status">
          <span className="status-dot"></span>
          MARS MISSION CONTROL
        </div>
      </header>

      <main className="main-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">EXPLORATION / MARS</p>
            <h2>Mars Explorer</h2>
            <p className="subtitle">
              Explore the Martian surface and inspect terrain conditions.
            </p>
          </div>

          <div className="region-tag">
            <span>+</span> JEZERO CRATER
          </div>
        </section>

        <section className="explorer-layout">
          <aside className="sidebar">
            <div className="panel-heading">
              <span className="panel-icon">+</span>
              <h3>Map Layer</h3>
            </div>

            <p className="section-label">SURFACE DATA</p>

            <div className="layer-list">
              {layers.map((layer) => (
                <button
                  key={layer}
                  className={`layer-button ${
                    activeLayer === layer ? 'active' : ''
                  }`}
                  onClick={() => setActiveLayer(layer)}
                >
                  <span className="layer-symbol">
                    {layer === 'Satellite'
                      ? '◉'
                      : layer === 'Elevation'
                        ? '▥'
                        : layer === 'Rock Density'
                          ? '◆'
                          : '⌁'}
                  </span>

                  {layer}

                  <span className="layer-check">
                    {activeLayer === layer ? '●' : '○'}
                  </span>
                </button>
              ))}
            </div>

            <div className="sidebar-divider"></div>

            <div className="panel-heading">
              <span className="panel-icon">⌖</span>
              <h3>Selected Location</h3>
            </div>

            <div className="location-card">
              <span className="location-name">
                Jezero Crater Region
              </span>

              <div className="coordinate-row">
                <span>Latitude</span>
                <strong>
                  {selectedLocation.lat.toFixed(3)}°
                </strong>
              </div>

              <div className="coordinate-row">
                <span>Longitude</span>
                <strong>
                  {selectedLocation.lon.toFixed(3)}°
                </strong>
              </div>
            </div>

            <p className="map-hint">
              Click anywhere on the map to inspect a location.
            </p>

            <HazardsSciencePanel
              data={hazardsScience}
              selectedLocation={selectedLocation}
            />
          </aside>

          <section className="map-section">
            <div className="map-toolbar">
              <div>
                <span className="live-dot"></span>
                <span>LIVE SURFACE VIEW</span>
              </div>

              <span className="map-layer-label">
                {activeLayer.toUpperCase()} LAYER
              </span>
            </div>

            <div
              className={`map-wrapper layer-${activeLayer
                .toLowerCase()
                .replace(' ', '-')}`}
            >
              <MapContainer
                crs={L.CRS.Simple}
                center={[500, 500]}
                zoom={-1}
                minZoom={-2}
                maxZoom={2}
                scrollWheelZoom={true}
                className="mars-map"
              >
                <MapClickHandler onSelect={handleMapClick} />

                <HazardsScienceMarkers
                  locations={hazardsScience.visibleLocations}
                  selected={hazardsScience.selected}
                  onSelect={hazardsScience.selectLocation}
                />

                <CircleMarker
                  center={markerPosition}
                  radius={10}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 3,
                    fillColor: '#68c8e8',
                    fillOpacity: 1,
                  }}
                />
              </MapContainer>

              <div className="map-caption">
                <span>◎</span> JEZERO CRATER
              </div>

              <div className="map-legend">
                <span>
                  <i className="legend-dot selected"></i>
                  Selected
                </span>

                <span>
                  <i className="legend-dot high"></i>
                  High risk
                </span>

                <span>
                  <i className="legend-dot medium"></i>
                  Medium risk
                </span>

                <span>
                  <i className="legend-dot low"></i>
                  Low risk
                </span>

                <span>
                  <i
                    className="legend-dot"
                    style={{ backgroundColor: '#a78bfa' }}
                  ></i>
                  Science POI
                </span>
              </div>
            </div>

            <div className="map-footer">
              <span>MAP SOURCE: SIMULATED MOCK DATA</span>

              <span>
                COORDINATES: {selectedLocation.lat.toFixed(3)}°,{' '}
                {selectedLocation.lon.toFixed(3)}°
              </span>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
