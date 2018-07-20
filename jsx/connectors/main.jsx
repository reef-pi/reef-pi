import React from 'react'
import Outlets from './outlets'
import Jacks from './jacks'
import Inlets from './inlets'

export default class Connectors extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <Inlets />
          <hr />
        </div>
        <div className='row'>
          <Outlets />
          <hr />
        </div>
        <div className='row'>
          <Jacks />
        </div>
      </div>
    )
  }
}
