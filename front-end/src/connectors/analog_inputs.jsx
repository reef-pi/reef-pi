import React from 'react'
import { confirm } from 'utils/confirm'
import { connect } from 'react-redux'
import Pin from './pin'
import i18n from 'utils/i18n'
import { byCapability } from './driver_filter'
import { groupByDriverName } from './driver_groups'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

import {
  fetchAnalogInputs,
  updateAnalogInput,
  deleteAnalogInput,
  createAnalogInput
} from 'redux/actions/analog_inputs'

import AnalogInput from './analog_input'

class analogInputs extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      pin: 0,
      driver: props.drivers.filter(byCapability('analog-input'))[0] || {},
      add: false
    }
    this.list = this.list.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.remove = this.remove.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleSetDriver = this.handleSetDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.onPinChange = this.onPinChange.bind(this)
  }

  handleNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onPinChange (v) {
    this.setState({ pin: v })
  }

  handleSetDriver (e) {
    const driver = this.props.drivers.filter(d => d.id === e.target.value)[0]
    this.setState({
      driver: driver || {}
    })
  }

  remove (conn) {
    return function () {
      const message = (
        <div>
          <p>
            {i18n.t('configuration:connectors:warn_delete', { name: conn.name })}
          </p>
        </div>
      )

      confirm(i18n.t('configuration:connectors:title_delete', { name: conn.name }), { description: message }).then(
        function () {
          this.props.delete(conn.id)
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
      name: ''
    })
  }

  handleSave () {
    const payload = {
      name: this.state.name,
      pin: this.state.pin,
      driver: this.state.driver.id
    }
    this.props.create(payload)
    this.handleAdd()
  }

  list () {
    const driverGroups = groupByDriverName(this.props.analog_inputs, this.props.drivers)

    const list = []
    driverGroups.groups.forEach(group => {
      list.push(
        <div key={'driver-' + group.driverName} style={{ marginTop: 'var(--reefpi-space-xs)' }}>
          <small style={{ color: 'var(--reefpi-color-text-muted)', fontWeight: 600 }}>{group.driverName}</small>
        </div>
      )
      group.connectors.forEach(j => {
        list.push(
          <AnalogInput
            name={j.name}
            key={j.id}
            pin={j.pin}
            driver={driverGroups.driverMap[j.driver] || {}}
            drivers={this.props.drivers}
            analog_input_id={j.id}
            remove={this.remove(j)}
            update={p => {
              this.props.update(j.id, p)
              this.props.fetch()
            }}
          />
        )
      })
    })
    return list
  }

  render () {
    const dStyle = {
      display: this.state.add ? '' : 'none'
    }
    return (
      <div className='reefpi-view'>
        <div style={{ marginBottom: 'var(--reefpi-space-xxs)' }}>
          <div>
            <label className='h5'>{i18n.t('analog_inputs')}</label>
            {this.list()}
          </div>
        </div>
        <div>
          <div>
            <Button
              id='add_analog_input'
              data-testid='smoke-analog-add-toggle'
              variant='secondary'
              style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
              onClick={this.handleAdd}
            >{this.state.add ? '-' : '+'}
            </Button>
          </div>
        </div>
        <div>
          <div>
            <div style={dStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
                <FormField label={i18n.t('name')}>
                  <Input
                    type='text'
                    id='analog_inputName'
                    data-testid='smoke-analog-name'
                    value={this.state.name}
                    onChange={this.handleNameChange}
                  />
                </FormField>
                <Pin
                  driver={this.state.driver}
                  update={this.onPinChange}
                  type='analog-input'
                  current={this.state.pin}
                />
                <FormField label={i18n.t('driver')}>
                  <Select
                    name='driver'
                    data-testid='smoke-analog-driver'
                    onChange={this.handleSetDriver}
                    value={this.state.driver.id}
                  >
                    {this.props.drivers.filter(byCapability('analog-input')).map(item => {
                      return (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      )
                    })}
                  </Select>
                </FormField>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    id='createAnalogInput'
                    data-testid='smoke-analog-submit'
                    variant='primary'
                    onClick={this.handleSave}
                  >{i18n.t('add')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    analog_inputs: state.analog_inputs,
    drivers: state.drivers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchAnalogInputs()),
    create: j => dispatch(createAnalogInput(j)),
    delete: id => dispatch(deleteAnalogInput(id)),
    update: (id, j) => dispatch(updateAnalogInput(id, j))
  }
}

const AnalogInputs = connect(
  mapStateToProps,
  mapDispatchToProps
)(analogInputs)
export { analogInputs as RawAnalogInputs }
export default AnalogInputs
