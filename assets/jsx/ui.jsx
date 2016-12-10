import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Dashboard from './dashboard.jsx';
import Electronics from './electronics.jsx';
import Equipments from './equipments.jsx';
import Jobs from './jobs.jsx';
import DeviceManagement from './device_management.jsx';
import Lighting from './lighting.jsx';
import ATO from './ato.jsx';
import Temperature from './temperature.jsx';
import WaveMaker from './wave_maker.jsx';

export default class App extends Component {
  handleSelect(index, last) {
  }

  render() {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Electronics</Tab>
          <Tab>Equipments</Tab>
          <Tab>Jobs</Tab>
          <Tab>Devices</Tab>
          <Tab>Lighting</Tab>
          <Tab>ATO</Tab>
          <Tab>Temperature</Tab>
          <Tab>WaveMaker</Tab>
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
          <DeviceManagement />
        </TabPanel>
        <TabPanel>
         <Lighting />
        </TabPanel>
        <TabPanel>
          <ATO />
        </TabPanel>
        <TabPanel>
          <Temperature />
        </TabPanel>
        <TabPanel>
          <WaveMaker />
        </TabPanel>
      </Tabs>
    );
  }
}

render(<App/>, document.getElementById('main-panel'));
