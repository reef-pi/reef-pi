import { byCapability } from './driver_filter'
import React from 'react'
import { confirm } from 'utils/confirm'
import { fetchInlets, deleteInlet, createInlet, updateInlet } from 'redux/actions/inlets'
import { connect } from 'react-redux'
import Inlet from './inlet'
import Pin from './pin'
import i18n from 'utils/i18n'
import { SortByName } from 'utils/sort_by_name'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

class inlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      pin: 0,
      driver: props.drivers.filter(byCapability('digital-input'))[0] || {},
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
      driver
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
    const driverMap = {}
    this.props.drivers.forEach(d => { driverMap[d.id] = d })

    const groups = {}
    this.props.inlets.slice().sort((a, b) => SortByName(a, b))
      .forEach(i => {
        const driverName = (driverMap[i.driver] || {}).name || i.driver
        if (!groups[driverName]) groups[driverName] = []
        groups[driverName].push(i)
      })

    const items = []
    Object.keys(groups).sort().forEach(driverName => {
      items.push(
        <div key={'driver-' + driverName} style={{ marginTop: 'var(--reefpi-space-xs)' }}>
          <small className='text-muted font-weight-bold'>{driverName}</small>
        </div>
      )
      groups[driverName].forEach(i => {
        items.push(
          <Inlet
            name={i.name}
            pin={i.pin}
            reverse={i.reverse}
            equipment={i.equipment}
            inlet_id={i.id}
            driver={driverMap[i.driver] || {}}
            drivers={this.props.drivers}
            key={i.id}
            remove={this.remove(i)}
            update={p => {
              this.props.update(i.id, p)
              this.props.fetch()
            }}
          />
        )
      })
    })
    return items
  }

  render () {
    const dStyle = {
      display: this.state.add ? '' : 'none'
    }
    return (
      <div className='container'>
        <div style={{ marginBottom: 'var(--reefpi-space-xxs)' }}>
          <div>
            <label className='h5'>{i18n.t('inlets')}</label>
            {this.list()}
          </div>
        </div>
        <div>
          <div>
            <Button
              id='add_inlet'
              data-testid='smoke-inlet-add-toggle'
              variant='secondary'
              style={{ padding: '0 var(--reefpi-space-xs)', minHeight: '2rem', fontSize: '0.875rem' }}
              onClick={this.handleAdd}
            >{this.state.add ? '-' : '+'}</Button>
          </div>
        </div>
        <div style={dStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: 'var(--reefpi-space-md)' }}>
            <FormField label={i18n.t('name')}>
              <Input
                type='text'
                id='inletName'
                data-testid='smoke-inlet-name'
                value={this.state.name}
                onChange={this.handleNameChange}
              />
            </FormField>
            <Pin
              driver={this.state.driver}
              current={this.state.pin}
              update={this.onPinChange}
              type='digital-input'
            />
            <FormField label={i18n.t('driver')}>
              <Select
                name='driver'
                data-testid='smoke-inlet-driver'
                onChange={this.handleDriverChange}
                value={this.state.driver.id}
              >
                {this.props.drivers.filter(byCapability('digital-input')).map(item => {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  )
                })}
              </Select>
            </FormField>
            <FormField label={i18n.t('reverse')}>
              <Input
                type='checkbox'
                id='inletReverse'
                onChange={this.handleReverseChange}
                checked={this.state.reverse}
              />
            </FormField>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button
                id='createInlet'
                data-testid='smoke-inlet-submit'
                variant='primary'
                onClick={this.handleSave}
              >{i18n.t('add')}</Button>
            </div>
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
export { inlets as RawInlets }
export default Inlets
