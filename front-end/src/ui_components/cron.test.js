import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Cron from './cron'

Enzyme.configure({ adapter: new Adapter() })

const defaultProps = {
  values: { month: '*', week: '*', day: '*', hour: '*', minute: '*', second: '0' },
  errors: {},
  touched: {}
}

describe('Cron', () => {
  it('renders without throwing', () => {
    expect(() => shallow(<Cron {...defaultProps} />)).not.toThrow()
  })

  it('renders 6 Field inputs (month, week, day, hour, minute, second)', () => {
    const wrapper = shallow(<Cron {...defaultProps} />)
    expect(wrapper.find('Field')).toHaveLength(6)
  })

  it('renders a field for each cron part', () => {
    const wrapper = shallow(<Cron {...defaultProps} />)
    const names = wrapper.find('Field').map(f => f.prop('name'))
    expect(names).toContain('month')
    expect(names).toContain('week')
    expect(names).toContain('day')
    expect(names).toContain('hour')
    expect(names).toContain('minute')
    expect(names).toContain('second')
  })

  it('disables all fields when readOnly is true', () => {
    const wrapper = shallow(<Cron {...defaultProps} readOnly />)
    const fields = wrapper.find('Field')
    fields.forEach(field => {
      expect(field.prop('disabled')).toBe(true)
    })
  })

  it('does not disable fields when readOnly is false', () => {
    const wrapper = shallow(<Cron {...defaultProps} readOnly={false} />)
    const fields = wrapper.find('Field')
    fields.forEach(field => {
      expect(field.prop('disabled')).toBe(false)
    })
  })

  it('adds is-invalid class when minute has an error and is touched', () => {
    const wrapper = shallow(
      <Cron
        {...defaultProps}
        errors={{ minute: 'required' }}
        touched={{ minute: true }}
      />
    )
    const minuteField = wrapper.find('Field[name="minute"]')
    expect(minuteField.prop('className')).toContain('is-invalid')
  })

  it('does not add is-invalid class when field is not touched', () => {
    const wrapper = shallow(
      <Cron
        {...defaultProps}
        errors={{ minute: 'required' }}
        touched={{ minute: false }}
      />
    )
    const minuteField = wrapper.find('Field[name="minute"]')
    expect(minuteField.prop('className')).not.toContain('is-invalid')
  })
})
