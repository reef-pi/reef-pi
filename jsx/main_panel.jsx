import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Dashboard from './dashboard.jsx'
import Equipments from './equipments.jsx'
import Jobs from './jobs.jsx'
import TemperatureController from './tc.jsx'
import Lighting from './lighting.jsx'

export default class MainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  componentDidMount () {
  }
  handleSelect (index, last) {
  }

  render () {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Equipments</Tab>
          <Tab>Jobs</Tab>
          <Tab>Lighting</Tab>
          <Tab>Temperature</Tab>
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
        <TabPanel>
          <TemperatureController />
        </TabPanel>
      </Tabs>
    )
  }
}
