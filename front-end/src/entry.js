import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { configureStore } from 'redux/store'
import { setAlertDispatcher } from 'utils/alert'
import App from 'app'

const store = configureStore()
setAlertDispatcher(store.dispatch)
const root = createRoot(document.getElementById('main-panel'))

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
