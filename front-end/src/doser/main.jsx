import React from 'react'
import { confirm, showModal } from 'utils/confirm'
import DoserForm from './doser_form'
import { fetchDosingPumps, createDosingPump, deleteDosingPump, updateDosingPump, calibrateDosingPump } from 'redux/actions/doser'
import { connect } from 'react-redux'
import CollapsibleList from '../ui_components/collapsible_list'
import Collapsible from '../ui_components/collapsible'
import CalibrationModal from './calibration_modal'
import { SortByName } from 'utils/sort_by_name'
import i18next from 'i18next'

class doser extends React.Component {
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
  }

  handleToggleAddDoserDiv () {
    this.setState({
      addDoser: !this.state.addDoser
    })
  }

  doserList () {
    return (
      this.props.dosers.sort((a, b) => SortByName(a, b))
        .map(doser => {
          const calibrationButton = (
            <button
              type='button' name={'calibrate-doser-' + doser.id}
              className='btn btn-sm btn-outline-info float-right'
              onClick={(e) => this.calibrateDoser(e, doser)}
            >
              {i18next.t('doser:calibrate')}
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
      regiment: {
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
          {i18next.t('doser:warn_delete').replace('$[name]', doser.name)}
        </p>
      </div>
    )
    confirm(i18next.t('delete'), { description: message }).then(
      function () {
        this.props.delete(doser.id)
      }.bind(this))
  }

  calibrateDoser (e, doser) {
    e.stopPropagation()
    showModal(
      <CalibrationModal
        doser={doser}
        calibrateDoser={this.props.calibrateDoser}
      />
    )
  }

  render () {
    let newDoser = null
    if (this.state.addDoser) {
      newDoser = <DoserForm onSubmit={this.handleCreateDoser} jacks={this.props.jacks} />
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
    jacks: state.jacks
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchDosingPumps: () => dispatch(fetchDosingPumps()),
    create: t => dispatch(createDosingPump(t)),
    delete: id => dispatch(deleteDosingPump(id)),
    update: (id, t) => dispatch(updateDosingPump(id, t)),
    calibrateDoser: (id, p) => dispatch(calibrateDosingPump(id, p))
  }
}

const Doser = connect(
  mapStateToProps,
  mapDispatchToProps
)(doser)
export default Doser
