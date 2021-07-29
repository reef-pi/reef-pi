import React from 'react'
import { confirm } from 'utils/confirm'
import { fetchOutlets, updateOutlet, deleteOutlet, createOutlet } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import Outlet from './outlet'
import Pin from './pin'
import i18next from 'i18next'
import { SortByName } from 'utils/sort_by_name'

class outlets extends React.Component {
  constructor (props) {
    super(props)
    const d = props.drivers.filter(d => d.id === 'rpi')[0]
    this.state = {
      outName: '',
      outPin: 0,
      outReverse: false,
      add: false,
      driver: d
    }
    this.list = this.list.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.remove = this.remove.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
    this.handleDriverChange = this.handleDriverChange.bind(this)
  }

  handleDriverChange (e) {
    const driver = this.props.drivers.filter(d => d.id === e.target.value)[0]
    this.setState({
      driver: driver || {}
    })
  }

  handleNameChange (e) {
    this.setState({ outName: e.target.value })
  }

  onPinChange (v) {
    this.setState({ outPin: v })
  }

  handleReverseChange () {
    this.setState({ outReverse: !this.state.outReverse })
  }

  remove (id) {
    return function () {
      confirm('Are you sure ?').then(
        function () {
          this.props.delete(id)
        }.bind(this)
      )
    }.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  handleAdd () {
    this.setState({
      add: !this.state.add,
      outName: '',
      outPin: 0,
      outReverse: false
    })
  }

  handleSave () {
    const payload = {
      name: this.state.outName,
      pin: this.state.outPin,
      reverse: this.state.outReverse,
      driver: this.state.driver.id
    }
    this.props.create(payload)
    this.handleAdd()
  }

  list () {
    const list = []
    this.props.outlets
      .sort((a, b) => SortByName(a, b))
      .forEach((o, i) => {
        list.push(
          <Outlet
            name={o.name}
            outlet_id={o.id}
            pin={o.pin}
            key={o.id}
            reverse={o.reverse}
            equipment={o.equipment}
            remove={this.remove(o.id)}
            drivers={this.props.drivers}
            driver={this.props.drivers.filter(d => d.id === o.driver)[0] || {}}
            update={p => {
              this.props.update(o.id, p)
              this.props.fetch()
            }}
          />
        )
      })
    return list
  }

  render () {
    const dStyle = {
      display: this.state.add ? '' : 'none'
    }
    return (
      <div className='container'>
        <div className='row mb-1'>
          <div className='col-12'>
            <label className='h5'>{i18next.t('outlets')}</label>
            {this.list()}
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <input
              id='add_outlet'
              type='button'
              value={this.state.add ? '-' : '+'}
              onClick={this.handleAdd}
              className='btn btn-sm btn-outline-success'
            />
          </div>
        </div>

        <div className='row' style={dStyle}>
          <div className='col-12 col-md-3'>
            <div className='form-group'>
              <span className='input-group-addon'>{i18next.t('name')}</span>
              <input
                type='text'
                id='outletName'
                onChange={this.handleNameChange}
                value={this.state.outName}
                className='form-control'
              />
            </div>
          </div>
          <div className='col-12 col-md-2'>
            <Pin
              driver={this.state.driver}
              update={this.onPinChange}
              type='digital-output'
              current={this.state.outPin}
            />
          </div>
          <div className='col-12 col-md-2'>
            <div className='driver-type form-group'>
              <span className='input-group-addon'>{i18next.t('driver')}</span>
              <select
                name='driver'
                className='form-control custom-select'
                onChange={this.handleDriverChange}
                value={this.state.driver.id}
              >
                {this.props.drivers.map(item => {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <div className='col-12 col-md-2'>
            <div className='form-group'>
              <span className='input-group-addon'> {i18next.t('reverse')} </span>
              <input
                type='checkbox'
                id='outletReverse'
                onChange={this.handleReverseChange}
                className='form-control'
                checked={this.state.outReverse}
              />
            </div>
          </div>
          <div className='col-12 col-md-3 text-right'>
            <input
              type='button'
              id='createOutlet'
              value={i18next.t('add')}
              onClick={this.handleSave}
              className='btn btn-outline-primary col-12 col-md-4'
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    outlets: state.outlets,
    drivers: state.drivers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchOutlets()),
    create: outlet => dispatch(createOutlet(outlet)),
    delete: id => dispatch(deleteOutlet(id)),
    update: (id, o) => dispatch(updateOutlet(id, o))
  }
}

const Outlets = connect(
  mapStateToProps,
  mapDispatchToProps
)(outlets)

export default Outlets
