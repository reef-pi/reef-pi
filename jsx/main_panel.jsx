import React from 'react'
import ATO from 'ato/main'
import Camera from 'camera/main'
import Equipment from 'equipment/main'
import Lighting from 'lighting/main'
import Configuration from 'configuration/main'
import Temperature from 'temperature/main'
import Timers from 'timers/main'
import Doser from 'doser/controller'
import Ph from 'ph/main'
import Macro from 'macro/main'
import Dashboard from 'dashboard/main'
import $ from 'jquery'
import {fetchUIData} from 'redux/actions/ui'
import {connect} from 'react-redux'
import Summary from 'summary'
import '../assets/reef_pi.css'

const caps = {
  'dashboard': <Dashboard />,
  'equipment': <Equipment />,
  'timers': <Timers />,
  'lighting': <Lighting />,
  'temperature': <Temperature />,
  'ato': <ATO />,
  'ph': <Ph />,
  'doser': <Doser />,
  'macro': <Macro />,
  'camera': <Camera />,
  'configuration': <Configuration />
}

class mainPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      tab: 'dashboard'
    }
    this.navs = this.navs.bind(this)
    this.setTab = this.setTab.bind(this)
  }

  componentDidMount () {
    this.props.fetchUIData()
  }

  setTab (k) {
    return () => { this.setState({tab: k}) }
  }

  navs (tab) {
    var panels = [ ]
    $.each(caps, function (k, panel) {
      if (this.props.capabilities[k] === undefined) {
        return
      }
      if (!this.props.capabilities[k]) {
        return
      }
      var cname = k === tab ? 'nav-link active text-primary' : 'nav-link'
      panels.push(
        <li className='nav-item' key={k}>
          <a id={'tab-' + k}className={cname} onClick={this.setTab(k)}>{k}</a>
        </li>
      )
    }.bind(this))
    return (
      <ul className='nav nav-tabs'>
        {panels}
      </ul>
    )
  }

  render () {
    var tab = this.state.tab
    if(!this.props.capabilities['dashboard'] && tab === 'dashboard'){
      for(var k in this.props.capabilities){
        if(this.props.capabilities[k] && (caps[k]!== undefined)){
          tab = k
          break
        }
      }
    }
    var body = caps[tab]
    return (
      <div className='container'>
        {this.navs(tab)}
        {body}
        <hr />
        <Summary />
      </div>
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
