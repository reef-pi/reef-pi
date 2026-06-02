import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import fs from 'fs'
import path from 'path'
import Button from './Button'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('design-system Button primitive', () => {
  it('renders primary button defaults without Bootstrap classes', () => {
    const html = renderToStaticMarkup(<Button>Save</Button>)

    expect(html).toContain('type="button"')
    expect(html).toContain('Save')
    expect(html).toContain('var(--reefpi-color-brand)')
    expect(html).not.toContain('btn')
  })

  it('supports submit and reset button types', () => {
    expect(renderToStaticMarkup(<Button type='submit'>Apply</Button>)).toContain('type="submit"')
    expect(renderToStaticMarkup(<Button type='reset'>Reset</Button>)).toContain('type="reset"')
  })

  it('renders secondary, danger, and ghost variants', () => {
    expect(renderToStaticMarkup(<Button variant='secondary'>Cancel</Button>)).toContain('var(--reefpi-color-border)')
    expect(renderToStaticMarkup(<Button variant='danger'>Delete</Button>)).toContain('var(--reefpi-color-error)')
    expect(renderToStaticMarkup(<Button variant='ghost'>Edit</Button>)).toContain('transparent')
  })

  it('supports disabled behavior and click handling', () => {
    const onClick = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<Button onClick={onClick}>Run</Button>)
    })
    act(() => container.querySelector('button').click())
    expect(onClick).toHaveBeenCalledTimes(1)

    act(() => {
      root.render(<Button onClick={onClick} disabled>Run</Button>)
    })
    expect(container.querySelector('button').disabled).toBe(true)

    act(() => root.unmount())
  })

  it('supports icon-only buttons with an accessible label', () => {
    const html = renderToStaticMarkup(<Button variant='ghost' icon={<span>+</span>} iconOnly aria-label='Add equipment' />)

    expect(html).toContain('aria-label="Add equipment"')
    expect(html).toContain('>+</span>')
    expect(html).not.toContain('Add equipment</button>')
  })

  it('documents the preview story without Bootstrap button classes', () => {
    const story = fs.readFileSync(path.join(process.cwd(), 'front-end/design-system/preview/primitives/button.html'), 'utf8')

    expect(story).toContain('data-variant="primary"')
    expect(story).toContain('data-state="disabled"')
    expect(story).toContain('aria-label="Edit"')
    expect(story).not.toContain('btn ')
    expect(story).not.toContain('btn-')
  })
})
