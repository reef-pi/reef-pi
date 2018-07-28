import React from 'react'
import PropTypes from 'prop-types'
import Step from './step'

export default class Steps extends React.Component {
  constructor (props) {
    super(props)
    this.updateStep = this.updateStep.bind(this)
    this.add = this.add.bind(this)
    this.addStepUI = this.addStepUI.bind(this)
  }

  updateStep (i) {
    return (step) => {
      var steps = this.props.steps
      steps[i] = step
      this.props.hook(steps)
    }
  }

  add () {
    var step = {
      type: 'wait',
      config: {
        duration: 10
      }
    }
    var steps = this.props.steps
    steps.push(step)
    this.props.hook(steps)
  }

  addStepUI () {
    if (this.props.readOnly) {
      return
    }
    return (
      <div className='col'>
        <div className='float-right'>
          <button className='btn btn-outline-success' onClick={this.add}>
            <label>+</label>
          </button>
        </div>
      </div>
    )
  }

  render () {
    var items = []
    this.props.steps.forEach((step, i) => {
      items.push(
        <li key={i}>
          <Step
            type={step.type}
            config={step.config}
            hook={this.updateStep(i)}
            readOnly={this.props.readOnly}
          />
        </li>
      )
    })
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>Steps</div>
        </div>
        <div className='row'>
          <ul>{items}</ul>
        </div>
        <div className='row'>
          {this.addStepUI()}
        </div>
      </div>
    )
  }
}

Steps.propTypes = {
  steps: PropTypes.array,
  hook: PropTypes.func,
  readOnly: PropTypes.bool
}
