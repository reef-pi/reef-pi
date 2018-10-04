import React from 'react'
import { confirm } from 'utils/confirm'
import { fetchOutlets, updateOutlet, deleteOutlet, createOutlet } from 'redux/actions/outlets'
import { connect } from 'react-redux'
import Outlet from './outlet'

class outlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      outName: '',
      outPin: '',
      outReverse: false,
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
    this.setState({ outName: e.target.value })
  }
  handlePinChange (e) {
    this.setState({ outPin: e.target.value })
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

  add () {
    this.setState({
      add: !this.state.add,
      outName: '',
      outPins: '',
      outReverse: false
    })
  }

  save () {
    var payload = {
      name: this.state.outName,
      pin: parseInt(this.state.outPin),
      reverse: this.state.outReverse
    }
    this.props.create(payload)
    this.add()
  }

  list () {
    var list = []
    this.props.outlets.forEach((o, i) => {
      list.push(
        <Outlet
          name={o.name}
          outlet_id={o.id}
          pin={o.pin}
          key={o.id}
          reverse={o.reverse}
          equipment={o.equipment}
          remove={this.remove(o.id)}
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
    var dStyle = {
      display: this.state.add ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <label className='h6'>Outlets</label>
        <div className='row'>
          <div className='container'>{this.list()}</div>
        </div>
        <div className='row'>
          <input
            id='add_outlet'
            type='button'
            value={this.state.add ? '-' : '+'}
            onClick={this.add}
            className='btn btn-outline-success'
          />
          <div className='container' style={dStyle}>
            <div className='row'>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Name </span>
                  <input
                    type='text'
                    id='outletName'
                    onChange={this.handleNameChange}
                    value={this.state.outName}
                    className='form-control'
                  />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Pin </span>
                  <input
                    type='number'
                    id='outletPin'
                    onChange={this.handlePinChange}
                    value={this.state.outPin}
                    className='form-control'
                  />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Reverse </span>
                  <input
                    type='checkbox'
                    id='outletReverse'
                    onChange={this.handleReverseChange}
                    checked={this.state.outReverse}
                  />
                </div>
              </div>
              <div className='col-sm-1'>
                <input
                  type='button'
                  id='createOutlet'
                  value='add'
                  onClick={this.save}
                  className='btn btn-outline-primary'
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
  return { outlets: state.outlets }
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
