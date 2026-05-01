import { deleteAction, getAction, postAction, putAction } from './api'

export const equipmentUpdated = () => {
  return ({
    type: 'EQUIPMENT_UPDATED'
  })
}
export const equipmentLoaded = (equipment) => {
  return ({
    type: 'EQUIPMENTS_LOADED',
    payload: equipment
  })
}

export const fetchEquipment = () => {
  return getAction('equipment', equipmentLoaded)
}
export const deleteEquipment = (id) => {
  return deleteAction(['equipment', id], fetchEquipment)
}

export const createEquipment = (e) => {
  return putAction('equipment', e, fetchEquipment)
}

export const updateEquipment = (id, e) => {
  return postAction(['equipment', id], e, fetchEquipment)
}
