import type { SunResult } from '../types'
import { getBearingLabel, getSunIntensity } from '../utils/bearingUtils'
import SunCompass from './SunCompass'

interface Props {
  result: SunResult
  travelDate: Date
  onReset: () => void
}

function SeatResult({ result, travelDate, onReset }: Props) {
  const bearingLabel = getBearingLabel(result.travelBearing)
  const intensity = getSunIntensity(travelDate, result.fromLocation.lat, result.fromLocation.lon)
  const isLeft = result.sitSide === 'LEFT'

  function openGoogleMaps() {
    const from = encodeURIComponent(result.fromLocation.name)
    const to = encodeURIComponent(result.toLocation.name)
    const url = `https://www.google.com/maps/dir/${from}/${to}`
    window.open(url, '_blank')
  }

  function shareOnWhatsApp() {
    const time = travelDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const date = travelDate.toLocaleDateString('en-IN')
    const msg = `SunSeat Result%0A%0ARoute: ${result.fromLocation.name} to ${result.toLocation.name}%0ADate: ${date} at ${time}%0A%0ASit on the *${result.sitSide}* side of the vehicle%0ATravelling: ${bearingLabel}%0ASun is in the: ${getBearingLabel(result.sunAzimuth)}%0ASun intensity: ${intensity}%0A%0AStay cool! Try SunSeat for your next journey.`
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
      <p className='text-center text-gray-500 text-sm mb-6'>
        {result.fromLocation.name} to {result.toLocation.name}
      </p>
      <div className={`rounded-2xl p-8 mb-6 text-center ${isLeft ? 'bg-blue-50' : 'bg-green-50'}`}>
        <p className='text-gray-500 text-sm mb-2'>Sit on the</p>
        <h1 className={`text-6xl font-black mb-2 ${isLeft ? 'text-blue-600' : 'text-green-600'}`}>
          {result.sitSide}
        </h1>
        <p className='text-gray-500 text-sm'>side of the vehicle</p>
      </div>
      <SunCompass sunAzimuth={result.sunAzimuth} travelBearing={result.travelBearing} sitSide={result.sitSide} />
      <div className='space-y-3 mb-6'>
        <div className='flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3'>
          <span className='text-gray-500 text-sm'>Travelling</span>
          <span className='font-semibold text-gray-800'>{bearingLabel} ({Math.round(result.travelBearing)})</span>
        </div>
        <div className='flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3'>
          <span className='text-gray-500 text-sm'>Sun is in the</span>
          <span className='font-semibold text-gray-800'>{getBearingLabel(result.sunAzimuth)} ({Math.round(result.sunAzimuth)})</span>
        </div>
        <div className='flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3'>
          <span className='text-gray-500 text-sm'>Sun intensity</span>
          <span className='font-semibold text-gray-800'>{intensity}</span>
        </div>
      </div>
      <div className='bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-6'>
        <p className='text-orange-700 text-sm text-center'>
          Sitting on the {result.sitSide} side keeps the sun behind you
        </p>
      </div>
      <div className='flex gap-3 mb-3'>
        <button onClick={openGoogleMaps}
          className='flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors text-sm'>
          Open in Google Maps
        </button>
        <button onClick={shareOnWhatsApp}
          className='flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors text-sm'>
          Share on WhatsApp
        </button>
      </div>
      <button onClick={onReset}
        className='w-full border-2 border-gray-300 hover:border-gray-400 text-gray-600 font-semibold py-3 rounded-lg transition-colors'
      >
        Back to Form
      </button>
    </div>
  )
}

export default SeatResult