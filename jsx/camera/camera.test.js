import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Capture from './capture'
import Config from './config'
import Gallery from './gallery'
import Motion from './motion'
import configureMockStore from 'redux-mock-store'
import {mockLocalStorage} from '../utils/test_helper'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import renderer from 'react-test-renderer'
import {Provider} from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Camera module', () => {
  it('<Main />', () => {
    renderer.create(
      <Provider store={mockStore({camera: {}})} >
        <Main />
      </Provider>)
  })

  it('<Capture />', () => {
    shallow(<Capture store={mockStore({camera: {}})} />)
  })

  it('<Config />', () => {
    const m = shallow(<Config config={{}} />).instance()
    m.updateBool('foo')({target: {}})
    m.updateText('bar')({target: {}})
    m.save()
  })

  it('<Gallery />', () => {
    shallow(<Gallery />)
  })

  it('<Motion />', () => {
    shallow(<Motion url='' width={300} height={600} />)
  })
})
