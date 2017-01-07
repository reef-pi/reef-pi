import React from 'react'
import { render } from 'react-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Dashboard from './dashboard.jsx'
import Electronics from './electronics.jsx'
import Equipments from './equipments.jsx'
import Jobs from './jobs.jsx'
import ATO from './ato.jsx'

export default class App extends React.Component {
  handleSelect (index, last) {
  }

  render () {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Electronics</Tab>
          <Tab>Equipments</Tab>
          <Tab>Jobs</Tab>
          <Tab>Auto Top Off</Tab>
        </TabList>
        <TabPanel>
          <Dashboard />
        </TabPanel>
        <TabPanel>
          <Electronics />
        </TabPanel>
        <TabPanel>
          <Equipments />
        </TabPanel>
        <TabPanel>
          <Jobs />
        </TabPanel>
        <TabPanel>
          <ATO />
        </TabPanel>
      </Tabs>
    )
  }
}

render(<App />, document.getElementById('main-panel'))
