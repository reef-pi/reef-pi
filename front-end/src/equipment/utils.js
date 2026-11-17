import { SortByName } from 'utils/sort_by_name'

export const SORT_NAME_AZ = 'name_az'
export const SORT_NAME_ZA = 'name_za'
export const SORT_ON_FIRST = 'on_first'
export const SORT_OFF_FIRST = 'off_first'
export const EQUIPMENT_POLL_INTERVAL_MS = 10 * 1000

export function sortEquipment (equipment = [], mode = SORT_NAME_AZ) {
  const copy = [...equipment]
  switch (mode) {
    case SORT_NAME_ZA:
      return copy.sort((a, b) => SortByName(b, a))
    case SORT_ON_FIRST:
      return copy.sort((a, b) => (b.on ? 1 : 0) - (a.on ? 1 : 0) || SortByName(a, b))
    case SORT_OFF_FIRST:
      return copy.sort((a, b) => (a.on ? 1 : 0) - (b.on ? 1 : 0) || SortByName(a, b))
    default:
      return copy.sort((a, b) => SortByName(a, b))
  }
}

export function buildEquipmentPayload (equipment, updates = {}) {
  return {
    id: equipment.id,
    name: equipment.name,
    on: equipment.on,
    outlet: equipment.outlet,
    stay_off_on_boot: equipment.stay_off_on_boot,
    boot_delay: equipment.boot_delay || 0,
    ...updates
  }
}

// Turn equipment on or off. The update endpoint (POST /api/equipment/{id}) ignores `on`;
// only /control changes the outlet state. Rejects on a non-2xx response.
export function controlEquipment (id, on) {
  return fetch(`/api/equipment/${id}/control`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ on })
  }).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  })
}
