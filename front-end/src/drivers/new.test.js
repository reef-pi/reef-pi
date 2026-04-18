import React from 'react'
import 'isomorphic-fetch'
import { shallow } from 'enzyme'
import { render } from '@testing-library/react'
import New from './new'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])

describe('New Driver', () => {
  it('<New />', () => {
    expect(() => render(<New store={mockStore()} />)).not.toThrow()
    shallow(<New store={mockStore()} />)
  })
})
