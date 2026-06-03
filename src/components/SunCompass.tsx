interface Props {
  sunAzimuth: number
  travelBearing: number
  sitSide: 'LEFT' | 'RIGHT'
}

function SunCompass({ sunAzimuth, travelBearing, sitSide }: Props) {
  const cx = 100
  const cy = 100
  const radius = 80
  const sunAngle = ((sunAzimuth - travelBearing + 360) % 360)
  const sunRad = (sunAngle - 90) * (Math.PI / 180)
  const sunX = cx + radius * Math.cos(sunRad)
  const sunY = cy + radius * Math.sin(sunRad)
  const arrowY2 = cy + 60

  return (
    <div className='flex flex-col items-center mb-6'>
      <p className='text-gray-500 text-sm mb-3'>Sun position relative to your journey</p>
      <svg width='200' height='200' viewBox='0 0 200 200'>
        <circle cx={cx} cy={cy} r={radius} fill='#f8fafc' stroke='#e2e8f0' strokeWidth='1.5' />
        <text x={cx} y={cy - radius - 8} textAnchor='middle' fontSize='10' fill='#94a3b8'>N</text>
        <text x={cx} y={cy + radius + 16} textAnchor='middle' fontSize='10' fill='#94a3b8'>S</text>
        <text x={cx + radius + 10} y={cy + 4} textAnchor='middle' fontSize='10' fill='#94a3b8'>E</text>
        <text x={cx - radius - 10} y={cy + 4} textAnchor='middle' fontSize='10' fill='#94a3b8'>W</text>
        <rect x={cx - 12} y={cy - 22} width='24' height='44' rx='5' fill='#334155' />
        <rect x={cx - 9} y={cy - 18} width='18' height='12' rx='2' fill='#7dd3fc' />
        <rect x={cx - 9} y={cy + 2} width='18' height='12' rx='2' fill='#7dd3fc' />
        <defs>
          <marker id='arrow' markerWidth='6' markerHeight='6' refX='3' refY='3' orient='auto'>
            <path d='M0,0 L0,6 L6,3 z' fill='#f97316' />
          </marker>
        </defs>
        <line x1={cx} y1={cy + 22} x2={cx} y2={arrowY2} stroke='#f97316' strokeWidth='2' markerEnd='url(#arrow)' />
        <circle cx={sunX} cy={sunY} r='14' fill='#fbbf24' opacity='0.9' />
        <text x={sunX} y={sunY + 5} textAnchor='middle' fontSize='12'>☀️</text>
        {sitSide === 'LEFT' && (
          <rect x={cx - 80} y={cy - 40} width='30' height='80' rx='4' fill='#3b82f6' opacity='0.15' />
        )}
        {sitSide === 'RIGHT' && (
          <rect x={cx + 50} y={cy - 40} width='30' height='80' rx='4' fill='#22c55e' opacity='0.15' />
        )}
        {sitSide === 'LEFT' && (
          <text x={cx - 65} y={cy + 5} textAnchor='middle' fontSize='9' fill='#3b82f6' fontWeight='bold'>SIT HERE</text>
        )}
        {sitSide === 'RIGHT' && (
          <text x={cx + 65} y={cy + 5} textAnchor='middle' fontSize='9' fill='#22c55e' fontWeight='bold'>SIT HERE</text>
        )}
      </svg>
    </div>
  )
}

export default SunCompass