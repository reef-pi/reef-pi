import React from 'react'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import Main from './main'
import Capture from './capture'
import Config from './config'
import Gallery from './gallery'
import Motion from './motion'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

const cameraState = {
  camera: { config: { tick_interval: 60, enable: false }, images: [{ name: 'foo.jpg' }, { name: 'bar.jpg' }] }
}

describe('Camera module', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('<Main /> mounts with images', () => {
    fetchMock.get('/api/camera/config', cameraState.camera.config)
    fetchMock.get('/api/camera/images', cameraState.camera.images)
    fetchMock.get('/api/camera/latest', '')
    const store = mockStore(cameraState)
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
  })

  it('<Main /> mounts with empty state', () => {
    fetchMock.get('/api/camera/config', {})
    fetchMock.get('/api/camera/images', [])
    fetchMock.get('/api/camera/latest', '')
    const store = mockStore({ camera: { config: {}, images: [] } })
    const wrapper = mount(<Provider store={store}><Main /></Provider>)
    expect(wrapper).toBeDefined()
    wrapper.unmount()
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
