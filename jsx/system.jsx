import React from 'react'
import Admin from './admin.jsx'
import Settings from './settings.jsx'
import Dashboard from './dashboard.jsx'

export default class System extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <Dashboard />
          <hr />
        </div>
        <div className='row'>
          <Settings />
        </div>
        <div className='row'>
          <Admin />
        </div>
      </div>
    )
  }
}
