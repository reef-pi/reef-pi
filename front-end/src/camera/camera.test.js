import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Main from './main'
import Capture from './capture'
import Config from './config'
import Gallery from './gallery'
import Motion from './motion'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

describe('Camera module', () => {
  it('<Main />', () => {
    const state = {
      camera: {
        config: {},
        images: [{ name: 'foo' }, { name: 'bar' }]
      }
    }
    const store = mockStore(state)
    const { getByText } = render(<Main store={store} />)

    expect(getByText('configure')).toBeInTheDocument()
  })

  it('<Capture />', () => {
    const store = mockStore({ camera: { latest: '' } })
    const { getByText } = render(<Capture store={store} />)

    expect(getByText('camera:take_photo')).toBeInTheDocument()
  })

  it('<Config />', () => {
    let m = render(<Config config={{ tick_interval: 1 }} update={() => {}} />)
    const input = m.container.querySelector('input[name="enable"]')
    input.click()
    m.rerender(<Config config={{ tick_interval: 1 }} update={() => {}} />)
    const saveButton = m.container.querySelector('input[name="updateCamera"]')
    saveButton.click()
    m.rerender(<Config config={{ tick_interval: 'foo' }} update={() => {}} />)
    saveButton.click()
  })

  it('<Gallery />', () => {
    const images = [{ thumbnail: '', src: '' }]
    const { getByRole } = render(<Gallery images={images} />)
    const link = getByRole('link')
    link.click()
    const closeButton = getByRole('button', { name: /close/i })
    closeButton.click()
    const prevButton = getByRole('button', { name: /previous/i })
    prevButton.click()
    const nextButton = getByRole('button', { name: /next/i })
    nextButton.click()
    const thumbnail = getByRole('img')
    thumbnail.click()
  })

  it('<Motion />', () => {
    const { getByRole } = render(<Motion url='/foo' width={300} height={600} />)
    const img = getByRole('img')
    expect(img).toHaveAttribute('src', '/foo')
    expect(img).toHaveAttribute('width', '300')
    expect(img).toHaveAttribute('height', '600')
  })
})
