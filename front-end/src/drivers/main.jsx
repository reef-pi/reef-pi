import React from 'react'
import { fetchDrivers, fetchDriverOptions, deleteDriver, createDriver, updateDriver, provisionDriver } from 'redux/actions/drivers'
import { connect } from 'react-redux'
import Driver from './driver'
import New from './new'
import { validateDriver } from './api'
import { SortByName } from 'utils/sort_by_name'

export class RawDriversMain extends React.Component {
  constructor (props) {
    super(props)
    this.list = this.list.bind(this)
    this.validate = this.validate.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
    this.props.fetchDriverOptions()
  }

  validate (payload) {
    return validateDriver(payload)
  }

  list () {
    const items = []
    this.props.drivers.sort((a, b) => SortByName(a, b))
      .forEach((d, n) => {
        items.push(
          <Driver
            key={d.id}
            driver={d}
            validate={this.validate}
            driverOptions={this.props.driverOptions}
            read_only={(d.type === 'rpi')}
            remove={this.props.delete}
            update={this.props.update}
            provision={this.props.provision}
          />
        )
      })
    return items
  }

  render () {
    return (
      <div className='container'>
        <div className='row mb-1'>
          <div className='col-12'>
            {this.list()}
          </div>
        </div>
        <New
          drivers={this.props.drivers}
          hook={this.props.create}
          driverOptions={this.props.driverOptions}
          validate={this.validate}
        />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    drivers: state.drivers,
    driverOptions: state.driverOptions
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchDrivers()),
    fetchDriverOptions: () => dispatch(fetchDriverOptions()),
    create: d => dispatch(createDriver(d)),
    delete: id => dispatch(deleteDriver(id)),
    update: (id, p) => dispatch(updateDriver(id, p)),
    provision: id => dispatch(provisionDriver(id))
  }
}

const Drivers = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawDriversMain)
export default Drivers
