import React from 'react'
import Steps from './steps'
import PropTypes from 'prop-types'

export default class Macro extends React.Component {
  constructor(props) {
    super(props)
    this.update = this.update.bind(this)
  }
  update() {
  }

  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col'>Name</div>
          <div className='col'>
            {this.props.name}
          </div>
          <div className='col'>
            <Steps steps={this.props.steps} hook={this.update} />
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <div className='float-right'>
              <input
                type='button'
                id='create_macro'
                value='edit'
                onClick={this.update}
                className='btn btn-outline-primary'
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
  steps: PropTypes.array
}
