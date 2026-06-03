import React from 'react'
import MainPanel from 'main_panel'
import SignIn from 'sign_in'
import 'style.scss'
import i18n from 'utils/i18n'
import { useTheme } from '../design-system/ui_kits/reef-pi-app/hooks/useTheme'

// Mounts the system-preference change listener for the duration of the session
function ThemeInitializer () {
  useTheme()
  return null
}

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false,
      logged: false
    }
    this.getComponent = this.getComponent.bind(this)
  }

  componentDidMount () {
    SignIn.isSignedIn().then(r => {
      this.setState({ loaded: true, logged: r })
    })
  }

  getComponent () {
    if (!this.state.logged) {
      document.documentElement.classList.add('auth-page')
      document.body.classList.add('auth-page')
      const mainPanel = document.getElementById('main-panel')
      if (mainPanel) mainPanel.classList.add('auth-page')
      return <SignIn />
    } else {
      document.documentElement.classList.remove('auth-page')
      document.body.classList.remove('auth-page')
      const mainPanel = document.getElementById('main-panel')
      if (mainPanel) mainPanel.classList.remove('auth-page')
      return <MainPanel />
    }
  }

  render () {
    if (!this.state.loaded) {
      return <div>{i18n.t('loading')}</div>
    } else {
      return (
        <>
          <ThemeInitializer />
          {this.getComponent()}
        </>
      )
    }
  }
}
