import ColorPicker from './color_picker'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'

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

    // Collapsed state renders a Button component (design-system primitive, not raw 'button')
    const rendered = component.render()
    expect(rendered.type).toBe(Button)

    // Clicking it should set expand=true
    rendered.props.onClick()
    expect(component.state.expand).toBe(true)

    // Expanded state renders SketchPicker with onChangeComplete bound to handleColorChange
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
