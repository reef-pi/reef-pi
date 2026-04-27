import React from 'react'
import { shallow } from 'enzyme'
import Modal from './modal'
import 'isomorphic-fetch'

describe('<Modal />', () => {
  it('renders children inside modal-content', () => {
    const wrapper = shallow(<Modal><span id='child'>hello</span></Modal>)
    expect(wrapper.find('#child').length).toBe(1)
  })

  it('renders modal-backdrop', () => {
    const wrapper = shallow(<Modal><div /></Modal>)
    expect(wrapper.find('.modal-backdrop').length).toBe(1)
  })

  it('renders modal div with role=dialog', () => {
    const wrapper = shallow(<Modal><div /></Modal>)
    expect(wrapper.find('.modal').length).toBe(1)
  })

  it('renders without children', () => {
    const wrapper = shallow(<Modal />)
    expect(wrapper).toBeDefined()
  })
})
