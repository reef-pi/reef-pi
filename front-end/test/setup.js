import Enzyme from 'enzyme'

const Adapter = require('@belzile/enzyme-adapter-react-19').default

Enzyme.configure({ adapter: new Adapter() })

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

global.ResizeObserver = ResizeObserver
