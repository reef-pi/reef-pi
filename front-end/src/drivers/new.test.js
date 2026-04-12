import React from 'react'
import 'isomorphic-fetch'
import { shallow } from 'enzyme'
import New from './new'
import configureMockStore from 'redux-mock-store'
import renderer from 'react-test-renderer'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

describe('New Driver', () => {
  it('<New />', () => {
    renderer.create(<New store={mockStore()} />)
    shallow(<New store={mockStore()} />)
  })
})
