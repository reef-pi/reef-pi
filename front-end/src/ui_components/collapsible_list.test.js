import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CollapsibleList from './collapsible_list'

Enzyme.configure({ adapter: new Adapter() })

const Item = (props) => <div name={props.name}>{props.name}</div>

describe('CollapsibleList', () => {
  it('renders children', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='a' />
        <Item name='b' />
      </CollapsibleList>
    )
    expect(wrapper.find(Item)).toHaveLength(2)
  })

  it('starts collapsed (expanded false) for items without defaultOpen', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='x' />
      </CollapsibleList>
    )
    expect(wrapper.state('expanded').x).toBe(false)
  })

  it('starts expanded for items with defaultOpen', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='y' defaultOpen />
      </CollapsibleList>
    )
    expect(wrapper.state('expanded').y).toBe(true)
  })

  it('starts readOnly for all items', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='z' />
      </CollapsibleList>
    )
    expect(wrapper.state('readOnly').z).toBe(true)
  })

  it('onToggle toggles expanded state when readOnly', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='t' />
      </CollapsibleList>
    )
    wrapper.instance().onToggle('t')
    expect(wrapper.state('expanded').t).toBe(true)
    wrapper.instance().onToggle('t')
    expect(wrapper.state('expanded').t).toBe(false)
  })

  it('onToggle does not toggle when not readOnly (editing)', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='e' />
      </CollapsibleList>
    )
    wrapper.instance().onEdit('e')
    expect(wrapper.state('readOnly').e).toBe(false)
    wrapper.instance().onToggle('e')
    // Still expanded because editing prevents toggle
    expect(wrapper.state('expanded').e).toBe(true)
  })

  it('onEdit expands and sets readOnly to false', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='ed' />
      </CollapsibleList>
    )
    wrapper.instance().onEdit('ed')
    expect(wrapper.state('expanded').ed).toBe(true)
    expect(wrapper.state('readOnly').ed).toBe(false)
  })

  it('onSubmit collapses and sets readOnly to true', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='s' />
      </CollapsibleList>
    )
    wrapper.instance().onEdit('s')
    wrapper.instance().onSubmit('s')
    expect(wrapper.state('expanded').s).toBe(false)
    expect(wrapper.state('readOnly').s).toBe(true)
  })

  it('getDerivedStateFromProps adds new child as collapsed', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='first' />
      </CollapsibleList>
    )
    wrapper.setProps({ children: [<Item key='new' name='new' />] })
    expect(wrapper.state('expanded').new).toBe(false)
    expect(wrapper.state('readOnly').new).toBe(true)
  })

  it('passes expanded, readOnly, onToggle, onEdit, onSubmit to children', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Item name='p' />
      </CollapsibleList>
    )
    const child = wrapper.find(Item).first()
    expect(child.prop('expanded')).toBeDefined()
    expect(child.prop('readOnly')).toBeDefined()
    expect(typeof child.prop('onToggle')).toBe('function')
    expect(typeof child.prop('onEdit')).toBe('function')
    expect(typeof child.prop('onSubmit')).toBe('function')
  })
})
