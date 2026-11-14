
import { useState } from 'react'
import './HazardsSciencePanel.css'

export default function HazardsSciencePanel({
  data,
  selectedLocation,
}) {
  const [coordinates, setCoordinates] = useState({
    lat: '18.4',
    lon: '77.7',
    radius: '10',
  })

  function handleNearbySearch(event) {
    event.preventDefault()
    data.findNearby(
      coordinates.lat,
      coordinates.lon,
      coordinates.radius,
    )
  }

  function useMapLocation() {
    setCoordinates((previous) => ({
      ...previous,
      lat: String(selectedLocation.lat),
      lon: String(selectedLocation.lon),
    }))
  }

  return (
    <section className="hs-panel">
      <div className="hs-heading">
        <span className="hs-symbol">⌖</span>
        <div>
          <h3>Hazards & Science</h3>
          <small>SIMULATED MISSION DATA</small>
        </div>
      </div>

      <div className="hs-tabs">
        {[
          ['all', 'All'],
          ['hazards', 'Hazards'],
          ['science', 'Science'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={data.category === value ? 'active' : ''}
            onClick={() => data.setCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="hs-field">
        Search locations
        <input
          type="search"
          value={data.search}
          onChange={(event) => data.setSearch(event.target.value)}
          placeholder="Search hazards or science sites"
        />
      </label>

      <div className="hs-filters">
        <label className="hs-field">
          Hazard severity
          <select
            value={data.severity}
            onChange={(event) =>
              data.setSeverity(event.target.value)
            }
          >
            <option value="all">All levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="hs-field">
          Science importance
          <select
            value={data.importance}
            onChange={(event) =>
              data.setImportance(event.target.value)
            }
          >
            <option value="all">All levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <div className="hs-list-heading">
        <span>DISCOVERED LOCATIONS</span>
        <span>{data.visibleLocations.length}</span>
      </div>

      {data.loading && <p className="hs-message">Loading locations...</p>}

      {data.error && (
        <p className="hs-error" role="alert">
          Unable to load locations: {data.error}
        </p>
      )}

      {!data.loading &&
        !data.error &&
        data.visibleLocations.length === 0 && (
          <p className="hs-message">No matching locations found.</p>
        )}

      <div className="hs-locations">
        {!data.loading &&
          !data.error &&
          data.visibleLocations.map((location) => {
            const active =
              data.selected?.id === location.id &&
              data.selected?.kind === location.kind

            const distance =
              data.nearbyResults?.[location.kind]?.get(location.id)

            return (
              <button
                key={`${location.kind}-${location.id}`}
                type="button"
                className={`hs-location ${active ? 'selected' : ''}`}
                onClick={() => data.selectLocation(location)}
              >
                <span
                  className={`hs-location-icon ${location.kind}`}
                >
                  {location.kind === 'hazard' ? '!' : '✦'}
                </span>

                <span className="hs-location-info">
                  <strong>{location.name}</strong>
                  <small>
                    {location.kind === 'hazard'
                      ? `${location.severity} severity`
                      : `${location.importance} importance`}
                    {distance != null ? ` · ${distance} km` : ''}
                  </small>
                </span>

                <span className="hs-chevron">›</span>
              </button>
            )
          })}
      </div>

      <form className="hs-nearby" onSubmit={handleNearbySearch}>
        <div className="hs-list-heading">
          <span>NEARBY SEARCH</span>
          <button type="button" onClick={useMapLocation}>
            Use map selection
          </button>
        </div>

        <div className="hs-coordinate-fields">
          {[
            ['lat', 'Latitude'],
            ['lon', 'Longitude'],
            ['radius', 'Radius km'],
          ].map(([field, label]) => (
            <label className="hs-field" key={field}>
              {label}
              <input
                type="number"
                step="any"
                value={coordinates[field]}
                onChange={(event) =>
                  setCoordinates((old) => ({
                    ...old,
                    [field]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="hs-search-button"
          disabled={data.nearbyLoading}
        >
          {data.nearbyLoading
            ? 'Searching...'
            : 'Find nearby locations'}
        </button>

        {data.nearbyResults && (
          <button
            type="button"
            className="hs-clear-button"
            onClick={data.clearNearby}
          >
            Clear nearby results
          </button>
        )}

        {data.nearbyError && (
          <p className="hs-error" role="alert">
            {data.nearbyError}
          </p>
        )}
      </form>

      <div className="hs-details">
        <div className="hs-list-heading">
          <span>LOCATION DETAILS</span>
        </div>

        {!data.selected && (
          <p className="hs-message">
            Select a hazard or science marker to view details.
          </p>
        )}

        {data.detailsLoading && (
          <p className="hs-message">Loading details...</p>
        )}

        {data.detailsError && (
          <p className="hs-error" role="alert">
            {data.detailsError}
          </p>
        )}

        {data.selected &&
          !data.detailsLoading &&
          data.details && (
            <div className="hs-detail-content">
              <span
                className={`hs-detail-badge ${data.selected.kind}`}
              >
                {data.selected.kind === 'hazard'
                  ? `${data.details.severity} severity`
                  : `${data.details.importance} importance`}
              </span>

              <h4>{data.details.name}</h4>
              <p>{data.details.description}</p>

              <div className="hs-detail-grid">
                <div>
                  <small>LATITUDE</small>
                  <strong>{data.details.location.lat}°</strong>
                </div>
                <div>
                  <small>LONGITUDE</small>
                  <strong>{data.details.location.lon}°</strong>
                </div>
              </div>

              {data.details.radius_km != null && (
                <p>
                  <strong>Hazard radius:</strong>{' '}
                  {data.details.radius_km} km
                </p>
              )}

              {data.details.recommendation && (
                <div className="hs-recommendation">
                  <strong>Planning recommendation</strong>
                  <p>{data.details.recommendation}</p>
                </div>
              )}

              {data.details.research_interest?.length > 0 && (
                <div className="hs-research">
                  <strong>Research interests</strong>
                  <ul>
                    {data.details.research_interest.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <small className="hs-source">
                Data source: {data.details.data_source ?? 'mock'}
              </small>
            </div>
          )}
      </div>
    </section>
  )
}
