import React from 'react'
import { render } from 'react-dom'
import MainPanel from './main_panel.jsx'
import $ from 'jquery'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      info: {}
    }
    this.loadInfo = this.loadInfo.bind(this)
  }
  componentDidMount () {
    this.loadInfo()
  }

  loadInfo () {
    $.ajax({
      url: '/api/info',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          info: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
    })
  }

  render () {
    var st = {textAlign: 'center'}
    return (
      <div className='container'>
        <div className='container'><h3 style={st}> {this.state.info.name} </h3></div>
        <div className='container'>
          <MainPanel />
        </div>
      </div>
    )
  }
}

render(<App />, document.getElementById('main-panel'))
