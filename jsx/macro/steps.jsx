import React from 'react'
import PropTypes from 'prop-types'
import Step from './step'

export default class Steps extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.updateStep = this.updateStep.bind(this)
    this.add = this.add.bind(this)
  }

  updateStep () {
  }

  add () {
    var step = {
      key: this.props.steps.length + 1,
      type: 'wait',
      config: {
        duration: 10
      }
    }
    this.props.hook(step)
  }

  render () {
    var items = []
    this.props.steps.forEach((step, i) => {
      items.push(
        <li key={i}>
          <Step type={step.type} config={step.config} hook={this.updateStep} />
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
          <div className='col'>
            <div className='float-right'>
              <button className='btn btn-outline-success' onClick={this.add}>
                <label>+</label>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Steps.propTypes = {
  steps: PropTypes.array,
  hook: PropTypes.func
}
