import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore, setStore } from 'redux/store'
import App from 'app'

const store = setStore(configureStore())

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main-panel')
)
