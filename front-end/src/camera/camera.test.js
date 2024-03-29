import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Main from './main'
import Capture from './capture'
import Config from './config'
import Gallery from './gallery'
import Motion from './motion'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('Camera module', () => {
  it('<Main />', () => {
    const state = {
      camera: {
        config: {},
        images: [{ name: 'foo' }, { name: 'bar' }]
      }
    }
    const m = shallow(<Main store={mockStore(state)} />)
      .dive()
      .instance()

    const d = shallow(<Main store={mockStore(state)} />)
      .dive()
      .instance()
  })

  it('<Capture />', () => {
    const d = shallow(<Capture store={mockStore({ camera: { latest: '' } })} />)
      .dive()
      .instance()
  })

  it('<Config />', () => {
    let m = shallow(<Config config={{ tick_interval: 1 }} update={() => {}} />)
    m.instance().updateBool('enable')({ target: { checked: true } })
    m.instance().updateText('bar')({ target: {} })
    m.update()
    m.instance().handleSave()
    m = m.instance()
    m.state.config.tick_interval = 'foo'
    m.handleSave()
  })

  it('<Gallery />', () => {
    const images = [{ thumbnail: '', src: '' }]
    const ev = {
      preventDefault: () => true
    }
    const wrapper = shallow(<Gallery images={images} />)
    wrapper
      .find('a')
      .first()
      .simulate('click', ev)
    const m = wrapper.instance()

    m.handleClose()
    m.handleGotoPrevious()
    m.handleGotoNext()
    m.handleGotoImage(0)
    m.handleOnClick()
    m.state.current = -1
    m.handleOnClick()
    shallow(<Gallery />).instance()
  })

  it('<Motion />', () => {
    shallow(<Motion url='/foo' width={300} height={600} />)
  })
})
