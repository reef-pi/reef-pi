import React from 'react'
import { fetchDrivers, deleteDriver, createDriver, updateDriver } from 'redux/actions/drivers'
import { connect } from 'react-redux'
import Driver from './driver'
import New from './new'

class drivers extends React.Component {
  constructor (props) {
    super(props)
    this.list = this.list.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  list () {
    const items = []
    this.props.drivers.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).forEach((d, n) => {
      if (d.type === 'rpi') {
        items.push(
          <div className='row ' key={d.id}>
            <div className='col-4 col-md-6'>{d.name}</div>
            <div className='col-4 col-md-6'>{d.type}</div>
          </div>
        )
        return
      }
      items.push(
        <Driver
          name={d.name}
          driver_id={d.id}
          type={d.type}
          key={d.id}
          config={d.config}
          remove={this.props.delete}
          update={this.props.update}
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
        <New drivers={this.props.drivers} hook={this.props.create} />
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { drivers: state.drivers }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchDrivers()),
    create: d => dispatch(createDriver(d)),
    delete: id => dispatch(deleteDriver(id)),
    update: (id, p) => dispatch(updateDriver(id, p))
  }
}

const Drivers = connect(
  mapStateToProps,
  mapDispatchToProps
)(drivers)
export default Drivers
