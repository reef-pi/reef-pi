import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

class App extends Component {
  handleSelect(index, last) {
    console.log('Selected tab: ' + index + ', Last tab: ' + last);
  }

  render() {
    return (
      <Tabs onSelect={this.handleSelect} selectedIndex={2}>
        <TabList>
          <Tab>Lighting</Tab>
          <Tab>ATO</Tab>
          <Tab>Temperature</Tab>
          <Tab>Pumps</Tab>
        </TabList>
        <TabPanel>
					Lighting components go here
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
