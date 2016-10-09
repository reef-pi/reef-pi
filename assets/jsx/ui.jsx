import React, { Component } from 'react';
import { render } from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Light from './light.jsx';
import ATO from './ato.jsx';
import Temperature from './temperature.jsx';
import Pumps from './pumps.jsx';

export default class App extends Component {
  handleSelect(index, last) {
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
					<ATO />
        </TabPanel>
        <TabPanel>
          <Temperature />
        </TabPanel>
        <TabPanel>
          <Pumps />
        </TabPanel>
      </Tabs>
    );
  }
}

render(<App/>, document.getElementById('main-panel'));
