import type { MoonInfo } from '../utils/sunUtils'

interface Props {
  sunAzimuth: number
  travelBearing: number
  sitSide: 'LEFT' | 'RIGHT'
  showSitHighlight: boolean
  sunAltitude: number
  moonInfo: MoonInfo
}

function SunCompass({
  sunAzimuth,
  travelBearing,
  sitSide,
  showSitHighlight,
  sunAltitude,
  moonInfo,
}: Props) {
  const cx = 100
  const cy = 102
  const sunRadius = 86
  const sunAngle = (sunAzimuth - travelBearing + 360) % 360
  const sunAngleRad = (sunAngle * Math.PI) / 180
  const sunX = cx + sunRadius * Math.sin(sunAngleRad)
  const sunY = cy - sunRadius * Math.cos(sunAngleRad)

  const moonAngle = (moonInfo.azimuth - travelBearing + 360) % 360
  const moonAngleRad = (moonAngle * Math.PI) / 180
  const moonX = cx + sunRadius * Math.sin(moonAngleRad)
  const moonY = cy - sunRadius * Math.cos(moonAngleRad)

  const showSun = sunAltitude >= 0
  const showMoon = !showSun && moonInfo.altitude > 0
  const showMoonBelowHorizon = !showSun && moonInfo.altitude <= 0

  const bodyX = 52
  const bodyY = 58
  const bodyW = 96
  const bodyH = 88
  const midX = bodyX + bodyW / 2
  const driverCx = bodyX + bodyW * 0.72
  const driverCy = bodyY + bodyH * 0.28
  const darkGrey = '#334155'
  const leftHalfFill = showSitHighlight && sitSide === 'LEFT' ? '#38bdf8' : darkGrey
  const rightHalfFill = showSitHighlight && sitSide === 'RIGHT' ? '#4ade80' : darkGrey
  const sitLabelX = sitSide === 'LEFT' ? bodyX + bodyW * 0.25 : bodyX + bodyW * 0.75
  const sitLabelY = bodyY + bodyH / 2 + 4

  return (
    <div className='flex flex-col items-center mb-6'>
      <p className='text-gray-500 text-sm mb-3'>Sun position relative to your journey</p>
      <svg width='200' height='200' viewBox='0 0 200 200'>
        <circle cx={cx} cy={cy} r={sunRadius} fill='#f8fafc' stroke='#e2e8f0' strokeWidth='1.5' />
        <text x={midX} y={38} textAnchor='middle' fontSize='9' fill='#64748b' fontWeight='600'>
          FRONT
        </text>
        <text x={midX} y={168} textAnchor='middle' fontSize='9' fill='#64748b' fontWeight='600'>
          BACK
        </text>
        <text x={34} y={cy + 4} textAnchor='middle' fontSize='9' fill='#64748b' fontWeight='600'>
          LEFT
        </text>
        <text x={166} y={cy + 4} textAnchor='middle' fontSize='9' fill='#64748b' fontWeight='600'>
          RIGHT
        </text>

        <rect x={bodyX} y={bodyY} width={bodyW / 2} height={bodyH} rx='6' fill={leftHalfFill} />
        <rect x={midX} y={bodyY} width={bodyW / 2} height={bodyH} rx='6' fill={rightHalfFill} />
        <rect x={bodyX + 8} y={bodyY + 4} width={bodyW - 16} height={18} rx='4' fill='#7dd3fc' opacity='0.85' />
        <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx='8' fill='none' stroke={darkGrey} strokeWidth='2' />

        <circle cx={driverCx} cy={driverCy} r='9' fill='none' stroke='#e2e8f0' strokeWidth='2' />
        <circle cx={driverCx} cy={driverCy - 14} r='4' fill='#fcd34d' />
        <text x={driverCx} y={driverCy + 22} textAnchor='middle' fontSize='6' fill='#ffffff' fontWeight='600'>
          Driver
        </text>

        {showSitHighlight && (
          <text
            x={sitLabelX}
            y={sitLabelY}
            textAnchor='middle'
            fontSize='10'
            fill='#ffffff'
            fontWeight='bold'
          >
            SIT HERE
          </text>
        )}

        <defs>
          <marker id='forward-arrow' markerWidth='6' markerHeight='6' refX='3' refY='3' orient='auto'>
            <path d='M0,0 L0,6 L6,3 z' fill='#f97316' />
          </marker>
        </defs>
        <line
          x1={midX}
          y1={bodyY + 26}
          x2={midX}
          y2={44}
          stroke='#f97316'
          strokeWidth='2.5'
          markerEnd='url(#forward-arrow)'
        />

        {showSun && (
          <>
            <circle cx={sunX} cy={sunY} r='14' fill='#fbbf24' opacity='0.95' />
            <text x={sunX} y={sunY + 5} textAnchor='middle' fontSize='12'>
              ☀️
            </text>
          </>
        )}
        {showMoon && (
          <>
            <circle cx={moonX} cy={moonY} r='14' fill='#e2e8f0' opacity='0.95' />
            <text x={moonX} y={moonY + 5} textAnchor='middle' fontSize='12'>
              🌙
            </text>
          </>
        )}
      </svg>
      {showMoonBelowHorizon && (
        <p className='text-gray-400 text-xs mt-1'>Moon is below the horizon</p>
      )}
    </div>
  )
}

export default SunCompass
