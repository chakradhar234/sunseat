import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import type { Location, Place, RoutePoint } from '../types'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'

const defaultMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultMarkerIcon

interface Props {
  from: Location
  to: Location
  routePoints: RoutePoint[]
  places?: Place[]
}

function FitRouteBounds({ points }: { points: RoutePoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [24, 24] })
    }
  }, [map, points])
  return null
}

function RouteMap({ from, to, routePoints, places = [] }: Props) {
  const start: RoutePoint = [from.lat, from.lon]
  const end: RoutePoint = [to.lat, to.lon]

  return (
    <div className='h-[300px] w-full rounded-2xl overflow-hidden mb-6 border border-gray-200'>
      <MapContainer
        center={start}
        zoom={6}
        scrollWheelZoom={false}
        className='h-full w-full'
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={start} />
        <Marker position={end} />
        <Polyline positions={routePoints} pathOptions={{ color: '#f97316', weight: 4 }} />
        {places.map((place) => (
          <CircleMarker
            key={`${place.name}-${place.lat}-${place.lon}`}
            center={[place.lat, place.lon]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: place.side === 'LEFT' ? '#3b82f6' : '#22c55e',
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className='text-sm'>
                <p className='font-semibold mb-2'>{place.name}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                  target='_blank'
                  rel='noreferrer'
                  className='text-blue-600 underline'
                >
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <FitRouteBounds points={routePoints} />
      </MapContainer>
    </div>
  )
}

export default RouteMap
