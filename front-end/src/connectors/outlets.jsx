import React from 'react'
import { confirm } from 'utils/confirm'
import { fetchOutlets, updateOutlet, deleteOutlet, createOutlet } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import Outlet from './outlet'
import Pin from './pin'
import i18n from 'utils/i18n'
import { byCapability } from './driver_filter'
import { groupByDriverName } from './driver_groups'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { Field as FormField, Input, Select } from '../../design-system/ui_kits/reef-pi-app/primitives/Form'

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
    const driverGroups = groupByDriverName(this.props.outlets, this.props.drivers)

    const list = []
    driverGroups.groups.forEach(group => {
      list.push(
        <div key={'driver-' + group.driverName} style={{ marginTop: 'var(--reefpi-space-xs)' }}>
          <small className='text-muted font-weight-bold'>{group.driverName}</small>
        </div>
      )
      group.connectors.forEach(o => {
        list.push(
          <Outlet
            name={o.name}
            outlet_id={o.id}
            pin={o.pin}
            key={o.id}
            reverse={o.reverse}
            equipment={o.equipment}
            remove={this.remove(o)}
            drivers={this.props.drivers}
            driver={driverGroups.driverMap[o.driver] || {}}
            update={p => {
              this.props.update(o.id, p)
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
            <label className='h5'>{i18n.t('outlets')}</label>
            {this.list()}
          </div>
        </div>
        <div>
          <div>
            <Button
              id='add_outlet'
              data-testid='smoke-outlet-add-toggle'
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
                id='outletName'
                data-testid='smoke-outlet-name'
                onChange={this.handleNameChange}
                value={this.state.outName}
              />
            </FormField>
            <Pin
              driver={this.state.driver}
              update={this.onPinChange}
              type='digital-output'
              current={this.state.outPin}
            />
            <FormField label={i18n.t('driver')}>
              <Select
                name='driver'
                data-testid='smoke-outlet-driver'
                onChange={this.handleDriverChange}
                value={this.state.driver ? this.state.driver.id : ''}
              >
                {this.props.drivers.filter(byCapability('digital-output')).map(item => {
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
                id='outletReverse'
                onChange={this.handleReverseChange}
                checked={this.state.outReverse}
              />
            </FormField>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button
                id='createOutlet'
                data-testid='smoke-outlet-submit'
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

export { outlets as RawOutlets }
export default Outlets
