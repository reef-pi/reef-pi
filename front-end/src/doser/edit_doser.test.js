import EditDoser from './edit_doser'
import 'isomorphic-fetch'
import * as Alert from '../utils/alert'
import Cron from '../ui_components/cron'

const findAll = (node, predicate, acc = []) => {
  if (!node || typeof node !== 'object') {
    return acc
  }
  if (predicate(node)) {
    acc.push(node)
  }
  const children = node.props?.children
  if (children !== undefined) {
    ;[].concat(children).forEach(child => findAll(child, predicate, acc))
  }
  return acc
}

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
    expect(() => EditDoser({
      values,
      jacks,
      doser,
      errors: {},
      touched: {},
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn
    })).not.toThrow()
  })

  it('<EditDoser /> renders the type field', () => {
    const typeField = findAll(EditDoser({
      values,
      jacks,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      setFieldValue: fn,
      dirty: true,
      isValid: true
    }), node => node.props?.name === 'type')[0]
    expect(typeField).toBeTruthy()
  })

  it('<EditDoser /> wires schedule fields to Formik handlers', () => {
    const handleBlur = jest.fn()
    const handleChange = jest.fn()
    const cron = findAll(EditDoser({
      values,
      jacks,
      handleBlur,
      handleChange,
      submitForm: fn,
      errors: {},
      touched: {},
      setFieldValue: fn,
      dirty: true,
      isValid: true
    }), node => node.type === Cron)[0]

    expect(cron.props.handleBlur).toBe(handleBlur)
    expect(cron.props.handleChange).toBe(handleChange)
  })

  it('<EditDoser /> should submit', () => {
    const form = EditDoser({
      values,
      jacks,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      dirty: true,
      isValid: true
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).not.toHaveBeenCalled()
  })

  it('<EditDoser /> should show alert when invalid', () => {
    const form = EditDoser({
      values,
      jacks,
      doser,
      handleBlur: fn,
      handleChange: fn,
      submitForm: fn,
      errors: {},
      touched: {},
      dirty: true,
      isValid: false
    })
    form.props.onSubmit({ preventDefault: () => {} })
    expect(Alert.showError).toHaveBeenCalled()
  })
})
