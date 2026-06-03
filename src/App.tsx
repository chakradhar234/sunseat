import { useState } from 'react'
import type { RouteFormData, SunResult } from './types'
import { getCoordinates } from './services/nominatimService'
import { calculateSeatSide } from './utils/bearingUtils'
import RouteForm from './components/RouteForm'
import SeatResult from './components/SeatResult'

function App() {
  const [screen, setScreen] = useState<'form' | 'result'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SunResult | null>(null)
  const [travelDate, setTravelDate] = useState<Date | null>(null)

  async function handleFormSubmit(data: RouteFormData) {
    setIsLoading(true)
    setError('')
    try {
      const fromLocation = await getCoordinates(data.fromCity)
      const toLocation = await getCoordinates(data.toCity)
      const dateObj = new Date(`${data.date}T${data.time}:00`)
      const sunResult = await calculateSeatSide(fromLocation, toLocation, dateObj)
      setResult(sunResult)
      setTravelDate(dateObj)
      setScreen('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setScreen('form')
    setResult(null)
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
        <SeatResult result={result} travelDate={travelDate} onReset={handleReset} />
      )}
    </div>
  )
}

export default App