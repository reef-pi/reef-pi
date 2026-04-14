import React from 'react'
import 'isomorphic-fetch'
import { renderToStaticMarkup } from 'react-dom/server'
import New, { NewAtoView } from './new'

describe('New ATO', () => {
  it('<New />', () => {
    const createATO = jest.fn()
    const component = new NewAtoView({ createATO, inlets: [], equipment: [], macros: [] })
    component.setState = jest.fn(update => {
      component.state = { ...component.state, ...update }
    })

    expect(() => renderToStaticMarkup(<NewAtoView createATO={createATO} inlets={[]} equipment={[]} macros={[]} />)).not.toThrow()
    component.handleToggle()
    expect(component.state.add).toBe(true)
    component.handleSubmit({
      name: 'test',
      enable: false,
      inlet: '3',
      period: 60,
      control: '',
      pump: '',
      disable_on_alert: false,
      notify: false,
      maxAlert: 0,
      one_shot: false
    })
    expect(createATO).toHaveBeenCalledWith({
      name: 'test',
      enable: false,
      inlet: '3',
      period: 60,
      control: false,
      pump: '',
      disable_on_alert: false,
      notify: {
        enable: false,
        max: 0
      },
      is_macro: false,
      one_shot: false
    })
    expect(component.state.add).toBe(false)
    expect(New).toBeDefined()
  })
})
