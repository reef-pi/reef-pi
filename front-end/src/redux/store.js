import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { rootReducer } from './reducer'
import { createInitialState } from './state'

export const configureStore = (preloadedState = createInitialState()) => {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk))
}

let appStore

export const setStore = (store) => {
  appStore = store
  return appStore
}

export const getStore = () => {
  if (!appStore) {
    appStore = configureStore()
  }
  return appStore
}
