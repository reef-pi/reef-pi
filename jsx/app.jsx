import React from 'react'
import { render } from 'react-dom'
import $ from 'jquery'
import MainPanel from 'main_panel'
import SignIn from 'sign_in'
import 'style.scss'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'react-toggle-switch/dist/css/switch.min.css'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      logged: false
    }
  }
  componentDidMount () {
    const setState = this.setState.bind(this)
    SignIn.isSignedIn().then(r => {
      setState({ loaded: true, logged: r })
    })
  }
  getComponent () {
    if (!this.state.logged) {
      $('html').addClass('auth-page')
      $('body').addClass('auth-page')
      $('#main-panel').addClass('auth-page')
      return <SignIn />
    } else {
      $('html').removeClass('auth-page')
      $('body').removeClass('auth-page')
      $('#main-panel').removeClass('auth-page')
      return <MainPanel />
    }
  }
  render () {
    if (!this.state.loaded) {
      return <div>Loading</div>
    } else {
      return this.getComponent()
    }
  }
}
