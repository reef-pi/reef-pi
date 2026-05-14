import React from 'react'
import { confirm, showModal } from 'utils/confirm'
import DoserForm from './doser_form'
import { fetchDosingPumps, createDosingPump, deleteDosingPump, updateDosingPump, calibrateDosingPump, saveDosingPumpCalibration } from 'redux/actions/doser'
import { connect } from 'react-redux'
import EmptyState, { DoserIcon } from '../../design-system/ui_kits/reef-pi-app/shell/EmptyState'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import CalibrationModal from './calibration_modal'
import { SortByName } from 'utils/sort_by_name'
import i18n from 'utils/i18n'

export class RawDoser extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addDoser: false
    }
    this.doserList = this.doserList.bind(this)
    this.handleToggleAddDoserDiv = this.handleToggleAddDoserDiv.bind(this)
    this.handleDeleteDoser = this.handleDeleteDoser.bind(this)
    this.handleCreateDoser = this.handleCreateDoser.bind(this)
    this.handleUpdateDoser = this.handleUpdateDoser.bind(this)
    this.calibrateDoser = this.calibrateDoser.bind(this)
    this.valuesToDoser = this.valuesToDoser.bind(this)
  }

  handleToggleAddDoserDiv () {
    this.setState({
      addDoser: !this.state.addDoser
    })
  }

  doserList () {
    return (
      this.props.dosers.slice().sort((a, b) => SortByName(a, b))
        .map(doser => {
          const calibrationButton = (
            <button
              type='button' name={'calibrate-doser-' + doser.id}
              className='btn btn-sm btn-outline-info float-right'
              onClick={(e) => this.calibrateDoser(e, doser)}
            >
              {i18n.t('doser:calibrate')}
            </button>
          )
          const handleTState = () => {
            doser.regiment.enable = !doser.regiment.enable
            this.props.update(doser.id, doser)
          }
          return (
            <Collapsible
              key={'panel-doser-' + doser.id}
              name={'panel-doser-' + doser.id}
              item={doser}
              onToggleState={handleTState}
              enabled={doser.regiment.enable}
              buttons={calibrationButton}
              title={<b className='ml-2 align-middle'>{doser.name} </b>}
              onDelete={this.handleDeleteDoser}
            >
              <DoserForm
                onSubmit={this.handleUpdateDoser}
                jacks={this.props.jacks}
                outlets={this.props.outlets}
                doser={doser}
              />
            </Collapsible>
          )
        })
    )
  }

  valuesToDoser (values) {
    const doser = {
      name: values.name,
      jack: values.jack,
      pin: parseInt(values.pin),
      stepper: values.stepper,
      type: values.type,
      regiment: {
        volume: parseFloat(values.volume),
        volume_per_second: parseFloat(values.volume_per_second) || 0,
        enable: values.enable,
        duration: parseFloat(values.duration),
        speed: parseInt(values.speed),
        schedule: {
          month: values.month,
          week: values.week,
          day: values.day,
          hour: values.hour,
          minute: values.minute,
          second: values.second
        }
      }
    }
    return doser
  }

  handleUpdateDoser (values) {
    const payload = this.valuesToDoser(values)
    this.props.update(values.id, payload)
  }

  handleCreateDoser (values) {
    const payload = this.valuesToDoser(values)
    this.props.create(payload)
    this.handleToggleAddDoserDiv()
  }

  handleDeleteDoser (doser) {
    const message = (
      <div>
        <p>
          {i18n.t('doser:warn_delete', { name: doser.name })}
        </p>
      </div>
    )
    confirm(i18n.t('doser:title_delete', { name: doser.name }), { description: message }).then(
      function () {
        this.props.delete(doser.id)
      }.bind(this)
    )
  }

  calibrateDoser (e, doser) {
    e.stopPropagation()
    showModal(
      <CalibrationModal
        doser={doser}
        calibrateDoser={this.props.calibrateDoser}
        saveCalibration={this.props.saveCalibration}
      />
    )
  }

  render () {
    let newDoser = null
    if (this.state.addDoser) {
      newDoser = <DoserForm onSubmit={this.handleCreateDoser} jacks={this.props.jacks} outlets={this.props.outlets} />
    }

    if (this.props.dosers.length === 0 && !this.state.addDoser) {
      return (
        <EmptyState
          icon={<DoserIcon />}
          title='No dosing pumps yet'
          body='Add a pump to automate two-part, calcium, or kalkwasser dosing.'
          action={{ label: 'Add dosing pump', onClick: this.handleToggleAddDoserDiv }}
        />
      )
    }

    return (
      <ul className='list-group list-group-flush'>
        <CollapsibleList>
          {this.doserList()}
        </CollapsibleList>
        <li className='list-group-item add-doser'>
          <div className='row'>
            <div className='col'>
              <input
                type='button'
                id='add_doser'
                data-testid='smoke-doser-add-toggle'
                value={this.state.addDoser ? '-' : '+'}
                onClick={this.handleToggleAddDoserDiv}
                className='btn btn-outline-success'
              />
            </div>
          </div>
          {newDoser}
        </li>
      </ul>
    )
  }
}

const mapStateToProps = state => {
  return {
    dosers: state.dosers,
    jacks: state.jacks,
    outlets: state.outlets
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDosingPumps: () => dispatch(fetchDosingPumps()),
    create: t => dispatch(createDosingPump(t)),
    delete: id => dispatch(deleteDosingPump(id)),
    update: (id, t) => dispatch(updateDosingPump(id, t)),
    calibrateDoser: (id, p) => dispatch(calibrateDosingPump(id, p)),
    saveCalibration: (id, p) => dispatch(saveDosingPumpCalibration(id, p))
  }
}

const Doser = connect(
  mapStateToProps,
  mapDispatchToProps
)(RawDoser)
export default Doser
