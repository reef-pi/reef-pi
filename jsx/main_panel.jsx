import React from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import ATO from './ato/main.jsx'
import Camera from './camera/main.jsx'
import Equipments from './equipments/main.jsx'
import Lighting from './lighting/main.jsx'
import Configuration from './configuration/main.jsx'
import Temperature from './temperature/main.jsx'
import Timers from './timers/main.jsx'
import Doser from './doser/controller.jsx'
import Ph from './ph/main.jsx'
import Dashboard from './dashboard/main.jsx'
import $ from 'jquery'
import 'react-tabs/style/react-tabs.css'
import {fetchCapabilities} from './redux/actions'
import {connect} from 'react-redux'

class mainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      panels: {
        'equipments': <Equipments />,
        'timers': <Timers />,
        'lighting': <Lighting />,
        'temperature': <Temperature />,
        'ato': <ATO />,
        'ph': <Ph />,
        'doser': <Doser />,
        'camera': <Camera />,
        'configuration': <Configuration />
      }
    }
  }

  componentDidMount () {
    this.props.fetchCapabilities()
  }

  handleSelect (index, last) {
  }

  render () {
    var tabs = [ ]
    var panels = [ ]
    if (this.props.capabilities.dashboard) {
      tabs.push(<Tab key='dashboard'> dashboard </Tab>)
      panels.push(<TabPanel key='dashboard'> <Dashboard capabilities={this.props.capabilities} /> </TabPanel>)
    }

    $.each(this.state.panels, function (k, panel) {
      if (this.props.capabilities[k] === undefined) {
        return
      }
      if (!this.props.capabilities[k]) {
        return
      }
      tabs.push(<Tab key={k}>{k}</Tab>)
      panels.push(<TabPanel key={k}> {panel} </TabPanel>)
    }.bind(this))

    return (
      <div className='container'>
        <div id='reef-pi-alert' className='alert alert-danger' />
        <Tabs >
          <TabList>
            {tabs}
          </TabList>
          {panels}
        </Tabs>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return { capabilities: state.capabilities }
}

const mapDispatchToProps = (dispatch) => {
  return {fetchCapabilities: () => dispatch(fetchCapabilities())}
}

const MainPanel = connect(mapStateToProps, mapDispatchToProps)(mainPanel)
export default MainPanel
