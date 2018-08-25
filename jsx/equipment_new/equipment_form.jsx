import EditEquipment from './edit_equipment'
import EquipmentSchema from './equipment_schema'
import { withFormik } from 'formik'

const EditEquipmentForm = withFormik({
  displayName: 'EquipmentForm',
  mapPropsToValues: props => ({
    equipment: props.equipment,
    outlets: props.outlets,
    remove: props.remove
  }),
  validationSchema: EquipmentSchema,
  handleSubmit: (values, formikBag) => {

    const payload = {
      name: values.name,
      outlet: values.outletID
    }

    this.props.create(payload)

    formikBag.props.create(payload)
  }
})(EditEquipment)

export default EditEquipmentForm
