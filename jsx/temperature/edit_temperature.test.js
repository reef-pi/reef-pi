import React from 'react'
import Enzyme, {shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ControlChart from './control_chart'
import EditTemperature from './edit_temperature'
import ReadingsChart from './readings_chart'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'

Enzyme.configure({ adapter: new Adapter() })

describe('<EditTemperature />', () => {
  var values = {}
  var sensors = [{id: 'sensor'}]
  var equipment = [{id: '1', name: 'EQ'}]
  var fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')

    values = {
      id: '1',
      name: 'tc1',
      enable: true,
      sensor: 'sensor',
      fahrenheit: true,
      period: 60,
      chart_min: 76,
      min: 72,
      max: 78,
      chart_max: 89,
      heater: '',
      cooler: '',
      alerts: false,
      minChart: 60,
      maxChart: 90
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not show charts when showChart is false', () => {
    const wrapper = shallow(
      <EditTemperature values={values}
        sensors={sensors}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart={false} />
    )

    expect(wrapper.find(ReadingsChart).length).toBe(0)
    expect(wrapper.find(ControlChart).length).toBe(0)
  })

  it('should show reading charts when showChart is true but hide control chart', () => {
    const wrapper = shallow(
      <EditTemperature values={values}
        sensors={sensors}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart />
    )

    expect(wrapper.find(ReadingsChart).length).toBe(1)
    expect(wrapper.find(ControlChart).length).toBe(0)
  })

  it('should show both charts when heater or chiller is used', () => {
    values.heater = '2'
    values.cooler = '4'

    const wrapper = shallow(
      <EditTemperature values={values}
        sensors={sensors}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart />
    )

    expect(wrapper.find(ReadingsChart).length).toBe(1)
    expect(wrapper.find(ControlChart).length).toBe(1)
  })

  it('<EditEquipment /> should submit', () => {
    const wrapper = shallow(
      <EditTemperature values={values}
        sensors={sensors}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditEquipment /> should show alert when invalid', () => {
    values.name = ''
    values.fahrenheit = false
    const wrapper = shallow(
      <EditTemperature values={values}
        sensors={sensors}
        equipment={equipment}
        handleBlur={fn}
        handleChange={fn}
        submitForm={fn}
        showChart
        dirty
        isValid={false} />
    )
    wrapper.find('form').simulate('submit', {preventDefault: () => {}})
    expect(Alert.showError).toHaveBeenCalled()
  })
})
