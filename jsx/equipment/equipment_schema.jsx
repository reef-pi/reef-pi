import * as Yup from 'yup'

const EquipmentSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  outlet: Yup.string().required('Outlet is required')
})

export default EquipmentSchema
