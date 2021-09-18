import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditDoser from './edit_doser'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditPh />', () => {
  let values = { enable: true }
  let doser = { id: 1 }
  let fn = jest.fn()
  const jacks = [{ id: 1, name: 'jack 1', pins: [1, 2, 3] }]

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditDoser />', () => {
    shallow(
      <EditDoser
        values={values}
        jacks={jacks}
        doser={doser}
        errors={{}}
        touched={{}}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
      />
    )
  })

  it('<EditDoser /> should update pins', () => {
    const wrapper = shallow(
      <EditDoser
        values={values}
        jacks={jacks}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        setFieldValue={fn}
        dirty
        isValid
      />
    )
    wrapper.find('[component][name="jack"]').simulate('change', { target: { value: 1 } })
  })

  it('<EditDoser /> should submit', () => {
    const wrapper = shallow(
      <EditDoser
        values={values}
        jacks={jacks}
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

  it('<EditDoser /> should show alert when invalid', () => {
    const wrapper = shallow(
      <EditDoser
        values={values}
        jacks={jacks}
        doser={doser}
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
