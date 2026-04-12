import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Percent from './percent'

Enzyme.configure({ adapter: new Adapter() })

describe('Percent', () => {
  const noop = () => {}

  it('renders an input element', () => {
    const wrapper = shallow(<Percent value={50} onChange={noop} />)
    expect(wrapper.find('input')).toHaveLength(1)
  })

  it('renders with type number', () => {
    const wrapper = shallow(<Percent value={50} onChange={noop} />)
    expect(wrapper.find('input').prop('type')).toBe('number')
  })

  it('shows empty string when value is NaN', () => {
    const wrapper = shallow(<Percent value={NaN} onChange={noop} />)
    expect(wrapper.find('input').prop('value')).toBe('')
  })

  it('calls onChange with float value for valid input', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const wrapper = shallow(<Percent value={0} onChange={onChange} name='pct' />)
    wrapper.find('input').simulate('change', {
      target: { name: 'pct', value: '75' }
    })
    expect(received).toBe(75)
  })

  it('accepts 100 as a valid value', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const wrapper = shallow(<Percent value={0} onChange={onChange} name='pct' />)
    wrapper.find('input').simulate('change', {
      target: { name: 'pct', value: '100' }
    })
    expect(received).toBe(100)
  })

  it('does not call onChange for clearly invalid characters', () => {
    let called = false
    const onChange = () => { called = true }
    const wrapper = shallow(<Percent value={0} onChange={onChange} name='pct' />)
    wrapper.find('input').simulate('change', {
      target: { name: 'pct', value: 'abc' }
    })
    expect(called).toBe(false)
  })

  it('calls onChange with NaN for empty input', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const wrapper = shallow(<Percent value={0} onChange={onChange} name='pct' />)
    wrapper.find('input').simulate('change', {
      target: { name: 'pct', value: '' }
    })
    expect(isNaN(received)).toBe(true)
  })

  it('accepts decimal values like 99.5', () => {
    let received
    const onChange = (e) => { received = e.target.value }
    const wrapper = shallow(<Percent value={0} onChange={onChange} name='pct' />)
    wrapper.find('input').simulate('change', {
      target: { name: 'pct', value: '99.5' }
    })
    expect(received).toBe(99.5)
  })
})
