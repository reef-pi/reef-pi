import React from 'react'
import { render } from 'react-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Dashboard from './dashboard.jsx'
import Equipments from './equipments.jsx'
import Jobs from './jobs.jsx'
import Lighting from './lighting.jsx'

export default class App extends React.Component {
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
    )
  }
}

render(<App />, document.getElementById('main-panel'))
