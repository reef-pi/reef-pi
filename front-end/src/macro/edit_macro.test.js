import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditMacro from './edit_macro'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'
import { FieldArray } from 'formik'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditMacro />', () => {
  let values = {
    enable: true,
    name: 'test macro',
    steps: [
      {
        type: 'wait',
        duration: 30
      },
      {
        type: 'equipment',
        id: '1',
        on: true
      }
    ]
  }

  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditMacro />', () => {
    const wrapper = shallow(
      <EditMacro
        values={values}
        errors={{}}
        touched={{}}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
      />
    )
    let arrayField = wrapper.find(FieldArray).shallow()
    expect(arrayField.length).toBe(1)
  })

  it('<EditMacro /> should submit', () => {
    const wrapper = shallow(
      <EditMacro
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditMacro /> should show alert when invalid', () => {
    const wrapper = shallow(
      <EditMacro
        values={values}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid={false}
      />
    )
    wrapper.find('form').simulate('submit', { preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })
})
