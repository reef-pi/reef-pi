import React, { act } from 'react'
import { shallow } from 'enzyme'
import AutoProfile from './auto_profile'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'

const mockStore = configureMockStore([thunk])

describe('Lighting ui - Auto Profile', () => {
  const ev = {
    target: { value: 10 }
  }
  const click = (node) => {
    act(() => {
      node.prop('onClick')()
    })
  }

  it('<AutoProfile />', () => {
    const config = {
      start: '14:00:00',
      end: '20:00:00',
      values: []
    }
    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />).instance()
    m.curry(1)(ev)
    m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />).instance()
    m.curry(1)({ target: { value: 'foo' } })
  })

  it('<AutoProfile /> should default to 12 values', () => {
    const config = {
      start: '14:00:00',
      end: '20:00:00'
    }
    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />)
    expect(m.find('input.no-spinner').length).toBe(12)
  })

  it('<AutoProfile /> should set labels based on start end and values', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20.3, 30]
    }

    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />)
    let labels = m.find('div.px-0')
    expect(labels.length).toBe(3)
    expect(labels.at(0).text()).toBe('14:00')
    expect(labels.at(1).text()).toBe('14:30')
    expect(labels.at(2).text()).toBe('15:00')
  })

  it('<AutoProfile /> should set add labels based when Add Point is clicked', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20.3, 30]
    }

    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />)

    click(m.find('.btn-add-point'))
    click(m.find('.btn-add-point'))

    const labels = m.find('div.px-0')
    expect(labels.length).toBe(5)
    expect(labels.at(0).text()).toBe('14:00')
    expect(labels.at(1).text()).toBe('14:15')
    expect(labels.at(2).text()).toBe('14:30')
    expect(labels.at(3).text()).toBe('14:45')
    expect(labels.at(4).text()).toBe('15:00')
  })

  it('<AutoProfile /> should set remove labels based when Remove Point is clicked', () => {
    const config = {
      start: '14:00:00',
      end: '15:00:00',
      values: [10, 20, 30]
    }

    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />)

    click(m.find('.btn-remove-point').at(1))

    const labels = m.find('div.px-0')
    expect(labels.length).toBe(2)
    expect(labels.at(0).text()).toBe('14:00')
    expect(labels.at(1).text()).toBe('15:00')
  })

  it('<AutoProfile /> Should allow end time before start time to represent overnight', () => {
    const config = {
      start: '23:00:00',
      end: '02:00:00',
      values: [10, 20, 30, 40]
    }

    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />)
    let labels = m.find('div.px-0')
    expect(labels.length).toBe(4)
    expect(labels.at(0).text()).toBe('23:00')
    expect(labels.at(1).text()).toBe('00:00')
    expect(labels.at(2).text()).toBe('01:00')
    expect(labels.at(3).text()).toBe('02:00')
  })

  it('<AutoProfile /> Should allow end time before start time with same hour to represent overnight', () => {
    const config = {
      start: '02:45:00',
      end: '02:15:00',
      values: [10, 20, 30]
    }

    let m = shallow(<AutoProfile store={mockStore()} config={config} onChangeHandler={() => true} />)
    let labels = m.find('div.px-0')
    expect(labels.length).toBe(3)
    expect(labels.at(0).text()).toBe('02:45')
    expect(labels.at(1).text()).toBe('14:30')
    expect(labels.at(2).text()).toBe('02:15')
  })
})
