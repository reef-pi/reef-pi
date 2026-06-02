import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import fs from 'fs'
import path from 'path'
import { Field, Input, Select } from './Form'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system form primitives', () => {
  it('wires Field label, help text, error text, required, and aria attributes', () => {
    const html = renderToStaticMarkup(
      <Field id='equipment-name' label='Name' helpText='Shown on control panels' error='Name is required' required>
        <Input name='name' />
      </Field>
    )

    expect(html).toContain('for="equipment-name"')
    expect(html).toContain('id="equipment-name"')
    expect(html).toContain('required=""')
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="equipment-name-help equipment-name-error"')
    expect(html).toContain('role="alert"')
    expect(html).toContain('Name is required')
  })

  it('preserves explicit child ids and described-by references', () => {
    const html = renderToStaticMarkup(
      <Field id='field-id' label='Outlet' helpText='Select a connector'>
        <Select id='custom-outlet' aria-describedby='external-help' options={['Outlet 1']} />
      </Field>
    )

    expect(html).toContain('for="field-id"')
    expect(html).toContain('id="custom-outlet"')
    expect(html).toContain('aria-describedby="external-help field-id-help"')
  })

  it('renders Input states without Bootstrap form-control classes', () => {
    const html = renderToStaticMarkup(
      <div>
        <Input type='date' readOnly value='2026-06-01' />
        <Input type='password' disabled />
        <Input invalid defaultValue='bad' />
      </div>
    )

    expect(html).toContain('type="date"')
    expect(html).toContain('readOnly=""')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-invalid="true"')
    expect(html).not.toContain('form-control')
  })

  it('renders Select options and emits change events', () => {
    const onChange = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <Field id='outlet' label='Outlet'>
          <Select
            value='2'
            onChange={onChange}
            options={[
              { value: '1', label: 'Outlet 1' },
              { value: '2', label: 'Outlet 2' },
              { value: '3', label: 'Outlet 3', disabled: true }
            ]}
          />
        </Field>
      )
    })

    const select = container.querySelector('select')
    expect(select.value).toBe('2')
    expect(container.querySelectorAll('option')).toHaveLength(3)
    expect(container.querySelector("option[value='3']").disabled).toBe(true)

    act(() => {
      select.value = '1'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onChange).toHaveBeenCalled()
    act(() => root.unmount())
  })

  it('documents the preview story across themes without Bootstrap classes', () => {
    const story = fs.readFileSync(path.join(process.cwd(), 'front-end/design-system/preview/primitives/form-controls.html'), 'utf8')

    expect(story).toContain('data-theme-sample="light"')
    expect(story).toContain('data-theme-sample="dark"')
    expect(story).toContain('data-theme-sample="actinic"')
    expect(story).not.toContain('form-control')
    expect(story).not.toContain('btn ')
  })
})
