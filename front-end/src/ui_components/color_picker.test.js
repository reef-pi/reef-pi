import ColorPicker from './color_picker'

describe('ColorPicker', () => {
  it('starts collapsed and expands', () => {
    const component = new ColorPicker({
      name: 'picker',
      color: '',
      onChangeHandler: jest.fn()
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    expect(component.render().type).toBe('button')

    component.render().props.onClick()
    expect(component.state.expand).toBe(true)
    expect(component.render().props.onChangeComplete).toBe(component.handleColorChange)
  })

  it('handles color change and collapses', () => {
    const onChangeHandler = jest.fn()
    const component = new ColorPicker({
      name: 'picker',
      color: '',
      onChangeHandler
    })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    component.handleColorChange({ hex: '#abcdef' })

    expect(onChangeHandler).toHaveBeenCalledWith({
      target: {
        name: 'picker',
        value: '#abcdef'
      }
    })
    expect(component.state).toEqual({ expand: false, color: '#abcdef' })
  })
})
