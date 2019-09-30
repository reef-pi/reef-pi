import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import ColorPicker from './color_picker'
import { HuePicker } from 'react-color'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('ColorPicker', () => {
  const ev = {
    target: { name: 'color', value: 10 }
  }

  it('<ColorPicker />', () => {
    shallow(<ColorPicker name='picker' color='' onChangeHandler={() => true} />)
  })

  it('should start collapsed', () => {
    const wrapper = shallow(<ColorPicker name='picker' color='' onChangeHandler={() => true} />)
    expect(wrapper.find('button').length).toBe(1)
    expect(wrapper.find(HuePicker).length).toBe(0)
  })

  it('should handle color change', () => {
    const instance = shallow(<ColorPicker name='picker' color='' onChangeHandler={() => true} />).instance()
    instance.handleColorChange(ev)
  })

  it('should expand', () => {
    const wrapper = shallow(<ColorPicker name='picker' color='' onChangeHandler={() => true} />)
    wrapper.find('button').simulate('click')
    expect(wrapper.find('button').length).toBe(0)
    expect(wrapper.find(HuePicker).length).toBe(1)
  })
})
