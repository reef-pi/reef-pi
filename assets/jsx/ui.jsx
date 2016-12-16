import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Dashboard from './dashboard.jsx';
import Electronics from './electronics.jsx';
import Equipments from './equipments.jsx';
import Jobs from './jobs.jsx';

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
      </Tabs>
    );
  }
}

render(<App/>, document.getElementById('main-panel'));
