import React from 'react'
import { render } from 'react-dom'
import MainPanel from './main_panel.jsx'
import SignIn from './sign_in.jsx'
import {connect, Provider} from 'react-redux'
import {configureStore} from './redux/store'
import {fetchInfo} from './redux/actions'

const store = configureStore()

export default class ConnectedApp extends React.Component {
  componentDidMount () {
    if (SignIn.isSignIned()) {
      this.props.fetchInfo()
    }
  }

  render () {
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

const mapStateToProps = (state) => {
  return { info: state.info }
}

const mapDispatchToProps = (dispatch) => {
  return {fetchInfo: () => dispatch(fetchInfo())}
}

const App = connect(mapStateToProps, mapDispatchToProps)(ConnectedApp)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main-panel')
)
