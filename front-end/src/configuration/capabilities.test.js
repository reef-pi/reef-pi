import React from 'react'
import { render, screen } from '@testing-library/react'
import Capabilities from './capabilities'

describe('render capabilities component', () => {
  it('<Capabilities />', () => {
    render(
      <Capabilities capabilities={[]} update={() => {}} />
    )

    expect(screen.getByLabelText('equipment')).toBeTruthy()
    expect(screen.getByLabelText('dashboard')).toBeTruthy()
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(5)
  })
})
