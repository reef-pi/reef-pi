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
    m.toggleConfig()

    let d = shallow(<Main store={mockStore(state)} />)
      .dive()
      .instance()
    d.state.config.motion = {
      width: 640,
      height: 480,
      url: '#'
    }
    d.motion()
    d.props.updateConfig()
  })

  it('<Capture />', () => {
    let d = shallow(<Capture store={mockStore({ camera: { latest: '' } })} />)
      .dive()
      .instance()
    d.props.takeImage()
  })

  it('<Config />', () => {
    let m = shallow(<Config config={{ tick_interval: 1 }} update={() => {}} />)
    m.instance().updateBool('enable')({ target: { checked: true } })
    m.instance().updateText('bar')({ target: {} })
    m.update()
    m.instance().save()
    m = m.instance()
    m.state.config.tick_interval = 'foo'
    m.save()
  })

  it('<Gallery />', () => {
    const images = [{ thumbnail: '', src: '' }]
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
    m.state.current = -1
    m.onClick()
    shallow(<Gallery />).instance()
  })

  it('<Motion />', () => {
    shallow(<Motion url='' width={300} height={600} />)
  })
})
