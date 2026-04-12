import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import EditEntry from './edit_entry'
import * as Alert from 'utils/alert'

Enzyme.configure({ adapter: new Adapter() })

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
    expect(() => shallow(<EditEntry {...defaultProps} />)).not.toThrow()
  })

  it('renders value, comment, timestamp fields', () => {
    const wrapper = shallow(<EditEntry {...defaultProps} />)
    const names = wrapper.find('Field').map(f => f.prop('name'))
    expect(names).toContain('value')
    expect(names).toContain('comment')
    expect(names).toContain('timestamp')
  })

  it('calls submitForm and showUpdateSuccessful on valid submit', () => {
    const submitForm = jest.fn()
    const wrapper = shallow(<EditEntry {...defaultProps} submitForm={submitForm} />)
    wrapper.find('form').simulate('submit', { preventDefault: jest.fn() })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
  })

  it('calls showError when not valid and dirty', () => {
    const submitForm = jest.fn()
    const wrapper = shallow(<EditEntry {...defaultProps} submitForm={submitForm} isValid={false} dirty />)
    wrapper.find('form').simulate('submit', { preventDefault: jest.fn() })
    expect(Alert.showError).toHaveBeenCalled()
  })

  it('shows is-invalid class on value field when there is a touched error', () => {
    const wrapper = shallow(
      <EditEntry
        {...defaultProps}
        errors={{ value: 'required' }}
        touched={{ value: true }}
      />
    )
    const valueField = wrapper.find('Field[name="value"]')
    expect(valueField.prop('className')).toContain('is-invalid')
  })
})
