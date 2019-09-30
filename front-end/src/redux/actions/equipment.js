import { reduxGet, reduxPost, reduxPut, reduxDelete } from '../../utils/ajax'

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
  return (
    reduxGet({
      url: '/api/equipment',
      success: equipmentLoaded
    }))
}
export const deleteEquipment = (id) => {
  return (
    reduxDelete({
      url: '/api/equipment/' + id,
      success: fetchEquipment
    }))
}

export const createEquipment = (e) => {
  return (
    reduxPut({
      url: '/api/equipment',
      data: e,
      success: fetchEquipment
    }))
}

export const updateEquipment = (id, e) => {
  return (
    reduxPost({
      url: '/api/equipment/' + id,
      data: e,
      success: fetchEquipment
    }))
}
