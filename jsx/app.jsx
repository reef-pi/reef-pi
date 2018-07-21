import React from 'react'
import { render } from 'react-dom'
import MainPanel from 'main_panel'
import SignIn from 'sign_in'
import {connect} from 'react-redux'
import {fetchInfo} from 'redux/actions/info'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

class app extends React.Component {
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
        <div id='reef-pi-alert' className='alert alert-danger alert-dismissible fade show'>
          <div id='reef-pi-alert-msg' />
          <button type='button' className='close' data-dismiss='alert' aria-label='Close'>
            <span aria-hidden='true'>&times;</span>
          </button>
        </div>
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

const App = connect(mapStateToProps, mapDispatchToProps)(app)
export default App
