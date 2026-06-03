import { useState } from 'react'
import type { RouteFormData } from '../types'

interface Props {
  onSubmit: (data: RouteFormData) => void
  isLoading: boolean
}

function RouteForm({ onSubmit, isLoading }: Props) {
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const today = new Date().toISOString().split('T')[0]

  function handleSubmit() {
    if (!fromCity || !toCity || !date || !time) {
      alert('Please fill in all fields')
      return
    }
    onSubmit({ fromCity, toCity, date, time })
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg p-8 w-full max-w-md'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Plan Your Journey</h2>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>From</label>
        <input type='text' placeholder='e.g. Bengaluru' value={fromCity}
          onChange={(e) => setFromCity(e.target.value)}
          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>To</label>
        <input type='text' placeholder='e.g. Hyderabad' value={toCity}
          onChange={(e) => setToCity(e.target.value)}
          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>Travel Date</label>
        <input type='date' min={today} value={date}
          onChange={(e) => setDate(e.target.value)}
          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
        />
      </div>
      <div className='mb-6'>
        <label className='block text-sm font-medium text-gray-600 mb-1'>Departure Time</label>
        <input type='time' value={time}
          onChange={(e) => setTime(e.target.value)}
          className='w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400'
        />
      </div>
      <button onClick={handleSubmit} disabled={isLoading}
        className='w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50'
      >
        {isLoading ? 'Calculating...' : 'Find My Seat'}
      </button>
    </div>
  )
}

export default RouteForm