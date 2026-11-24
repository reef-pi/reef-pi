import React from 'react'
import PropTypes from 'prop-types'
import { Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

// A Yes/No select bound to a boolean form value. The DOM only deals in strings, so convert on the way
// in and out; otherwise the form submits "true"/"false" and the API rejects the request.
const BooleanFormSelect = ({ value, onChange, children, ...props }) => (
  <Select
    {...props}
    value={String(value)}
    onChange={e => onChange({ target: { name: e.target.name, value: e.target.value === 'true' } })}
  >
    {children}
  </Select>
)

BooleanFormSelect.propTypes = {
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node
}

export default BooleanFormSelect
