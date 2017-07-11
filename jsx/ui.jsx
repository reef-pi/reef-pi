import React from 'react'
import { render } from 'react-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Dashboard from './dashboard.jsx'
import Equipments from './equipments.jsx'
import Jobs from './jobs.jsx'
import Lighting from './lighting.jsx'
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

  handleSelect (index, last) {
  }

  render () {
    var st = {textAlign: 'center'}
    return (
      <div className='container'>
        <div className='container'><h3 style={st}> {this.state.info.name} </h3></div>
        <div className='container'>
          <Tabs onSelect={this.handleSelect} selectedIndex={0}>
            <TabList>
              <Tab>Dashboard</Tab>
              <Tab>Equipments</Tab>
              <Tab>Jobs</Tab>
              <Tab>Lighting</Tab>
            </TabList>
            <TabPanel>
              <Dashboard />
            </TabPanel>
            <TabPanel>
              <Equipments />
            </TabPanel>
            <TabPanel>
              <Jobs />
            </TabPanel>
            <TabPanel>
              <Lighting />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    )
  }
}

render(<App />, document.getElementById('main-panel'))
