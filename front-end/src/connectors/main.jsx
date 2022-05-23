import React from 'react'
import Outlets from './outlets'
import Jacks from './jacks'
import AnalogInputs from './analog_inputs'
import Inlets from './inlets'
import i18n from 'utils/i18n'
import { connect } from 'react-redux'
import { fetchDrivers } from 'redux/actions/jacks'

class connectors extends React.Component {
  render () {
    if (this.props.drivers === undefined ||
          this.props.drivers.length === 0) {
      return (
        <div className='container'>
          {i18n.t('loading')}
        </div>
      )
    }

    return (
      <div className='container'>
        <div className='row inlets'>
          <Inlets />
        </div>
        <hr />
        <div className='row outlets'>
          <Outlets />
        </div>
        <hr />
        <div className='row analog-inputs'>
          <AnalogInputs />
        </div>
        <hr />
        <div className='row jacks'>
          <Jacks />
        </div>

      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    drivers: state.drivers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDrivers: () => dispatch(fetchDrivers())
  }
}

const Connectors = connect(
  mapStateToProps,
  mapDispatchToProps
)(connectors)
export default Connectors
