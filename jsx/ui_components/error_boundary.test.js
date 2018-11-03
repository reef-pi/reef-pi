import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ErrorBoundary from './error_boundary'

Enzyme.configure({ adapter: new Adapter() })

describe('ErrorBoundary', () => {
  it('should show child when there are no errors', () => {
    const wrapper = shallow(<ErrorBoundary><span>Child</span></ErrorBoundary>)
    expect(wrapper.find('span').length).toBe(1)
    expect(wrapper.find('details').length).toBe(0)
  })

  it('should show the error when there is an error', () => {
    const wrapper = shallow(<ErrorBoundary><span>Child</span></ErrorBoundary>)
    wrapper.instance().componentDidCatch('error', {componentStack: 'stackTrace'})

    expect(wrapper.find('span').length).toBe(0)
    expect(wrapper.find('details').length).toBe(1)
  })

  it('should reset once tab is changed', () => {
    const wrapper = shallow(<ErrorBoundary tab='tab1'><span>Child</span></ErrorBoundary>)
    wrapper.instance().componentDidCatch('error', {componentStack: 'stackTrace'})

    expect(wrapper.find('span').length).toBe(0)
    expect(wrapper.find('details').length).toBe(1)

    wrapper.setProps({tab: 'tab2'})
    expect(wrapper.find('span').length).toBe(1)
    expect(wrapper.find('details').length).toBe(0)
  })
})
