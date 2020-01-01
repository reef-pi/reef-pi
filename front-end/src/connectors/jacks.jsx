import React from 'react'
import { confirm } from 'utils/confirm'
import { showError } from 'utils/alert'
import { connect } from 'react-redux'
import { fetchJacks, updateJack, deleteJack, createJack } from 'redux/actions/jacks'
import Jack from './jack'
import i18next from 'i18next'

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
      driver_name: this.props.drivers.filter(d => d.id === e.target.value)[0].name
    })
  }

  remove (id) {
    return function () {
      confirm(i18next.t('are_you_sure')).then(
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
        showError('Use only comma separated numbers')
        return
      }
    }
    const payload = {
      name: this.state.JackName,
      pins: pins,
      driver: this.state.JackDriver,
      reverse: this.state.JackReverse
    }
    this.props.create(payload)
    this.handleAdd()
  }

  list () {
    const list = []
    this.props.jacks.sort((a, b) => { return parseInt(a.id) < parseInt(b.id) }).forEach((j, i) => {
      list.push(
        <Jack
          name={j.name}
          key={j.id}
          pins={j.pins}
          reverse={j.reverse}
          driver={j.driver}
          drivers={this.props.drivers}
          jack_id={j.id}
          remove={this.remove(j.id)}
          update={p => {
            this.props.update(j.id, p)
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
            <label className='h6'>{i18next.t('jacks')}</label>
            {this.list()}
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <input
              id='add_jack'
              type='button'
              value={this.state.add ? '-' : '+'}
              onClick={this.handleAdd}
              className='btn btn-sm btn-outline-success'
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <div className='row add-jack' style={dStyle}>
              <div className='col-12 col-md-3'>
                <div className='form-group'>
                  <label htmlFor='jackName'>{i18next.t('name')}</label>
                  <input
                    type='text'
                    id='jackName'
                    value={this.state.JackName}
                    onChange={this.handleNameChange}
                    className='form-control'
                  />
                </div>
              </div>
              <div className='col-12 col-md-2'>
                <div className='form-group'>
                  <span className='input-group-addon'>{i18next.t('reverse')}</span>
                  <input
                    type='checkbox'
                    id='jackReverse'
                    className='form-control'
                    onChange={this.handleReverseChange}
                    checked={this.state.JackReverse}
                  />
                </div>
              </div>
              <div className='col-12 col-md-2'>
                <div className='form-group'>
                  <label htmlFor='jackPins'>{i18next.t('pins')}</label>
                  <input
                    type='text'
                    id='jackPins'
                    value={this.state.JackPins}
                    onChange={this.handlePinChange}
                    className='form-control'
                  />
                </div>
              </div>

              <div className='col-12 col-md-2'>
                <div className='jack-type form-group'>
                  <label>{i18next.t('driver')}</label>
                  <select
                    name='driver'
                    className='form-control custom-select'
                    onChange={this.handleSetDriver}
                    value={this.state.JackDriver}
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
              <div className='col-12 col-md-3 text-right'>
                <input
                  type='button'
                  id='createJack'
                  value={i18next.t('add')}
                  onClick={this.handleSave}
                  className='btn btn-outline-primary col-12 col-md-4'
                />
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
export default Jacks
