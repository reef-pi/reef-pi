import React from 'react'
import { confirm } from 'utils/confirm'
import { fetchInlets, deleteInlet, createInlet, updateInlet } from 'redux/actions/inlets'
import { connect } from 'react-redux'
import Inlet from './inlet'

class inlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      inName: '',
      inPin: '',
      inReverse: false,
      add: false
    }
    this.list = this.list.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handlePinChange = this.handlePinChange.bind(this)
    this.handleReverseChange = this.handleReverseChange.bind(this)
  }

  handleNameChange (e) {
    this.setState({ inName: e.target.value })
  }
  handlePinChange (e) {
    this.setState({ inPin: e.target.value })
  }
  handleReverseChange () {
    this.setState({ inReverse: !this.state.outReverse })
  }
  componentDidMount () {
    this.props.fetch()
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

  add () {
    this.setState({
      add: !this.state.add,
      inName: '',
      inPin: '',
      inReverse: false
    })
  }

  save () {
    var payload = {
      name: this.state.inName,
      pin: parseInt(this.state.inPin),
      reverse: this.state.inReverse
    }
    this.props.create(payload)
    this.add()
  }

  list () {
    var items = []
    this.props.inlets.forEach((i, n) => {
      items.push(
        <Inlet
          name={i.name}
          pin={i.pin}
          reverse={i.reverse}
          equipment={i.equipment}
          inlet_id={i.id}
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
    var dStyle = {
      display: this.state.add ? '' : 'none'
    }
    return (
      <div className='container'>
        <div className='row mb-1'>
          <div className='col-12'>
            <label className='h6'>Inlets</label>
            {this.list()}
          </div>
        </div>
        <div className='row'>
          <div className='col-12'>
            <input
              id='add_inlet'
              type='button'
              value={this.state.add ? '-' : '+'}
              onClick={this.add}
              className='btn btn-sm btn-outline-success'
            />
          </div>
        </div>
        <div className='row' style={dStyle}>
          <div className='col-12 col-md-5'>
            <div className='form-group'>
              <span className='input-group-addon'>Name</span>
              <input
                type='text'
                id='inletName'
                value={this.state.inName}
                onChange={this.handleNameChange}
                className='form-control'
              />
            </div>
          </div>
          <div className='col-12 col-md-2'>
            <div className='form-group'>
              <span className='input-group-addon'>Pin</span>
              <input
                type='number'
                min='2'
                max='27'
                id='inletPin'
                value={this.state.inPin}
                onChange={this.handlePinChange}
                className='form-control'
              />
            </div>
          </div>
          <div className='col-12 col-md-2'>
            <div className='form-group'>
              <span className='input-group-addon'>Reverse</span>
              <input
                type='checkbox'
                id='inletReverse'
                className='form-control'
                onChange={this.handleReverseChange}
                checked={this.state.inReverse}
              />
            </div>
          </div>
          <div className='col-12 col-md-3 text-right'>
            <input type='button' id='createInlet' value='add' onClick={this.save} className='btn btn-outline-primary col-12 col-md-4' />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { inlets: state.inlets }
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
