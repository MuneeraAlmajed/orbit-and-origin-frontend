
import { useEffect, useMemo } from 'react'
import {
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet'

function isValidPoint(point) {
  return (
    point &&
    point.lat != null &&
    point.lon != null &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lon))
  )
}

function toLeafletPoint(point) {
  return [
    Number(point.lat),
    Number(point.lon),
  ]
}

function FitRouteToMap({ waypoints, routeId }) {
  const map = useMap()

  useEffect(() => {
    if (waypoints.length < 2) return

    map.fitBounds(waypoints, {
      padding: [40, 40],
      maxZoom: 12,
    })
  }, [map, waypoints, routeId])

  return null
}

export default function RouteMapOverlay({ route }) {
  const waypoints = useMemo(() => {
    if (!Array.isArray(route?.waypoints)) {
      return []
    }

    return route.waypoints
      .filter(isValidPoint)
      .map(toLeafletPoint)
  }, [route])

  if (!route) return null

  const start = isValidPoint(route.start)
    ? toLeafletPoint(route.start)
    : waypoints[0]

  const destination = isValidPoint(route.destination)
    ? toLeafletPoint(route.destination)
    : waypoints[waypoints.length - 1]

  return (
    <>
      <FitRouteToMap
        waypoints={waypoints}
        routeId={route.id}
      />

      {waypoints.length >= 2 && (
        <Polyline
          positions={waypoints}
          pathOptions={{
            color: '#ffbd73',
            weight: 5,
            opacity: 0.95,
            dashArray: '12 7',
            bubblingMouseEvents: false,
          }}
        >
          <Tooltip>
            Simulated route #{route.id}
          </Tooltip>
        </Polyline>
      )}

      {start && (
        <CircleMarker
          center={start}
          radius={10}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: '#37c9a9',
            fillOpacity: 1,
            bubblingMouseEvents: false,
          }}
        >
          <Tooltip direction="top">
            Route start
          </Tooltip>
        </CircleMarker>
      )}

      {destination && (
        <CircleMarker
          center={destination}
          radius={10}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: '#ef9869',
            fillOpacity: 1,
            bubblingMouseEvents: false,
          }}
        >
          <Tooltip direction="top">
            Route destination
          </Tooltip>
        </CircleMarker>
      )}
    </>
  )
}
