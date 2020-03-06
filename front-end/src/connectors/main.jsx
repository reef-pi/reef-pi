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
          <hr />
        </div>
        <div className='row outlets'>
          <Outlets />
          <hr />
        </div>
        <div className='row jacks'>
          <Jacks />
        </div>
        <div className='row analog-inputs'>
          <AnalogInputs />
        </div>
      </div>
    )
  }
}
