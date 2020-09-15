import React from 'react'
import PropTypes from 'prop-types'
import WaitStep from './wait_step'
import AlertStep from './alert_step'
import GenericStep from './generic_step'

const StepSelector = ({
  type,
  name,
  errors,
  touched,
  readOnly
}) => {
  const configUI = () => {
    if (type === undefined) return null
    switch (type) {
      case 'wait':
        return (
          <WaitStep
            name={name}
            errors={errors}
            touched={touched}
            readOnly={readOnly}
          />
        )
      case 'alert':
        return (
          <AlertStep
            name={name}
            errors={errors}
            touched={touched}
            readOnly={readOnly}
          />
        )
      default:
        return (
          <GenericStep
            type={type}
            name={name}
            errors={errors}
            touched={touched}
            readOnly={readOnly}
          />
        )
    }
  }

  return configUI()
}

StepSelector.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  touched: PropTypes.object,
  errors: PropTypes.object,
  readOnly: PropTypes.bool
}

export default StepSelector
