import { createStore, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import { rootReducer } from './reducer'
import { createInitialState } from './state'

export const configureStore = (preloadedState = createInitialState()) => {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk))
}
