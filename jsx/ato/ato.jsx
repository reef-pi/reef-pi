import React from 'react'
import ATOChart from './chart'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import {deleteATO, updateATO} from 'redux/actions/ato'
import {connect} from 'react-redux'
import {confirm} from 'utils/confirm'
import AtoForm from './ato_form'

class ato extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ato: props.data,
      readOnly: true,
      expand: false
    }
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)

    this.save = this.save.bind(this)
    this.expand = this.expand.bind(this)
  }

  expand () {
    this.setState({expand: !this.state.expand})
  }

  handleEdit (e) {
    e.stopPropagation()
    this.setState({readOnly: false, expand: true})
  }

  handleDelete (e) {
    e.stopPropagation()

    const message = (
      <div>
        <p>This action will delete {this.props.data.name}.</p>
      </div>
    )

    confirm('Delete ' + this.props.data.name, {description: message})
      .then(function () {
        this.props.deleteATO(this.props.data.id)
      }.bind(this))
  }

  save (values) {
    var payload = {
      name: values.name,
      enable: values.enable,
      inlet: values.inlet,
      period: parseInt(values.period),
      control: (values.pump !== ''),
      pump: values.pump,
      disable_on_alert: values.disable_on_alert,
      notify: {
        enable: values.notify,
        max: values.maxAlert
      }
    }

    this.props.updateATO(this.props.data.id, payload)
    this.setState({
      expand: false,
      readOnly: true
    })
  }

  render () {
    var details = <div />
    let editButton = <span />

    if (this.state.expand) {
      details = (
        <div>
          <AtoForm data={this.props.data}
            onSubmit={this.save}
            inlets={this.props.inlets}
            equipment={this.props.equipment}
            readOnly={this.state.readOnly} />
          <div className='d-none d-sm-flex'>
            <ATOChart ato_id={this.props.data.id} width={500} height={300} ato_name={this.props.data.name} />
          </div>
        </div>
      )
    }

    if (this.state.readOnly) {
      editButton = (
        <button type='button'
          onClick={this.handleEdit}
          id={'edit-ato-' + this.props.data.id}
          className='btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'>
          Edit
        </button>
      )
    }

    return (
      <div>
        <div className='row mb-1 cursor-pointer text-center text-md-left'
          id={'expand-ato-' + this.props.data.id}
          onClick={this.expand}>
          <div className='col-12 col-sm-6 col-md-4 col-lg-3 order-sm-2 order-md-last'>
            <button type='button'
              onClick={this.handleDelete}
              className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'>
              Delete
            </button>
            {editButton}
          </div>
          <div className='pointer col-12 col-sm-6 col-md-8 col-lg-9 order-sm-first form-inline'>
            {this.state.expand ? FaAngleUp() : FaAngleDown()}
            <b className='ml-2 align-middle'>{this.props.data.name}</b>
          </div>
        </div>
        {details}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateATO: (id, a) => dispatch(updateATO(id, a)),
    deleteATO: (id) => dispatch(deleteATO(id))
  }
}

const ATO = connect(null, mapDispatchToProps)(ato)
export default ATO
