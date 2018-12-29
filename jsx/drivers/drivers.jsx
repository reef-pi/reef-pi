import React from 'react'
import { fetchDrivers } from 'redux/actions/drivers'
import { connect } from 'react-redux'

class drivers extends React.Component {
  componentDidMount () {
    this.props.fetchDrivers()
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

const Drivers = connect(
  mapStateToProps,
  mapDispatchToProps
)(drivers)

export default Drivers
