import React from 'react'
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'
import TemperatureForm from './temperature_form'
import { confirm } from 'utils/confirm'

export default class Sensor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      readOnly: true,
      expand: false
    }
    this.handleSave = this.handleSave.bind(this)
    this.handleExpand = this.handleExpand.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleExpand () {
    this.setState({ expand: !this.state.expand })
  }

  handleEdit (e) {
    e.stopPropagation()
    this.setState({ readOnly: false, expand: true })
  }

  handleSave (values) {
    const payload = {
      name: values.name,
      enable: values.enable,
      control: (values.heater !== '' || values.cooler !== ''),
      heater: values.heater,
      cooler: values.cooler,
      min: parseFloat(values.min),
      max: parseFloat(values.max),
      sensor: values.sensor,
      period: parseInt(values.period),
      fahrenheit: values.fahrenheit,
      notify: {
        enable: values.alerts,
        min: parseFloat(values.minAlert),
        max: parseFloat(values.maxAlert)
      },
      chart_min: parseFloat(values.chart_min),
      chart_max: parseFloat(values.chart_max)
    }

    this.props.save(this.props.data.id, payload)

    this.setState({
      expand: false,
      readOnly: true
    })
  }

  handleDelete (e) {
    e.stopPropagation()

    const message = (
      <div>
        <p>This action will delete {this.props.data.name}.</p>
      </div>
    )

    confirm('Delete ' + this.props.data.name, { description: message })
      .then(function () {
        this.props.remove(this.props.data.id)
      }.bind(this))
  }

  render () {
    let details = <div />
    let editButton = <span />

    if (this.state.expand) {
      details = (
        <TemperatureForm
          tc={this.props.data}
          readOnly={this.state.readOnly}
          showChart
          sensors={this.props.sensors}
          equipment={this.props.equipment}
          onSubmit={this.handleSave}
        />
      )
    }

    if (this.state.readOnly) {
      editButton = (
        <button
          type='button'
          onClick={this.handleEdit}
          id={'edit-tc-' + this.props.data.id}
          className='btn btn-sm btn-outline-primary float-right d-block d-sm-inline ml-2'
        >
          Edit
        </button>
      )
    }

    return (
      <div>
        <div
          className='row mb-1 cursor-pointer text-center text-md-left'
          id={'expand-tc-' + this.props.data.id}
          onClick={this.handleExpand}
        >
          <div className='col-12 col-sm-6 col-md-4 col-lg-3 order-sm-2 order-md-last'>
            <button
              type='button'
              onClick={this.handleDelete}
              className='btn btn-sm btn-outline-danger float-right d-block d-sm-inline ml-2'
            >
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
