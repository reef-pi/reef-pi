import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'

/** Normalise input: [{t,v}] or [number] → [{t, v}] */
function normalise (points) {
  if (!points || points.length === 0) return []
  if (typeof points[0] === 'number') {
    return points.map((v, i) => ({ t: i, v }))
  }
  return points
}

/** Map data coords → SVG pixel coords */
function project (pts, width, height, padX = 0, padY = 4) {
  const vs = pts.map(p => p.v)
  const ts = pts.map(p => p.t)
  const minV = Math.min(...vs), maxV = Math.max(...vs)
  const minT = Math.min(...ts), maxT = Math.max(...ts)
  const rangeV = maxV - minV || 1
  const rangeT = maxT - minT || 1
  const W = width - padX * 2
  const H = height - padY * 2
  return pts.map(p => ({
    ...p,
    x: padX + ((p.t - minT) / rangeT) * W,
    y: padY + (1 - (p.v - minV) / rangeV) * H
  }))
}

/** Band y-range in SVG pixel space */
function bandY (band, pts, height, padY = 4) {
  const vs = pts.map(p => p.v)
  const minV = Math.min(...vs), maxV = Math.max(...vs)
  const rangeV = maxV - minV || 1
  const H = height - padY * 2
  const top = padY + (1 - (band[1] - minV) / rangeV) * H
  const bot = padY + (1 - (band[0] - minV) / rangeV) * H
  return { top: Math.max(padY, top), bot: Math.min(height - padY, bot) }
}

function polylinePoints (projected) {
  return projected.map(p => `${p.x},${p.y}`).join(' ')
}

function formatLabel (pt) {
  if (typeof pt.t === 'number' && pt.t < 1e9) return `i=${pt.t}: ${pt.v}`
  const d = new Date(typeof pt.t === 'number' ? pt.t * 1000 : pt.t)
  return `${d.toLocaleTimeString()}: ${pt.v}`
}

export default function Sparkline ({
  points = [],
  stroke = 'var(--reefpi-color-brand)',
  fill = 'none',
  band,
  bandColor = 'var(--reefpi-color-band-safe)',
  hover = false,
  onHover,
  height = 60
}) {
  const uid = useId().replace(/:/g, '')
  const gradId = `sg-${uid}`
  const clipId  = `sc-${uid}`

  const svgRef = useRef(null)
  const [width, setWidth] = useState(300)
  const [activeIdx, setActiveIdx] = useState(null)

  // Measure SVG width on mount and resize
  useEffect(() => {
    if (!svgRef.current) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width
      if (w > 0) setWidth(w)
    })
    ro.observe(svgRef.current)
    setWidth(svgRef.current.getBoundingClientRect().width || 300)
    return () => ro.disconnect()
  }, [])

  const normalised = normalise(points)
  if (normalised.length === 0) return null

  const projected = project(normalised, width, height)

  // Pointer move → nearest point by x distance
  const handlePointerMove = useCallback(e => {
    if (!hover || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    let best = 0, bestD = Infinity
    projected.forEach((p, i) => {
      const d = Math.abs(p.x - mx)
      if (d < bestD) { bestD = d; best = i }
    })
    setActiveIdx(best)
    if (onHover) onHover(normalised[best])
  }, [hover, projected, normalised, onHover])

  const handlePointerLeave = useCallback(() => {
    setActiveIdx(null)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(e => {
    if (!hover) return
    setActiveIdx(prev => {
      const cur = prev ?? 0
      if (e.key === 'ArrowRight') return Math.min(cur + 1, normalised.length - 1)
      if (e.key === 'ArrowLeft')  return Math.max(cur - 1, 0)
      if (e.key === 'Home')       return 0
      if (e.key === 'End')        return normalised.length - 1
      return prev
    })
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
      e.preventDefault()
    }
  }, [hover, normalised.length])

  const linePath = `M ${projected.map(p => `${p.x} ${p.y}`).join(' L ')}`
  const areaPath = fill === 'gradient'
    ? `${linePath} L ${projected[projected.length - 1].x} ${height} L ${projected[0].x} ${height} Z`
    : null

  const activePt = activeIdx !== null ? projected[activeIdx] : null

  const bandRect = band && band.length === 2 ? bandY(band, normalised, height) : null

  return (
    <svg
      ref={svgRef}
      width='100%'
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio='none'
      role='img'
      aria-label='Sparkline chart'
      tabIndex={hover ? 0 : undefined}
      onPointerMove={hover ? handlePointerMove : undefined}
      onPointerLeave={hover ? handlePointerLeave : undefined}
      onKeyDown={hover ? handleKeyDown : undefined}
      style={{ display: 'block', overflow: 'visible', outline: 'none' }}
    >
      <defs>
        {fill === 'gradient' && (
          <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%'   stopColor={stroke} stopOpacity='0.4' />
            <stop offset='100%' stopColor={stroke} stopOpacity='0' />
          </linearGradient>
        )}
        <clipPath id={clipId}>
          <rect x='0' y='0' width={width} height={height} />
        </clipPath>
      </defs>

      {/* Threshold band */}
      {bandRect && (
        <rect
          x='0'
          y={bandRect.top}
          width={width}
          height={Math.max(0, bandRect.bot - bandRect.top)}
          fill={bandColor}
          opacity='0.5'
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Gradient fill area */}
      {areaPath && (
        <path
          d={areaPath}
          fill={`url(#${gradId})`}
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Line */}
      <polyline
        points={polylinePoints(projected)}
        fill='none'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinejoin='round'
        strokeLinecap='round'
        clipPath={`url(#${clipId})`}
      />

      {/* Crosshair + tooltip */}
      {hover && activePt && (
        <g>
          {/* Vertical dashed crosshair */}
          <line
            x1={activePt.x} y1='0'
            x2={activePt.x} y2={height}
            stroke='var(--reefpi-color-text-muted)'
            strokeWidth='1'
            strokeDasharray='3 3'
          />
          {/* Point circle */}
          <circle
            cx={activePt.x}
            cy={activePt.y}
            r='4'
            fill='var(--reefpi-color-surface-elevated)'
            stroke={stroke}
            strokeWidth='2'
          />
          {/* Tooltip */}
          <TooltipLabel
            x={activePt.x}
            y={activePt.y}
            label={formatLabel(normalised[activeIdx])}
            width={width}
            height={height}
          />
        </g>
      )}

      {/* Focus ring when keyboard-navigating */}
      {hover && activeIdx !== null && document.activeElement === svgRef.current && (
        <rect
          x='1' y='1' width={width - 2} height={height - 2}
          fill='none'
          stroke='var(--reefpi-color-focus)'
          strokeWidth='2'
          rx='4'
        />
      )}
    </svg>
  )
}

/** Small SVG tooltip that flips left/right to stay in bounds */
function TooltipLabel ({ x, y, label, width, height }) {
  const PAD = 6, H = 22, CHAR_W = 6.5
  const tw = label.length * CHAR_W + PAD * 2
  const flipRight = x + tw + 8 > width
  const tx = flipRight ? x - tw - 8 : x + 8
  const ty = Math.max(H / 2 + 2, Math.min(y - H / 2, height - H - 2))

  return (
    <g>
      <rect
        x={tx} y={ty}
        width={tw} height={H}
        rx='3'
        fill='var(--reefpi-color-surface-elevated)'
        stroke='var(--reefpi-color-border)'
        strokeWidth='1'
      />
      <text
        x={tx + PAD}
        y={ty + H / 2 + 4}
        fontSize='10'
        fontFamily='var(--reefpi-font-mono)'
        fill='var(--reefpi-color-text)'
      >
        {label}
      </text>
    </g>
  )
}

Sparkline.propTypes = {
  points: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.arrayOf(PropTypes.shape({ t: PropTypes.any, v: PropTypes.number }))
  ]),
  stroke: PropTypes.string,
  fill: PropTypes.oneOf(['none', 'gradient']),
  band: PropTypes.arrayOf(PropTypes.number),
  bandColor: PropTypes.string,
  hover: PropTypes.bool,
  onHover: PropTypes.func,
  height: PropTypes.number
}
