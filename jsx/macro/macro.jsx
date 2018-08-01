import React from 'react'
import Steps from './steps'
import PropTypes from 'prop-types'
import {confirm} from 'utils/confirm'

export default class Macro extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.name,
      steps: props.steps,
      edit: false,
      expand: false
    }
    this.update = this.update.bind(this)
    this.updateSteps = this.updateSteps.bind(this)
    this.details = this.details.bind(this)
    this.a2i = this.a2i.bind(this)
    this.remove = this.remove.bind(this)
  }

  remove () {
    confirm('Are you sure ?')
      .then(function () {
        this.props.delete()
      }.bind(this))
  }

  updateSteps (steps) {
    this.setState({
      steps: steps
    })
  }

  a2i (steps) {
    for (var i = 0; i < steps.length; i++) {
      switch (steps[i].type) {
        case 'wait':
          steps[i].config.duration = parseInt(steps[i].config.duration)
          break
      }
    }
    return steps
  }

  update () {
    if (!this.state.edit) {
      this.setState({edit: true})
      return
    }
    this.props.update({
      name: this.state.name,
      steps: this.a2i(this.state.steps)
    })
    this.setState({edit: false})
  }

  details () {
    var lbl = 'edit'
    var cls = 'btn btn-outline-success float-right'
    if (this.state.edit) {
      lbl = 'save'
      cls = 'btn btn-outline-primary float-right'
    }
    return (
      <div className='container'>
        <div className='row'>
          <Steps
            steps={this.state.steps}
            hook={this.updateSteps}
            readOnly={!this.state.edit}
            macro_id={this.props.macro_id}
          />
        </div>
        <div className='row'>
          <div className='col'>
            <input
              type='button'
              id='update_macro'
              value={lbl}
              onClick={this.update}
              className={cls}
            />
          </div>
        </div>
      </div>
    )
  }

  render () {
    var lbl = 'expand'
    var details = <div />
    if (this.state.expand) {
      lbl = 'collapse'
      details = this.details()
    }
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>
            {this.props.name}
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <div className='float-right'>
              <input
                type='button'
                id={'run_macro_' + this.props.macro_id}
                value='run'
                onClick={this.props.run}
                className='btn btn-outline-dark'
              />
              <input
                type='button'
                id={'expand_macro_' + this.props.macro_id}
                value={lbl}
                onClick={() => { this.setState({expand: !this.state.expand}) }}
                className='btn btn-outline-dark'
              />
              <input
                type='button'
                id='delete_macro'
                value='delete'
                onClick={this.remove}
                className='btn btn-outline-danger'
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-lg-11'>
            {details}
          </div>
        </div>
      </div>
    )
  }
}

Macro.propTypes = {
  name: PropTypes.string,
  steps: PropTypes.array,
  delete: PropTypes.func,
  update: PropTypes.func,
  macro_id: PropTypes.string,
  run: PropTypes.func
}
