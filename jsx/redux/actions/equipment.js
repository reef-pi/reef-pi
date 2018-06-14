import {reduxGet} from '../../utils/ajax'

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
