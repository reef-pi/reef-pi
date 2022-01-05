import React from 'react'
import Outlets from './outlets'
import Jacks from './jacks'
import AnalogInputs from './analog_inputs'
import Inlets from './inlets'

export default class Connectors extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className='row inlets'>
          <Inlets />
        </div>
        <hr />
        <div className='row outlets'>
          <Outlets />
        </div>
        <hr />
        <div className='row analog-inputs'>
          <AnalogInputs />
        </div>
        <hr />
        <div className='row jacks'>
          <Jacks />
        </div>

      </div>
    )
  }
}
