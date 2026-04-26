import EditEntry from './edit_entry'
import * as Alert from 'utils/alert'

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

const defaultProps = {
  values: { value: 7.2, comment: '', timestamp: 'Jul-08-23:38, 2022' },
  errors: {},
  touched: {},
  submitForm: jest.fn(),
  handleBlur: jest.fn(),
  isValid: true,
  dirty: true
}

describe('EditEntry', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing', () => {
    expect(() => EditEntry(defaultProps)).not.toThrow()
  })

  it('renders value, comment, timestamp fields', () => {
    const names = findAll(EditEntry(defaultProps), node => node.props?.name)
      .map(node => node.props.name)
    expect(names).toContain('value')
    expect(names).toContain('comment')
    expect(names).toContain('timestamp')
  })

  it('calls submitForm and showUpdateSuccessful on valid submit', () => {
    const submitForm = jest.fn()
    const form = EditEntry({ ...defaultProps, submitForm })
    form.props.onSubmit({ preventDefault: jest.fn() })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('calls showError when not valid and dirty', () => {
    const submitForm = jest.fn()
    const form = EditEntry({ ...defaultProps, submitForm, isValid: false, dirty: true })
    form.props.onSubmit({ preventDefault: jest.fn() })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('shows is-invalid class on value field when there is a touched error', () => {
    const valueField = findAll(
      EditEntry({
        ...defaultProps,
        errors: { value: 'required' },
        touched: { value: true }
      }),
      node => node.props?.name === 'value'
    )[0]
    expect(valueField.props.className).toContain('is-invalid')
  })
})
