import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { configureStore, setStore } from 'redux/store'
import App from 'app'

const store = setStore(configureStore())
const root = createRoot(document.getElementById('main-panel'))

root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
