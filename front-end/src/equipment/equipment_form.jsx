import EditEquipment from './edit_equipment'
import EquipmentSchema from './equipment_schema'
import { withFormik } from 'formik'

export const mapEquipmentPropsToValues = props => ({
  name: (props.equipment && props.equipment.name) || '',
  outlet: (props.equipment && props.equipment.outlet) || '',
  id: (props.equipment && props.equipment.id) || '',
  on: (props.equipment && props.equipment.on) || false,
  stay_off_on_boot: (props.equipment && props.equipment.stay_off_on_boot) || false,
  boot_delay: (props.equipment && props.equipment.boot_delay) || 0,
  outlets: props.outlets,
  remove: props.remove
})

export const submitEquipmentForm = (values, { props }) => {
  props.onSubmit(values)
}

const EditEquipmentForm = withFormik({
  displayName: 'EquipmentForm',
  mapPropsToValues: mapEquipmentPropsToValues,
  validationSchema: EquipmentSchema,
  handleSubmit: submitEquipmentForm
})(EditEquipment)

export default EditEquipmentForm
