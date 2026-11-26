import React from 'react'
import {
  FaBook,
  FaCamera,
  FaClock,
  FaEyeDropper,
  FaFaucetDrip,
  FaFlask,
  FaGaugeHigh,
  FaGear,
  FaHeartPulse,
  FaLightbulb,
  FaListCheck,
  FaPlug,
  FaServer,
  FaTemperatureHalf
} from 'react-icons/fa6'

/*
 * One Font Awesome 6 glyph per route, shared by Sidebar, BottomNav and the
 * app shell so every surface shows the same, distinct icon for a module.
 * Each icon is rendered at the same optical size (18px) and hidden from
 * assistive tech — the nav item's text label is the accessible name.
 */
const SIZE = 18

function glyph (Icon) {
  return <Icon size={SIZE} aria-hidden='true' focusable='false' />
}

export const NAV_ICONS = {
  dashboard: glyph(FaGaugeHigh),
  equipment: glyph(FaPlug),
  timers: glyph(FaClock),
  lighting: glyph(FaLightbulb),
  temperature: glyph(FaTemperatureHalf),
  ato: glyph(FaFaucetDrip),
  ph: glyph(FaFlask),
  doser: glyph(FaEyeDropper),
  macro: glyph(FaListCheck),
  camera: glyph(FaCamera),
  manager: glyph(FaServer),
  journal: glyph(FaBook),
  configuration: glyph(FaGear),
  health: glyph(FaHeartPulse)
}

export function navIconFor (key) {
  return NAV_ICONS[key] || NAV_ICONS.configuration
}
