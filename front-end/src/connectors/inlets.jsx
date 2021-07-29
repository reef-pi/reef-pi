import React from 'react'
import { confirm } from 'utils/confirm'
import { fetchInlets, deleteInlet, createInlet, updateInlet } from 'redux/actions/inlets'
import { connect } from 'react-redux'
import Inlet from './inlet'
import Pin from './pin'
import i18next from 'i18next'
import { SortByName } from 'utils/sort_by_name'

class inlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      pin: 0,
      driver: props.drivers.filter(d => d.id === 'rpi')[0] || {},
      reverse: false,
      add: false
    }
    this.list = this.list.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.remove = this.remove.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleDriverChange = this.handleDriverChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onPinChange (v) {
    this.setState({ pin: v })
  }

  handleReverseChange () {
    this.setState({ reverse: !this.state.reverse })
  }

  componentDidMount () {
    this.props.fetch()
  }

  handleDriverChange (e) {
    const driver = this.props.drivers.filter(d => d.id === e.target.value)[0] || {}
    this.setState({
      driver: driver
    })
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

  handleAdd () {
    this.setState({
      add: !this.state.add,
      name: '',
      reverse: false,
      pin: 0
    })
  }

  handleSave () {
    const payload = {
      name: this.state.name,
      pin: this.state.pin,
      reverse: this.state.reverse,
      driver: this.state.driver.id
    }
    this.props.create(payload)
    this.handleAdd()
  }

  list () {
    const items = []
    this.props.inlets.sort((a, b) => SortByName(a, b))
      .forEach((i, n) => {
        const d = this.props.drivers.filter(d => d.id === i.driver)[0] || {}
        items.push(
          <Inlet
            name={i.name}
            pin={i.pin}
            reverse={i.reverse}
            equipment={i.equipment}
            inlet_id={i.id}
            driver={d}
            drivers={this.props.drivers}
            key={i.id}
            remove={this.remove(i.id)}
            update={p => {
              this.props.update(i.id, p)
              this.props.fetch()
            }}
          />
        )
      })
    return items
  }

  render () {
    const dStyle = {
      display: this.state.add ? '' : 'none'
    }
    return (
      <div className='container'>
        <div className='row mb-1'>
          <div className='col-12'>
            <label className='h5'>{i18next.t('inlets')}</label>
            {this.list()}
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <input
              id='add_inlet'
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
                id='inletName'
                value={this.state.name}
                onChange={this.handleNameChange}
                className='form-control'
              />
            </div>
          </div>
          <div className='col-12 col-md-2'>
            <Pin
              driver={this.state.driver}
              current={this.state.pin}
              update={this.onPinChange}
              type='digital-input'
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
              <span className='input-group-addon'>{i18next.t('reverse')}</span>
              <input
                type='checkbox'
                id='inletReverse'
                className='form-control'
                onChange={this.handleReverseChange}
                checked={this.state.reverse}
              />
            </div>
          </div>
          <div className='col-12 col-md-3 text-right'>
            <input
              type='button'
              id='createInlet'
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
    inlets: state.inlets,
    drivers: state.drivers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchInlets()),
    create: inlet => dispatch(createInlet(inlet)),
    delete: id => dispatch(deleteInlet(id)),
    update: (id, p) => dispatch(updateInlet(id, p))
  }
}

const Inlets = connect(
  mapStateToProps,
  mapDispatchToProps
)(inlets)
export default Inlets
