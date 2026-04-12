import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import BlankPanel from './blank_panel'

Enzyme.configure({ adapter: new Adapter() })

describe('<BlankPanel />', () => {
  it('renders without throwing', () => {
    expect(() => shallow(<BlankPanel height={200} />)).not.toThrow()
  })

  it('renders a container div', () => {
    const wrapper = shallow(<BlankPanel height={200} />)
    expect(wrapper.find('.container')).toHaveLength(1)
  })

  it('handles componentWillUnmount gracefully', () => {
    const wrapper = shallow(<BlankPanel height={200} />)
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
