import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Light from './light.jsx';
import ATO from './ato.jsx';
import Temperature from './temperature.jsx';
import Pumps from './pumps.jsx';
import Dashboard from './dashboard.jsx';
import Settings from './settings.jsx';
import Schedule from './schedule.jsx';
import DeviceManagement from './device_management.jsx';

export default class App extends Component {
  handleSelect(index, last) {
  }

  render() {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Lighting</Tab>
          <Tab>ATO</Tab>
          <Tab>Temperature</Tab>
          <Tab>Pumps</Tab>
          <Tab>Jobs</Tab>
          <Tab>Devices</Tab>
        </TabList>
        <TabPanel>
         <Dashboard />
        </TabPanel>
        <TabPanel>
         <Light />
        </TabPanel>
        <TabPanel>
          <ATO />
        </TabPanel>
        <TabPanel>
          <Temperature />
        </TabPanel>
        <TabPanel>
          <Pumps />
        </TabPanel>
        <TabPanel>
          <Schedule url="/api/schedule"/>
        </TabPanel>
        <TabPanel>
          <DeviceManagement />
        </TabPanel>
      </Tabs>
    );
  }
}

render(<App/>, document.getElementById('main-panel'));
