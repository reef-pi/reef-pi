import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import ATO from './ato.jsx'
import Camera from './camera.jsx'
import Equipments from './equipments.jsx'
import Lighting from './lighting.jsx'
import Configuration from './configuration.jsx'
import Temperature from './temperature.jsx'
import Timers from './timers.jsx'
import Doser from './doser.jsx'
import $ from 'jquery'
import Common from './common.jsx'

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
    var tabs = []
    var panels = []

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
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          {tabs}
        </TabList>
        {panels}
      </Tabs>
    )
  }
}
