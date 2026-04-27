import React from 'react'
import { connect } from 'react-redux'
import { confirm } from 'utils/confirm'
import { fetchFlowMeters, createFlowMeter, updateFlowMeter, deleteFlowMeter } from 'redux/actions/flow_meters'
import FlowMeterForm from './flow_meter_form'
import Collapsible from 'ui_components/collapsible'
import CollapsibleList from 'ui_components/collapsible_list'
import Chart from './chart'
import { SortByName } from 'utils/sort_by_name'
import i18n from 'utils/i18n'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = { addMeter: false }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleToggleAdd = this.handleToggleAdd.bind(this)
  }

  componentDidMount () {
    this.props.fetch()
  }

  valuesToFlowMeter (values) {
    return {
      name: values.name,
      enable: values.enable,
      sensor: values.sensor,
      pulses_per_liter: parseFloat(values.pulses_per_liter),
      period: parseInt(values.period),
      notify: {
        enable: values.notify_enable,
        min: parseFloat(values.notify_min) || 0
      }
    }
  }

  handleSubmit (values) {
    this.props.create(this.valuesToFlowMeter(values))
    this.setState({ addMeter: false })
  }

  handleUpdate (values) {
    this.props.update(values.id, this.valuesToFlowMeter(values))
  }

  handleDelete (fm) {
    const message = <p>{i18n.t('flow_meter:warn_delete', { name: fm.name })}</p>
    confirm(i18n.t('flow_meter:title_delete', { name: fm.name }), { description: message }).then(
      () => this.props.delete(fm.id)
    )
  }

  handleToggleAdd () {
    this.setState(s => ({ addMeter: !s.addMeter }))
  }

  meterList () {
    return this.props.flow_meters.sort(SortByName).map(fm => {
      const handleToggle = () => {
        this.props.update(fm.id, { ...fm, enable: !fm.enable })
      }
      return (
        <Collapsible
          key={'panel-flow-meter-' + fm.id}
          name={'panel-flow-meter-' + fm.id}
          item={fm}
          enabled={fm.enable}
          onToggleState={handleToggle}
          title={<b className='ml-2 align-middle'>{fm.name}</b>}
          onDelete={this.handleDelete}
        >
          <FlowMeterForm flow_meter={fm} onSubmit={this.handleUpdate} />
          <Chart meter_id={fm.id} name={fm.name} notify={fm.notify} height={200} />
        </Collapsible>
      )
    })
  }

  render () {
    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>{this.meterList()}</CollapsibleList>
        <li className='list-group-item'>
          <div className='row'>
            <div className='col'>
              <input
                type='button'
                value={this.state.addMeter ? '-' : '+'}
                onClick={this.handleToggleAdd}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {this.state.addMeter && (
            <FlowMeterForm onSubmit={this.handleSubmit} />
          )}
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => ({ flow_meters: state.flow_meters })
const mapDispatchToProps = dispatch => ({
  fetch: () => dispatch(fetchFlowMeters()),
  create: f => dispatch(createFlowMeter(f)),
  update: (id, f) => dispatch(updateFlowMeter(id, f)),
  delete: id => dispatch(deleteFlowMeter(id))
})

const FlowMeters = connect(mapStateToProps, mapDispatchToProps)(Main)
export default FlowMeters
