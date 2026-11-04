import type { Place } from '../types'

interface Props {
  places: Place[]
  recommendedSide: 'LEFT' | 'RIGHT'
  isLoading: boolean
  failed: boolean
  onRetry: () => void
}

function PlacesList({ places, recommendedSide, isLoading, failed, onRetry }: Props) {
  if (isLoading) {
    return (
      <div className='mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center'>
        <p className='text-gray-500 text-sm'>Loading places along your route…</p>
      </div>
    )
  }

  if (failed) {
    return (
      <div className='mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center'>
        <p className='text-gray-600 text-sm mb-3'>Couldn&apos;t load places right now</p>
        <button
          type='button'
          onClick={onRetry}
          className='text-sm font-semibold text-orange-600 hover:text-orange-700 underline'
        >
          Retry
        </button>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className='mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center'>
        <p className='text-gray-500 text-sm'>No notable places found along this route.</p>
      </div>
    )
  }

  return (
    <div className='mb-6'>
      <h3 className='text-lg font-bold text-gray-800 mb-3'>Places along the route</h3>
      <ul className='space-y-3'>
        {places.map((place) => {
          const visibleFromWindow = place.side === recommendedSide
          const isLeft = place.side === 'LEFT'
          return (
            <li
              key={`${place.name}-${place.lat}-${place.lon}`}
              className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'
            >
              <div className='flex items-start justify-between gap-2 mb-1'>
                <p className='font-semibold text-gray-800 text-sm leading-snug'>{place.name}</p>
                <span
                  className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${
                    isLeft ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {place.side}
                </span>
              </div>
              <p className='text-gray-500 text-xs mb-2 capitalize'>{place.category.replace(/_/g, ' ')}</p>
              <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600'>
                <span>{Math.round(place.distanceFromStartKm)} km from start</span>
                <span>{Math.round(place.distanceOffRouteKm * 10) / 10} km off route</span>
              </div>
              {visibleFromWindow && (
                <span className='inline-block mt-2 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded'>
                  Visible from your window
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PlacesList
