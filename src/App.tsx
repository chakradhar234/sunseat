import { useState } from 'react'
import type { RouteFormData, RoutePoint, Place, SunResult } from './types'
import { getCoordinates } from './services/nominatimService'
import { getRouteGeometry } from './services/osrmService'
import { getPlacesAlongRoute } from './services/placesService'
import { calculateSeatSide } from './utils/bearingUtils'
import RouteForm from './components/RouteForm'
import SeatResult from './components/SeatResult'

function App() {
  const [screen, setScreen] = useState<'form' | 'result'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SunResult | null>(null)
  const [travelDate, setTravelDate] = useState<Date | null>(null)
  const [routePoints, setRoutePoints] = useState<RoutePoint[] | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [placesFailed, setPlacesFailed] = useState(false)

  function loadPlacesAlongRoute(points: RoutePoint[], bypassCache = false) {
    setPlacesLoading(true)
    setPlacesFailed(false)
    void getPlacesAlongRoute(points, bypassCache)
      .then(({ places: found, failed }) => {
        setPlaces(found)
        setPlacesFailed(failed)
      })
      .catch(() => {
        setPlaces([])
        setPlacesFailed(true)
      })
      .finally(() => setPlacesLoading(false))
  }

  async function handleFormSubmit(data: RouteFormData) {
    setIsLoading(true)
    setError('')
    try {
      const fromLocation = await getCoordinates(data.fromCity)
      const toLocation = await getCoordinates(data.toCity)
      const dateObj = new Date(`${data.date}T${data.time}:00`)
      const sunResult = await calculateSeatSide(fromLocation, toLocation, dateObj)
      let points: RoutePoint[] | null = null
      try {
        points = await getRouteGeometry(fromLocation, toLocation)
      } catch {
        points = null
      }
      setResult(sunResult)
      setTravelDate(dateObj)
      setRoutePoints(points)
      setPlaces([])
      setPlacesFailed(false)
      setPlacesLoading(false)
      setScreen('result')
      if (points && points.length > 0) {
        loadPlacesAlongRoute(points)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setScreen('form')
    setResult(null)
    setRoutePoints(null)
    setPlaces([])
    setPlacesFailed(false)
    setPlacesLoading(false)
    setError('')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-100 to-yellow-50 flex flex-col items-center justify-center p-4'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-black text-orange-500'>SunSeat</h1>
        <p className='text-gray-500 mt-1'>Know which side to sit before you travel</p>
      </div>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 w-full max-w-md text-sm'>
          {error}
        </div>
      )}
      {screen === 'form' && (
        <RouteForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      )}
      {screen === 'result' && result && travelDate && (
        <SeatResult
          result={result}
          travelDate={travelDate}
          routePoints={routePoints}
          places={places}
          placesLoading={placesLoading}
          placesFailed={placesFailed}
          onRetryPlaces={() => routePoints && loadPlacesAlongRoute(routePoints, true)}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App