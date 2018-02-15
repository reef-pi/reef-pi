import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import ATO from './ato/main.jsx'
import Camera from './camera/main.jsx'
import Equipments from './equipments/main.jsx'
import Lighting from './lighting/main.jsx'
import Configuration from './configuration.jsx'
import Temperature from './temperature/main.jsx'
import Timers from './timers/main.jsx'
import Doser from './doser/controller.jsx'
import Dashboard from './dashboard.jsx'
import $ from 'jquery'
import Common from './common.jsx'
import 'react-tabs/style/react-tabs.css'

export default class MainPanel extends Common {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: {},
      panels: {
        'ato': <ATO />,
        'camera': <Camera />,
        'configuration': <Configuration />,
        'equipments': <Equipments />,
        'lighting': <Lighting />,
        'temperature': < Temperature />,
        'timers': <Timers />,
        'doser': < Doser />
      }
    }
    this.loadCapabilities = this.loadCapabilities.bind(this)
  }

  componentDidMount () {
    this.loadCapabilities()
  }

  handleSelect (index, last) {
  }

  loadCapabilities () {
    this.ajaxGet({
      url: '/api/capabilities',
      success: function (data) {
        this.setState({
          capabilities: data
        })
      }.bind(this)
    })
  }

  render () {
    var tabs = [ ]
    var panels = [ ]
    if (this.state.capabilities.dashboard) {
      tabs.push(<Tab key='dashboard'> dashboard </Tab>)
      panels.push(<TabPanel key='dashboard'> <Dashboard capabilities={this.state.capabilities} /> </TabPanel>)
    }

    $.each(this.state.capabilities, function (k, v) {
      if (!v) {
        return
      }
      if (this.state.panels[k] === undefined) {
        return
      }
      tabs.push(<Tab key={k}>{k}</Tab>)
      panels.push(<TabPanel key={k}> {this.state.panels[k]} </TabPanel>)
    }.bind(this))

    return (
      <Tabs >
        <TabList>
          {tabs}
        </TabList>
        {panels}
      </Tabs>
    )
  }
}
