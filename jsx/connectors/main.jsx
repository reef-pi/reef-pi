import React from 'react'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'
import Inlets from './inlets.jsx'

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
