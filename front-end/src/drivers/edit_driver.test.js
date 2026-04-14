import React from 'react'
import * as Alert from '../utils/alert'
import { shallow } from 'enzyme'
import EditDriver from './edit_driver'
import 'isomorphic-fetch'


describe('<EditDriver />', () => {
  let values = {}
  let options = {
    ezo: {},
    pca9685: {}
  }
  let fn = jest.fn()

  beforeEach(() => {
    jest.spyOn(Alert, 'showError')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('<EditDriver />', () => {
    shallow(
      <EditDriver
        values={values}
        handleBlur={fn}
        submitForm={fn}
        driverOptions={options}
      />
    )
  })
})
