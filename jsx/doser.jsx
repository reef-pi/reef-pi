import Common from './common.jsx'
import $ from 'jquery'
import React from 'react'
import SelectEquipment from './select_equipment.jsx'

export default class Doser extends Common {
  constructor (props) {
    super(props)
    this.state = {
      selectedEquipment: undefined,
      dosers: [],
      add: false
    }
    this.add = this.add.bind(this)
    this.addUI = this.addUI.bind(this)
    this.toggle = this.toggle.bind(this)
    this.remove = this.remove.bind(this)
    this.fetch = this.fetch.bind(this)
    this.setEquipment = this.setEquipment.bind(this)
    this.doserList = this.doserList.bind(this)
  }

  componentWillMount () {
    this.fetch()
  }

  doserList () {
    var dosers = []
    $.each(this.state.dosers, function (i, doser) {
      dosers.push(
        <div key={'doser-' + i} className='row'>
          <div className='col-sm-4'>{doser.Name}</div>
          <div className='col-sm-1'>
            <input type='button' id={'remove-doser-' + doser.name} onClick={this.remove(doser.id)} value='delete' className='btn btn-outline-danger col-sm-2' />
          </div>
        </div>
      )
    }.bind(this))
    return (dosers)
  }

  fetch () {
    this.ajaxGet({
      url: '/api/dosers',
      success: function (data) {
        this.setState({
          dosers: data
        })
      }.bind(this)
    })
  }

  setEquipment (eq) {
    this.setState({
      selectedEquipment: eq
    })
  }

  add () {
    if (this.state.selectedEquipment === undefined) {
      this.setState({
        showAlert: true,
        alertMsg: 'Select an equipment'
      })
      return
    }
    if ($('#doserName').val() === '') {
      this.setState({
        showAlert: true,
        alertMsg: 'Specify doser name'
      })
      return
    }
    var payload = {
      name: $('#doserName').val(),
      equipment: this.state.selectedEquipment
    }
    this.ajaxPut({
      url: '/api/dosers',
      data: JSON.stringify(payload),
      success: function (data) {
        this.fetch()
        this.setState({
          add: !this.state.add
        })
        $('#doserName').val('')
      }.bind(this)
    })
  }

  remove (id) {
    return (function () {
      this.confirm('Are you sure ?')
      .then(function () {
        this.ajaxDelete({
          url: '/api/dosers/' + id,
          type: 'DELETE',
          success: function (data) {
            this.fetch()
          }.bind(this)
        })
      }.bind(this))
    }.bind(this))
  }

  toggle () {
    this.setState({
      add: !this.state.add
    })
    $('#doserName').val('')
  }

  addUI () {
    if (!this.state.add) {
      return
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-2'>Name</div>
          <div className='col-sm-2'><input type='text' id='doserName' /> </div>
        </div>
        <div className='row'>
          <div className='col-sm-2'>Pump</div>
          <div className='col-sm-4'><SelectEquipment update={this.setEquipment} active={this.state.selectedEquipment} /></div>
        </div>
        <input type='button' id='createDoser' value='add' onClick={this.add} className='btn btn-outline-primary' />
      </div>
    )
  }

  render () {
    return (
      <div className='container'>
        {super.render()}
        <div className='container'>
          { this.doserList() }
        </div>
        <div className='container'>
          <input id='add_doser' type='button' value={this.state.add ? '-' : '+'} onClick={this.toggle} className='btn btn-outline-success' />
          {this.addUI()}
        </div>
      </div>
    )
  }
}
