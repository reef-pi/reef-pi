import {createStore} from 'redux'
import {rootReducer} from './reducer'

const store = createStore(rootReducer)
const mapStateToProps = (state) => {
  return {
    equipment: state
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default store;

