import Enzyme from 'enzyme'

const Adapter = require('@cfaester/enzyme-adapter-react-18').default

Enzyme.configure({ adapter: new Adapter() })

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

global.ResizeObserver = ResizeObserver
