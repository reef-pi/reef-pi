import AtoForm, { mapAtoPropsToValues, submitAtoForm } from './ato_form'
import 'isomorphic-fetch'

describe('AtoForm', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('maps defaults for create', () => {
    expect(mapAtoPropsToValues({})).toEqual({
      id: '',
      name: '',
      enable: true,
      control: '',
      inlet: '',
      one_shot: false,
      disable_on_alert: false,
      period: 60,
      debounce: 0,
      pump: '',
      notify: false,
      maxAlert: 120
    })
    expect(AtoForm).toBeDefined()
  })

  it('maps equipment control for edit and submits', () => {
    const onSubmit = jest.fn()
    const data = {
      id: '1', name: 'Main ATO', enable: true, control: true, is_macro: false,
      inlet: '1', pump: '2', period: 60, debounce: 5, one_shot: false,
      disable_on_alert: false, notify: { enable: true, max: 120 }
    }

    expect(mapAtoPropsToValues({ data })).toEqual({
      id: '1',
      name: 'Main ATO',
      enable: true,
      control: 'equipment',
      inlet: '1',
      one_shot: false,
      disable_on_alert: false,
      period: 60,
      debounce: 5,
      pump: '2',
      notify: true,
      maxAlert: 120
    })

    submitAtoForm({ id: '1' }, { onSubmit })
    expect(onSubmit).toHaveBeenCalledWith({ id: '1' })
  })

  it('maps macro and disabled control branches', () => {
    const macroData = {
      id: '2', name: 'Macro ATO', enable: true, control: true, is_macro: true,
      inlet: '', pump: '', period: 60, debounce: 0, one_shot: false,
      disable_on_alert: false, notify: {}
    }
    const sensorOnlyData = {
      id: '3', name: 'Sensor Only', enable: false, control: false,
      inlet: '', pump: '', period: 60, debounce: 0, one_shot: false,
      disable_on_alert: false, notify: {}
    }

    expect(mapAtoPropsToValues({ data: macroData }).control).toBe('macro')
    expect(mapAtoPropsToValues({ data: sensorOnlyData }).control).toBe('')
  })
})
