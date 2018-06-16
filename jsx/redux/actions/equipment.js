import {reduxGet, reduxPost, reduxPut, reduxDelete} from '../../utils/ajax'

export const equipmentsLoaded = (equipments) => {
  return ({
    type: 'EQUIPMENTS_LOADED',
    payload: equipments
  })
}

export const fetchEquipments = () => {
  return (
    reduxGet({
      url: '/api/equipments',
      success: equipmentsLoaded
    }))
}
export const deleteEquipment = (id) => {
  return (
    reduxDelete({
      url: '/api/equipments/' + id,
      success: fetchEquipments
    }))
}

export const createEquipment = (e) => {
  return (
    reduxPut({
      url: '/api/equipments',
      data: e,
      success: fetchEquipments
    }))
}

export const updateEquipment = (id, e) => {
  return (
    reduxPost({
      url: '/api/equipments/'+id,
      data: e,
      success: fetchEquipments
    }))
}
