import React from 'react'
import Steps from './steps'
import PropTypes from 'prop-types'

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
  }

  updateSteps (steps) {
    this.setState({
      steps: this.state.steps
    })
  }

  update () {
    if (!this.state.edit) {
      this.setState({edit: true})
      return
    }
    this.props.update({
      name: this.state.name,
      steps: this.state.steps
    })
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
          <Steps steps={this.state.steps} hook={this.updateSteps} readOnly={!this.state.edit} />
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
                id={'expand_macro_' + this.props.macro_id}
                value={lbl}
                onClick={() => { this.setState({expand: !this.state.expand}) }}
                className='btn btn-outline-dark'
              />
              <input
                type='button'
                id='delete_macro'
                value='delete'
                onClick={this.props.delete}
                className='btn btn-outline-danger'
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-lg-8'>
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
  macro_id: PropTypes.string
}
