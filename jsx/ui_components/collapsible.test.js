import React from 'react'
import Enzyme, {shallow, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import CollapsibleList from './collapsible_list'
import Collapsible from './collapsible'

Enzyme.configure({ adapter: new Adapter() })

describe('Collapsible', () => {
  const noop = () => {}
  const Content = (props) => {
    return (
      <div>
        This is inner content
        <button type='button' id='submit' onClick={props.onSubmit()}>click</button>
      </div>
    )
  }

  it('should not show content when collapsed', () => {
    const wrapper = mount(
      <Collapsible name='test' title='title' expanded={false} readOnly onToggle={noop} onDelete={noop} onEdit={noop} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    expect(wrapper.find('button#submit').length).toBe(0)
  })

  it('should show content when expanded', () => {
    const wrapper = mount(
      <Collapsible name='test' title='title' expanded readOnly={false} onToggle={noop} onDelete={noop} onEdit={noop} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )

    expect(wrapper.find('button#submit').length).toBe(1)
  })

  it('should show Edit button when readOnly', () => {
    const wrapper = shallow(
      <Collapsible name='test' title='title' expanded readOnly onToggle={noop} onDelete={noop} onEdit={noop} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    expect(wrapper.find('#edit-timer-test').length).toBe(1)
  })

  it('should not show Edit button when readOnly is false', () => {
    const wrapper = shallow(
      <Collapsible name='test' title='title' expanded readOnly={false} onToggle={noop} onDelete={noop} onEdit={noop} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    expect(wrapper.find('#edit-timer-test').length).toBe(0)
  })

  it('should fire edit function', () => {
    const jestFn = jest.fn()
    const wrapper = shallow(
      <Collapsible name='test' title='title' expanded readOnly onToggle={noop} onDelete={noop} onEdit={jestFn} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    wrapper.find('#edit-timer-test').simulate('click', {stopPropagation: noop})
    expect(jestFn).toHaveBeenCalled()
  })

  it('should fire delete function', () => {
    const jestFn = jest.fn()
    const wrapper = shallow(
      <Collapsible name='test' title='title' expanded readOnly onToggle={noop} onDelete={jestFn} onEdit={noop} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    wrapper.find('#delete-timer-test').simulate('click', {stopPropagation: noop})
    expect(jestFn).toHaveBeenCalled()
  })

  it('should fire onToggle function', () => {
    const jestFn = jest.fn()
    const wrapper = shallow(
      <Collapsible name='test' title='title' expanded readOnly onToggle={jestFn} onDelete={noop} onEdit={noop} onSubmit={noop}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    wrapper.find('div.row.pointer').simulate('click')
    expect(jestFn).toHaveBeenCalled()
  })

  it('should fire submit function', () => {
    const jestFn = jest.fn()
    const wrapper = mount(
      <Collapsible name='test' title='title' expanded readOnly onToggle={noop} onDelete={noop} onEdit={noop} onSubmit={jestFn}>
        <Content onSubmit={noop} />
      </Collapsible>
    )
    wrapper.find('#submit').simulate('click', {stopPropagation: noop})
    expect(jestFn).toHaveBeenCalled()
  })

  it('should expand and set readonly false when edit is clicked', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Collapsible name='test' title='title'>
          <Content onSubmit={noop} />
        </Collapsible>
      </CollapsibleList>
    )

    wrapper.find('#edit-timer-test').simulate('click', {stopPropagation: noop})
  })

  it('should add new panel as collapsed', () => {
    const wrapper = mount(
      <CollapsibleList>
        <Collapsible name='test' title='title'>
          <Content onSubmit={noop} />
        </Collapsible>
      </CollapsibleList>
    )
    wrapper.setProps({children: [<Collapsible name='another'><div /></Collapsible>]})

    const expanded = wrapper.state('expanded')
    expect(expanded['another']).toBe(false)
  })
})
