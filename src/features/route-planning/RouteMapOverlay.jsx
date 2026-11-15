
import { useEffect, useMemo } from "react";
import { CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";

function isValidPoint(point) {
  return (
    point &&
    point.lat != null &&
    point.lon != null &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lon))
  );
}

function toLeafletPoint(point) {
  return [Number(point.lat), Number(point.lon)];
}

function FitRouteToMap({ waypoints, routeId }) {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length < 2) return;

    map.fitBounds(waypoints, {
      padding: [40, 40],
      maxZoom: 12,
    });
  }, [map, waypoints, routeId]);

  return null;
}

export default function RouteMapOverlay({ route }) {
  const waypoints = useMemo(() => {
    if (!Array.isArray(route?.waypoints)) {
      return [];
    }

    return route.waypoints.filter(isValidPoint).map(toLeafletPoint);
  }, [route]);

  const exploredCells = useMemo(() => {
    if (!Array.isArray(route?.explored_cells)) {
      return [];
    }

    return route.explored_cells
      .filter(isValidPoint)
      .filter((_, index) => index % 10 === 0)
      .map(toLeafletPoint);
  }, [route]);

  if (!route) return null;

  const start = isValidPoint(route.start)
    ? toLeafletPoint(route.start)
    : waypoints[0];

  const destination = isValidPoint(route.destination)
    ? toLeafletPoint(route.destination)
    : waypoints[waypoints.length - 1];

  return (
    <>
      <FitRouteToMap waypoints={waypoints} routeId={route.id} />

      {exploredCells.map((cell, index) => (
        <CircleMarker
          key={`explored-${index}`}
          center={cell}
          radius={2}
          pathOptions={{
            color: "#168bff",
            weight: 0,
            fillColor: "#168bff",
            fillOpacity: 0.65,
            bubblingMouseEvents: false,
          }}
        />
      ))}

      {waypoints.length >= 2 && (
        <Polyline
          positions={waypoints}
          pathOptions={{
            color: "#00e5ff",
            weight: 5,
            opacity: 1,
            dashArray: "12 7",
            bubblingMouseEvents: false,
          }}
        >
          <Tooltip>A* Pathfinding Route #{route.id}</Tooltip>
        </Polyline>
      )}

      {start && (
        <CircleMarker
          center={start}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#37c9a9",
            fillOpacity: 1,
            bubblingMouseEvents: false,
          }}
        >
          <Tooltip direction="top">Route start</Tooltip>
        </CircleMarker>
      )}

      {destination && (
        <CircleMarker
          center={destination}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#ef9869",
            fillOpacity: 1,
            bubblingMouseEvents: false,
          }}
        >
          <Tooltip direction="top">Route destination</Tooltip>
        </CircleMarker>
      )}
    </>
  );
}
