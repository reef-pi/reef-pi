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
import {fetchUIData} from './redux/actions/ui'
import {connect} from 'react-redux'
import {hideAlert} from './utils/alert'
import Summary from './summary.jsx'
import '../assets/reef_pi.css'

const caps = {
  'dashboard': <Dashboard />,
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
  constructor(props){
    super(props)
    this.state = {
      body: 'dashboard'
    }
    this.navs = this.navs.bind(this)
    this.setBody = this.setBody.bind(this)
  }
  componentDidMount () {
    this.props.fetchUIData()
    hideAlert()
  }

  setBody(k) {
    return(() => {this.setState({body: k})})
  }

  navs() {
    var panels = [ ]
    $.each(caps, function (k, panel) {
      if (this.props.capabilities[k] === undefined) {
        return
      }
      if (!this.props.capabilities[k]) {
        return
      }
      var cname = k ===  this.state.body ? 'nav-link active text-primary' : 'nav-link'
      panels.push(
        <li className="nav-item" key={k}>
          <a id={'tab-' + k}className={cname} onClick={this.setBody(k)}>{k}</a>
        </li>
      )
    }.bind(this))
    return(
        <ul className="nav nav-tabs">
          {panels}
        </ul>
    )
  }

  render () {
    var body = caps[this.state.body]
    return (
      <div className='container'>
        {this.navs()}
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
