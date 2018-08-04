import React from 'react'
import {confirm} from 'utils/confirm'
import $ from 'jquery'
import {fetchInlets, deleteInlet, createInlet, updateInlet} from 'redux/actions/inlets'
import {connect} from 'react-redux'
import Inlet from './inlet'

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

  componentDidMount () {
    this.props.fetch()
  }

  remove (id) {
    return (function () {
      confirm('Are you sure ?')
        .then(function () {
          this.props.delete(id)
        }.bind(this))
    }.bind(this))
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
    this.props.create(payload)
    this.add()
  }

  list () {
    var items = []
    $.each(this.props.inlets, function (n, i) {
      items.push(
        <Inlet
          name={i.name}
          pin={i.pin}
          reverse={i.reverse}
          equipment={i.equipment}
          inlet_id={i.id}
          key={n}
          remove={this.remove(i.id)}
          update={(p) => {
            this.props.update(i.id, p)
            this.props.fetch()
          }}
        />
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
    fetch: () => dispatch(fetchInlets()),
    create: (inlet) => dispatch(createInlet(inlet)),
    delete: (id) => dispatch(deleteInlet(id)),
    update: (id, p) => dispatch(updateInlet(id, p))
  }
}

const Inlets = connect(mapStateToProps, mapDispatchToProps)(inlets)
export default Inlets
