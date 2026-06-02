import React from 'react'
import { confirm } from 'utils/confirm'
import { showError } from 'utils/alert'
import { connect } from 'react-redux'
import { fetchJacks, updateJack, deleteJack, createJack } from 'redux/actions/jacks'
import Jack from './jack'
import i18n from 'utils/i18n'
import { byCapability } from './driver_filter'
import { groupByDriverName } from './driver_groups'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

class jacks extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      JackName: '',
      JackPins: '',
      JackReverse: false,
      JackDriver: 'rpi',
      add: false
    }
    this.list = this.list.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.remove = this.remove.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleSetDriver = this.handleSetDriver.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePinChange = this.handlePinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
  }

  handleReverseChange () {
    this.setState({ JackReverse: !this.state.JackReverse })
  }

  handleNameChange (e) {
    this.setState({ JackName: e.target.value })
  }

  handlePinChange (e) {
    this.setState({ JackPins: e.target.value })
  }

  handleSetDriver (e) {
    this.setState({
      JackDriver: e.target.value,
      driver_name: (this.props.drivers.filter(d => d.id === e.target.value)[0] || {}).name
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
      JackName: '',
      JackPins: '',
      JackReverse: false
    })
  }

  handleSave () {
    const pins = this.state.JackPins.split(',').map(p => {
      return parseInt(p)
    })
    for (let i = 0; i < pins.length; i++) {
      if (isNaN(pins[i])) {
        showError(i18n.t('validation:comma_separated_numbers'))
        return
      }
    }
    const payload = {
      name: this.state.JackName,
      pins,
      driver: this.state.JackDriver,
      reverse: this.state.JackReverse
    }
    this.props.create(payload)
    this.handleAdd()
  }

  list () {
    const driverGroups = groupByDriverName(this.props.jacks, this.props.drivers)

    const list = []
    driverGroups.groups.forEach(group => {
      list.push(
        <div key={'driver-' + group.driverName} style={{ marginTop: 'var(--reefpi-space-xs)' }}>
          <small className='text-muted font-weight-bold'>{group.driverName}</small>
        </div>
      )
      group.connectors.forEach(j => {
        list.push(
          <Jack
            name={j.name}
            key={j.id}
            pins={j.pins}
            reverse={j.reverse}
            driver={j.driver}
            drivers={this.props.drivers}
            jack_id={j.id}
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
      <div className='container'>
        <div style={{ marginBottom: 'var(--reefpi-space-xxs)' }}>
          <div>
            <label className='h5'>{i18n.t('jacks')}</label>
            {this.list()}
          </div>
        </div>
        <div>
          <div>
            <Button
              id='add_jack'
              data-testid='smoke-jack-add-toggle'
              variant='secondary'
              style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
              onClick={this.handleAdd}
            >{this.state.add ? '-' : '+'}</Button>
          </div>
        </div>
        <div>
          <div>
            <div className='add-jack' style={dStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
                <FormField label={i18n.t('name')}>
                  <Input
                    type='text'
                    id='jackName'
                    data-testid='smoke-jack-name'
                    value={this.state.JackName}
                    onChange={this.handleNameChange}
                  />
                </FormField>
                <FormField label={i18n.t('reverse')}>
                  <Input
                    type='checkbox'
                    id='jackReverse'
                    onChange={this.handleReverseChange}
                    checked={this.state.JackReverse}
                  />
                </FormField>
                <FormField label={i18n.t('pins')}>
                  <Input
                    type='text'
                    id='jackPins'
                    data-testid='smoke-jack-pins'
                    value={this.state.JackPins}
                    onChange={this.handlePinChange}
                  />
                </FormField>
                <FormField label={i18n.t('driver')}>
                  <Select
                    name='driver'
                    data-testid='smoke-jack-driver'
                    onChange={this.handleSetDriver}
                    value={this.state.JackDriver}
                  >
                    {this.props.drivers.filter(byCapability('pwm')).map(item => {
                      return (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      )
                    })}
                  </Select>
                </FormField>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <Button
                    id='createJack'
                    data-testid='smoke-jack-submit'
                    variant='primary'
                    onClick={this.handleSave}
                  >{i18n.t('add')}</Button>
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
    jacks: state.jacks,
    drivers: state.drivers
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetch: () => dispatch(fetchJacks()),
    create: j => dispatch(createJack(j)),
    delete: id => dispatch(deleteJack(id)),
    update: (id, j) => dispatch(updateJack(id, j))
  }
}

const Jacks = connect(
  mapStateToProps,
  mapDispatchToProps
)(jacks)
export { jacks as RawJacks }
export default Jacks
