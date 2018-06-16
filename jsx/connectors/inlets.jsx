import React from 'react'
import {confirm} from '../utils/confirm.js'
import $ from 'jquery'
import {fetchInlets, deleteInlet, createInlet} from '../redux/actions/inlets'
import {connect} from 'react-redux'

class inlets extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      add: false
    }
    this.list = this.list.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
    this.save = this.save.bind(this)
  }

  remove (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.deleteInlet(id)
        }.bind(this))
    }.bind(this))
  }

  componentDidMount () {
    this.props.fetchInlets()
  }

  add () {
    this.setState({
      add: !this.state.add
    })
    $('#inletName').val('')
    $('#inletPin').val('')
  }

  save () {
    var payload = {
      name: $('#inletName').val(),
      pin: parseInt($('#inletPin').val()),
      reverse: $('#inletReverse')[0].checked
    }
    this.props.createInlet(payload)
    this.add()
  }

  list () {
    var items = []
    $.each(this.props.inlets, function (n, i) {
      items.push(
        <div className='row'key={i.name}>
          <div className='col-sm-2'>
            {i.name}
          </div>
          <div className='col-sm-1'>
            <label className='small'>{i.pin}</label>
          </div>
          <div className='col-sm-1'>
            <label className='small'>{i.equipment === '' ? '' : 'in-use'}</label>
          </div>
          <div className='col-sm-1'>
            <label className='small'>{i.reverse ? 'reverse' : '' }</label>
          </div>
          <div className='col-sm-1'>
            <input type='button' className='btn btn-outline-danger' value='X' onClick={this.remove(i.id)} />
          </div>
        </div>
      )
    }.bind(this))
    return (items)
  }

  render () {
    var dStyle = {
      display: this.state.add ? 'block' : 'none'
    }
    return (
      <div className='container'>
        <label className='h6'>Inlets</label>
        <div className='row'>
          <div className='container'>
            {this.list()}
          </div>
        </div>
        <div className='row'>
          <input id='add_inlet' type='button' value={this.state.add ? '-' : '+'} onClick={this.add} className='btn btn-outline-success' />
          <div className='container' style={dStyle}>
            <div className='row'>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Name </span>
                  <input type='text' id='inletName' className='form-control' />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Pin </span>
                  <input type='text' id='inletPin' className='form-control' />
                </div>
              </div>
              <div className='col-sm-3'>
                <div className='input-group'>
                  <span className='input-group-addon'> Reverse </span>
                  <input type='checkbox' id='inletReverse' />
                </div>
              </div>
              <div className='col-sm-1'>
                <input type='button' id='createInlet' value='add' onClick={this.save} className='btn btn-outline-primary' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { inlets: state.inlets }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchInlets: () => dispatch(fetchInlets()),
    createInlet: (inlet) => dispatch(createInlet(inlet)),
    deleteInlet: (id) => dispatch(deleteInlet(id))
  }
}

const Inlets = connect(mapStateToProps, mapDispatchToProps)(inlets)
export default Inlets
