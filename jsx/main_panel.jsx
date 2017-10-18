import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import ATO from './ato.jsx'
import Camera from './camera.jsx'
import Equipments from './equipments.jsx'
import Lighting from './lighting.jsx'
import System from './system.jsx'
import Temperature from './temperature.jsx'
import Timers from './timers.jsx'
import Doser from './doser.jsx'
import $ from 'jquery'
import Common from './common.jsx'

export default class MainPanel extends Common {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: [],
      tabs: {
        'ato': 'Auto Top Off',
        'camera': 'Camera',
        'equipments': 'Equipments',
        'lighting': 'Lighting',
        'system': 'System',
        'temperature': 'Temperature',
        'timers': 'Timers',
        'doser': 'Dosing pumps'
      },
      panels: {
        'ato': <ATO />,
        'camera': <Camera />,
        'system': <System />,
        'equipments': <Equipments />,
        'lighting': <Lighting />,
        'temperature': < Temperature />,
        'timers': <Timers />,
        'doser': < Doser />
      }
    }
    this.tabList = this.tabList.bind(this)
    this.panelList = this.panelList.bind(this)
    this.loadCapabilities = this.loadCapabilities.bind(this)
  }

  tabList () {
    var tabs = []
    $.each(this.state.capabilities, function (i, c) {
      tabs.push(
        <Tab key={c}>{c}</Tab>
      )
    })
    return tabs
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

  panelList () {
    var panels = []
    $.each(this.state.capabilities, function (i, c) {
      panels.push(
        <TabPanel key={c}>
          {this.state.panels[c]}
        </TabPanel>
      )
    }.bind(this))
    return panels
  }

  render () {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          {this.tabList()}
        </TabList>
        {this.panelList()}
      </Tabs>
    )
  }
}
