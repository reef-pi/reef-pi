import Equipment from './equiment'
import EquipmentSchema from './equipment_schema'
import { withFormik } from 'formik'

const AddEquipmentForm = withFormik({
  mapPropsToValues: props => ({config: props.config, remove: props.remove}),
  validationSchema: EquipmentSchema,
  handleSubmit: (values, formikBag) => {
    var payload = {
      name: values.name,
      outlet: values.outletID
    }
    formikBag.props.create(payload)
  }
})(Equipment)

export default AddEquipmentForm
