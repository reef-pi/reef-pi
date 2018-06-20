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

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])
window.localStorage = mockLocalStorage()

describe('Camera module', () => {
  it('<Main />', () => {
    const state = {
      camera: {
        config: {},
        images: [{name: 'foo'}, {name: 'bar'}]
      }
    }
    const m = shallow(<Main store={mockStore(state)} />).dive().instance()
    m.toggleConfig()
  })

  it('<Capture />', () => {
    shallow(<Capture store={mockStore({camera: {latest: ''}})} />).dive()
  })

  it('<Config />', () => {
    const m = shallow(<Config config={{tick_interval: 1}} update={() => {}} />)
    m.instance().updateBool('enable')({target: {checked: true}})
    m.instance().updateText('bar')({target: {}})
    m.update()
    m.instance().save()
  })

  it('<Gallery />', () => {
    const images = [{thumbnail: '', src: ''}]
    const m = shallow(<Gallery images={images} />).instance()
    const ev = {
      preventDefault: () => true
    }
    m.open(1, ev)
    m.onClose()
    m.gotoPrevious()
    m.gotoNext()
    m.gotoImage(0)
    m.onClick()
  })

  it('<Motion />', () => {
    shallow(<Motion url='' width={300} height={600} />)
  })
})
