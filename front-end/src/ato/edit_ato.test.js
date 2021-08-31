import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditAto from './edit_ato'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditAto />', () => {
  const values = {}
  const inlets = [{ id: '1', name: 'inlet 1' }]
  const equipment = [{ id: '1', name: 'EQ' }]
  const fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditAto />', () => {
    shallow(
      <EditAto
        values={values}
        inlets={inlets}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
      />
    )
  })

  it('<EditATO /> should submit', () => {
    const wrapper = shallow(
      <EditAto
        values={values}
        inlets={inlets}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        dirty
        isValid
        showChart={false}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditAto /> should show alert when invalid', () => {
    values.name = ''
    values.fahrenheit = false
    const wrapper = shallow(
      <EditAto
        values={values}
        inlets={inlets}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid={false}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })
})
