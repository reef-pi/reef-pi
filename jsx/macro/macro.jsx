import React from 'react'
import Steps from './steps'
import PropTypes from 'prop-types'

export default class Macro extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: props.name,
      steps: props.steps
    }
    this.update = this.update.bind(this)
    this.updateSteps = this.updateSteps.bind(this)
  }

  updateSteps (steps) {
    this.setState({
      steps: this.state.steps
    })
  }

  update () {
    this.props.update({
      name: this.state.name,
      steps: this.state.steps
    })
  }

  render () {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>
            {this.props.name}
          </div>
          <div className='col'>
            <Steps steps={this.state.steps} hook={this.updateSteps} />
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <div className='float-right'>
              <input
                type='button'
                id='update_macro'
                value='edit'
                onClick={this.update}
                className='btn btn-outline-primary'
              />
            </div>
          </div>
          <div className='col'>
            <div className='float-right'>
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
      </div>
    )
  }
}

Macro.propTypes = {
  name: PropTypes.string,
  steps: PropTypes.array,
  delete: PropTypes.func,
  update: PropTypes.func
}
