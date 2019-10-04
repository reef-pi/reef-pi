import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditTimer from './edit_timer'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditTimer />', () => {
  var values = {type: 'equipment', target: {}}
  var equipment = [{id: '1', name: 'EQ'}]
  var macros = [{id: '1', name: 'EQ'}]
  var fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditTimer />', () => {
    shallow(
      <EditTimer values={values}
        errors={{}}
        touched={{}}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn} />
    )
  })

  it('<EditTimer /> should submit', () => {
    const wrapper = shallow(
      <EditTimer values={values}
        equipment={equipment}
        macros={macros}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        errors={{}}
        touched={{}}
        dirty
        isValid
        showChart={false} />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditTimer /> should show alert when invalid', () => {
    values.type = 'reminder'
    values.name = ''

    const wrapper = shallow(
      <EditTimer values={values}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        macros={macros}
        showChart
        errors={{}}
        touched={{}}
        dirty
        isValid={false} />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('EditTimer /> should set macro target when macro is selected', () => {
    values.type = 'macro'

    const changeHandler = jest.fn()

    const wrapper = shallow(
      <EditTimer values={values}
        equipment={equipment}
        handleBlur={fn}
        handleChange={changeHandler}
        submitForm={fn}
        macros={macros}
        showChart
        errors={{}}
        touched={{}}
        dirty
        isValid={false} />
    )

    wrapper.find({component: 'select', name: 'type'}).simulate('change', {target: {name: 'type', value: 'macro'}})

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({id: ''})
  })

  it('EditTimer /> should set equipment target when equipment is selected', () => {
    values.type = 'equipment'

    const changeHandler = jest.fn()

    const wrapper = shallow(
      <EditTimer values={values}
        equipment={equipment}
        handleBlur={fn}
        handleChange={changeHandler}
        submitForm={fn}
        macros={macros}
        showChart
        errors={{}}
        touched={{}}
        dirty
        isValid={false} />
    )

    wrapper.find({component: 'select', name: 'type'}).simulate('change', {target: {name: 'type', value: 'equipment'}})

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({ id: '', on: true, revert: false, duration: 60 })
  })

  it('EditTimer /> should set reminder target when reminder is selected', () => {
    const changeHandler = jest.fn()

    const wrapper = shallow(
      <EditTimer values={values}
        equipment={equipment}
        handleBlur={fn}
        handleChange={changeHandler}
        submitForm={fn}
        macros={macros}
        showChart
        errors={{}}
        touched={{}}
        dirty
        isValid={false} />
    )

    wrapper.find({component: 'select', name: 'type'}).simulate('change', {target: {name: 'type', value: 'reminder'}})

    expect(changeHandler.mock.calls.length).toBe(2)
    expect(changeHandler.mock.calls[1][0].target.value).toEqual({title: '', message: ''})
  })
})
