import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

global.ResizeObserver = ResizeObserver
