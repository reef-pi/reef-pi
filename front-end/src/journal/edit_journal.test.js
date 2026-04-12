import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import { Formik } from 'formik'
import EditJournal from './edit_journal'
import * as Alert from 'utils/alert'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

const initialValues = { id: '1', name: 'pH', description: 'log', unit: 'pH' }

const render = (extraProps = {}) => {
  const store = mockStore({ journal_usage: {} })
  fetchMock.getOnce('/api/journal/1/usage', {})
  const submitForm = extraProps.submitForm || jest.fn()
  return mount(
    <Provider store={store}>
      <Formik initialValues={initialValues} onSubmit={submitForm}>
        {(formikProps) => (
          <EditJournal
            values={formikProps.values}
            errors={formikProps.errors}
            touched={formikProps.touched}
            submitForm={formikProps.submitForm}
            handleBlur={formikProps.handleBlur}
            isValid={formikProps.isValid}
            dirty={formikProps.dirty}
            readOnly={false}
            {...extraProps}
          />
        )}
      </Formik>
    </Provider>
  )
}

describe('EditJournal', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    fetchMock.reset()
    fetchMock.restore()
  })

  it('renders without throwing', () => {
    expect(() => render()).not.toThrow()
  })

  it('renders name, description, unit fields', () => {
    const wrapper = render()
    const names = wrapper.find('Field').map(f => f.prop('name'))
    expect(names).toContain('name')
    expect(names).toContain('description')
    expect(names).toContain('unit')
  })

  it('disables fields when readOnly', () => {
    const wrapper = render({ readOnly: true })
    wrapper.find('Field').forEach(f => {
      expect(f.prop('disabled')).toBe(true)
    })
  })
})
