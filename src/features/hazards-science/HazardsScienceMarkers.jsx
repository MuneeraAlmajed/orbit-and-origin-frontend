
import { CircleMarker, Tooltip } from 'react-leaflet'
import L from 'leaflet'


function marsToMapCoordinates(location) {
  const latitude = Number(location.lat)
  const longitude = Number(location.lon)

  return [
    500 - (latitude - 18.4) * 1000,
    500 + (longitude - 77.7) * 1000,
  ]
}

const severityColors = {
  high: '#ed654f',
  medium: '#e6ad4c',
  low: '#76b9a0',
}

export default function HazardsScienceMarkers({
  locations = [],
  selected,
  onSelect,
}) {
  return (
    <>
      {locations.map((location) => {
        if (
          !Number.isFinite(Number(location.location?.lat)) ||
          !Number.isFinite(Number(location.location?.lon))
        ) {
          return null
        }

        const isHazard = location.kind === 'hazard'

        const color = isHazard
          ? severityColors[location.severity] ?? '#ed654f'
          : '#a78bfa'

        const isSelected =
          selected?.id === location.id &&
          selected?.kind === location.kind

        return (
          <CircleMarker
            key={`${location.kind}-${location.id}`}
            center={marsToMapCoordinates(location.location)}
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color: '#ffffff',
              weight: isSelected ? 3 : 2,
              fillColor: color,
              fillOpacity: 0.95,
              bubblingMouseEvents: false,
            }}
            eventHandlers={{
              click: (event) => {
                if (event.originalEvent) {
                  L.DomEvent.stopPropagation(event.originalEvent)
                }
                onSelect?.(location)
              },
            }}
          >
            <Tooltip direction="top">
              <strong>{location.name}</strong>
              <div>
                {isHazard
                  ? `${location.severity} severity`
                  : `${location.importance} importance`}
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </>
  )
}
