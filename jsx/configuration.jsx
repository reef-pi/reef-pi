import React from 'react'
import Admin from './admin.jsx'
import Settings from './settings.jsx'
import Dashboard from './dashboard.jsx'
import Outlets from './outlets.jsx'
import Jacks from './jacks.jsx'

export default class Configuration extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <Dashboard />
        </div>
        <div className='row'>
          <hr />
        </div>
        <div className='row'>
          <Settings />
          <hr />
        </div>
        <div className='row'>
          <Outlets />
        </div>
        <div className='row'>
          <Jacks />
        </div>
        <div className='row'>
          <Admin />
        </div>
      </div>
    )
  }
}
