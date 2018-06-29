import React from 'react'
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
import 'react-responsive-tabs/styles.css'
import Tabs from 'react-responsive-tabs'
import {fetchUIData} from './redux/actions/ui'
import {connect} from 'react-redux'

const caps = {
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

class mainPanel extends React.Component {
  componentDidMount () {
    this.props.fetchUIData()
  }

  render () {
    var panels = [ ]
    if (this.props.capabilities.dashboard) {
      panels.push({
        title: 'dashboard',
        getContent: () => <Dashboard capabilities={this.props.capabilities} />
      })
    }

    $.each(caps, function (k, panel) {
      if (this.props.capabilities[k] === undefined) {
        return
      }
      if (!this.props.capabilities[k]) {
        return
      }
      panels.push({
        title: k,
        getContent: () => panel
      })
    }.bind(this))
    return (
      <Tabs items={panels} />
    )
  }
}
const mapStateToProps = (state) => {
  return { capabilities: state.capabilities }
}

const mapDispatchToProps = (dispatch) => {
  return {fetchUIData: () => dispatch(fetchUIData(dispatch))}
}

const MainPanel = connect(mapStateToProps, mapDispatchToProps)(mainPanel)
export default MainPanel
