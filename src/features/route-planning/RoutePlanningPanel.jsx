import { useState } from "react";
import "./RoutePlanningPanel.css";

function formatNumber(value, digits = 1) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "—";
  }

  return Number(value).toFixed(digits);
}

function CoordinatesEditor({ label, which, point, planner, selectedLocation }) {
  return (
    <div className="rp-coordinate-group">
      <div className="rp-row">
        <strong>{label}</strong>

        <div className="rp-actions">
          <button
            type="button"
            onClick={() => planner.fillFromSelected(which, selectedLocation)}
            disabled={planner.working}
          >
            Use selected
          </button>

          <button
            type="button"
            className={planner.pickMode === which ? "rp-picking" : ""}
            onClick={() =>
              planner.setPickMode(planner.pickMode === which ? null : which)
            }
            disabled={planner.working}
          >
            {planner.pickMode === which ? "Cancel" : "Pick on map"}
          </button>
        </div>
      </div>

      <div className="rp-input-grid">
        {[
          ["lat", "Latitude", -90, 90],
          ["lon", "Longitude", -180, 180],
        ].map(([field, text, min, max]) => (
          <label key={field}>
            {text}
            <input
              type="number"
              step="any"
              min={min}
              max={max}
              value={point[field]}
              disabled={planner.working}
              onChange={(event) =>
                planner.updatePoint(which, field, event.target.value)
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default function RoutePlanningPanel({ planner, selectedLocation }) {
  const [savedRouteId, setSavedRouteId] = useState("");

  const { route, analysis, hazardReport, terrainReport } = planner;

  const terrain = terrainReport?.terrain_summary ?? analysis?.terrain_analysis;

  const hazards = hazardReport?.hazards ?? analysis?.hazards ?? [];

  const warnings = Array.isArray(analysis?.warnings) ? analysis.warnings : [];

  function handleGenerate(event) {
    event.preventDefault();
    planner.planRoute();
  }

  function handleLoad(event) {
    event.preventDefault();
    planner.loadSavedRoute(savedRouteId);
  }

  return (
    <section className="rp-panel" aria-label="Route planning">
      <header className="rp-heading">
        <span className="rp-icon">↗</span>

        <div>
          <h3>Route Planning</h3>
          <small>NASA MARS TERRAIN ANALYSIS</small>
        </div>
      </header>

      <p className="rp-description">
        Plan a route across the Martian surface and analyze its hazards,
        distance, and terrain conditions.
      </p>

      <form onSubmit={handleGenerate}>
        <CoordinatesEditor
          label="01 / START LOCATION"
          which="start"
          point={planner.start}
          planner={planner}
          selectedLocation={selectedLocation}
        />

        <CoordinatesEditor
          label="02 / DESTINATION"
          which="destination"
          point={planner.destination}
          planner={planner}
          selectedLocation={selectedLocation}
        />

        {planner.pickMode && (
          <p className="rp-map-instruction" role="status">
            Click anywhere on the Mars map to set your {planner.pickMode}{" "}
            location.
          </p>
        )}

        <button className="rp-primary" type="submit" disabled={planner.working}>
          {planner.working ? "Analyzing route..." : "Generate & Analyze Route"}
        </button>
      </form>

      {planner.error && (
        <p className="rp-error" role="alert">
          {planner.error}
        </p>
      )}

      {planner.notice && (
        <p className="rp-notice" role="status">
          {planner.notice}
        </p>
      )}

      <form className="rp-load" onSubmit={handleLoad}>
        <label>
          Retrieve existing route by ID
          <div className="rp-row">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Route ID"
              value={savedRouteId}
              onChange={(event) => setSavedRouteId(event.target.value)}
              disabled={planner.working}
            />

            <button type="submit" disabled={planner.working}>
              Load
            </button>
          </div>
        </label>
      </form>

      {route && (
        <div className="rp-results" aria-live="polite">
          <div className="rp-result-header">
            <div>
              <small>ACTIVE ROUTE #{route.id}</small>
              <h4>{route.name ?? "Exploration Route"}</h4>
            </div>

            <span
              className={`rp-status ${
                route.status === "not_recommended" ? "rp-status-warning" : ""
              }`}
            >
              {(route.status ?? "planned").replaceAll("_", " ")}
            </span>
          </div>

          <div className="rp-metrics">
            <div>
              <small>DISTANCE</small>
              <strong>
                {formatNumber(analysis?.distance_km ?? route.distance_km)} km
              </strong>
            </div>

            <div>
              <small>EST. DURATION</small>
              <strong>
                {formatNumber(
                  analysis?.estimated_duration_hours ??
                    route.estimated_duration_hours,
                  2,
                )}{" "}
                h
              </strong>
            </div>

            <div>
              <small>SAFETY SCORE</small>
              <strong>
                {formatNumber(analysis?.safety_score ?? route.safety_score, 0)}{" "}
                / 100
              </strong>
            </div>

            <div>
              <small>RISK LEVEL</small>
              <strong className="rp-capitalize">
                {analysis?.risk_level ?? route.risk_level ?? "Pending analysis"}
              </strong>
            </div>
          </div>

          <div className="rp-section">
            <h5>SAFETY ASSESSMENT</h5>
            <p>
              {analysis?.recommendation ??
                "No safety recommendation available."}
            </p>

            <p className="rp-secondary">
              {route.waypoints?.length ?? 0} waypoints
              {" · "}
              {hazardReport?.total_hazards ??
                analysis?.hazards_detected ??
                "—"}{" "}
              hazards reported
            </p>
          </div>

          <div className="rp-section">
            <h5>TERRAIN CONDITIONS</h5>

            {terrain ? (
              <div className="rp-terrain">
                <span>Surface: {terrain.terrain_type ?? "Unknown"}</span>
                <span>Difficulty: {terrain.difficulty ?? "Unknown"}</span>
                <span>
                  Average slope: {formatNumber(terrain.average_slope)}°
                </span>
                {terrain.maximum_slope != null && (
                  <span>
                    Maximum slope: {formatNumber(terrain.maximum_slope)}°
                  </span>
                )}
              </div>
            ) : (
              <p className="rp-secondary">Terrain analysis unavailable.</p>
            )}
          </div>

          <div className="rp-section">
            <h5>HAZARDS NEAR THE ROUTE</h5>

            {hazards.length > 0 ? (
              <ul className="rp-hazard-list">
                {hazards.map((hazard, index) => (
                  <li key={hazard.id ?? index}>
                    <strong>{hazard.name}</strong>
                    {" · "}
                    {hazard.severity ?? "Unknown severity"}
                    {hazard.distance_from_route_km != null &&
                      ` · ${formatNumber(
                        hazard.distance_from_route_km,
                      )} km from route`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rp-secondary">
                {hazardReport || analysis
                  ? "No hazards listed in the available report."
                  : "Hazard report unavailable."}
              </p>
            )}

            {warnings.length > 0 && (
              <ul className="rp-warning-list">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            )}
          </div>

          {planner.reportWarnings.length > 0 && (
            <div className="rp-error">
              {planner.reportWarnings.map((warning, index) => (
                <p key={index}>{warning}</p>
              ))}
            </div>
          )}

          <button
            type="button"
            className="rp-delete"
            onClick={planner.removeRoute}
            disabled={planner.working}
          >
            Delete Route #{route.id}
          </button>
        </div>
      )}

      <p className="rp-disclaimer">
        Terrain and slope-risk analysis use USGS/NASA HiRISE DTM data. Route
        selection uses a simplified planning model and is not validated for real
        rover navigation.
      </p>
    </section>
  );
}
