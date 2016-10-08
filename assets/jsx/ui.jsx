import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Light from './light.jsx';

export default class App extends Component {
  handleSelect(index, last) {
    console.log(index);
  }

  render() {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={0}>
        <TabList>
          <Tab>Lighting</Tab>
          <Tab>ATO</Tab>
          <Tab>Temperature</Tab>
          <Tab>Pumps</Tab>
        </TabList>
        <TabPanel>
         <Light />
        </TabPanel>
        <TabPanel>
					ATO components go here
        </TabPanel>
        <TabPanel>
					Temperature components go here
        </TabPanel>
        <TabPanel>
					Pump components go here
        </TabPanel>
      </Tabs>
    );
  }
}

render(<App/>, document.getElementById('main-panel'));
