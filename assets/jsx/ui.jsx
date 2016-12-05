import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Lighting from './lighting.jsx';
import ATO from './ato.jsx';
import Temperature from './temperature.jsx';
import WaveMaker from './wave_maker.jsx';
import Dashboard from './dashboard.jsx';
import DeviceManagement from './device_management.jsx';
import Configuration from './configuration.jsx';

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
          <Tab>WaveMaker</Tab>
          <Tab>Devices</Tab>
          <Tab>Configure</Tab>
        </TabList>
        <TabPanel>
         <Dashboard />
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
        <TabPanel>
          <DeviceManagement />
        </TabPanel>
        <TabPanel>
          <Configuration />
        </TabPanel>
      </Tabs>
    );
  }
}

render(<App/>, document.getElementById('main-panel'));
