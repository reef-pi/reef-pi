import React from 'react'
import { render } from 'react-dom'
import MainPanel from './main_panel.jsx'
import SignIn from './sign_in.jsx'
import {ajaxGet} from './utils/ajax.js'
import {connect, Provider} from 'react-redux'
import store from './redux/store'
import {fetchInfo} from './redux/actions'

window.store = store
window.fetchInfo = fetchInfo

const mapStateToProps = state => {
  return ({ info: state.info })
}

export default class ConnectedApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      info: {}
    }
    this.loadInfo = this.loadInfo.bind(this)
  }
  componentDidMount () {
    this.loadInfo()
  }

  loadInfo () {
    ajaxGet({
      url: '/api/info',
      success: function (data) {
        store.dispatch(fetchInfo(data))
        this.setState({
          info: data
        })
      }.bind(this)
    })
  }

  render () {
    console.log(this.props)
    if (!SignIn.isSignIned()) {
      return (<SignIn />)
    }
    var st = {textAlign: 'center'}
    return (
      <div className='container'>
        <div className='container'><h3 style={st}> {this.props.info.name} </h3></div>
        <div className='container'>
          <MainPanel />
        </div>
      </div>
    )
  }
}

const App = connect(mapStateToProps)(ConnectedApp)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main-panel')
)
