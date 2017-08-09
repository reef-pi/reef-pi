import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Dashboard from './dashboard.jsx'
import Admin from './admin.jsx'
import Equipments from './equipments.jsx'
import Timers from './timers.jsx'
import TemperatureController from './tc.jsx'
import Lighting from './lighting.jsx'
import ATO from './ato.jsx'
import Doser from './doser.jsx'
import $ from 'jquery'

export default class MainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      capabilities: [],
      tabs: {
        'dashboard': 'Dashboard',
        'equipments': 'Equipments',
        'timers': 'Timers',
        'lighting': 'Lighting',
        'temperature': 'Temperature',
        'ato': 'Auto Top Off',
        'doser': 'Dosing pumps',
        'admin': 'Admin'
      },
      panels: {
        'dashboard': <Dashboard />,
        'equipments': <Equipments />,
        'timers': <Timers />,
        'lighting': <Lighting />,
        'temperature': < TemperatureController />,
        'ato': <ATO />,
        'doser': < Doser />,
        'admin': <Admin />
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
    $.ajax({
      url: '/api/capabilities',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        this.setState({
          capabilities: data
        })
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err.toString())
      }
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
