
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
  Rectangle,
} from "react-leaflet";
import L from "leaflet";

import {
  getMarsMap,
  getTerrainLayers,
  getMarsTerrain,
  getTerrainLayer,
} from "./services/api";

import { useHazardsScience } from "./features/hazards-science/useHazardsScience";
import HazardsSciencePanel from "./features/hazards-science/HazardsSciencePanel";
import HazardsScienceMarkers from "./features/hazards-science/HazardsScienceMarkers";

import { useRoutePlanner } from "./features/route-planning/useRoutePlanner";
import RoutePlanningPanel from "./features/route-planning/RoutePlanningPanel";
import RouteMapOverlay from "./features/route-planning/RouteMapOverlay";

import "./App.css";
import "./styles/mission-details.css";
import "./styles/hazards-polish.css";
import "./styles/route-planning-polish.css";

const NASA_TILE_URL =
  "https://trek.nasa.gov/tiles/Mars/EQ/NES_JEZ_MID_Visible_Mosaic_HiRISE_CTX_HRSC_GCS_MARS_07-10-2018/1.0.0/default/default028mm/{z}/{y}/{x}.png";

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  return null;
}

function TerrainOverlay({ activeLayer }) {
  if (activeLayer === "Satellite") {
    return null;
  }

  const areas = [
    {
      bounds: [
        [18.3, 77.2],
        [18.4, 77.35],
      ],
      value: 20,
    },
    {
      bounds: [
        [18.4, 77.35],
        [18.5, 77.5],
      ],
      value: 40,
    },
    {
      bounds: [
        [18.2, 77.35],
        [18.3, 77.5],
      ],
      value: 60,
    },
    {
      bounds: [
        [18.4, 77.5],
        [18.5, 77.65],
      ],
      value: 80,
    },
  ];

  function getColor(value) {
    if (activeLayer === "Elevation") {
      return value < 30
        ? "#2ecc71"
        : value < 60
          ? "#f1c40f"
          : "#e67e22";
    }

    if (activeLayer === "Slope") {
      return value < 30
        ? "#2ecc71"
        : value < 60
          ? "#f1c40f"
          : "#e74c3c";
    }

    return value < 30
      ? "#d6b58c"
      : value < 60
        ? "#a87945"
        : "#704214";
  }

  return areas.map((area, index) => (
    <Rectangle
      key={index}
      bounds={area.bounds}
      pathOptions={{
        color: getColor(area.value),
        fillColor: getColor(area.value),
        fillOpacity: 0.45,
        weight: 1,
      }}
    />
  ));
}

function App() {
  const hazardsScience = useHazardsScience();
  const routePlanner = useRoutePlanner();

  const [terrain, setTerrain] = useState(null);
  const [activeLayer, setActiveLayer] = useState("Satellite");

  const [selectedLocation, setSelectedLocation] = useState({
    lat: 18.4,
    lon: 77.4,
  });

  const [markerPosition, setMarkerPosition] = useState([
    18.4,
    77.4,
  ]);

  const [marsMap, setMarsMap] = useState(null);
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [layerDetails, setLayerDetails] = useState(null);

  useEffect(() => {
    async function loadMarsData() {
      try {
        const [mapData, layerData] = await Promise.all([
          getMarsMap(),
          getTerrainLayers(),
        ]);

        setMarsMap(mapData);
        setLayers(layerData.layers);
      } catch {
        setError("Unable to load Mars data");
      } finally {
        setLoading(false);
      }
    }

    loadMarsData();
  }, []);

  async function handleMapClick(position) {
    const lat = position.lat;
    const lon = position.lng;

    setMarkerPosition([lat, lon]);
    setSelectedLocation({ lat, lon });

    routePlanner.applyMapSelection({ lat, lon });

    setError("");

    try {
      const terrainData = await getMarsTerrain(lat, lon);
      setTerrain(terrainData.terrain);
    } catch {
      setTerrain(null);
      setError("Unable to load terrain information");
    }
  }

  async function handleLayerClick(layer) {
    setActiveLayer(layer.name);
    setError("");

    if (layer.name === "Satellite") {
      setLayerDetails(null);
      return;
    }

    try {
      const data = await getTerrainLayer(layer.id);
      setLayerDetails(data);
    } catch {
      setLayerDetails(null);
      setError("Unable to load layer details");
    }
  }

  const displayLayers = [
    { id: "satellite", name: "Satellite", type: "satellite" },
    ...layers,
  ];

  const terrainLegend = {
    Elevation: [
      { color: "#2ecc71", label: "Low" },
      { color: "#f1c40f", label: "Medium" },
      { color: "#e67e22", label: "High" },
    ],
    Slope: [
      { color: "#2ecc71", label: "Gentle" },
      { color: "#f1c40f", label: "Moderate" },
      { color: "#e74c3c", label: "Steep" },
    ],
    "Rock Density": [
      { color: "#d6b58c", label: "Low" },
      { color: "#a87945", label: "Medium" },
      { color: "#704214", label: "High" },
    ],
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">O</div>
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
            <span>⌖</span> {marsMap?.region || "JEZERO CRATER"}
          </div>
        </section>

        {loading && <p>Loading Mars data...</p>}
        {error && <p>{error}</p>}

        <section className="explorer-layout">
          <aside className="sidebar">
            <div className="panel-heading">
              <span className="panel-icon">◈</span>
              <h3>Map Layers</h3>
            </div>

            <p className="section-label">SURFACE DATA</p>

            <div className="layer-list">
              {displayLayers.map((layer) => (
                <button
                  key={layer.id}
                  className={`layer-button ${
                    activeLayer === layer.name ? "active" : ""
                  }`}
                  onClick={() => handleLayerClick(layer)}
                >
                  <span className="layer-symbol">
                    {layer.type === "satellite"
                      ? "◉"
                      : layer.type === "elevation"
                        ? "▥"
                        : layer.type === "rock_density"
                          ? "◆"
                          : "⌁"}
                  </span>

                  {layer.name}

                  <span className="layer-check">
                    {activeLayer === layer.name ? "●" : "○"}
                  </span>
                </button>
              ))}
            </div>

            {layerDetails && (
              <div className="location-card">
                <span className="location-name">
                  {layerDetails.name} Details
                </span>

                <div className="coordinate-row">
                  <span>Description</span>
                  <strong>{layerDetails.description}</strong>
                </div>

                <div className="coordinate-row">
                  <span>Unit</span>
                  <strong>{layerDetails.unit}</strong>
                </div>

                <div className="coordinate-row">
                  <span>Minimum</span>
                  <strong>{layerDetails.min_value}</strong>
                </div>

                <div className="coordinate-row">
                  <span>Maximum</span>
                  <strong>{layerDetails.max_value}</strong>
                </div>
              </div>
            )}

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

            {terrain && (
  <div className="location-card terrain-card">
    <span className="location-name">
      Terrain Information
    </span>

    <div className="coordinate-row">
      <span>MOLA Elevation</span>
      <strong>{terrain.elevation.mola} m</strong>
    </div>

    <div className="coordinate-row">
      <span>HiRISE Elevation</span>
      <strong>{terrain.elevation.hirise} m</strong>
    </div>

    <div className="coordinate-row">
      <span>MOLA Slope</span>
      <strong>{terrain.slope.mola}°</strong>
    </div>

    <div className="coordinate-row">
      <span>HiRISE Slope</span>
      <strong>{terrain.slope.hirise}°</strong>
    </div>
  </div>
)}

            <p className="map-hint">
              Click anywhere on the map to inspect a location.
            </p>

            <section className="oo-hazards-shell" aria-label="Hazards and science">
              <div className="oo-hazards-head">
                <div className="oo-hazards-heading">
                  <span className="oo-hazards-kicker">02 / MISSION INTELLIGENCE</span>
                  <h3>Hazard & Science Analysis</h3>
                  <p>Explore surface risks and scientific destinations.</p>
                </div>
                <span className="oo-hazards-badge">PROTOTYPE DATA</span>
              </div>
              <HazardsSciencePanel
              data={hazardsScience}
              selectedLocation={selectedLocation}
            />
            </section>

            <RoutePlanningPanel
              planner={routePlanner}
              selectedLocation={selectedLocation}
            />
          </aside>

          <section className="map-section">
            <div className="map-toolbar">
              <div>
                <span className="live-dot"></span>
                <span>NASA MARS IMAGERY</span>
              </div>

              <span className="map-layer-label">
                {activeLayer.toUpperCase()} LAYER
              </span>
            </div>

            <div
              className={`map-wrapper layer-${activeLayer
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              <MapContainer
                crs={L.CRS.EPSG4326}
                center={[18.4, 77.4]}
                zoom={10}
                minZoom={3}
                maxZoom={17}
                scrollWheelZoom={true}
                className="mars-map"
              >
                <TileLayer
                  url={NASA_TILE_URL}
                  minZoom={0}
                  maxNativeZoom={17}
                  tileSize={256}
                  attribution="NASA Mars Trek / HiRISE"
                />

                <TerrainOverlay activeLayer={activeLayer} />

                {activeLayer !== "Satellite" && (
                  <div className="terrain-legend">
                    <h4>
                      {activeLayer} — Simulated
                    </h4>

                    {terrainLegend[activeLayer]?.map((item) => (
                      <div
                        className="legend-item"
                        key={item.label}
                      >
                        <span
                          className="legend-color"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <MapClickHandler onSelect={handleMapClick} />

                <HazardsScienceMarkers
                  locations={hazardsScience.visibleLocations}
                  selected={hazardsScience.selected}
                  onSelect={hazardsScience.selectLocation}
                />

                <RouteMapOverlay
                  route={routePlanner.route}
                />

                <CircleMarker
                  center={markerPosition}
                  radius={8}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: "#68c8e8",
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
                    style={{ backgroundColor: "#a78bfa" }}
                  ></i>
                  Science POI
                </span>
              </div>
            </div>

            <div className="map-footer">
              <span>
                MAP SOURCE: NASA MARS TREK – HiRISE
              </span>

              <span>
                COORDINATES:{" "}
                {selectedLocation.lat.toFixed(3)}°,{" "}
                {selectedLocation.lon.toFixed(3)}°
              </span>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
